# 챕터 내용 정리

## 10장 - 조건부 로직 간소화

### 10.1 조건문 분해하기 (Decompose Conditional)

```javascript
if (!aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd))
    change = quantity * plan.summerRate;
else
    change = quantity * plan.regularRate + plan.regularServiceCharge;
```
▼
```javascript
if (summer())
    charge = summerCharge();
else
    charge = regularCharge();
```

> 복잡한 조건부 로직은 프로그램을 복잡하게 만드는 가장 흔한 원흉 (...)

- 조건문은 무슨 일이 일어나는지는 이야기 해 주지만 '왜' 일어나는지는 제대로 말해주지 않을 때가 많음
- 해당 조건이 무엇인지, 그래서 무엇을 분기했는지 강조할 것

#### 절차

1. 조건식과 그 조건식에 딸린 조건절 각각을 함수로 추출(6.1)

#### 예시
##### 단순한 예시
- 여름철에는 할인율을 다르게 적용하는 요금을 계산하는 프로그램
```javascript
if (!aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd))
    charge = quantity * plan.summerRate;
else
    charge = quantity * plan.regularRate + plan.regularServiceCharge;
```
▼
```javascript
if (summer())
    charge = quantity * plan.summerRate;
else
    charge = quantity * plan.regularRate + plan.regularServiceCharge;

function summer() { // 조건식을 별도 함수로 추출
    return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd);
}
```
▼
```javascript
if (summer())
    charge = summerCharge();
else
    charge = regularCharge();

function summer() {
    return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd);
}
function summerCharge() { // 로직도 별도 함수로 추출
    return quantity * plan.summerRate;
}
function regularCharge() { // 로직도 별도 함수로 추출
    return quantity * plan.regularRate + plan.regularServiceCharge;
}
```

### 10.2 조건식 통합하기 (Consolidate Conditional Expression)
```javascript
if (anEmployee.seniority < 2) return 0;
if (anEmployee.monthsDisabled > 12) return 0;
if (anEmployee.isPartTime) return 0;
```
▼
```javascript
if (isNotEligibleForDisability()) return 0;

function isNotEligibleForDisability() {
    return ((anEmployee.seniority < 2) 
        || (anEmployee.monthsDisabled > 12) 
        || (anEmployee.isPartTime));
}
```

- 조건부 코드를 통합하는 게 중요한 이유
    1. 나뉜 조건들을 통합함으로써 하려는 일이 더 명확해짐
    2. 함수 추출하기(6.1)로 이어질 수 있음
- 독립된 조건들이라고 판단 될 경우 리팩터링 X

#### 절차
1. 조건식에 부수효과를 확인
    - 부수효과가 있을 경우 → 질의 함수와 변경 함수 분리하기(11.1) 먼저 적용
2. 조건문 두 개를 선택하여, 조건식들을 논리 연산자로 결합
3. 테스트
4. 2~3 반복
5. 함수로 추출(6.1)할지 고려

#### 예시
##### or 사용하기
```javascript
function disabilityAmount(anEmployee) {
    if (anEmployee.seniority < 2) return 0;
    if (anEmployee.monthsDisabled > 12) return 0;
    if (anEmployee.isPartTime) return 0;
    // 장애 수당 계산 ...
}
```
▼
```javascript
function disabilityAmount(anEmployee) {
    if ((anEmployee.seniority < 2)
        || (anEmployee.monthsDisabled > 12)) return 0; // 2. 조건식을 결합 후 3. 테스트
    if (anEmployee.isPartTime) return 0;
}
```
▼
```javascript
function disabilityAmount(anEmployee) {
    if ((anEmployee.seniority < 2)
        || (anEmployee.monthsDisabled > 12)
        || (anEmployee.isPartTime)) return 0;  // 2. 조건식을 결합 후 3. 테스트
}
```
▼
```javascript
function disabilityAmount(anEmployee) {
    if (isNotEligableForDisability()) return 0;
    // compute the disability amount

    function isNotEligableForDisability() { // 함수로 추출
        return ((anEmployee.seniority < 2)
            || (anEmployee.monthsDisabled > 12)
            || (anEmployee.isPartTime));
    }
}
```

##### and 사용하기
```javascript
function something() {
    if (anEmployee.onVacation)
        if (anEmployee.seniority > 10)
            return 1;
    return 0.5;
}
```
▼
```javascript
function something() {
    if ((anEmployee.onVacation)
        && (anEmployee.seniority > 10)) return 1;
    return 0.5;
}
```

### 10.3 중첩 조건문을 보호 구문으로 바꾸기 (Replace Nested Conditional with Guard Clauses)
```javascript
function getPayAmount() {
    let result;
    if (isDead) result = deadAmount();
    else {
        if (isSeparated) result = separatedAmount();
        else {
            if (isRetired) result = retiredAmount();
            else result = normalPayAmount();
        }
    }
    return result
}
```
▼
```javascript
function getPayAmount() {
    if (isDead) return deadAmount();
    if (isSeparated) return separatedAmount();
    if (isRetired) return retiredAmount();
    return normalPayAmount();
}
```

