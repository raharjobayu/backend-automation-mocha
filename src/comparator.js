import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import csv from 'csv-parser';

// Utility to get directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Comparator {
    constructor(file1, file2, outputFile, limit, batchSize) {
        this.file1 = file1;
        this.file2 = file2;
        this.outputFile = outputFile;
        this.results = [];
        this.equalCount = 0;
        this.notEqualCount = 0;
        this.errorCount = 0;
        this.limit = limit; // Limit on how many URLs to compare
        this.batchSize = batchSize; // Size of each batch for comparison
    }

    // Helper function to read URLs from a CSV file up to the specified limit
    static async readUrlsFromCSV(filePath, limit) {
        const urls = [];

        return new Promise((resolve, reject) => {
            let count = 0;

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    // CSV has a column named 'url'
                    if (row.url && count < limit) {
                        urls.push(row.url);
                        count++;
                    }
                })
                .on('end', () => {
                    resolve(urls);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    // Helper function to compare two JSON objects and highlight differences
    static compareJson(obj1, obj2) {
        const differences = [];

        function findDifferences(path, o1, o2) {
            if (typeof o1 !== 'object' || typeof o2 !== 'object' || o1 === null || o2 === null) {
                if (o1 !== o2) {
                    differences.push(`Difference at ${path}: ${JSON.stringify(o1)} !== ${JSON.stringify(o2)}`);
                }
                return;
            }

            const keys1 = Object.keys(o1);
            const keys2 = Object.keys(o2);

            for (const key of keys1) {
                if (!(key in o2)) {
                    differences.push(`Missing key in second JSON at ${path}: ${key}`);
                } else {
                    findDifferences(`${path}.${key}`, o1[key], o2[key]);
                }
            }

            for (const key of keys2) {
                if (!(key in o1)) {
                    differences.push(`Missing key in first JSON at ${path}: ${key}`);
                }
            }
        }

        findDifferences('', obj1, obj2);

        return differences.length ? differences.join('\n') : null;
    }

    // Function to fetch the response from a URL
    static async fetchResponse(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${url}: ${error.message}`);
            return null;
        }
    }

    // Function to compare two URLs and add the result to the results array
    static async compareUrls(url1, url2) {
        const response1 = await Comparator.fetchResponse(url1);
        const response2 = await Comparator.fetchResponse(url2);

        if (response1 && response2) {
            const diff = Comparator.compareJson(response1, response2);
            if (diff) {
                return `${url1} not equals ${url2}\n${diff}`;
            } else {
                return `${url1} equals ${url2}`;
            }
        } else {
            return `Comparison failed for ${url1} and ${url2}`;
        }
    }

    // Worker thread function
    static async workerFunction({ url1, url2 }) {
        const result = await Comparator.compareUrls(url1, url2);
        parentPort.postMessage(result);
    }

    // Function to process a batch of URLs
    async processBatch(urls1, urls2) {
        const promises = [];

        for (let i = 0; i < urls1.length; i++) {
            const url1 = urls1[i];
            const url2 = urls2[i];

            promises.push(new Promise((resolve) => {
                const worker = new Worker(__filename, {
                    workerData: { url1, url2 }
                });

                worker.on('message', (result) => {
                    if (result.includes('not equals')) {
                        this.notEqualCount++;
                    } else if (result.includes('equals')) {
                        this.equalCount++;
                    } else {
                        this.errorCount++;
                    }

                    this.results.push(result);
                    resolve();
                });
                worker.on('error', resolve);
                worker.on('exit', (code) => {
                    if (code !== 0) {
                        console.error(`Worker stopped with exit code ${code}`);
                    }
                    resolve();
                });
            }));
        }

        await Promise.all(promises);
    }

    // Main function to compare URLs from two CSV files up to the specified limit
    async compareFiles() {
        const urls1 = await Comparator.readUrlsFromCSV(this.file1, this.limit);
        const urls2 = await Comparator.readUrlsFromCSV(this.file2, this.limit);

        if (urls1.length !== urls2.length) {
            throw new Error('CSV files must have the same number of rows');
        }

        const batches = Math.ceil(urls1.length / this.batchSize);

        for (let i = 0; i < batches; i++) {
            const start = i * this.batchSize;
            const end = start + this.batchSize;
            const batchUrls1 = urls1.slice(start, end);
            const batchUrls2 = urls2.slice(start, end);

            await this.processBatch(batchUrls1, batchUrls2);
        }
    }

    // Function to write the results and counts to the output file
    async writeResultsToFile() {
        const summary = `Equal URLs: ${this.equalCount}\nNot Equal URLs: ${this.notEqualCount}\nComparison Errors: ${this.errorCount}\n\n`;
        fs.writeFileSync(this.outputFile, summary + this.results.join('\n\n'), 'utf-8');
    }

    // Static method to initialize the comparison process
    static async start(file1, file2, outputFile, limit, batchSize) {
        const comparator = new Comparator(file1, file2, outputFile, limit, batchSize);
        await comparator.compareFiles();
        await comparator.writeResultsToFile();
        console.log('Comparison complete');
    }
}

if (!isMainThread) {
    Comparator.workerFunction(workerData);
}

// Run the comparator if this is the main thread
if (isMainThread) {
    const file1 = path.join(__dirname, 'data', 'file1.csv');
    const file2 = path.join(__dirname, 'data', 'file2.csv');
    const outputFile = path.join(__dirname, 'output', 'comparison_report.txt');
    const limit = 1000; // Specify the number of URLs to compare
    const batchSize = 100; // Specify the size of each batch for comparison

    // Ensure the output directory exists
    fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });

    Comparator.start(file1, file2, outputFile, limit, batchSize).then(() => {
        console.log('Comparison complete');
    });
}
