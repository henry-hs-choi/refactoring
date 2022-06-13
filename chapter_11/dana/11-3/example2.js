function deliveryDate(anOrder, isRush) {
    let result;
    let deliveryTime;
    if (anOrder.deliveryState === "NA" || anOrder.deliveryState === "CT") deliveryTime = isRush ? 1 : 2;
    else if (anOrder.deliveryState === "NY" || anOrder.deliveryState === "NH") {
        deliveryTime = 2;
        if (anOrder.deliveryState === "NH" && !isRush) {
            deliveryTime = 3;
        }
    }
    else if (isRush)
        deliveryTime = 3;
    else if (anOrder.deliveryState === "ME")
        deliveryTime = 3;
    else
        deliveryTime = 4;

    result = anOrder.plusDays(2 + deliveryTime);
    if (isRush) result = result.minusDays(1);
    return result;
}