- 조건문의 두 가지 형태
    1. 참 / 거짓 모두 정상 동작으로 이어지는 형태
        - if / else 사용
    2. 한 쪽만 정상인 형태
        - 비정상인 경우를 if 에서 검사하고, 함수에서 빠져나옴 (보호 구문 - guard clause)
- 중첩된 조건문을 보호 구문으로 바꾸는 이유?
    - 의도를 부각

#### 절차
1. 교체해야 할 조건 중 가장 바깥 것을 보호 구문으로 바꿈
2. 테스트
3. 1~2 반복
4. 같은 결과를 반환하는 보호 구문들의 조건식을 통합(10.2)

#### 예시
##### 간단한 예시
- 직원 급여를 계산하는 코드
```javascript
function payAmount(employee) {
    let result;
    if(employee.isSeparated) { // 퇴사 여부 체크
        result = {amount: 0, reasonCode: "SEP"};
    }
    else {
        if (employee.isRetired) { // 은퇴 여부 체크
            result = {amount: 0, reasonCode: "RET"};
        }
        else {
            // 급여 계산 로직
            lorem.ipsum(dolor.sitAmet);
            consectetur(adipiscing).elit();
            sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
            ut.enim.ad(minim.veniam);
            result = someFinalComputation();
        }
    }
    return result;
}
```
▼
```javascript
function payAmount(employee) {
    let result;
    if (employee.isSeparated) return {amount: 0, reasonCode: "SEP"}; // 1. 최상위 조건부터 보호 구문으로 변경 & 2. 테스트
    if (employee.isRetired) {
        result = {amount: 0, reasonCode: "RET"};
    }
    else {
        // 급여 계산 로직
        lorem.ipsum(dolor.sitAmet);
        consectetur(adipiscing).elit();
        sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
        ut.enim.ad(minim.veniam);
        result = someFinalComputation();
    }
    return result;
}
```
▼
```javascript
function payAmount(employee) {
    let result;
    if (employee.isSeparated) return {amount: 0, reasonCode: "SEP"};
    if (employee.isRetired)   return {amount: 0, reasonCode: "RET"}; // 3. 반복
    // 급여 계산 로직
    lorem.ipsum(dolor.sitAmet);
    consectetur(adipiscing).elit();
    sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
    ut.enim.ad(minim.veniam);
    result = someFinalComputation();
    return result;
}
```
▼
```javascript
function payAmount(employee) {
    // let result; // 불필요 변수 제거
    if (employee.isSeparated) return {amount: 0, reasonCode: "SEP"};
    if (employee.isRetired)   return {amount: 0, reasonCode: "RET"};
    // 급여 계산 로직
    lorem.ipsum(dolor.sitAmet);
    consectetur(adipiscing).elit();
    sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
    ut.enim.ad(minim.veniam);
    return someFinalComputation();
}
```
##### 예시 : 조건 반대로 만들기
```javascript
function adjustedCapital(anInstrument) {
    let result = 0;
    if (anInstrument.capital > 0) {
        if (anInstrument.interestRate > 0 && anInstrument.duration > 0) {
            result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
        }
    }
    return result;
}
```
▼
```javascript
function adjustedCapital(anInstrument) {
    let result = 0;
    if (anInstrument.capital <= 0) return result; // 보호 구문을 추가하며 조건을 역으로 변경
    if (anInstrument.interestRate > 0 && anInstrument.duration > 0) {
        result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
    }
    return result;
}
```
▼
```javascript
function adjustedCapital(anInstrument) {
    let result = 0;
    if (anInstrument.capital <= 0) return result;
    if (!(anInstrument.interestRate > 0 && anInstrument.duration > 0)) return result; //  복잡한 경우 (1) not 연산자 추가
    result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
    return result;
}
```
▼
```javascript
function adjustedCapital(anInstrument) {
    let result = 0;
    if (anInstrument.capital <= 0) return result;
    if (anInstrument.interestRate <= 0 || anInstrument.duration <= 0) return result; // (2) 간소화
    result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
    return result;
}
```
▼
```javascript
function adjustedCapital(anInstrument) {
    let result = 0;
    if (   anInstrument.capital      <= 0
        || anInstrument.interestRate <= 0
        || anInstrument.duration     <= 0) return result; // 4. 조건식 통합
    result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
    return result;
}
```
▼
- result 변수가 두 가지 의미를 지님 (예외 값, 최종 결과 값)
```javascript
function adjustedCapital(anInstrument) {
    if (   anInstrument.capital      <= 0
        || anInstrument.interestRate <= 0
        || anInstrument.duration     <= 0) return 0; // 변수 쪼개기(9.1)
    return (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
}
```

