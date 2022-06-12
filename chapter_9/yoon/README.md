# 챕터 내용 정리

## 9장 - 데이터 조직화

### 9.1 변수 쪼개기 (Split Variable)

```javascript
let temp = 2 * (height + width);
console.log(temp);
temp = height * width;
console.log(temp);
```
▼
```javascript
const perimeter = 2 * (height + width);
console.log(perimeter);
const area = height * width;
console.log(area);
```

- 긴 코드의 결과를 참조하려는 목적으로 쓰이는 변수는 값을 단 한번만 대입하도록 하자
- 역할이 둘 이상인 변수는 혼란을 주므로 *예외 없이* 쪼개야 함

#### 절차

1. 변수를 선언한 곳과 값을 처음 대입하는 곳에서 변수 이름 변경
   - 이후의 대입이 항상 i = i + <무언가> 형태일 경우 수집 변수 → 쪼개면 안됨
2. 가능할 경우 불변(immutable)으로 선언
3. 두 번재로 값을 대입하는 곳 앞까지의 모든 참조를 새로운 변수 이름으로 변경
4. 두 번째 대입 시 변수를 원래 이름으로 재선언
5. 테스트
6. 반복

#### 예시
##### 단순한 예시
- 음식이 다른 지역으로 전파된 거리를 구하는 프로그램
```javascript
function distanceTravelled (scenario, time) {
    let result;
    let acc = scenario.primaryForce / scenario.mass; // 초기 가속도
    let primaryTime = Math.min(time, scenario.delay);
    result = 0.5 * acc * primaryTime * primaryTime; // 전파된 거리
    let secondaryTime = time - scenario.delay;
    if (secondaryTime > 0) { // 두 번째 힘을 반영해 다시 계산
        let primaryVelocity = acc * scenario.delay;
        acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass; // 두 번째 힘까지 반영된 가속도. 변수에 값이 두 번 대입됨
        result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
    }
    return result;
}
```
▼
```javascript
function distanceTravelled (scenario, time) {
    let result;
    const primaryAcceleration = scenario.primaryForce / scenario.mass; // 1. 변수 이름 변경, 2. 불변으로 선언
    let primaryTime = Math.min(time, scenario.delay);
    result = 0.5 * primaryAcceleration * primaryTime * primaryTime; // 3. 두 번째 대입 전까지의 참조를 새 이름으로 변경
    let secondaryTime = time - scenario.delay;
    if (secondaryTime > 0) {
        let primaryVelocity = primaryAcceleration * scenario.delay; // 3. 두 번째 대입 전까지의 참조를 새 이름으로 변경
        let acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass; // 4. 두 번째로 대입할 때 변수 재선언
        result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
    }
    return result;
}
// 5. 테스트
```
▼
```javascript
function distanceTravelled (scenario, time) {
    let result;
    const primaryAcceleration = scenario.primaryForce / scenario.mass;
    let primaryTime = Math.min(time, scenario.delay);
    result = 0.5 * primaryAcceleration * primaryTime * primaryTime;
    let secondaryTime = time - scenario.delay;
    if (secondaryTime > 0) {
        let primaryVelocity = primaryAcceleration * scenario.delay;
        const secondaryAcceleration = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass; // 6. 반복
        result += primaryVelocity * secondaryTime +
            0.5 * secondaryAcceleration * secondaryTime * secondaryTime;
    }
    return result;
}
```
##### 입력 매개변수의 값을 수정할 때
```javascript
function discount (inputValue, quantity) { // inputValue 가 매개변수이자 반환 값으로 사용됨
    if (inputValue > 50) inputValue = inputValue - 2;
    if (quantity > 100) inputValue = inputValue - 1;
    return inputValue;
}
```
▼
```javascript
function discount (originalInputValue, quantity) {
    let inputValue = originalInputValue; // 쪼개기
    if (inputValue > 50) inputValue = inputValue - 2;
    if (quantity > 100) inputValue = inputValue - 1;
    return inputValue;
}
```
▼
```javascript
function discount (inputValue, quantity) { // 변수 이름 바꾸기(6.7)
    let result = inputValue;
    if (inputValue > 50) result = result - 2;
    if (quantity > 100) result = result - 1;
    return result;
}
```

