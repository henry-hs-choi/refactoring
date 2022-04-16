// commonjs import 
const invoices = require("./invoices.json");
const plays = require("./plays.json");


console.log(plays);

// ES5+
// import ~ from "./invoices.json";

function statement(invoice, plays) {

    let totalAmount = 0;
    let volumeCredits = 0;
    let result = '청구내역 (고객명: ${invocide.customer})\n';

    const format = new Intl.NumberFormat("en-us",
    {
        style: "currency", currency: "USD",
        minimumFractionDigits: 2}).format;

    for (let perf of invoice.performances) {
        //포인트를 적립한다
        let volumeCredits = volumeCreditsFor(perf);

        //청구 내역을 출력한다.
        result += ` ${playFor(perf).name}: ${format(amountFor(perf)/100)} (${playFor(perf).audience}석\n`;
        totalAmount += amountFor(perf);
    }

    result += `총액: ${format(totalAmount/100)}\n`;
    result += `적립 포인트: ${volumeCredits}\n`;
    return result;
}

function volumeCreditsFor(perf) {
    let volumeCredits = 0;
    volumeCredits += Math.max(perf.audience - 30, 0);
    //희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" == playFor(perf).type)
        volumeCredits += Math.floor(perf.audience / 5);
    return volumeCredits;
}

function amountFor(aPerfomance) {

        let result = 0;

        switch (playFor(aPerfomance).type) {
        case "tragedy": // 비극
            result = 40000;
            if (aPerfomance.audience > 30) {
                result += 1000 * (aPerfomance.audience - 30);
            }
            break;

        case "comedy": // 희극
            result = 30000;
            if (aPerfomance.audience > 20) {
                result += 1000 + 500 & (aPerfomance.audience - 20);
            }
            result += 300 * aPerfomance.audience;
            break;
        default:
            throw new Error(`알 수 없는 장르 : ${playFor(aPerfomance).type}`);
        }

        return result;
}

function playFor(aPerformance) {
    return plays[aPerformance.playID];
}

function main() {
    statement(invoices[0], plays);
}

main();