### 10.4 조건부 로직을 다형성으로 바꾸기 (Replace Conditional with Polymorphism)
```javascript
switch (bird.type) {
    case '유럽 제비':
        return '보통이다';
    case '아프리카 제비':
        return bird.numberOfCounts > 2 ? '지쳤다' : '보통이다';
    case '노르웨이 파랑 앵무':
        return bird.voltage > 100 ? '그을렸다' : '예쁘다';
    default:
        return '알 수 없다';
}
```
▼
```javascript
class EuropeanSwallow {
    get plumage() {
        return '보통이다';
    }
    // ...
}

class AfricanSwallow {
    get plumage() {
        return bird.numberOfCounts > 2 ? '지쳤다' : '보통이다';
    }
    // ...
}

class NorwegianBlueParrot {
    get plumage() {
        return bird.voltage > 100 ? '그을렸다' : '예쁘다';
    }
    // ...
}
```

- 클래스와 다형성을 이용해 조건부 로직을 직관적으로 구조화 할 수 있음

#### 절차
1. 다형적 동작을 표현하는 클래스들이 없을 경우 → 생성. 팩터리 함수도 함께 만들길 권함
2. 호출하는 코드에서 팩터리 함수를 사용
3. 조건부 로직 함수를 슈퍼클래스로 옮김
    - 조건부 로직이 온전한 함수로 분리되어 있지 않을 경우 → 먼저 함수로 추출(6.1)
4. 서브클래스에서 슈퍼클래스의 조건부 로직 메서드를 오버라이드. 선택된 서브클래스에 해당하는 조건절을 서브클래스 메서드로 복사한 후 적절히 수정
5. 4 반복
6. 슈퍼클래스 메서드에는 기본 동작 부분만 남김
    - 슈퍼클래스가 추상 클래스여야 할 경우 → 이 메서드를 추상으로 선언하거나 서브클래스에서 처리해야 함을 알리는 에러를 던짐

