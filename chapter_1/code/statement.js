// commonjs import 
const createStatementData = require("./createStatementData");
const invoices = require("./invoices.json");
const plays = require("./plays.json");

// ES5+
// import ~ from "./invoices.json";

function statement(invoice, plays) {
    return renderPlainText(createStatementData(invoice, plays));
}

function renderPlainText(data) {
    let result = `청구내역 (고객명: ${data.customer})\n`;

    for (let perf of data.performances) {
        result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`;
    }

    result += `총액: ${usd(data.totalAmount)}\n`;
    result += `적립 포인트: ${data.totalVolumeCredits}\n`;

    return result;
}

function usd(aNumber) {
    return new Intl.NumberFormat("en-us", {
        style: "currency", currency: "USD",
        minimumFractionDigits: 2
    }).format(aNumber / 100);
}


function main() {
    console.log(statement(invoices[0], plays));
}

main();