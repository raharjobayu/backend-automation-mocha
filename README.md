# backend-automation-mocha
---
# API Comparator and Automation
This repository contains scripts and automation tools for comparing API responses and automating the process using Node.js.

## Comparator.js

### Overview

The `comparator.js` script is designed to compare responses from two sets of URLs fetched via HTTP requests. It provides a mechanism to detect differences between JSON responses and generates a detailed report.

### Features

- **JSON Comparison**: Compares JSON responses retrieved from specified URLs.
- **Batch Processing**: Optimizes memory usage and processing time by comparing URLs in batches.
- **Error Handling**: Gracefully handles exceptions and errors during URL comparisons.
- **Output Report**: Generates a detailed comparison report with differences highlighted.

### Usage

1. **Installation**
   - Clone the repository:
     ```
     git clone https://github.com/raharjobayu/backend-automation-mocha.git
     cd src
     ```

   - Install dependencies:
     ```
     npm install
     ```

2. **Configuration**

   - Ensure CSV files `file1.csv` and `file2.csv` are placed in the `data` directory with the URLs to be compared.

3. **Running Comparator**

   - Adjust parameters in `comparator.js` if necessary (e.g., batch size, limit).
   - Execute the script:
     ```
     node comparator.js
     ```

4. **Output**

   - View the comparison results in `output/comparison_report.txt`.

### Example CSV Data

- **file1.csv**:
  ```
  url
  https://reqres.in/api/users/3
  https://reqres.in/api/users/4
  https://reqres.in/api/users/5
  https://reqres.in/api/users/5
  ```

- **file2.csv**:
  ```
  url
  https://reqres.in/api/users/10
  https://reqres.in/api/users/4
  https://reqres.in/api/users/10
  https://reqres.in/api/users/3
  ```

---

## Automation Tools

### Overview

This repository also includes automation scripts for testing and managing API interactions using Node.js and relevant testing frameworks.

### Features

- **Test Automation**: Utilizes Mocha and Chai for creating and executing API tests.
- **CRUD Operations**: Demonstrates how to automate CRUD operations (Create, Read, Delete) for API resources.
- **Setup and Teardown**: Shows examples of setting up test data and cleaning up after tests.

### Usage

1. **Installation**

   - Clone the repository (if not already cloned):
     ```
     git clone git clone https://github.com/raharjobayu/backend-automation-mocha.git
     ```

   - Install dependencies:
     ```
     npm install
     ```

2. **Running Tests**

   - Execute tests:
     ```
     npm test
     ```

3. **Test Cases**

   - Explore `test/integration` directory for various test cases.

---
### Notes

- Ensure Node.js and npm are installed on your system.
- Customize the scripts and configurations as per your project's requirements.

---
