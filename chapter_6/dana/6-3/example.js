function price(order) {
    // 가격 (price) = 기본 가격 - 수량 할인 + 배송비
    const basePrice = order.quantity * order.itemPrice;
    // 불변변수 선언 후, 이름을 붙일 표현식의 복제본 대입 및 교체
    return basePrice -
        Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 +
        Math.min(basePrice * 0.1, 100);
}