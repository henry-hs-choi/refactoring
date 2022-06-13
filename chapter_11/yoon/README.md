# 챕터 내용 정리

## 11장 - API 리팩터링

> 모듈과 함수는 소프트웨어를 구성하는 빌딩 블록이며, API는 이 블록들을 끼워 맞추는 연결부다.
>
### 11.1 질의 함수와 변경 함수 분리하기 (Separate Query from Modifier)

```javascript
function getTotalOutstandingAndSendBill() {
    const result = customer.invoices.reduce( (total, each) => each.amount + total, 0);
    sendBill();
    return result;
}
```
▼
```javascript
function totalOutstanding() {
    return customer.invoices.reduce((total, each) => each.amount + total, 0);
}
function sendBill() {
    emailGateway.send(formatBill(customer));
}
```

- 외부에서 보았을 때 겉보기 부수효과(Observable Side Effect) 없이 값을 반환해주는 함수를 추구해야 함
    - 언제, 얼만큼 호출해도 문제가 없으며 테스트도 쉬워짐
- 겉보기 부수효과가 있는 함수와 없는 함수를 구분하자
    - *질의 함수는 모두 부수효과가 없어야 함* : 명령-질의 분리(Command-Query Separation)
    - 값을 반환하면서 부수효과도 있는 함수 → 상태를 변경하는 부분과 질의하는 부분을 분리할 것!

#### 절차

1. 대상 함수를 복제하고 질의 목적에 충실한 이름 짓기
2. 새 질의 함수에서 부수효과 제거
3. 정적 검사 수행
4. 원래 함수를 호출하는 곳을 찾아 변경
    - 반환 값을 사용한다면 질의 함수를 호출하도록 변경 후 원래 함수를 호출하는 코드를 바로 아래 줄에 새로 추가 / 테스트
5. 원래 함수에서 질의 관련 코드 제거
6. 테스트


#### 예시
- 이름 목록을 훑어 악당(miscreant)을 찾아 반환하고, 경고를 울리는 프로그램
```javascript
function alertForMiscreant (people) {
    for (const p of people) {
        if (p === "Don") {
            setOffAlarms();
            return "Don";
        }
        if (p === "John") {
            setOffAlarms();
            return "John";
        }
    }
    return "";
}

const found = alertForMiscreant(people);
```
▼
```javascript
function findMiscreant (people) { // 1. 함수를 복제하고 질의 목적에 맞는 이름 짓기
    for (const p of people) {
        if (p === "Don") {
            // setOffAlarms(); // 2. 부수효과를 낳는 부분 제거
            return "Don";
        }
        if (p === "John") {
            // setOffAlarms();
            return "John";
        }
    }
    return "";
}

const found = findMiscreant(people); // 4. 원래 함수를 호출하는 곳을 찾아, 새 질의함수를 호출하도록 변경
alertForMiscreant(people); // 4. 원래의 변경 함수를 호출하는 코드를 바로 아래에 삽입
```
▼
```javascript
function alertForMiscreant (people) {
    for (const p of people) {
        if (p === "Don") {
            setOffAlarms();
            return; // 5. 원래의 변경 함수에서 질의 관련 코드 삭제
        }
        if (p === "John") {
            setOffAlarms();
            return;
        }
    }
    return;
}
```

### 11.2 함수 매개변수화하기 (Parameterize Function)
```javascript
function tenPercentRaise(aPerson) {
    aPerson.salary = aPerson.salary.multiply(1.1)
}
function fivePercentRaise(aPerson) {
    aPerson.salary = aPerson.salary.multiply(1.05)
}
```
▼
```javascript
function raise(aPerson, factor) {
    aPerson.salary = aPerson.salary.multiply(1 + factory)
}
```

- 두 함수의 로직이 아주 비슷하고 단지 리터럴 값만 다를 경우, 해당 값만 매개변수로 받아 처리하는 함수로 합칠 수 있음

#### 절차
1. 비슷한 함수 중 하나를 선택
2. 함수 선언 바꾸기(6.5)로 리터럴들을 매개변수로 추가
3. 이 함수를 호출하는 곳 모두에 적절한 리터럴 값 추가
4. 테스트
5. 매개변수로 받은 값을 사용하도록 함수 본문 수정 / 테스트
6. 비슷한 다른 함수도 마찬가지로 적용
    - 새롭게 만든 함수가 이 함수와 다르게 동작한다면, 이 동작도 처리할 수 있도록 본문 코드를 적절히 수정 후 진행

