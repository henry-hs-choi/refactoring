class Site {
    get customer() {return this._customer === "미확인 고객") ? new UnknownCustomer() : this._customer;}
}

class Customer {
    get name() {...}
    get billingPlan() {...}
    set billingPlan() {...}
    get paymentHistory() {...}
    get isUnknown() {return false;}
}

class UnknownCustomer {
    get isUnknown() {return true;}
    get name() {return "거주자";}
    get billingPlan() {return registry.billingPlans.basic;}
    set billingPlan(arg) {/* 무시한다 */}
    get paymentHistory() {return new NullPaymentHistory();}
}

class NullPaymentHistory {
    get weeksDelinquentInLastYer() {return 0;}
}

function isUnknown(arg) {
    if (!((arg instanceof Customer) || arg instanceof UnknownCustomer))
        throw new Error('잘못된 값과 비교: <${arg}>')
    return (arg === "미확인 고객");
}

class Client1 {
    const aCustomer = site.customer;
    // 웅앵웅
    const customerName = aCustomer.name;
}

class Client2 {
    const plan = aCustomer.billingPlan;
}

class Client3 {
    aCustomer.billingPlan = newPlan;
}

class Client4 {
    const weeksDelinquent =  aCustomer.paymentHistory.weeksDelinquentInLastYer;
}

