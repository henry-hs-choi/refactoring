class Customer {
    constructor(name, discountRate) {
        this._name = name;
        this._setDiscountRate(discountRate);
        this._contract = new CustomerContract(dateToday());
    }

    get discountRate() {return this._contract.discountRate;}
    _setDiscountRate(aNumber) {this._contract.discountRate = aNumber;}
    becomePreferred() {
        this._setDiscountRate(this.discountRate + 0.03);
        // other amazing thigs..
    }

    applyDiscount(amount) {
        return amount.subtract(amount.multiply(this.discountRate));
    }
}

// discountRate field 옮기기
class CustomerContract {
    constructor(name, discountRate) {
        this._name = name;
        this._discountRate = discountRate
    }

    get discountRate() {return this._discountRate;}
    set discountRate(arg) {this._discountRate = arg;}
}