#### 예시
##### 명백한 예시
```javascript
function tenPercentRaise(aPerson) {
    aPerson.salary = aPerson.salary.multiply(1.1);
}
function fivePercentRaise(aPerson) {
    aPerson.salary = aPerson.salary.multiply(1.05);
}
```
▼
```javascript
function raise(aPerson, factor) {
    aPerson.salary = aPerson.salary.multiply(1 + factor);
}
```
##### 간단히 끝나지 않는 경우
```javascript
function baseCharge(usage) {
    if (usage < 0) return usd(0);
    const amount =
        bottomBand(usage) * 0.03
        + middleBand(usage) * 0.05
        + topBand(usage) * 0.07;
    return usd(amount);
}

function bottomBand(usage) {
    return Math.min(usage, 100);
}

function middleBand(usage) { // 1. 다른 함수들을 고려해봤을 때 중간 정도로 비슷한 함수를 선택
    return usage > 100 ? Math.min(usage, 200) - 100 : 0;
}

function topBand(usage) {
    return usage > 200 ? usage - 200 : 0;
}
```
▼
```javascript
function withinBand(usage, bottom, top) { // 2. 함수 선언 바꾸기(6.5)
    return usage > 100 ? Math.min(usage, 200) - 100 : 0;
}

function baseCharge(usage) {
    if (usage < 0) return usd(0);
    const amount =
        bottomBand(usage) * 0.03
        + withinBand(usage, 100, 200) * 0.05 // 3. 해당 리터럴들을 호출 시점에 입력하도록 수정
        + topBand(usage) * 0.07;
    return usd(amount);
}
```
▼
```javascript
function withinBand(usage, bottom, top) {
    return usage > bottom ? Math.min(usage, 200) - bottom : 0; // 5. 함수에서 사용하던 리터럴들을 적절한 매개변수로 대체
}
```
▼
```javascript
function withinBand(usage, bottom, top) {
    return usage > bottom ? Math.min(usage, top) - bottom : 0;
}
```
▼
```javascript
function baseCharge(usage) {
    if (usage < 0) return usd(0);
    const amount =
        withinBand(usage, 0, 100) * 0.03 // 6. 하한을 호출하는 부분도 변경
        + withinBand(usage, 100, 200) * 0.05
        + withinBand(usage, 200, Infinity) * 0.07; // 6. 상한을 호출하는 부분도 변경
    return usd(amount);
}
```

### 11.3 플래그 인수 제거하기 (Remove Flag Argument)
```javascript
function setDimension(name, value) {
    if (name === 'height') {
        this._height = value;
        return;
    }
    if (name === 'width') {
        this._width = value;
        return;
    }
}
```
▼
```javascript
function setHeight(value) {
    this._height = value;
}
function setWidth(value) {
    this._width = value;
}
```

- 플래그 인수(Flag argument) : 호출되는 함수가 실행할 로직을 호출하는 쪽에서 선택하기 위해 전달하는 인수
    - bool 형, 열거형, 문자열 형일 수 있음
        - 호출할 수 있는 함수들이 무엇이고, 어떻게 호출해야 하는지 이해가 어려워짐
- 플래그 인수를 제거했을 때 장점
    - 코드가 깔끔해짐
    - 코드 분석 도구가 로직의 차이를 더 쉽게 파악할 수 있음

#### 절차
1. 매개변수로 주어질 수 있는 값 각각에 대응하는 명시적 함수들을 생성
2. 원래 함수를 호출하는 코드들을 모두 찾아서 각 리터럴 값에 대응되는 명시적 함수를 호출하도록 수정

#### 예시
- 배송일자를 계산하는 프로그램
```javascript
function deliveryDate(anOrder, isRush) {
    if (isRush) {
        let deliveryTime;
        if (["MA", "CT"]     .includes(anOrder.deliveryState)) deliveryTime = 1;
        else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
        else deliveryTime = 3;
        return anOrder.placedOn.plusDays(1 + deliveryTime);
    }
    else {
        let deliveryTime;
        if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
        else if (["ME", "NH"] .includes(anOrder.deliveryState)) deliveryTime = 3;
        else deliveryTime = 4;
        return anOrder.placedOn.plusDays(2 + deliveryTime);
    }
}

aShipment.deliveryDate = deliveryDate(anOrder, true);
aShipment.deliveryDate = deliveryDate(anOrder, false); // 호출하는 쪽에서 불리언 값의 의미를 알기 힘듦

```
▼
```javascript
function deliveryDate(anOrder, isRush) { // 1. 조건문 분해하기(10.1)
    if (isRush) return rushDeliveryDate(anOrder);
    else        return regularDeliveryDate(anOrder);
}
function rushDeliveryDate(anOrder) {
    let deliveryTime;
    if (["MA", "CT"]     .includes(anOrder.deliveryState)) deliveryTime = 1;
    else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else deliveryTime = 3;
    return anOrder.placedOn.plusDays(1 + deliveryTime);
}
function regularDeliveryDate(anOrder) {
    let deliveryTime;
    if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else if (["ME", "NH"] .includes(anOrder.deliveryState)) deliveryTime = 3;
    else deliveryTime = 4;
    return anOrder.placedOn.plusDays(2 + deliveryTime);
}

aShipment.deliveryDate = rushDeliveryDate(anOrder); // 2. 호출문 대체
aShipment.deliveryDate = regularDeliveryDate(anOrder);
```
##### 예시: 매개변수를 까다로운 방식으로 사용할 때
```javascript
function deliveryDate(anOrder, isRush) { // isRush 를 최상위 분배 조건으로 뽑아내기 힘들어 보임
    let result;
    let deliveryTime;
    if (anOrder.deliveryState === "MA" || anOrder.deliveryState === "CT")
        deliveryTime = isRush? 1 : 2;
    else if (anOrder.deliveryState === "NY" || anOrder.deliveryState === "NH") {
        deliveryTime = 2;
        if (anOrder.deliveryState === "NH" && !isRush)
            deliveryTime = 3;
    }
    else if (isRush)
        deliveryTime = 3;
    else if (anOrder.deliveryState === "ME")
        deliveryTime = 3;
    else
        deliveryTime = 4;
    result = anOrder.placedOn.plusDays(2 + deliveryTime);
    if (isRush) result = result.minusDays(1);
    return result;
}
```
▼
```javascript
function rushDeliveryDate   (anOrder) {return deliveryDate(anOrder, true);} // 1. deliveryDate()를 감싸는 래핑 함수를 고려
function regularDeliveryDate(anOrder) {return deliveryDate(anOrder, false);}
```
▼
```javascript
// 2. 호출하는 코드 대체

function deliveryDateHelperOnly(anOrder, isRush) { // 함수의 가시 범위를 제한하거나, 직접 호출하지 말라는 의미를 이름에 명시
    // ...
}
```