#### 예시
##### 기본 예시
- 다양한 새의 종류에 따른 비행 속도와 깃털 상태를 알려주는 프로그램
```javascript
function plumages(birds) {
    return new Map(birds.map(b => [b.name, plumage(b)]));
}
function speeds(birds) {
    return new Map(birds.map(b => [b.name, airSpeedVelocity(b)]));
}

function plumage(bird) {
    switch (bird.type) {
        case 'EuropeanSwallow':
            return "average";
        case 'AfricanSwallow':
            return (bird.numberOfCoconuts > 2) ? "tired" : "average";
        case 'NorwegianBlueParrot':
            return (bird.voltage > 100) ? "scorched" : "beautiful";
        default:
            return "unknown";
    }
}

function airSpeedVelocity(bird) {
    switch (bird.type) {
        case 'EuropeanSwallow':
            return 35;
        case 'AfricanSwallow':
            return 40 - 2 * bird.numberOfCoconuts;
        case 'NorwegianBlueParrot':
            return (bird.isNailed) ? 0 : 10 + bird.voltage / 10;
        default:
            return null;
    }
}
```
▼
```javascript
function plumage(bird) {
    return new Bird(bird).plumage;
}

function airSpeedVelocity(bird) {
    return new Bird(bird).airSpeedVelocity;
}

class Bird { // 3. 여러 함수를 클래스로 묶기(6.9)
    constructor(birdObject) {
        Object.assign(this, birdObject);
    }
    get plumage() {
        switch (this.type) {
            case 'EuropeanSwallow':
                return "average";
            case 'AfricanSwallow':
                return (this.numberOfCoconuts > 2) ? "tired" : "average";
            case 'NorwegianBlueParrot':
                return (this.voltage > 100) ? "scorched" : "beautiful";
            default:
                return "unknown";
        }
    }
    get airSpeedVelocity() {
        switch (this.type) {
            case 'EuropeanSwallow':
                return 35;
            case 'AfricanSwallow':
                return 40 - 2 * this.numberOfCoconuts;
            case 'NorwegianBlueParrot':
                return (this.isNailed) ? 0 : 10 + this.voltage / 10;
            default:
                return null;
        }
    }
}
```
▼
```javascript
function plumage(bird) {
    return createBird(bird).plumage; // 2. 객체를 얻을 때 팩터리 함수를 사용하도록 수정
}

function airSpeedVelocity(bird) {
    return createBird(bird).airSpeedVelocity;
}

function createBird(bird) { // 1. 팩터리 함수 생성
    switch (bird.type) {
        case 'EuropeanSwallow':
            return new EuropeanSwallow(bird);
        case 'AfricanSwallow':
            return new AfricanSwallow(bird);
        case 'NorweigianBlueParrot':
            return new NorwegianBlueParrot(bird);
        default:
            return new Bird(bird);
    }
}

class EuropeanSwallow extends Bird { // 1. 종 별 서브클래스 생성
}

class AfricanSwallow extends Bird {
}

class NorwegianBlueParrot extends Bird {
}
```
▼
```javascript
class EuropeanSwallow extends Bird {
    get plumage() { // 4. switch 문의 절 하나를 선택해 서브클래스에서 오버라이드
        return "average";
    }
}

class Bird { // 3. 여러 함수를 클래스로 묶기(6.9)
    constructor(birdObject) {
        Object.assign(this, birdObject);
    }
    get plumage() {
        switch (this.type) {
            case 'EuropeanSwallow':
                throw "오류 발생"; // 슈퍼클래스에 오류를 던지도록 추가 후 테스트 
            case 'AfricanSwallow':
                return (this.numberOfCoconuts > 2) ? "tired" : "average";
            case 'NorwegianBlueParrot':
                return (this.voltage > 100) ? "scorched" : "beautiful";
            default:
                return "unknown";
        }
    }
    //...
}
```
▼
```javascript
// 5. 반복
function plumages(birds) {
    return new Map(birds
        .map(b => createBird(b))
        .map(bird => [bird.name, bird.plumage]));
}
function speeds(birds) {
    return new Map(birds
        .map(b => createBird(b))
        .map(bird => [bird.name, bird.airSpeedVelocity]));
}

function createBird(bird) {
    switch (bird.type) {
        case 'EuropeanSwallow':
            return new EuropeanSwallow(bird);
        case 'AfricanSwallow':
            return new AfricanSwallow(bird);
        case 'NorwegianBlueParrot':
            return new NorwegianBlueParrot(bird);
        default:
            return new Bird(bird);
    }
}

class Bird {
    constructor(birdObject) {
        Object.assign(this, birdObject);
    }
    get plumage() {
        return "알 수 없다"; // 6. 슈퍼클래스의 메서드는 기본 동작용으로 남겨둠
    }
    get airSpeedVelocity() {
        return null;
    }
}
class EuropeanSwallow extends Bird {
    get plumage() {
        return "average";
    }
    get airSpeedVelocity() {
        return 35;
    }
}
class AfricanSwallow extends Bird {
    get plumage() {
        return (this.numberOfCoconuts > 2) ? "tired" : "average";
    }
    get airSpeedVelocity() {
        return 40 - 2 * this.numberOfCoconuts;
    }
}
class NorwegianBlueParrot extends Bird {
    get plumage() {
        return (this.voltage > 100) ? "scorched" : "beautiful";
    }
    get airSpeedVelocity() {
        return (this.isNailed) ? 0 : 10 + this.voltage / 10;
    }
}
```
##### 예시 : 변형 동작을 다형성으로 표현하기
- 신용 평가 기관에서 선박의 항해에 대해 투자 등급을 계산하는 코드
```javascript
function rating(voyage, history) { // 투자 등급
    const vpf = voyageProfitFactor(voyage, history);
    const vr = voyageRisk(voyage);
    const chr = captainHistoryRisk(voyage, history);
    if (vpf * 3 > (vr + chr * 2)) return "A";
    else return "B";
}
function voyageRisk(voyage) { // 항해 경로 위험요소
    let result = 1;
    if (voyage.length > 4) result += 2;
    if (voyage.length > 8) result += voyage.length - 8;
    if (["중국", "east-indies"].includes(voyage.zone)) result += 4;
    return Math.max(result, 0);
}
function captainHistoryRisk(voyage, history) { // 선장의 항해 이력 위험요소
    let result = 1;
    if (history.length < 5) result += 4;
    result += history.filter(v => v.profit < 0).length;
    if (voyage.zone === "중국" && hasChina(history)) result -= 2;
    return Math.max(result, 0);
}
function hasChina(history) { // 중국을 경유하는가?
    return history.some(v => "중국" === v.zone);
}
function voyageProfitFactor(voyage, history) { // 수익 요인
    let result = 2;
    if (voyage.zone === "중국") result += 1;
    if (voyage.zone === "east-indies") result += 1;
    if (voyage.zone === "중국" && hasChina(history)) { // 특수 상황을 검사하는 로직이 반복됨 (중국까지 항해해본 선장이 중국을 경유해 항해하는지 체크)
        result += 3;
        if (history.length > 10) result += 1;
        if (voyage.length > 12) result += 1;
        if (voyage.length > 18) result -= 1;
    }
    else {
        if (history.length > 8) result += 1;
        if (voyage.length > 14) result -= 1;
    }
    return result;
}


// 클라이언트 코드
const voyage = {zone: "west-indies", length: 10};
const history = [
    {zone: "east-indies", profit:  5},
    {zone: "west-indies", profit: 15},
    {zone: "중국",       profit: -2},
    {zone: "west-africa", profit:  7},
];

const myRating = rating(voyage, history);
```
▼
```javascript
class Rating { // 여러 함수를 클래스로 묶기(6.9)
    constructor(voyage, history) {
        this.voyage = voyage;
        this.history = history;
    }
    get value() {
        const vpf = this.voyageProfitFactor;
        const vr = this.voyageRisk;
        const chr = this.captainHistoryRisk;
        if (vpf * 3 > (vr + chr * 2)) return "A";
        else return "B";
    }
    get voyageRisk() {
        let result = 1;
        if (this.voyage.length > 4) result += 2;
        if (this.voyage.length > 8) result += this.voyage.length - 8;
        if (["중국", "east-indies"].includes(this.voyage.zone)) result += 4;
        return Math.max(result, 0);
    }
    get captainHistoryRisk() {
        let result = 1;
        if (this.history.length < 5) result += 4;
        result += this.history.filter(v => v.profit < 0).length;
        if (this.voyage.zone === "중국" && this.hasChinaHistory) result -= 2;
        return Math.max(result, 0);
    }
    get voyageProfitFactor() {
        let result = 2;

        if (this.voyage.zone === "중국") result += 1;
        if (this.voyage.zone === "east-indies") result += 1;
        if (this.voyage.zone === "중국" && this.hasChinaHistory) {
            result += 3;
            if (this.history.length > 10) result += 1;
            if (this.voyage.length > 12) result += 1;
            if (this.voyage.length > 18) result -= 1;
        }
        else {
            if (this.history.length > 8) result += 1;
            if (this.voyage.length > 14) result -= 1;
        }
        return result;
    }
    get hasChinaHistory() {
        return this.history.some(v => "중국" === v.zone);
    }
}

class ExperiencedChinaRating extends Rating { // 빈 서크를래스 만들기
}

function createRating(voyage, history) { // 팩터리 함수 만들기
    if (voyage.zone === "중국" && history.some(v => "중국" === v.zone))
        return new ExperiencedChinaRating(voyage, history);
    else return new Rating(voyage, history);
}

function rating(voyage, history) {
    return createRating(voyage, history).value; // 생성자를 호출하는 코드에서 팩터리 함수를 사용하도록 변경하기
}
```
▼
```javascript
class ExperiencedChinaRating extends Rating {
    get captainHistoryRisk() { // Rating 클래스의 captainHistoryRisk 메서드를 오버라이드
        const result = super.captainHistoryRisk - 2;
        return Math.max(result, 0);
    }
}

class Rating {
    // ...
    get captainHistoryRisk() {
        let result = 1;
        if (this.history.length < 5) result += 4;
        result += this.history.filter(v => v.profit < 0).length;
        // if (this.voyage.zone === "중국" && this.hasChinaHistory) result -= 2; // 해당 조건절 삭제
        return Math.max(result, 0);
    }
    // ...
}
```
▼
```javascript
class ExperiencedChinaRating extends Rating {
    get captainHistoryRisk() { // Rating 클래스의 captainHistoryRisk 메서드를 오버라이드
        const result = super.captainHistoryRisk - 2;
        return Math.max(result, 0);
    }
}

class Rating {
    // ...
    get captainHistoryRisk() {
        let result = 1;
        if (this.history.length < 5) result += 4;
        result += this.history.filter(v => v.profit < 0).length;
        // if (this.voyage.zone === "중국" && this.hasChinaHistory) result -= 2; // 해당 조건절 삭제
        return Math.max(result, 0);
    }
    // ...
}
```
- `voyageProfitFactor()`에서 변형 동작은 분리하기
```javascript
class Rating {
    // ...
    get voyageProfitFactor() {
        let result = 2;
    
        if (this.voyage.zone === "중국") result += 1;
        if (this.voyage.zone === "east-indies") result += 1;
        if (this.voyage.zone === "중국" && this.hasChinaHistory) {
            result += 3;
            if (this.history.length > 10) result += 1;
            if (this.voyage.length > 12) result += 1;
            if (this.voyage.length > 18) result -= 1;
        }
        else {
            if (this.history.length > 8) result += 1;
            if (this.voyage.length > 14) result -= 1;
        }
        return result;
    }
}
```
▼
```javascript
class Rating {
    // ...
    get voyageProfitFactor() {
        let result = 2;
    
        if (this.voyage.zone === "중국") result += 1;
        if (this.voyage.zone === "east-indies") result += 1;
        result += this.voyageAndHistoryLengthFactor; // 조건부 블록 전체를 함수로 추출(6.1)
        return result;
    }
    
    get voyageAndHistoryLengthFactor() {
        let result = 0;
        if (this.voyage.zone === "중국" && this.hasChinaHistory) {
            result += 3;
            if (this.history.length > 10) result += 1;
            if (this.voyage.length > 12) result += 1;
            if (this.voyage.length > 18) result -= 1;
        }
        else {
            if (this.history.length > 8) result += 1;
            if (this.voyage.length > 14) result -= 1;
        }
        return result;
    }
}
```
▼
```javascript
class Rating {
    // ...
    get voyageAndHistoryLengthFactor() {
        let result = 0;
        if (this.history.length > 8) result += 1;
        if (this.voyage.length > 14) result -= 1;
        return result;
    }
}

class ExperiencedChinaRating {
    // ...
    get voyageAndHistoryLengthFactor() {
        let result = 0;
        result += 3;
        if (this.history.length > 10) result += 1;
        if (this.voyage.length > 12) result += 1;
        if (this.voyage.length > 18) result -= 1;
        return result;
    }
}
```

