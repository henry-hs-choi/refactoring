let _repositoryData;

export function initialize() {
    _repositoryData = {};
    _repositoryData.customers = new Map();
}

export function registerCustomer(id) {
    if (! _repositoryData.customers.has(id))
        _repositoryData.customers.set(id, new Customer(id));
    return findCustomer(id);
}

export function findCustomer(id) {
    return _repositoryData.customers.get(id);
}

class Order {
    constructor(data) {
        this._number = data.number;
        this._customer = registerCustomer(data.customer);
        // 다른 데이터를 읽어 들인다.
    }

    get customer() {return this._customer;}
}