### 11.4 객체 통째로 넘기기 (Preserve Whole Object)
```javascript
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if(aPlan.withinRange(low, high)) {
    // ...
}
```
▼
```javascript
if(aPlan.withinRange(aRoom.daysTempRange)); {
    // ...
}
```

- 하나의 레코드에서 값 두어개를 가져와 인수로 넘기는 코드 → 레코드를 통째로 넘기고 함수 본문에서 필요한 값들을 꺼내 쓰도록 수정
- 장점
    - 변화에 대응하기 쉬움
    - 매개변수 목록이 짧아져서 함수 사용법을 이해하기 쉬워짐
    - 레코드의 데이터 중 일부를 받는 함수가 여러개 일 때, 중복되는 로직을 없애기 쉬워짐
- 단점
    - 함수가 레코드 자체에 의존하게 됨
        - 레코드와 함수가 서로 다른 모듈에 속한 상황일 때
- 어떤 객체로부터 얻은 값들로만 무언가를 하는 로직 → 로직을 객체 안으로 집어넣어야 함
    - 매개변수 객체 만들기(6.8) 적용 후에 본 리팩터링을 적용할 것
- 항상 똑같은 일부만을 사용하는 코드가 많을 경우 → 해당 기능만을 따로 묶어 클래스로 추출(7.5) 고려

#### 절차
1. 매개변수들을 원하는 형태로 받는 빈 함수 생성
2. 새 함수의 본문에서 원래 함수를 호출하여, 새 매개변수와 원래 함수의 매개변수를 매핑
3. 정적 검사 수행
4. 모든 호출자가 새 함수를 사용하게 수정 / 테스트
    - 원래의 매개변수를 만들어내는 불필요 코드는 죽은 코드 제거하기(8.9)로 제거
5. 원래 함수를 인라인(6.2)
6. 새 함수의 이름을 적절히 수정하고 모든 호출자에 반영

#### 예시
- 실내 온도 모니터링 시스템
```javascript
class HeatingPlan {
    withinRange(bottom, top) {
        return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
    }
}

// 클라이언트
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high))
    alerts.push("room temperature went outside range");
```
▼
```javascript
class HeatingPlan {
    withinRange(bottom, top) {
        return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
    }

    xxNEWwithinRange(aNumberRange) { // 1. 원하는 인터페이스를 갖춘 빈 메서드 생성성
        return this.withinRange(aNumberRange.low, aNumberRange.high); // 2. 본문에서 기존 코드를 호출하도록 하고, 매개변수 매핑
    }
}

// 클라이언트
// const low = aRoom.daysTempRange.low; // 5. 죽은 코드 제거(8.9)
// const high = aRoom.daysTempRange.high;
if (!aPlan.xxNEWwithinRange(aRoom.daysTempRange)) // 4. 기존 함수를 호출하는 코드 → 새 함수를 호출하도록 수정
    alerts.push("room temperature went outside range");
```
▼
```javascript
class HeatingPlan {
    xxNEWwithinRange(aNumberRange) {
        return (aNumberRange.low >= this._temperatureRange.low) && // 5. 원래 함수 인라인(6.2)
            (aNumberRange.high <= this._temperatureRange.high);
    }
}
```
▼
```javascript
class HeatingPlan {
    withinRange(aNumberRange) { // 6. 함수 이름 변경  
        return (aNumberRange.low >= this._temperatureRange.low) &&
            (aNumberRange.high <= this._temperatureRange.high);
    }
}

// 클라이언트
if (!aPlan.withinRange(aRoom.daysTempRange)) // 호출자에 변경된 함수 이름 반영
    alerts.push("room temperature went outside range");
```
##### 예시 : 새 함수를 다른 방식으로 만들기
- 새 함수를 직접 작성하지 않고, 다른 리팩터링을 연달아 수행함으로써 새 함수를 만들어내기
```javascript
// 클라이언트
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high))
    alerts.push("room temperature went outside range");
```
▼
```javascript
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
const isWithinRange = aPlan.withinRange(low, high); // 변수 추출하기(6.3)
if (!isWithinRange)
    alerts.push("room temperature went outside range");
```
▼
```javascript
const tempRange = aRoom.daysTempRange; // 입력 매개변수 추출(6.3)
const low = tempRange.low;
const high = tempRange.high;
const isWithinRange = aPlan.withinRange(low, high);
if (!isWithinRange)
    alerts.push("room temperature went outside range");
```
▼
```javascript
const tempRange = aRoom.daysTempRange;
const isWithinRange = xxNEWwithinRange(aPlan, tempRange); // 함수 추출하기(6.1)
if (!isWithinRange)
    alerts.push("room temperature went outside range");

function xxNEWwithinRange(aPlan, tempRange) {
    const low = tempRange.low;
    const high = tempRange.high;
    const isWithinRange = aPlan.withinRange(low, high);
    return isWithinRange;
}
```
▼
```javascript
class HeatingPlan {
    xxNEWwithinRange(tempRange) { // 함수 옮기기(8.1)
        const low = tempRange.low;
        const high = tempRange.high;
        const isWithinRange = this.withinRange(low, high);
        return isWithinRange;
    }
}

// 클라이언트
const tempRange = aRoom.daysTempRange;
const isWithinRange = aPlan.xxNEWwithinRange(tempRange);
if (!isWithinRange)
    alerts.push("room temperature went outside range");
```