### 9.2 필드 이름 바꾸기 (Rename Field)
```javascript
class Organization {
    get name() { /*...*/ }
}
```
▼
```javascript
class Organization {
    get title() { /*...*/ }
}
```

> "데이터 테이블 없이 흐름도만 보여줘서는 나는 여전히 혼란스러울 것이다.
> 하지만 데이터 테이블을 보여준다면 흐름도는 웬만해선 필요조차 없을 것이다.
> 테이블만으로 명확하기 때문이다."

#### 절차
1. 레코드의 유효 범위가 제한적일 경우 → 모든 코드를 수정 후 테스트, 리팩터링 종료
2. 레코드 캡슐화(7.1)
3. 캡슐화된 객체 안의 private 필드 명 변경 후 그에 맞게 내부 메서드 수정
4. 테스트
5. 생성자의 매개변수 중 필드와 이름이 겹치는게 있을 경우 → 함수 선언 바꾸기(6.5)로 변경
6. 접근자들의 이름도 변경(6.5)

#### 예시
##### 단순한 예시
```javascript
const organization = {name: "Acme Gooseberries", country: "GB"};
```
▼
```javascript
class Organization { // 2. 캡슐화
    constructor(data) {
        this._name = data.name;
        this._country = data.country;
    }
    get name()    {return this._name;}
    set name(aString) {this._name = aString;}
    get country()    {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}

const organization = new Organization({name: "Acme Gooseberries", country: "GB"});
```
▼
```javascript
class Organization {
    constructor(data) {
        this._title = data.name; // 3. 별도의 필드를 정의하고 생성자와 접근자에서 둘을 구분해 사용하도록 함
        this._country = data.country;
    }
    get name()    {return this._title;}
    set name(aString) {this._title = aString;}
    get country()    {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}
```
▼
```javascript
class Organization {
    constructor(data) {
        this._title = (data.title !== undefined) ? data.title : data.name; // 생성자를 호출하는 곳에서 두 이름 모두 사용할 수 있도록 수정
        this._country = data.country;
    }
    get name()    {return this._title;}
    set name(aString) {this._title = aString;}
    get country()    {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}

// 생성자를 호출하는 곳을 찾아서 title 을 사용하도록 변경
```
▼
```javascript
class Organization {
    constructor(data) {
        this._title = data.title; // name 을 사용하던 코드 제거
        this._country = data.country;
    }
    get name()    {return this._title;}
    set name(aString) {this._title = aString;}
    get country()    {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}
```
▼
```javascript
class Organization {
    constructor(data) {
        this._title = data.title;
        this._country = data.country;
    }
    get title()    {return this._title;} // 6. 접근자 수정 : 함수 이름 바꾸기(6.5)
    set title(aString) {this._title = aString;}
    get country()    {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}
```

### 9.3 파생 변수를 질의 함수로 바꾸기 (Replace Derived Variable with Query)
```javascript
get discountedTotal() {return this._discountedTotal;}
set discount(aNumber) {
    const old = this._discount;
    this._discount = aNumber;
    this._discountedTotal += old - aNumber;
}
```
▼
```javascript
get discountedTotal() {return this._basetotal - this._discount;}
set discount(aNumber) {this._discount = aNumber;}
```

> 가변 데이터는 소프트웨어에 문제를 일으키는 가장 큰 골칫거리

- 가변 데이터의 유효범위를 가능한 한 좁혀야 함
- 값을 쉽게 계산해 낼 수 있는 변수는 모두 제거
    - 예외 : 새로운 데이터 구조를 생성하는 변형 연산(transformation operation)
        1. 데이터 구조를 감싸며 그 데이터에 기초하여 계산한 결과를 속성으로 제공하는 객체 (소스 데이터가 가변이고 파생 데이터 구조의 수명을 관리해야 할 경우 유리)
        2. 데이터 구조를 받아 다른 데이터 구조로 변환해 반환하는 함수
    
