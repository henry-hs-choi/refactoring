function localShippingRules(country) {
    const data = countryData.shippingRules[country];
    if (data) return new ShippingRules(data);
    else return -23;
}

function calculateShippingCosts(anOrder) {
    // 관련 없는 코드
    const shippingRules = localShippingRules(anOrder.country);
    if (shipping < 0) return shippingRules; // 오류전파
}

const status = calculateShippingCosts(orderData);
if (status < 0) errorList.push({order: orderData, errorCode: status});