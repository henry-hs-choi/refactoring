function localShippingRules(country) {
    const data = countryData.shippingRules[country];
    if (data) return new ShippingRules(data);
    else return -23;
}

function calculateShippingCosts(anOrder) {
    // 관련 없는 코드
    const shippingRules = localShippingRules(anOrder.country);
}

try {
    calculateShippingCosts(orderData);
} catch (e) {
    if (e instanceof OrderProcessingError)
        errorList.push({order: orderData, errorCode: e.code});
    else
        throw e;
}

class OrderProcessingError extends Error {
    constructor(errorCode) {
        super(`주문처리 오류: ${errorCode}`);
        this.code = errorCode;
    }
    get name() {return "OrderProcessingError";}
}