function printOwing(invoice) {
    let outstanding = 0;

    printBanner();

    // 미해결 채무(outstanding)를 계산한다.
    for (const o of invoice.orders) {
        outstanding += o.amount;
    }

    recordDueDate(invoice); // 마감일 설정 로직을 함수로 추출
    printDetails(invoice, outstanding);

}

function recordDueDate(invoice) {
    const today = Clock.today;
    invoice.dueDate = new Date(today.getFullYear(), today.getMonth(),
        today.getDate() + 30);
}

function printDetails(invoice, outstanding) { // 지역 변수를 매개변수로 전달
    console.log(`고객명: ${invoice.customer}`);
    console.log(`채무액: ${outstanding}`);
    console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`);
}

function printBanner() {
    console.log("*******************");
    console.log("***** 고객 채무 *****");
    console.log("*******************");
}
