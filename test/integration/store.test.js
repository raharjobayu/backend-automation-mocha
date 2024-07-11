import chai from 'chai';
import StoreHelper from './helpers/store.helper.js';

const expect = chai.expect;

describe('Store API Automation Test', function() {

    it('should returns pet inventories by status', function(done) {
        StoreHelper.getPetInventory()
            .end(function(err, res) {
                expect(res).to.have.status(200);
                Object.values(res.body).forEach(function (value) {
                    expect(value).to.not.be.null;
                });
                Object.keys(res.body).forEach(function (key) {
                    expect(key).to.be.a('string');
                });
                done();
            });
    });

    it('should get purchase order by valid id', function(done) {
        let orderId = 6
        StoreHelper.getStoreOrderbyOrderId(orderId)
            .end(function(err, res) {
                let resBody = res.body
                expect(res).to.have.status(200);
                expect(resBody.id).to.equal(orderId);
                expect(resBody).to.not.be.null;
                done();
            });
    });

    it('should get purchase order by not found order id', function(done) {
        let orderId = 0
        StoreHelper.getStoreOrderbyOrderId(orderId)
            .end(function(err, res) {
                let resBody = res.body
                expect(res).to.have.status(404);
                expect(resBody.message).to.include("not found");
                done();
            });
    });

    it('should get purchase order by invalid type order id', function(done) {
        let orderId = "a"
        StoreHelper.getStoreOrderbyOrderId(orderId)
            .end(function(err, res) {
                expect(res).to.have.status(404);
                done();
            });
    });

    it('should create order for a pet with valid data', function(done) {
        let orderId = 99
        let orderData = {
            "id": orderId,
            "petId": 0,
            "quantity": 0,
            "shipDate": "2023-12-09T15:34:37.230Z",
            "status": "placed",
            "complete": true
        }
        StoreHelper.createStoreOrder(orderData)
            .end(function(err, res) {
                let resBody = res.body
                expect(res).to.have.status(200);
                expect(resBody.id).to.equal(orderData.id);
                expect(resBody.petId).to.equal(orderData.petId);
                expect(resBody.quantity).to.equal(orderData.quantity);
                expect(resBody.status).to.equal(orderData.status);
                expect(resBody.complete).to.equal(orderData.complete);
                done();
            });
    });

    it('should failed to create order for a pet with invalid type data', function(done) {
        let orderId = "a"
        let orderData = {
            "id": orderId,
            "petId": 0,
            "quantity": 0,
            "shipDate": "2023-12-09T15:34:37.230Z",
            "status": "placed",
            "complete": true
        }
        StoreHelper.createStoreOrder(orderData)
            .end(function(err, res) {
                expect(res).to.have.status(500);
                done();
            });
    });

    it('should delete purchase order by valid order id', function(done) {
        let orderId = 99
        StoreHelper.deleteStoreOrder(orderId)
            .end(function(err, res) {
                let resBody = res.body
                expect(res).to.have.status(200);
                expect(resBody.message).to.equal(orderId.toString());
                done();
            });
    });

    it('should failed delete purchase order by not found order id', function(done) {
        let orderId = 99
        StoreHelper.deleteStoreOrder(orderId)
            .end(function(err, res) {
                let resBody = res.body
                expect(res).to.have.status(404);
                expect(resBody.message).to.include("Order Not Found");
                done();
            });
    });

    it('should failed delete purchase order by invalid type order id', function(done) {
        let orderId = "a"
        StoreHelper.deleteStoreOrder(orderId)
            .end(function(err, res) {
                let resBody = res.body
                expect(res).to.have.status(404);
                done();
            });
    });

});
