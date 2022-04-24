const newEnglanders = someCustomers.filter(c => inNewEngland(c.address.state));

// function inNewEngland(aCustomer) {
//     return xxNEWinEngland(aCustomer.address.state);
// }

function inNewEngland(stateCode) {
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}

