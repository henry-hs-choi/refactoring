class Site {
    get customer() {return this._customer;}
}

class Customer {
    get name() {...}
    get billingPlan() {...}
    set billingPlan() {...}
    get paymentHistory() {...}
}

class Client1 {
    const aCustomer = site.customer;
    // 웅앵웅
    let customerName;
    if (aCustomer === "미확인 고객") customerName = "거주자";
    else customerName = aCustomer.name;
}

class Client2 {
    const plan = (aCustomer === "미확인 고객") ?
        registry.billingPlans.basic
        : aCustomer.billingPlan;
}

class Client3 {
    if (aCustomer !== "미확인 고객") aCustomer.billingPlan = newPlan;
}

class Client4 {
    const weeksDeliquent =  (aCustomer !== "미확인 고객") ? 0 : aCustomer.paymentHistory.weeksDelinquentInLastYer;
}

