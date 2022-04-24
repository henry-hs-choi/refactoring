function rating(aDriver) {
    return moreThanFiveLateDelivers(aDriver) ? 2 : 1;
}

function moreThanFiveLateDelivers(dvr) {
    return dvr.numberOfLateDelivers > 5;
}