### 10.5 특이 케이스 추가하기 (Introduce Special Case)
= Null 검사를 널 객체에 위임
```javascript
if (aCustomer === '미확인 고객') customerName = '거주자';
```
▼
```javascript
class UnknownCustomer {
    get name() { return '거주자'; }
}
```

- 특정 값을 확인한 후 똑같은 동작을 수행하는 중복 코드가 있을 때 → 한 데로 모으기
    - 특이 케이스 패턴(Special Case Pattern) : 특수한 경우의 공통 동작을 요소 하나에 모아서 사용
        - 단순한 데이터가 필요 할 경우 → 리터럴 객체 반환
        - 추가적인 동작을 수행해야 할 경우 → 필요한 메서드를 담은 객체 반환 

#### 절차
> 컨테이너 : 리팩터링의 대상의 될 속성을 담은 데이터 구조 / 클래스
1. 컨테이너에 특이 케이스인지 검사하는 속성을 추가하고, false 반환하게 만들기
2. 특이 케이스 객체 생성. 해당 객체는 특이 케이스인지를 검사하는 속성만 포함하며, 해당 속성은 true 반환하게 만들기
3. 클라이언트에서 특이 케이스를 검사하는 코드를 함수로 추출(6.1) 후 모든 클라이언트가 해당 함수를 사용하도록 수정
4. 코드에 새로운 특이 케이스 대상을 추가 (함수의 반환 값으로 받거나 변환 함수 적용)
5. 특이 케이스를 검사하는 함수 본문을 특이 케이스 객체의 속성을 사용하도록 수정
6. 테스트
7. 특이 케이스를 처리하는 공통 동작을 새로운 요소로 옮김
    - 여러 함수를 클래스로 묶기(6.9)
    - 여러 함수를 변환 함수로 묶기(6.10)
    - 특이 케이스 클래스는 간단한 요청에는 항상 같은 값을 반환하는 경우가 많음 → 해당 특이 케이스의 리터럴 레코드를 만들 수도 있음