### 11.5 매개변수를 질의 함수로 바꾸기 (Replace Parameter with Query)
↔ 질의 함수를 매개변수로 바꾸기(11.6)
```javascript
availableVacation(anEmployee, anEmployee.grade);
function availableVacation(anEmployee, grade) { /* ... */ }
```
▼
```javascript
availableVacation(anEmployee);
function availableVacation(anEmployee) {
    const grade = anEmployee.grade;
    // ...
}
```

- 매개변수 : 함수의 변동 요인을 모아놓은 곳
    - 중복을 피하고, 짧을수록 이해하기 쉬움
    - 피호출 함수가 '*쉽게*' 결정할 수 있는 값은 매개변수로 넘기지 않아도 됨
- 적용하지 말아야 할 때
    - 매개변수를 제거하면 피호출 함수에 원치 않는 의존성이 생길 때
- 주의사항
    - 대상 함수가 참조 투명(referential transparency) 해야 함 : 함수에 똑같은 값을 건네 호출하면 항상 똑같이 동작함

#### 절차
1. 먼저 대상 매개변수의 값을 계산하는 코드를 별도 함수로 추출(6.1) 해둘지 고려
2. 함수 본문에서 대상 매개변수로의 참조를 모두 찾아서 그 매개변수의 값을 만들어주는 표현식을 참조하도록 변경 / 테스트
3. 함수 선언 바꾸기(6.5)로 대상 매개변수 제거

#### 예시
##### 다른 리팩터링을 수행한 뒤 특정 매개변수가 더는 필요 없어졌을 때
```javascript
class Order {
    get finalPrice() {
        const basePrice = this.quantity * this.itemPrice;
        let discountLevel;
        if (this.quantity > 100) discountLevel = 2;
        else discountLevel = 1;
        return this.discountedPrice(basePrice, discountLevel);
    }

    discountedPrice(basePrice, discountLevel) {
        switch (discountLevel) {
            case 1: return basePrice * 0.95;
            case 2: return basePrice * 0.9;
        }
    }
}
```
▼
```javascript
class Order {
    get finalPrice() {
        const basePrice = this.quantity * this.itemPrice;
        return this.discountedPrice(basePrice, this.discountLevel); // 임시 변수를 질의 함수로 바꾸기(7.4)
    }

    get discountLevel() {
        return (this.quantity > 100) ? 2 : 1;
    }

    discountedPrice(basePrice, discountLevel) { 
        switch (this.discountLevel) { // 2. 매개변수를 참조하는 코드를 모두 함수 호출로 변경
            case 1: return basePrice * 0.95;
            case 2: return basePrice * 0.9;
        }
    }
}
```
▼
```javascript
class Order {
    get finalPrice() {
        const basePrice = this.quantity * this.itemPrice;
        return this.discountedPrice(basePrice);
    }

    discountedPrice(basePrice) { // 3. 함수 선언 바꾸기(6.5)로 매개변수 제거
        switch (this.discountLevel) {
            case 1: return basePrice * 0.95;
            case 2: return basePrice * 0.9;
        }
    }
}
```

### 11.6 질의 함수를 매개변수로 바꾸기 (Replace Query with Parameter)
↔ 매개변수를 질의 함수로 바꾸기(11.5)
```javascript
targetTemperature(aPlan);
function targetTemperature(aPlan) {
    currentTemperature = thermostat.currentTemperature;
    // ...
}
```
▼
```javascript
targetTemperature(aPlan, thermostat.currentTemperature);
function targetTemperature(aPlan, currentTemperature) {
    // ...
}
```
- 함수 안에 두기에 거북한 참조가 있을 때 적용
- 코드의 의존 관계를 변경하려 할 때 발생하는 리팩터링
    - 모든 것을 매개변수로 바꿔 길고 반복적인 매개변수 목록 만들기 ↔ 함수들끼리 많은 것을 공유하여 수많은 결합을 만들어내기
- 단점
    - 호출자가 복잡해짐

