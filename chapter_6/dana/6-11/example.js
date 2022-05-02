function priceOrder(product, quantity, shippingMethod) {
    const basePrice = product.basePrice * quantity;
    const discount = Math.max(quantity - product.discountThreshold, 0)
            * product.basePrice * product.discountRate; // 상품 가격 계산

    // 첫 번째 단계와 두 번째 단계가 주고받을 중간 데이터 구조 생성
    const priceData = {basePrice: basePrice, quantity: quantity, discount: discount};
    const price = applyShipping(priceData, basePrice, shippingMethod);
    return price;
}

/**
 * 배송비 계산 부분 함수 추출
 */
function applyShipping(priceData, shippingMethod) {
    const shippingPerCase = (basePrice > shippingMethod.discountThreshold)
            ? shippingMethod.discountedFee : shippingMethod.feePerCase; // 배송비 계산
    const shippingCost = quantity * shippingPerCase;
    const price = basePrice - discount + shippingCost;
    return price;
}