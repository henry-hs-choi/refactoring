var assert = require('assert');
//var expect = require('expect');

class Province {
    constructor(doc) {
        this._name = doc.name;
        this._producers = [];
        this._totalProduction = 0;
        this._demand = doc.demand;
        this._price = doc.price;
        doc.producers.forEach(d => this.addProducer(new Producer(this, d)));
    }

    addProducer(arg) {
        this._producer.push(arg);
        this._totalProduction += arg.production;
    }

    get name() {return this._name};
    get producers() {return this._producers.slice();}
    get totalProduction() {return this._totalProduction;}
    set totalProduction(arg) {this._totalProduction = arg;}
    get demand() {return this._demand;}
    set demand(arg) {this._demand = parseInt(arg);}
    get price() {return this._price;}
    set price(arg) {this._price = parseInt(arg);}

    get shortfall() {
        return this._demand - this.totalProduction;
    }

    get profit() {
        return this.demandValue - this.demandCost;
    }

    get demandValue() {
        return this.satisfiedDemand * this.price;
    }

    get satisfiedDemand() {
        return Math.min(this._demand, this.totalProduction);
    }
    
    get demandCost() {
        let remainingDemand = this.demand;
        let result = 0;
        this.producers
          .sort((a,b) => a.cost - b.cost)
          .forEach(p => {
              const contribution = Math.min(remainingDemand, p.production);
              remainingDemand -= contribution;
              result += contribution * p.cost;
          });
          return result;
    }

}

class Producer {
    constructor(aProvince, data) {
        this._province = aProvince;
        this._cost = data.cost;
        this._name = data.name;
        this._production = data.production || 0;
    }

    get name() {return this._name;}
    get cost() {return this._cost;}
    set cost(arg) {this._cost = parseInt(arg);}

    get production() {return this._production;}
    set production(amountStr) {
        const amount = parseInt(amountStr);
        const newProduction = Number.isNaN(amount) ? 0 : amount;
        this._province.totalProduction += newProduction - this._production;
        this._production = newProduction;
    }

}

function sampleProvinceData() {
    return {
        name: "Asia",
        producers: [
            {
                name: "Byzantium", cost: 10, production: 9
            },
            {
                name: "Attalia", cost: 12, production: 10
            },
            {
                name: "Sinope", cost: 10, production: 6
            }
        ],
        demand: 30,
        price: 20
    };
}

function main() {
    console.log(sampleProvinceData());
}

main();

describe('province', function () {
    let asia;
    beforeEach(function() {
        asia = new Province(sampleProvinceData());
    });

    it('shortfall', function () {
        assert.equal(asia.shortfall, 5);
    });

/* 
    it('shortfall', function () {
        const asia = new Province(sampleProvinceData());
        expect(asia.shortfall).equal(5);
    });
 */
    it('profit', function() {
        assert.equal(asia.profit, 230);
    })

    it('change production', function() {
        asia.producers[0].production = 20;
        assert.equal(asia.shortfall).equal(-6);
        assert.equal(asia.profit).equal(292);
    })

    it('zero demand', function() { // 수요가 없다.
        asia.demand = 0;
    })

    it('negative demand', function() { // 수요가 없다.
        asia.demand = -1;
        assert.equal(asia.shortfall, -26);
        assert.equal(asia.profit, -10);
    })

    it('emty string demand', function() { // 빈 수요입력란
        asia.demand = "";
        assert.equal(asia.shortfall, NaN);
        assert.equal(asia.profit, NaN);
    })
});

describe('no producers', function () { // 생산자가 없다
    let noProducers;
    beforeEach(function() {
        const data = {
            name: "No Producers",
            producers: [],
            demand: 30,
            price: 20
        };
        noProducers = new Province(data);
    });

    it('shortfall', function () {
        assert.equal(noProducers.shortfall, 30);
    });

    it('profit', function() {
        assert.equal(noProducers.profit, 0);
    })
});

describe('string for producers', function () { // 생산자 수 필드에 문자열을 대입한다.
    it('', function() {
        const data = {
            name: "String producers",
            producers: "",
            demand: 30,
            price: 20
        };
        const prov = new Province(data);
        assert(prov.shortfall).equal(0);
    })
});