8. 특이 케이스 검사 함수를 이용하는 곳이 남아 있을 경우 → 검사 함수를 인라인(6.2)

#### 예시
- 전력 회사의 프로그램에서, 이사 온 고객의 정보를 "미확인 고객"으로 처리할 때
```javascript
class Site {
    get customer() {return this._customer;}
}

class Customer {
    get name()           { /* ... */ }
    get billingPlan()    { /* ... */ }
    set billingPlan(arg) { /* ... */ }
    get paymentHistory() { /* ... */ }
}

// 클라이언트 1
const aCustomer = site.customer;
let customerName;
if (aCustomer === "unknown") customerName = "occupant";
else customerName = aCustomer.name;

// 클라이언트 2
const plan = (aCustomer === "unknown") ?
    registry.billingPlans.basic
    : aCustomer.billingPlan;

// 클라이언트 3
if (aCustomer !== "unknown") aCustomer.billingPlan = newPlan;

// 클라이언트 4
const weeksDelinquent = (aCustomer === "unknown") ?
    0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
- 고객 명으로는 occupant, 기본 billing plan, 연체(delinquent) 기간은 0 week 처리 → 특이 케이스 객체 
▼
```javascript
class Customer {
    get name()           { /* ... */ }
    get billingPlan()    { /* ... */ }
    set billingPlan(arg) { /* ... */ }
    get paymentHistory() { /* ... */ }
    get isUnknown() {return false;} // 1. 미확인 고객을 표시하는 메서드를 고객 클래스에 추가
}

class UnknownCustomer { // 2. 미확인 고객 전용 클래스 생성
    get isUnknown() {return true;}
}

function isUnknown(arg) { // 3. 한 번에 수정할 수 있도록 여러 곳에서 사용하는 코드를 함수로 추출(6.1)
    if (!((arg instanceof Customer) || (arg === "unknown")))
        throw new Error(`investigate bad value: <${arg}>`);
    return (arg === "unknown");
}

// 클라이언트 1
let customerName;
if (isUnknown(aCustomer)) customerName = "occupant";
else customerName = aCustomer.name;

// 클라이언트 2
const plan = (isUnknown(aCustomer)) ?
    registry.billingPlans.basic
    : aCustomer.billingPlan;

// 클라이언트 3
if (!isUnknown(aCustomer)) aCustomer.billingPlan = newPlan;

