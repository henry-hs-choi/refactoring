
// 4.3 테스트 수행
// 모카 사용
describe('province', function() {
    it('shortfall', function() {
        const asia = new Province(sampleProvinceData()); // 픽스처(fixture) 설정
        assert.equal(asia.shortfall, 5); // 검증
    });
});

// 차이 사용
describe('province', function() {
    it('shortfall', function() {
        const asia = new Province(sampleProvinceData());
        assert.equal(asia.shortfall, 5);
    });
});
// 차이에서 expect 문 이용
describe('province', function() {
    it('shortfall', function() {
        const asia = new Province(sampleProvinceData());
        expect(asia.shortfall).equal(5);
    });
});


// 4.4 여러 테스트 수행
describe('province', function() {
    const asia = new Province(sampleProvinceData()); // 이렇게 테스트끼리 상호작용하게 하는 공유 픽스처를 생성하면 안 됨!
    it('shortfall', function() {
        expect(asia.shortfall).equal(5);
    });
    it('profit', function() {
        expect(asia.profit).equal(230);
    });
});
// 테스트를 싱행하는 순서에 따라 결과가 달라질 수 있음

describe('province', function() {
    let asia;
    beforeEach(function() {
        asia = new Province(sampleProvinceData()); // 이렇게 하는게 더 나음
    });
    it('shortfall', function() {
        expect(asia.shortfall).equal(5);
    });
    it('profit', function() {
        expect(asia.profit).equal(230);
    });
});
// 모든 테스트들이 모두 똑같은 픽스처에 기초하여 검증하는게 좋음
// 표준 픽스처에 익숙해져서 테스트할 속성을 다양하게 찾아낼 수 있음


// 4.5 픽스처 내용을 수정하여 테스트도 진행해봄
describe('province', function() {
    let asia = new Province(sampleProvinceData());
    it('change production', function() {
        asia.producers[0].production = 20;
        expect(asia.shortfall).equal(-6);
        expect(asia.profit).equal(292); // shortfall과 profit 속성이 밀접하지 않다면 별개의 it 구문으로 나눌 수 있음
    });
});


// 4.6 경계 조건 테스트
describe('no producers', function() { // 생산자가 없을 경우
    let noProducers;
    beforeEach(function() {
        const data = {
            name: "No producers",
            producers: [],
            demand: 30,
            price: 20
        };
        noProducers = new Province(data);
    })
    it('shortfall', function() {
        expect(asia.shortfall).equal(30);
    });
    it('profit', function() {
        expect(asia.profit).equal(0);
    });
});

describe('province', function() { // 생산자가 없을 경우
    asia.demand = 0;
    let noProducers;
    beforeEach(function() {
        const data = {
            name: "No producers",
            producers: [],
            demand: 30,
            price: 20
        };
        noProducers = new Province(data);
    })
    it('zero demand', function() { // 숫자형일 경우 0도 검사해 봄
        asia.demand = 0;
        expect(asia.shortfall).equal(-25);
        expect(asia.profit).equal(0)
    });
    it('negative', function() { // 음수도 검사해 봄
        asia.demand = -1;
        expect(asia.shortfall).equal(-26);
        expect(asia.profit).equal(-10);
    });
});
// 수요가 음수일 때 수익이 음수라는 것이 고객 관점에서 말이 되는지, 특이 상황을 어떻게 처리하면 좋을 지 고민하기 좋음

describe('string for producers', function() { // 생산자 수 필드에 문자열을 대입
    it('', function () {
        const data = {
            name: "String producers",
            producers: "",
            demand: 30,
            price: 20
        }
        const prov = new Province(data);
        expect(prov.shortfall).equal(0);
    });
});