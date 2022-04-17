// commonjs import 
const createStatementData = require("./createStatementData");
const invoices = require("./invoices.json");
const plays = require("./plays.json");

// ES5+
// import ~ from "./invoices.json";

function htmlStatement(invoice, plays) {
    return renderHtml(createStatementData(invoice, plays));
}

function renderHtml(data) {
    let result = `<h1>청구내역 (고객명: ${data.customer})</h1>\n`;

    result += "<table>\n";
    result += "<tr><th>연극</th><th>좌석수</th><th>금액</th></tr>";

    for (let perf of data.performances) {
        result += ` <tr><td>${perf.play.name}</td><td>(${perf.audience}석)\n</td>`;
        result += `<td>${usd(perf.amount)}</td></tr>\n`;
    }

    result += "</table>\n";
    result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
    result += `<pm>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`;

    return result;
}

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
    console.log(htmlStatement(invoices[0], plays));
}

main();