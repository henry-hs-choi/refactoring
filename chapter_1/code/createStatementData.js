
class PerformanceCalculator {
    constructor(aPerfomance, aPlay) {
        this.performance = aPerfomance;
        this.play = aPlay;
    }

    get amount() {
        throw new Error(`subclass responsibility`);
    }

    get volumeCredits() {
        return Math.max(this.performance.audience - 30, 0);
    }
}

class TragedyCalculator extends PerformanceCalculator {
    get amount() {
        let result = 40000;
        if (this.performance.audience > 30) {
            result += 1000 * (this.performance.audience - 30);
        }    
        return result;
    }
}

class ComedyCalculator extends PerformanceCalculator {
    get amount() {
        let result = 30000;
        if (this.performance.audience > 20) {
            result += 1000 + 500 & (this.performance.audience - 20);
        }
        result += 300 * this.performance.audience;
        return result;
    }

    get volumeCredits() {
        return super.volumeCredits + Math.floor(this.performance.audience / 5);
    }
}

function createPerfomanceCalculator(aPerfomance, aPlay) {
    switch(aPlay.type) {
        case "tragedy" : return new TragedyCalculator(aPerfomance, aPlay);
        case "comedy" : return new ComedyCalculator(aPerfomance, aPlay);
    }
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