const newEnglanders = someCustomers.filter(c => inNewEngland(c));

function inNewEngland(aCustomer) {
    const stateCode = aCustomer.address.state;
    return xxNEWinEngland(stateCode);
}

function xxNEWinEngland(stateCode) {
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}