// 클라이언트 4
const weeksDelinquent = isUnknown(aCustomer) ?
    0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
▼
```javascript
class Site {
    get customer() {
        return (this._customer === "unknown") ? new UnknownCustomer() : this._customer; // 4. 특이 케이스일 때 UnknownCustomer 객체를 반환하도록 수정
    }
}

function isUnknown(arg) {
    if (!(arg instanceof Customer || arg instanceof UnknownCustomer)) // 5. isUnknown() 함수를 수정하여 "unknown" 문자열을 사용하던 코드를 완전히 제거
        throw new Error(`investigate bad value: <${arg}>`);
    return arg.isUnknown;
}

// 6. 테스트

class UnknownCustomer { // 7. 여러 함수를 클래스로 묶기(6.9)
    get isUnknown() {return true;}
    get name() {return "occupant";} // 이름을 기본값으로 두기
    get billingPlan()    {return registry.billingPlans.basic;}
    set billingPlan(arg) { /* ignore */ } // 겉보기 동작은 동일해야 하므로 세터는 생성하지만, 동작은 없도록 하기
    get paymentHistory() {return new NullPaymentHistory();}
    get weeksDelinquentInLastYear() {return 0;}

}

// 클라이언트 1
const customerName = aCustomer.name;

// 클라이언트 2
const plan = aCustomer.billingPlan;

// 클라이언트 3
aCustomer.billingPlan = newPlan;

// 클라이언트 4
const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
##### 예시: 객체 리터럴 이용하기
- 정보가 갱신될 필요가 없이, 데이터 구조를 읽기만 한다면 리터럴 객체 사용 가능
    - 이렇게 리터럴을 사용하기 위해서는 불변으로 만들어야 함
```javascript
class Site {
    get customer() {return this._customer;}
}

class Customer {
    get name()           { /* ... */ }
    get billingPlan()    { /* ... */ }
    set billingPlan(arg) { /* ... */ }
    get paymentHistory() { /* ... */ }
}

// 클라이언트 1
const aCustomer = site.customer;
let customerName;
if (aCustomer === "unknown") customerName = "occupant";
else customerName = aCustomer.name;

// 클라이언트 2
const plan = (aCustomer === "unknown") ?
    registry.billingPlans.basic
    : aCustomer.billingPlan;

// 클라이언트 3
const weeksDelinquent = (aCustomer === "unknown") ?
    0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
▼
```javascript
class Customer {
    get name()           { /* ... */ }
    get billingPlan()    { /* ... */ }
    set billingPlan(arg) { /* ... */ }
    get paymentHistory() { /* ... */ }
    get isUnknown() {return false;} // 1. isUnknown() 속성을 추가
}

function createUnknownCustomer() { // 2. 특이 케이스 객체 생성(리터럴)
    return {
        isUnknown: true,
    };
}

function isUnknown(arg) { // 3. 특이 케이스 조건 검사 로직을 함수로 추출(6.1)
    return (arg === "unknown");
}

// 클라이언트 1
let customerName;
if (isUnknown(aCustomer)) customerName = "occupant";
else customerName = aCustomer.name;

// 클라이언트 2
const plan = isUnknown(aCustomer) ?
    registry.billingPlans.basic
    : aCustomer.billingPlan;

// 클라이언트 3
const weeksDelinquent = isUnknown(aCustomer) ?
    0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
▼
```javascript
class Site {
    get customer() { // 4. Site 클래스에서 특이 케이스를 이용하도록 수정
        return (this._customer === "unknown") ? createUnknownCustomer() : this._customer;
    }
}

function isUnknown(arg) { // 4. 조건 검사 코드에서 특이 케이스를 이용하도록 수정
    return arg.isUnknown;
}
```
▼
```javascript
function createUnknownCustomer() {
    return {
        isUnknown: true,
        name: "occupant", // 7. 각각의 표준 응답을 적절한 리터럴 값으로 대체
        billingPlan: registry.billingPlans.basic,
        paymentHistory: {
            weeksDelinquentInLastYear: 0,
        },
    };
}


// 클라이언트 1
const customerName = aCustomer.name;

// 클라이언트 2
const plan = aCustomer.billingPlan;

// 클라이언트 3
const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
##### 예시: 변환 함수 이용하기
```javascript
input = {
    name: "Acme Boston",
    location: "Malden MA",
    // more site details
    customer: {
        name: "Acme Industries",
        billingPlan: "plan-451",
        paymentHistory: {
            weeksDelinquentInLastYear: 7
            //more
        },
        // more
    }
}

unknown = {
    name: "Warehouse Unit 15",
    location: "Malden MA",
    // more site details
    customer: "unknown",
}


// 클라이언트 1
const site = acquireSiteData();
const aCustomer = site.customer;
let customerName;
if (aCustomer === "unknown") customerName = "occupant";
else customerName = aCustomer.name;

// 클라이언트 2
const plan = (aCustomer === "unknown") ?
    registry.billingPlans.basic
    : aCustomer.billingPlan;

// 클라이언트 3
const weeksDelinquent = (aCustomer === "unknown") ?
    0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
▼
```javascript
// 클라이언트 1
const rawSite = acquireSiteData();
const site = enrichSite(rawSite);
const aCustomer = site.customer;
let customerName;
if (aCustomer === "unknown") customerName = "occupant";
else customerName = aCustomer.name;

