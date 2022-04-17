// commonjs import 
const invoices = require("./invoices.json");
const plays = require("./plays.json");

// ES5+
// import ~ from "./invoices.json";

function statement(invoice, plays) {
    const statementData = {}; // hashMap
    statementData.customer = invoice.customer; // 고객 데이터를 중간 데이터로 옮김
    statementData.performances = invoice.performances.map(enrichPerformance); // 공연 정보를 중간 데이터로 옮김
    return renderPlainText(statementData, plays);

    function enrichPerformance(aPerfomance) {
        const result = Object.assign({}, aPerfomance); // 얕은 복사 수행
        result.play = playFor(result);
        result.amount = amountFor(result);
        return result;
    }
    
    function playFor(aPerformance) {
        return plays[aPerformance.playID];
    }

    function amountFor(aPerfomance) {
        let result = 0;

        switch (aPerfomance.play.type) {
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
                throw new Error(`알 수 없는 장르 : ${aPerfomance.play.type}`);
        }

        return result;
    }
}

function renderPlainText(data, plays) {
    let result = `청구내역 (고객명: ${data.customer})\n`;

    for (let perf of data.performances) {
        result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`;
    }

    result += `총액: ${usd(totalAmount())}\n`;
    result += `적립 포인트: ${totalVolumeCredits()}\n`;

    return result;

    function totalAmount() {
        let result = 0;
        for (let perf of data.performances) {
            result += perf.amount;
        }

        return result;
    }

    function totalVolumeCredits() {
        let result = 0;
        for (let perf of data.performances) {
            result += volumeCreditsFor(perf);
        }

        return result;
    }

    function usd(aNumber) {
        return new Intl.NumberFormat("en-us", {
            style: "currency", currency: "USD",
            minimumFractionDigits: 2
        }).format(aNumber / 100);
    }

    function volumeCreditsFor(aPerfomance) {
        let volumeCredits = 0;
        volumeCredits += Math.max(aPerfomance.audience - 30, 0);

        if ("comedy" == aPerfomance.play.type)
            volumeCredits += Math.floor(aPerfomance.audience / 5);

        return volumeCredits;
    }
}

function main() {
    console.log(statement(invoices[0], plays));
}

main();