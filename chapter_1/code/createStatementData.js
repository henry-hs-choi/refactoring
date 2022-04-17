
class PerformanceCalculator {
    constructor(aPerfomance, aPlay) {
        this.performance = aPerfomance;
        this.play = aPlay;
    }

    get amount() {
        let result = 0;
        switch (this.play.type) {
            case "tragedy": // 비극
                result = 40000;
                if (this.performance.audience > 30) {
                    result += 1000 * (this.performance.audience - 30);
                }
                break;
            case "comedy": // 희극
                result = 30000;
                if (this.performance.audience > 20) {
                    result += 1000 + 500 & (this.performance.audience - 20);
                }
                result += 300 * this.performance.audience;
                break;
            default:
                throw new Error(`알 수 없는 장르 : ${this.performance.play.type}`);
        }
        return result;
    }

    get volumeCredits() {
        let volumeCredits = 0;
        volumeCredits += Math.max(this.performance.audience - 30, 0);

        if ("comedy" == this.play.type)
            volumeCredits += Math.floor(this.performance.audience / 5);

        return volumeCredits;
    }
}

function createPerfomanceCalculator(aPerfomance, aPlay) {
    return new PerformanceCalculator(aPerfomance, aPlay);
}

function createStatementData(invoice, plays) {
    const statementData = {}; // hashMap
    statementData.customer = invoice.customer; // 고객 데이터를 중간 데이터로 옮김
    statementData.performances = invoice.performances.map(enrichPerformance); // 공연 정보를 중간 데이터로 옮김
    statementData.totalAmount = totalAmount(statementData);
    statementData.totalVolumeCredits = totalVolumeCredits(statementData);
    return statementData;

    function enrichPerformance(aPerfomance) {
        const calculator = createPerfomanceCalculator(aPerfomance, playFor(aPerfomance));
        const result = Object.assign({}, aPerfomance); // 얕은 복사 수행
        result.play = calculator.play;
        result.amount = calculator.amount;
        result.volumeCredits = calculator.volumeCredits;
        return result;
    }

    function playFor(aPerformance) {
        return plays[aPerformance.playID];
    }

    function totalAmount(data) {
        return data.performances
            .reduce((total, p) => total + p.amount, 0);
    }

    function totalVolumeCredits(data) {
        return data.performances
            .reduce((total, p) => total + p.volumeCredits, 0);
    }
}

module.exports = createStatementData;