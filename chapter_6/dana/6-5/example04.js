const newEnglanders = someCustomers.filter(c => xxNEWinEngland(c.address.state));

function inNewEngland(aCustomer) {
    return xxNEWinEngland(aCustomer.address.state);
}

function xxNEWinEngland(stateCode) {
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}