#### 절차
1. 변수 추출하기(6.3)로 질의 코드를 함수 본문의 나머지 코드와 분리
2. 함수 본문 중 해당 질의를 호출하지 않는 코드들을 별도 함수로 추출(6.1)
3. 방금 만든 변수를 인라인(6.4)하여 제거
4. 원래 함수도 인라인(6.2)
5. 새 함수의 이름을 원래 함수의 이름으로 변경

#### 예시
- 실내온도 제어 시스템
```javascript
class HeatingPlan {
    get targetTemperature() {
        if      (thermostat.selectedTemperature >  this._max) return this._max;
        else if (thermostat.selectedTemperature <  this._min) return this._min;
        else return thermostat.selectedTemperature;
    }
}

// 호출자
if      (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
else setOff();
```
▼
```javascript
class HeatingPlan {
    get targetTemperature() {
        const selectedTemperature = thermostat.selectedTemperature; // 1. 변수 추출하기(6.3)를 이용해 매개변수를 준비
        if      (selectedTemperature >  this._max) return this._max;
        else if (selectedTemperature <  this._min) return this._min;
        else return selectedTemperature;
    }
}
```
▼
```javascript
class HeatingPlan {
    get targetTemperature() {
        const selectedTemperature = thermostat.selectedTemperature;
        return this.xxNEWtargetTemperature(selectedTemperature); // 2. 매개변수의 값을 구하는 코드를 제외한 나머지를 메서드로 추출(6.1)
    }

    xxNEWtargetTemperature(selectedTemperature) {
        if      (selectedTemperature >  this._max) return this._max;
        else if (selectedTemperature <  this._min) return this._min;
        else return selectedTemperature;
    }
}
```
▼
```javascript
class HeatingPlan {
    get targetTemperature() {
        return this.xxNEWtargetTemperature(thermostat.selectedTemperature); // 3. 방금 추출한 변수를 인라인(6.4)하여 단순 호출만 남기기
    }

    xxNEWtargetTemperature(selectedTemperature) {
        if      (selectedTemperature >  this._max) return this._max;
        else if (selectedTemperature <  this._min) return this._min;
        else return selectedTemperature;
    }
}

// 호출자
if      (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) > // 4. 이 메서드까지 인라인(6.2)
    thermostat.currentTemperature)
    setToHeat();
else if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) <
    thermostat.currentTemperature)
    setToCool();
else
    setOff();
```
▼
```javascript
class HeatingPlan {
    targetTemperature(selectedTemperature) { // 5. 메서드의 이름을 원래 메서드의 이름으로 변경
        if      (selectedTemperature >  this._max) return this._max;
        else if (selectedTemperature <  this._min) return this._min;
        else return selectedTemperature;
    }
}

// 호출자
if      (thePlan.targetTemperature(thermostat.selectedTemperature) >
    thermostat.currentTemperature)
    setToHeat();
else if (thePlan.targetTemperature(thermostat.selectedTemperature) <
    thermostat.currentTemperature)
    setToCool();
else
    setOff();
```

### 11.7 세터 제거하기 (Remove Setting Method)
```javascript
class Person {
    get name() { /* ... */ }
    set name(aString) { /* ... */ }
}
```
▼
```javascript
class person {
    get name() { /* ... */ }
}
```

- 리팩터링이 필요한 경우
    1. 접근자 메서드를 통해서만 필드를 다루려 할 때 (심지어 생성자 안에서도)
    2. 클라이언트에서 생성 스크립트(creation script)를 사용해 객체를 생성할 때
        - 생성 스크립트 : 생성자를 호출한 후 일련의 세터를 호출하여 객체를 완성하는 형태의 코드

#### 절차
1. 설정해야 할 값을 생성자에서 받지 않는다면 그 값을 받을 매개변수를 생성자에 추가
2. 생성자 밖에서 세터를 호출하는 곳을 찾아 제거하고, 대신 새로운 생성자를 사용하도록 수정 / 테스트
3. 세터 메서드를 인라인(6.2)
    - 가능하다면 해당 필드를 불변으로 변경
4. 테스트

### 11.8 생성자를 팩터리 함수로 바꾸기 (Replace Constructor with Factory Function)
```javascript
leadEngineer = new Employee(document.leadEngineer, 'E');
```
▼
```javascript
leadEngineer = createEngineer(document.leadEngineer);
```

- 장점
    - 서브클래스의 인스턴스나 프락시 반환 가능
    - 함수의 이름을 변경 가능
    - 특별한 연산자(new) 등을 사용하지 않으므로 일반 함수가 오길 기대하는 자리에도 사용 가능

#### 절차
1. 팩터리 함수 생성
    - 팩터리 함수의 본문에서는 원래의 생성자를 호출
2. 생성자를 호출하던 코드 → 팩터리 함수 호출로 변경
3. 하나씩 수정 / 테스트
4. 생성자의 가시 범위를 최소로 제한

