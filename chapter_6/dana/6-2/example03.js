function reportLines(aCustomer) {
    const lines = [];
    gatherCustomerDate(lines, aCustomer);
    return lines;
}

function gatherCustomerDate(out, aCustomer) {
    out.push(["name", aCustomer.name]);
    out.push(["location", aCustomer.loation]);
}