#### 절차
1. 변수 값이 갱신되는 지점을 모두 찾고, 필요할 경우 변수 쪼개기(9.1)
2. 해당 변수의 값을 계산해주는 함수 생성
3. 해당 변수가 사용되는 모든 곳에 어서션을 추가(10.6), 함수의 계산 결과가 변수의 값과 같은지 확인
    - 필요시 변수 캡슐화하기(6.6) 적용
4. 테스트
5. 변수를 읽는 코드를 모두 함수 호출로 대체
6. 테스트
7. 변수를 선언하고 갱신하는 코드 삭제 : 죽은 코드 제거하기(8.9)

#### 예시
```javascript
get production() {return this._production;}
applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount;
}
```
▼
```javascript
get production() {
    assert(this._production === this.calculatedProduction); // 3. 어서션을 추가하여 검증
    return this._production;
}

get calculatedProduction() { // 2. 질의 함수 생성
    return this._adjustments
        .reduce((sum, a) => sum + a.amount, 0);
}
```
▼
```javascript
get production() {
    // 테스트 후 어서션 삭제
    return this.calculatedProduction; // 5. 함수 호출로 대체
}
```
▼
```javascript
get production() {
    return this._adjustments // 메서드 인라인(6.2)
        .reduce((sum, a) => sum + a.amount, 0);
}

applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    // 7. 죽은 코드 제거하기
}
```

### 9.4 참조를 값으로 바꾸기 (Change Reference to Value)
↔ 값을 참조로 바꾸기(9.5)
```javascript
class Product {
    applyDiscount(arg) { this._price.amount -= arg; }
}
```
▼
```javascript
class Product {
    applyDiscount(arg) {
        this._price = new Money(this._price.amount - arg, this._price.currency);
    }
}
```
- 참조? 값?
    - 참조 : 내부 객체는 그대로 둔 채 그 객체의 속성만 갱신
    - 값 : 새로운 속성을 담은 객체로 기존 내부 객체를 통째로 대체
- 필드를 값으로 다룬다면 내부 객체의 클래스를 수정하여 Value Object 로 만들 수 있음
    - *불변*이므로 다루기 쉬워짐
    - 분산 시스템과 동시성 시스템에서 특히 유용함
- 적용 불가능한 경우
    - 특정 객체를 여러 객체에서 공유하여, 값을 변경했을 때 관련 객체 모두에 알려줘야 할 경우 등

#### 절차
1. 후보 클래스가 불변인지, 불변으로 만들 수 있는지 확인
2. 각각의 세터를 하나씩 제거(11.7)
3. 값 객체의 필드들을 사용하는 동치성(equality) 비교 메서드 생성
    - 동치성 비교 메서드를 오버라이딩 할 경우, 해시코드 생성 메서드도 오버라이드 하도록 체크

#### 예시
- 생성 시점에 전화번호가 올바로 설정되지 못한 사람 객체
```javascript
class Person {
    constructor() {
        this._telephoneNumber = new TelephoneNumber();
    }

    get officeAreaCode()    {return this._telephoneNumber.areaCode;}
    set officeAreaCode(arg) {this._telephoneNumber.areaCode = arg;}
    get officeNumber()    {return this._telephoneNumber.number;}
    set officeNumber(arg) {this._telephoneNumber.number = arg;}
}

class TelephoneNumber{
    get areaCode()    {return this._areaCode;}
    set areaCode(arg) {this._areaCode = arg;}
    
    get number()    {return this._number;}
    set number(arg) {this._number = arg;}
}
```
▼
```javascript
class TelephoneNumber{ // 1. 전화번호 불변으로 만들기
    constructor(areaCode, number) { // 세터로 설정하던 필드를 생성자에서 설정하도록 함수 선언 바꾸기(6.5)
        this._areaCode = areaCode;
        this._number = number;
    }
    // 2. 세터 제거(11.7)
}
```
▼
```javascript
class Person {
    constructor() {
        this._telephoneNumber = new TelephoneNumber();
    }

    get officeAreaCode()    {return this._telephoneNumber.areaCode;}
    set officeAreaCode(arg) {
        this._telephoneNumber = new TelephoneNumber(arg, this.officeNumber); // 전화번호를 매번 다시 대입하도록 변경
    }
    get officeNumber()    {return this._telephoneNumber.number;}
    set officeNumber(arg) {
        this._telephoneNumber = new TelephoneNumber(this.officeAreaCode, arg); // 전화번호를 매번 다시 대입하도록 변경
    }
}

// TelephoneNumber 불변 객체로 변경 완료 (Value Object 로 변경 준비 완료)
// 동치성을 값 기반으로 평가해야 함
```
▼
```javascript
class TelephoneNumber{
    constructor(areaCode, number) {
        this._areaCode = areaCode;
        this._number = number;
    }

    equals(other) { // 3. 동치성 비교 메서드 생성 
        if (!(other instanceof TelephoneNumber)) return false;
        return this.areaCode === other.areaCode &&
            this.number === other.number;
    }
}

it('telephone equals', function() { // 테스트
    assert(        new TelephoneNumber("312", "555-0142")
        .equals(new TelephoneNumber("312", "555-0142")));
});
```

