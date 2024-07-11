import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);

class StoreHelper {
    static url = 'https://petstore.swagger.io/v2/store';

    static getPetInventory() {
        return chai.request(this.url)
            .get(`/inventory`);
    }
    static getStoreOrderbyOrderId(orderId) {
        return chai.request(this.url)
            .get(`/order/${orderId}`);
    }
    static getStoreOrderbyOrderId(orderId) {
        return chai.request(this.url)
            .get(`/order/${orderId}`);
    }
    static createStoreOrder(orderData) {
        return chai.request(this.url)
            .post(`/order`)
            .send(orderData);
    }
    static deleteStoreOrder(orderId) {
        return chai.request(this.url)
            .delete(`/order/${orderId}`)
    }
}

export default StoreHelper;