#### 예시
- 직원 유형을 다루는 프로그램
```javascript
class Employee {
    constructor (name, typeCode) {
        this._name = name;
        this._typeCode = typeCode;
    }
    get name() {return this._name;}
    get type() {
        return Employee.legalTypeCodes[this._typeCode];
    }
    static get legalTypeCodes() {
        return {"E": "Engineer", "M": "Manager", "S": "Salesman"};
    }
}

// 호출자
candidate = new Employee(document.name, document.empType);
const leadEngineer = new Employee(document.leadEngineer, 'E');
```
▼
```javascript
function createEmployee(name, typeCode) { // 1. 팩터리 함수 생성
    return new Employee(name, typeCode); // 본문은 단순히 생성자에 위임하도록 함
}

// 호출자
candidate = createEmployee(document.name, document.empType); // 2. 생성자를 호출하는 곳을 찾아 수정
const leadEngineer = createEmployee(document.leadEngineer, 'E');
```
▼
- 호출자에서 문자열 리터럴을 사용(악취) → 직원 유형을 팩터리 함수의 이름에 녹임
```javascript
function createEngineer(name) {
    return new Employee(name, 'E');
}

const leadEngineer = createEngineer(document.leadEngineer);
```

### 11.9 함수를 명령으로 바꾸기 (Replace Function with Command)
↔ 명령을 함수로 바꾸기(11.10)
```javascript
function score(candidate, medicalExam, scoringGuide) {
    let result = 0;
    let healthLevel = 0;
    // 긴 코드 생략
}
```
▼
```javascript
class Scorer {
    constructor(candidate, medicalExam, scoringGuide) {
        this._candidate = candidate;
        this._medicalExam = medicalExam;
        this._scoringGuide = scoringGuide;
    }

    execute() {
        this._result = 0;
        this._healthLevel = 0;
        // 긴 코드 생략
    }
}
```

- 함수를, 그 함수만을 위한 객체 안으로 캡슐화 할 때 더 유용해지기도 함 : 명령 객체 혹은 단순히 *명령(command)*
    - 메서드 하나로 구성되며, 해당 메서드를 요청해 실행하는 것이 이 객체의 목적임
- 명령 객체의 장점
    - undo 와 같은 보조 연산 제공 가능
    - 수명주기를 더 정밀하게 제어하는데 필요한 매개변수를 만들어주는 메서드 제공 가능
    - 상속과 훅(hook)을 이용해 사용자 맞춤형으로 생성 가능
    - 일급 함수(first-class function)을 지원하지 않는 프로그램 언어에서 일급 함수의 기능 대부분 흉내 가능
        - 유연성 ↔ 복잡성
        - 일급 함수 vs 명령? 
            - 대부분 일급함수 win
            - 복잡한 함수를 잘게 쪼개서 이해하거나 수정하기 쉽게 만들고자 할 때 : 명령 win

#### 절차
1. 대상 함수의 기능을 옮길 빈 클래스 생성
    - 클래스 이름은 함수 이름에 기초해 명명
2. 방금 생성한 빈 클래스로 함수 옮기기(8.1)
    - 리팩터링이 끝나기 전까지는 원래 함수를 전달 함수 역할로 남겨둠
    - 명령 관련 이름은 사용하는 프로그래밍 언어의 명령규칙을 따름
        - 규칙이 없다면 execute 혹은 call 같이 명령의 실행 함수에 흔히 쓰이는 이름 선택
3. 함수의 인수들 각각은 명령의 필드로 만들어 생성자를 통해 설정할지 고려

