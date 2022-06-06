function payAmount(employee) {
    if(employee.isSeparated) { // 퇴사한 직원인가?
        return {amount: 0, reasonCode: "SEP"};
    }

    if (employee.isRetired) {
        return {amount: 0, reasonCode: "RET"};
    }

    // 급여 계산 로직
    lorem.ipsum(dolor.sitAmet);
    consectetur(adipiscing).elit();
    sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
    ut.enim.ad(minim.veniam);
    return someFinalComputation();
}

