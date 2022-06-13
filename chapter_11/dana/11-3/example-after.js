// 호출부1
aShipment.deliveryDate = rushDeliveryDate(anOrder);

// 호출부2
aShipment.deliveryDate = regularDeliveryDate(anOrder);

// boolean 값이 의미하는 바가 전혀 명확하지 않다.

function deliveryDate(anOrder, isRush) {
    if (isRush) {
        return rushDeliveryDate(anOrder);
    } else {
        return regularDeliveryDate(anOrder);
    }
}

// 조건문 분해하기
function rushDeliveryDate(anOrder) {
    let deliveryTime;
    if (["MA", "CT"]     .includes(anOrder.deliveryState)) deliveryTime = 1;
    else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else deliveryTime = 3;
    return anOrder.placedOn.plusDays(1 + deliveryTime);
}

function regularDeliveryDate(anOrder) {
    if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else if (["ME", "NH"] .includes(anOrder.deliveryState)) deliveryTime = 3;
    else deliveryTime = 4;
    return anOrder.placedOn.plusDays(2 + deliveryTime);
}