#### 예시
- 건강 보험 어플리케이션
```javascript
function score(candidate, medicalExam, scoringGuide) {
    let result = 0;
    let healthLevel = 0;
    let highMedicalRiskFlag = false;

    if (medicalExam.isSmoker) {
        healthLevel += 10;
        highMedicalRiskFlag = true;
    }
    let certificationGrade = "regular";
    if (scoringGuide.stateWithLowCertification(candidate.originState)) {
        certificationGrade = "low";
        result -= 5;
    }
    // lots more code like this
    result -= Math.max(healthLevel - 5, 0);
    return result;
}
```
▼
```javascript
function score(candidate, medicalExam, scoringGuide) { 
    return new Scorer().execute(candidate, medicalExam, scoringGuide); // 2. 함수를 해당 클래스로 옮기기(8.1)
}

class Scorer { // 1. 빈 클래스 생성
    execute (candidate, medicalExam, scoringGuide) {
        let result = 0;
        let healthLevel = 0;
        let highMedicalRiskFlag = false;

        if (medicalExam.isSmoker) {
            healthLevel += 10;
            highMedicalRiskFlag = true;
        }
        let certificationGrade = "regular";
        if (scoringGuide.stateWithLowCertification(candidate.originState)) {
            certificationGrade = "low";
            result -= 5;
        }
        // lots more code like this
        result -= Math.max(healthLevel - 5, 0);
        return result;
    }
}
```
▼
```javascript
function score(candidate, medicalExam, scoringGuide) {
    return new Scorer(candidate, medicalExam, scoringGuide).execute();
}

class Scorer {
    constructor(candidate, medicalExam, scoringGuide){
        this._candidate = candidate;
        this._medicalExam = medicalExam;
        this._scoringGuide = scoringGuide;
    }

    execute () { // 매개변수 옮기기
        let result = 0;
        let healthLevel = 0;
        let highMedicalRiskFlag = false;

        if (this._medicalExam.isSmoker) {
            healthLevel += 10;
            highMedicalRiskFlag = true;
        }
        let certificationGrade = "regular";
        if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
            certificationGrade = "low";
            result -= 5;
        }
        // lots more code like this
        result -= Math.max(healthLevel - 5, 0);
        return result;
    }
}
```
▼
- 더 나아가서, 단계 쪼개기 적용
```javascript
class Scorer {
    constructor(candidate, medicalExam, scoringGuide){
        this._candidate = candidate;
        this._medicalExam = medicalExam;
        this._scoringGuide = scoringGuide;
    }

    execute () {
        this._result = 0; // 지역변수 옮기기
        this._healthLevel = 0;
        this._highMedicalRiskFlag = false;

        if (this._medicalExam.isSmoker) {
            this._healthLevel += 10;
            this._highMedicalRiskFlag = true;
        }
        this._certificationGrade = "regular";
        if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
            this._certificationGrade = "low";
            this._result -= 5;
        }
        // lots more code like this
        this._result -= Math.max(this._healthLevel - 5, 0);
        return this._result;
    }
// 함수의 상태가 모두 명령 객체로 옮겨짐
// 함수가 사용하던 변수나 그 유효 범위에 구애받지 않고 함수 추출하기(6.1) 같은 리팩터링 적용 가능
}
```
▼
```javascript
class Scorer {
    constructor(candidate, medicalExam, scoringGuide){
        this._candidate = candidate;
        this._medicalExam = medicalExam;
        this._scoringGuide = scoringGuide;
    }

    execute () {
        this._result = 0;
        this._healthLevel = 0;
        this._highMedicalRiskFlag = false;

        this.scoreSmoking();
        this._certificationGrade = "regular";
        if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
            this._certificationGrade = "low";
            this._result -= 5;
        }
        // lots more code like this
        this._result -= Math.max(this._healthLevel - 5, 0);
        return this._result;
    }

    scoreSmoking() { // 이제 명령을 중첩 함수처럼 다룰 수 있음
        if (this._medicalExam.isSmoker) {
            this._healthLevel += 10;
            this._highMedicalRiskFlag = true;
        }
    }
}
```

### 11.10 명령을 함수로 바꾸기 (Replace Command with Function)
↔ 함수를 명령으로 바꾸기(11.9)
```javascript
class ChargeCalculator {
    constructor(customer, usage) {
        this._customer = customer;
        this._usage = usage;
    }
    execute() {
        return this._customer.rate * this._usage;
    }
}
```
▼
```javascript
function charge(customer, usage) {
    return customer.rate * usage;
}
```

- 로직이 크게 복잡하지 않다면 명령 객체는 장점보다 단점이 크므로 평범한 함수로 바꿔주는게 나음

#### 절차
1. 명령을 생성하는 코드와 명령의 실행 메서드를 호출하는 코드를 함께 함수로 추출
2. 명령의 실행 함수가 호출하는 보조 메서드들 각각을 인라인(6.2)
    - 보조 메서드가 값을 반환한다면, 함수 인라인에 앞서 변수 추출하기(6.3) 적용
3. 함수 선언 바꾸기(6.5)를 적용하여 생성자의 매개변수 모두를 명령의 실행 메서드로 옮김
4. 명령의 실행 메서드에서 참조하는 필드들 대신 대응하는 매개변수를 사용하게끔 변경 / 테스트
5. 생성자 호출과 명령의 실행 메서드 호출을 호출자 안으로 인라인
6. 테스트
7. 죽은 코드 제거하기(8.9)로 명령 클래스 제거

#### 예시
- 전력 회사의 프로그램에서, 이사 온 고객의 정보를 "미확인 고객"으로 처리할 때
```javascript
class ChargeCalculator {
    constructor (customer, usage, provider){
        this._customer = customer;
        this._usage = usage;
        this._provider = provider;
    }
    get baseCharge() {
        return this._customer.baseRate * this._usage;
    }
    get charge() {
        return this.baseCharge + this._provider.connectionCharge;
    }
}

// 호출자
monthCharge = new ChargeCalculator(customer, usage, provider).charge;
```
▼
```javascript
function charge(customer, usage, provider) { // 1. 클래스를 생성하고 호출하는 코드를 함께 함수로 추출(6.1)
    return new ChargeCalculator(customer, usage, provider).charge;
}

class ChargeCalculator {
    constructor (customer, usage, provider){
        this._customer = customer;
        this._usage = usage;
        this._provider = provider;
    }
    get baseCharge() {
        return this._customer.baseRate * this._usage;
    }
    get charge() {
        const baseCharge = this.baseCharge; // 2. 보조 메서드에서 반환할 값을 변수로 추출(6.3)
        return baseCharge + this._provider.connectionCharge;
    }
}

// 호출자
monthCharge = charge(customer, usage, provider);
```
▼
```javascript
function charge(customer, usage, provider) { // 1. 클래스를 생성하고 호출하는 코드를 함께 함수로 추출(6.1)
    return new ChargeCalculator(customer, usage, provider).charge;
}

class ChargeCalculator {
    constructor (customer, usage, provider){
        this._customer = customer;
        this._usage = usage;
        this._provider = provider;
    }
    get charge() {
        const baseCharge = this._customer.baseRate * this._usage; // 2. 보조 메서드를 인라인(6.2)
        return baseCharge + this._provider.connectionCharge;
    }
}

// 호출자
monthCharge = charge(customer, usage, provider);
```
▼
```javascript
function charge(customer, usage, provider) {
    return new ChargeCalculator(customer, usage, provider)
        .charge(customer, usage, provider);
}

class ChargeCalculator {
    constructor (customer, usage, provider){
        this._customer = customer;
        this._usage = usage;
        this._provider = provider;
    }

    charge(customer, usage, provider) { // 3. 생성자가 받던 매개변수를 charge 메서드로 옮김 : 함수 선언 바꾸기(6.5)
        const baseCharge = customer.baseRate * usage; // 4. 본문에서 필드 대신 건네받은 매개변수를 사용하도록 수정
        return baseCharge + provider.connectionCharge;
    }
}

// 호출자
monthCharge = charge(customer, usage, provider);
```
▼
```javascript
function charge(customer, usage, provider) {
    const baseCharge = customer.baseRate * usage; // 5. 함수 인라인(6.2)
    return baseCharge + provider.connectionCharge;
}

// 7. 명령 클래스는 죽은 코드 제거하기(8.9)로 제거
```