function enrichSite(inputSite) { // 변환함수를 이용하도록 수정
    return _.cloneDeep(inputSite);
}
```
▼
```javascript
function isUnknown(aCustomer) { // 3. 조건 검사 로직 함수로 추출(6.1)
    return aCustomer === "unknown";
}

// 클라이언트 1
const rawSite = acquireSiteData();
const site = enrichSite(rawSite);
const aCustomer = site.customer;
let customerName;
if (isUnknown(aCustomer)) customerName = "occupant";
else customerName = aCustomer.name;

function enrichSite(inputSite) {
    return _.cloneDeep(inputSite);
}

// 클라이언트 2
const plan = (isUnknown(aCustomer)) ?
    registry.billingPlans.basic
    : aCustomer.billingPlan;

// 클라이언트 3
const weeksDelinquent = (isUnknown(aCustomer)) ?
    0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
▼
```javascript
function enrichSite(aSite) { // 1,2. 고객 레코드에 isUnknown() 속성을 추가하여 현장 정보를 보강(enrich)함
    const result = _.cloneDeep(aSite);
    const unknownCustomer = {
        isUnknown: true,
    };

    if (isUnknown(result.customer)) result.customer = unknownCustomer;
    else result.customer.isUnknown = false;
    return result;
}

function isUnknown(aCustomer) { // 5. 특이 케이스 검사 시 해당 속성을 이용하도록 수정 (원래의 검사도 유지하여 하위호환성 지켜주기)
    if (aCustomer === "unknown") return true;
    else return aCustomer.isUnknown;
}

// 6. 테스트

// 7. 특이 케이스에 여러 함수를 변환 함수로 묶기(6.10) 적용
```

### 10.6 어서션 추가하기 (Introduce Assertion)
```javascript
if (this.discountRate) base = base - this.discountRate * base;
```
▼
```javascript
assert(this.discountRate >= 0);
if (this.discountRate) base = base - this.discountRate * base;
```
- 특정 조건이 참일 때만 제대로 동작해야 하는 경우 → 어서션 사용
    - 어서션 실패는 시스템의 다른 부분에서 검사하지 말아야 함
    - 어서션 유무가 프로그램의 정상 동작에 아무런 영향을 주지 않아야 함 (시스템 운영에 영향을 주면 안됨)
- 장점
    - 오류 찾기에 좋음
    - 프로그램이 어떤 상태를 가정하고 실행되는지 개발자에게 알려주는 지표 (소통 측면)

#### 절차
1. 참이라고 가정하는 조건을 명시하는 어서션을 추가

#### 예시
```javascript
class Customer {
    applyDiscount(aNumber) {
        return (this.discountRate)
            ? aNumber - (this.discountRate * aNumber)
            : aNumber;
    }
}
```
▼
```javascript
class Customer {
    applyDiscount(aNumber) { 
        if (!this.discountRate) return aNumber; // 어서션을 넣을 자리 만들기
        else return aNumber - (this.discountRate * aNumber);
    }
}
```
▼
```javascript
class Customer {
    applyDiscount(aNumber) {
        if (!this.discountRate) return aNumber;
        else {
            assert(this.discountRate >= 0); // 1. 어서션 추가
            return aNumber - (this.discountRate * aNumber);
        }
    }
}
```
▼
```javascript
class Customer {
    set discountRate(aNumber) { // 여기서는 어서션을 세터에 넣는게 오류의 출처를 특정하기 좋음
        assert(null === aNumber || aNumber >= 0);
        this._discountRate = aNumber;
    }
}
```

### 10.7 제어 플래그를 탈출문으로 바꾸기 (Replace Control Flag with Break)
```javascript
for (const p of people) {
    if (!found) {
        if (p === '조커') {
            sendAlert();
            found = true;
        }
        // ...
    }
}
```
▼
```javascript
// after
for (const p of people) {
    if (p === '조커') {
        sendAlert();
        break;
    }
    // ...
}
```
- 제어플래그는 악취를 풍기기 쉽고, 리팩터링으로 간소화할 수 있음

#### 절차
1. 제어 플래그를 사용하는 코드를 함수로 추출(6.1) 할지 고려
2. 제어 플래그를 갱신하는 코드 각각을 적절한 제어문으로 변경 및 테스트
    → 제어문으로는 주로 return, break, continue 가 쓰임
3. 모두 수정 후 제어 플래그를 제거
