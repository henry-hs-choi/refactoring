function printOwing(invoice) {
    printBanner();

    const outstanding = calculateOutstanding(outstanding);
    recordDueDate(invoice); // 마감일 설정 로직을 함수로 추출
    printDetails(invoice, outstanding);

}

function calculateOutstanding(invoice) { //추출할 코드 복사
    let result = 0; 
    for (const o of invoice.orders) {
        result += o.amount;
    }
    return result; //수정된 값 반환
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