### 11.11 수정된 값 반환하기 (Return Modified Value)
```javascript
let totalAscent = 0;
calculateAscent();
function calculateAscent() {
    for (let i = 1; i < points.length; i++) {
        const verticalCharge = points[i].elevation - points[i - 1].elevation;
        totalAscent += verticalChange > 0 ? verticalCharge : 0;
    }
}
```
▼
```javascript
const totalAscent = calculateAscent();

function calculateAscent() {
    let result = 0
    for (let i = 1; i < points.length; i++) {
        const verticalCharge = points[i].elevation - points[i - 1].elevation;
        result += verticalChange > 0 ? verticalCharge : 0;
    }
    return result
}
```

- 데이터가 수정된다면 그 사실을 명확히 알려주는 것이 중요함
    - 변수를 갱신하는 함수일 경우 → 수정된 값을 반환하여 호출자가 그 값을 변수에 담도록 하기
- 값 하나를 계산한다는 분명한 목적이 있을 때 효과적
    - 여러 개를 갱신하는 함수에는 효과적이지 않음
- 함수 옮기기(8.1)의 준비 작업으로 적용하기 좋은 리팩터링

#### 절차
1. 함수가 수정된 값을 반환하게 하여 호출자가 그 값을 자신의 변수에 저장하게 함
2. 테스트
3. 피호출 함수 안에 반환할 값을 가리키는 새로운 변수 선언
4. 테스트
5. 계산이 선언과 동시에 이뤄지도록 통합
6. 테스트
7. 피호출 함수의 변수 이름을 새 역할에 어울리도록 변경
8. 테스트

### 11.12 오류 코드를 예외로 바꾸기 (Replace Error Code with Exception)
```javascript
function something(){
    if (data)
        return new ShippingRules(data);
    else
        return -23;
}
```
▼
```javascript
function something(){
    if (data)
        return new ShippingRules(data);
    else
        throw new OrderProcessingError(-23)
}
```

- 예외를 사용할 때 장점
    - 오류 코드를 일일이 검사하지 않아도 됨
    - 오류를 식별해 콜스택 위로 던지는 일을 신경쓰지 않아도 됨

#### 절차
1. 콜스택 상위에 해당 예외를 처리할 예외 핸들러 작성
2. 테스트
3. 해당 오류 코드를 대체할 예외와 그 밖의 예외를 구분할 식별 방법 찾기
4. 정적 검사 수행
5. catch 절을 수정하여 직접 처리할 수있는 예외는 적절히 대처하고 그렇지 않은 예외는 다시 던짐
6. 테스트
7. 오류 코드를 반환하는 곳 모두에서 예외를 던지도록 수정 / 테스트
8. 오류 코드를 콜 스택 위로 전달하는 코드를 모두 제거 / 테스트

### 11.13 예외를 사전확인으로 바꾸기 (Replace Exception with Precheck)
```javascript
double getValueForPeriod (int periodNumber) {
    try {
        return values[periodNumber];
    } catch (ArrayIndexOutOfBoundsException e) {
        return 0;
    }
}
```
▼
```javascript
double getValueForPeriod (int periodNumber) {
    return (periodNumber >= values.length) ? 0 : values[periodNumber];
}
```

- 예외는 '뜻밖의 오류'일 때에만 사용되어야 함
    - 함수 수행 시 문제가 될 수 있는 부분을 함수 호출 전에 검사할 수 있다면, 예외를 던지는 대신 호출하는 곳에서 조건을 검사해야 함

#### 절차
1. 예외를 유발하는 상황을 검사할 수 있는 조건문 추가. catch 블록의 코드를 조건문의 조건절 중 하나로 옮기고 남은 try 블록의 코드를 다른 조건절로 옮김
2. catch 블록에 어서션 추가 / 테스트
3. try 문과 catch 블록 제거
4. 테스트
