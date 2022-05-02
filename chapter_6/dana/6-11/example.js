function priceOrder(product, quantity, shippingMethod) {
    const priceData = calculatePricingData(product, quantity);
    return applyShipping(priceData, basePrice, shippingMethod);
}

/**
 * 가격 계산 함수 (첫 번째 단계)
 */
function calculatePricingData(product, quantity) {

    const basePrice = product.basePrice * quantity;
    const discount = Math.max(quantity - product.discountThreshold, 0)
            * product.basePrice * product.discountRate; // 상품 가격 계산
    return {basePrice: basePrice, quantity: quantity, discount: discount};
}

/**
 * 배송비 계산 부분 함수 추출 (두 번째 단계)
 */
function applyShipping(priceData, shippingMethod) {
    const shippingPerCase = (basePrice > shippingMethod.discountThreshold)
            ? shippingMethod.discountedFee : shippingMethod.feePerCase; // 배송비 계산
    const shippingCost = quantity * shippingPerCase;
    return basePrice - discount + shippingCost;
}

