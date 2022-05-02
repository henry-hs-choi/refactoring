function priceOrder(product, quantity, shippingMethod) {
    const basePrice = product.basePrice * quantity;
    const discount = Math.max(quantity - product.discountThreshold, 0)
            * product.basePrice * product.discountRate; // 상품 가격 계산
    const shippingPerCase = (basePrice > shippingMethod.discountThreshold)
            ? shippingMethod.discountedFee : shippingMethod.feePerCase; // 배송비 계산
    const price = basePrice - discount + shippingCost;
    return price;
}