### 9.5 값을 참조로 바꾸기 (Change Value to Reference)
↔ 참조를 값으로 바꾸기(9.4)
```javascript
let customer = new Customer(customerData)
```
▼
```javascript
let customer = customerRepository.get(customerData)
```

- Value Object - 논리적으로 같은 데이터를 물리적으로 복제해 사용
    - 데이터를 갱신할 때 주의
        - 모든 복제본을 찾아서 빠짐없이 갱신 (놓칠 경우 데이터 일관성이 깨짐)
- 갱신된 내용이 모두 반영되길 원할 경우 VO → 참조로 변경
    - entity 하나 당 객체도 단 하나만 존재하게 됨 (보통 저장소를 이용하여 한 객체를 얻어 씀) 

#### 절차
1. 같은 부류에 속하는 객체들을 보관할 저장소 생성
2. 생성자에서 이 부류의 객체들 중 특정 객체를 정확히 찾아내는 방법이 있는지 확인
3. 호스트 객체의 생성자들을 수정하여 필요한 객체를 저장소에서 찾도록 변경 및 테스트

#### 예시
- 주문 클래스. 생성자에서 JSON 을 입력받아 필드를 채우고, 고객 ID를 이용하여 고객 객체 생성
```javascript
class Order {
    constructor(data) {
        this._number = data.number;
        this._customer = new Customer(data.customer);
        // 다른 데이터를 읽어 들인다.
    }
    get customer() {return this._customer;}
}

class Customer{
    constructor(id) {
        this._id = id;
    }
    get id() {return this._id;}
}
``` 
```javascript
let _repositoryData; // 저장소 객체 생성

export function initialize() {
    _repositoryData = {};
    _repositoryData.customers = new Map();
}

export function registerCustomer(id) {
    if (! _repositoryData.customers.has(id))
        _repositoryData.customers.set(id, new Customer(id));
    return findCustomer(id);
}

export function findCustomer(id) {
    return _repositoryData.customers.get(id);
}
```
▼
```javascript
class Order {
    constructor(data) {
        this._number = data.number;
        this._customer = registerCustomer(data.customer); // 3. 저장소에서 불러오도록 수정
        // load other data
    }
    get customer() {return this._customer;}
}

```
### 9.6 매직 리터럴 바꾸기 (Replace Magic Literal)
```javascript
function potentialEnergy(mass, height) {
    return mass * 9.81 * height;
}
```
▼
```javascript
const STANDARD_GRAVITY = 9.81;
function potentialEnergy(mass, height) {
    return mass * STANDARD_GRAVITY * height;
}
```
- 코드 자체에서 뜻을 분명히 드러낼 수 있도록 상수를 이용

#### 절차
1. 상수를 선언하고 매직 리터럴을 대입
2. 해당 리터럴이 사용되는 곳 탐색
3. 찾은 곳 각각에서 리터럴이 새 상수와 똑같은 의미로 쓰였는지 확인 후 대체 및 테스트
