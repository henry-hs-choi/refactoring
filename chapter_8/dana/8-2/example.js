class Customer {
    constructor(name, discountRate) {
        this._name = name;
        this._discountRate = discountRate;
        this._contract = new CustomerContract(dateToday());
    }

    get discountRate() {return this._discountRate;}
    becomePreferred() {
        this._discountRate += 0.03;
        // other amazing thigs..
    }

    applyDiscount(amount) {
        this._startDate = startDate;
    }
}