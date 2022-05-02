# 챕터 내용 정리

## 6장 - 기본적인 리팩터링

### 6.1 함수 추출하기 (Extract Function)

```javascript
function printOwing(invoice) {
    printBanner();
    let outstanding = calculateOutstanding();

    // 세부 사항 출력
    console.log('고객명 : ${invoice.customer}');
    console.log('채무액 : ${outstanding}');
}
```
▼
```javascript
function printOwing(invoice) {
    printBanner();
    let outstanding = calculateOutstanding();

    printDetails(outstanding); // 세부 사항 출력
    
    function printDetails(invoice, outstanding) {
        console.log('고객명 : ${invoice.customer}');
        console.log('채무액 : ${outstanding}');
        console.log('마감일 : ${invoice.dueDate.toLocaleDateString()}');
    }
}
```

- 함수 추출의 기준 : '목적과 구현을 분리'
- 이름을 잘 지어야 한다!

> 함수를 짧게 만들면 함수 호출이 많아져서 성능이 느려질까 걱정 (...).
> 함수가 짧으면 캐싱하기가 더 쉽기 때문에 컴파일러가 최적화하는 데 유리할 때가 많다. (...)
> "최적화를 할 때는 다음 두 규칙을 따르기 바란다. 첫 번째, 하지 마라. 두 번째(전문가 한정), 아직 하지 마라."

#### 절차

1. 함수를 만들고 목적을 드러내는 이름 붙이기 ('어떻게' X '무엇을' O)
   - 이름을 떠올리기 어렵다면 함수로 추출하지 말라는 신호일수도 있음
2. 추출할 코드를 복사! 원본 함수 → 새 함수
3. 원본 함수의 지역 변수를 참조하거나, 유효범위를 벗어나는 변수는 없는지 체크. 있을 경우 매개변수로 전달!
   - 중첩 함수로 추출할 때는 문제 없음
   - 추출한 코드 안에서 값이 바뀌는 변수는 주의하자
     - 해당 변수가 하나 뿐일 경우 → 추출한 코드를 질의 함수로 취급해서 그 반환 값을 해당 변수에 대입하기
     - 너무 많은 경우 → 함수 추출 X 변수 쪼개기(9.1), 임시 변수를 질의 함수로 바꾸기(7.4) 이후 함수 추출 시도
4. 컴파일 (컴파일 에러 찾기)
5. 원본 함수의 코드를 새 함수 호출로 변경
6. 테스트
7. 다른 코드에도 이 함수를 적용할 수 있을지 검토 (인라인코드를 함수 호출로 바꾸기(8.5))

#### 예시
##### 리팩터링 전
```javascript
function printOwing(invoice) {
    let outstanding = 0;

    console.log("************");
    console.log("**고객 체무**");
    console.log("************");

    // 미해결 채무(outstanding)를 계산한다
    for (const o of invoice.orders) {
        outstanding += o.amount;
    }

    // 마감일(dueDate)을 기록한다.
    const today = Clock.today;
    invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

    // 세부 사항을 출력한다.
    console.log('고객명 : ${invoice.customer}');
    console.log('채무액 : ${outstanding}');
    console.log('마감일 : ${invoice.dueDate.toLocaleDateString()}');
}
```
##### 유효범위를 벗어나는 변수가 없을 때
```javascript
function printOwing(invoice) {
    let outstanding = 0;

    printBanner(); // 배너 출력 로직을 함수로 추출

    // 동일한 코드 ...

    printDetails(); // 세부 사항 출력 로직을 함수로 추출

    function printDetails() {
        console.log('고객명 : ${invoice.customer}');
        console.log('채무액 : ${outstanding}');
        console.log('마감일 : ${invoice.dueDate.toLocaleDateString()}');
    }
}

function printBanner() {
    console.log("************");
    console.log("**고객 체무**");
    console.log("************");
}
```
- 중첩 함수를 지원하지 않을 경우에는 원본함수에서만 접근할 수 있는 변수들에 특별히 신경 써야 함

##### 지역 변수를 사용할 때
```javascript
function printOwing(invoice) {
    let outstanding = 0;

    printBanner();

    // 동일한 코드 ...

    printDetails(invoice, outstanding); // 앞의 예시와 다르게 지역 변수를 매개변수로 전달함
}

function printDetails(invoice, outstanding) {
    console.log('고객명 : ${invoice.customer}');
    console.log('채무액 : ${outstanding}');
    console.log('마감일 : ${invoice.dueDate.toLocaleDateString()}');
}
```
##### 지역 변수의 값을 변경할 때
- 매개변수에 값을 대입하는 코드가 있을 경우 → 그 변수를 쪼개서(9.1) 임시 변수를 새로 하나 만들고, 그 변수에 대입하게 해야한다.
- 변수가 초기화 되는 지점과 실제로 사용되는 지점이 떨어져 있을 경우 → 문장 슬라이드하기(8.6)
- 변수가 추출한 함수 밖에서 사용될 경우 → 새 값을 반환
```javascript
function printOwing(invoice) { 
    printBanner();

    // let outstanding = 0;     // 1. 선언문 슬라이드
    const outstanding = calculateOutstanding(invoice) // 5. 코드 변경 (원본 코드 → 새 함수 호출)
    recordDueDate(invoice);

    printDetails(invoice, outstanding);
}

function calculateOutstanding(invoice){ // 2. 코드 복사하기 & 3. 변경된 값 반환하도록 수정하기 & 4. 컴파일하기
    let outstanding = 0;
    for (const o of invoice.orders) {
        outstanding += o.amount;
    }
    return outstanding;
}
// 동일한 코드 ...
```
- 값을 반환할 변수가 여러 개 일 경우
  - 각각을 반환하는 함수 여러 개로 만들기
  - 값들을 레코드로 묶어서 반환하기 (이것보다는 아래 방법이 더 좋음)
  - 임시 변수를 질의 함수로 바꾸거나(7.4) 변수를 쪼개기(9.1)

### 6.2 함수 인라인하기 (Inline Function)

```javascript
function getRating(driver) {
    return moreThanFiveLateDeliveries(driver) ? 2 : 1;
}

function moreThanFiveLateDeliveries(driver) {
    return driver.numberOfLateDeliveries > 5;
}
```
▼
```javascript
function getRating(driver) {
    return (driver.numberOfLateDeliveries > 5) ? 2 : 1;
}
```
- 함수 본문이 명확할 경우 간접 호출은 쓸데 없고 거슬림
- 간접 호출을 너무 과하게 쓰면 다른 함수로 단순히 위임하기만 하는 함수들이 너무 많아져서 관계가 복잡하게 얽힘

#### 절차
1. 다형 메서드(polymorphic)인지 확인
   - 서브클래스에서 오버라이드하는 메서드는 인라인 X
2. 해당 함수를 호출하는 곳을 모두 찾는다
3. 각 호출문을 함수의 본문으로 교체
4. 하나씩 교체하면서 테스트
   - 모두 한 번에 처리할 필요 없고, 틈틈이 처리해도 된다!
5. 원본 함수 삭제

#### 예시
##### 단순 덮어쓰기 & 변수 명 맞춰주기
```javascript
function getRating(aDriver) {
    return moreThanFiveLateDeliveries(aDriver) ? 2 : 1;
}

function moreThanFiveLateDeliveries(driver) {
    return driver.numberOfLateDeliveries > 5;
}
```
▼
```javascript
function getRating(aDriver) {
    return aDriver.numberOfLateDeliveries > 5 ? 2 : 1;
}
```
##### 수정 사항이 더 많을 경우
```javascript
function reportLines(aCustomer) {
    const lines = [];
    gatherCustomerData(lines, aCustomer);
    return lines
}

function gatherCustomerData(out, aCustomer) {
    out.push(["name", acustomer.name]);
    out.push(["location", acustomer.location]);
}
```
▼
```javascript
function reportLines(aCustomer) {
    const lines = [];
    lines.push(["name", acustomer.name]); // 1. 한 줄씩 옮긴다
    lines.push(["location", acustomer.location]); // 2. 한 줄씩 옮긴다
    gatherCustomerData(lines, aCustomer);
    return lines
}

function gatherCustomerData(out, aCustomer) {
    // out.push(["name", acustomer.name]); // 1
    // out.push(["location", acustomer.location]); // 2
}
```
- 항상 단계를 잘게 나눠서 처리하자!

### 6.3 변수 추출하기 (Extract Variable)
```javascript
return order.quantity * order.itemPrice - 
    Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 +
    Math.min(order.quantity * order.itemPrice * 0.1, 100);
```
▼
```javascript
const basePrice = order.quantity * order.itemPrice;
const quantityDiscount = Math.max(0, order.quantity - 500)
                        * order.itemPrice * 0.05;
const shipping = Math.min(basePrice * 0.1, 100);
return basePrice - quantityDiscount + shipping
```
- 표현식이 너무 복잡해서 이해하기 어려울 때!
  - 변수 추출 → 복잡한 로직을 구성하는 단계마다 이름 붙일 수 있음
    - 코드의 목적이 명료하게 드러남
    - 디버깅이 쉬워짐
- 변수 추출 = 표현식에 이름 붙이기
  - 이름이 함수 안에서만 의미 있을 경우 → 변수 추출
  - 이름이 넓은 문맥(함수 밖)에서도 의미 있을 경우 → 대부분 함수 추출
    - 간단히 처리할 수 있을 경우 → 즉시 적용(함수 추출하기(6.1))
    - 변경할 코드가 많을 경우 → 임시 변수를 질의 함수로 바꾸기(7.4)
#### 절차
1. 추출하려는 표현식에 부작용이 있는지 확인
2. 불변 변수를 선언하고, 표현식을 복사해서 대입
3. 원본 표현식을 새로 만든 변수로 교체
4. 테스트
5. 표현식을 여러 곳에서 사용할 경우, 각각을 교체
   - 하나 교체할 때마다 테스트!
#### 예시
##### 간단한 계산식
```javascript
function price(order) {
    // 가격(price) = 기본 가격 - 수량 할인 + 배송비
    return order.quantity * order.itemPrice - 
        Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 +
        Math.min(order.quantity * order.itemPrice * 0.1, 100);
}
```
▼
```javascript
function price(order) {
    // 4. 기존에 있었던 불필요 주석 지우기
    const basePrice = order.quantity * order.itemPrice; // 1. 하나씩 확인하고 적용하기
    const quantityDiscount = Math.max(0, order.quantity - 500)
                        * order.itemPrice * 0.05; // 2. 하나씩 확인하고 적용하기
    const shipping = Math.min(basePrice * 0.1, 100); // 3. 하나씩 확인하고 적용하기
    return basePrice - quantityDiscount + shipping
}
```
##### 클래스 문맥에서 적용하기
```javascript
class Order {
    constructor(aRecord) {
        this._data = aRecord;
    }

    get quantity() {return this._data.quantity;}
    get itemPrice() {return this._data.itemPrice;}
    get Price() {
        return order.quantity * order.itemPrice - 
            Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 +
            Math.min(order.quantity * order.itemPrice * 0.1, 100);
    }
}
```
▼
```javascript
class Order {
    constructor(aRecord) {
        this._data = aRecord;
    }

    get quantity() {return this._data.quantity;}
    get itemPrice() {return this._data.itemPrice;}
    get Price() {
        return this.basePrice - this.quantityDiscount + this.shipping;
            Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 +
            Math.min(order.quantity * order.itemPrice * 0.1, 100);
    }

    get basePrice() {return this.quantity * this.itemPrice;} // 1. 하나씩 확인하고 적용하기
    get quantityDiscount {return Math.max(0, this.quantity - 500)
                        * this.itemPrice * 0.05;}  // 2. 하나씩 확인하고 적용하기
    get shipping {return Math.min(this.basePrice * 0.1, 100);} // 3. 하나씩 확인하고 적용하기
}
```

### 6.4 변수 인라인하기 (Inline Variable)
```javascript
let basePrice = anOrder.basePrice;
return (basePrice > 1000);
```
▼
```javascript
return anOrder.basePrice > 1000;
```
- 변수가 원래 표현식과 별 차이 없을 때 적용
- 변수가 주변 코드를 리팩터링 하는 데 방해가 될 때 적용
#### 절차
1. 원본 대입문의 표현식에서 부작용이 있는지 확인
2. 변수가 불변으로 선언된게 아니라면 불변으로 만든 후 테스트
   - 변수에 값이 단 한번만 대입되는게 맞는지 확인할 수 있음
3. 해당 변수를 사용하는 코드 → 표현식 코드로 변경
4. 테스트
5. 3~4 반복
6. 변수 선언문 & 대입문 삭제
7. 테스트

### 6.5 함수 선언 바꾸기 (Change Function Declaration)
```javascript
function circum(radius) {...}
```
▼
```javascript
function circumference(radius) {...}
```
- 함수 이름
  - 주석을 이용해 함수의 목적을 설명하다 보면 적절한 함수 이름을 찾을 수 있음
- 함수 매개변수
  - 함수를 사용하는 문맥을 설정함
  - 커플링 ↔ 캡슐화 Trade-off

#### 절차
- 해당 리팩터링은 경우에 따라 더 적합한 적용 방법이 나뉨
  - 간단하게 적용 할 수 있는 경우 → 간단한 절차
  - 점진적으로 적용 해야 하는 경우 → 마이그레이션 절차
 
##### 1. 간단한 절차
1. (매개변수를 제거할 경우) 함수 본문에서 해당 매개변수를 참조하는 곳이 있는지 확인
2. 메서드 선언을 바꿈
3. 기존 메서드 선언을 참조하는 부분을 찾아서 모두 수정
4. 테스트

##### 2. 마이그레이션 절차
1. 이후 단계를 수월하게 하기 위해 함수의 본문을 적절히 리팩터링
2. 함수 본문을 새로운 함수로 추출(6.1)
3. (매개변수 추가 필요시) '간단한 절차' 적용
4. 테스트
5. 기존 함수를 인라인(6.2)
6. 이름을 적절하게 수정
7. 테스트

#### 예시
##### 매개변수 추가하기
```javascript
addReservation(customer) {
    this._reservations.push(customer);
}
```
▼
```javascript
addReservation(customer) {
    this.zz_addReservation(customer, false); 
}
zz_addReservation(customer, isPriority) { // 2. 함수 추출 / 3. 매개변수 추가
    assert(isPriority === true || isPriority === false); // 4. 테스트
    this._reservations.push(customer);
}
// 5. 기존 함수를 인라인
// 6. 함수 이름 변경
```
##### 매개변수를 속성으로 바꾸기
```javascript
const newEnglanders = someCustomers.filter(c => inNewEngland(c));
function inNewEngland(aCustomer) {
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(aCustomer.address.state);
}
```
▼
```javascript
const newEnglanders = someCustomers.filter(c => inNewEngland(c));
function inNewEngland(aCustomer) {
    const stateCode = aCustomer.address.state; // 1. 함수 본문 리팩터링
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```
▼
```javascript
const newEnglanders = someCustomers.filter(c => inNewEngland(c));
function inNewEngland(aCustomer) {
    const stateCode = aCustomer.address.state;
    return xxNewinNewEngland(stateCode);
}
function xxNewinNewEngland(stateCode) { // 2. 함수 추출하기(6.1)
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```
▼
```javascript
const newEnglanders = someCustomers.filter(c => inNewEngland(c));
function inNewEngland(aCustomer) {
    return xxNewinNewEngland(aCustomer.address.state); // 변수 인라인하기(6.4)
}
function xxNewinNewEngland(stateCode) { 
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```
▼
```javascript
const newEnglanders = someCustomers.filter(c => xxNewinNewEngland(c.address.state)); // 5. 함수 인라인하기(6.2)
function xxNewinNewEngland(stateCode) { 
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```
```javascript
const newEnglanders = someCustomers.filter(c => inNewEngland(c.address.state));
function inNewEngland(stateCode) { // 6. 함수 선언 바꾸기
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```
### 6.6 변수 캡슐화하기 (Encapsulate Variable)
```javascript
let defaultOwner = {firstName: "마틴", lastName: "파울러"};
```
▼
```javascript
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"};
export function defaultOwner()          {return defaultOwnerData;}
export function setDefaultOwner(arg)    {defaultOwnerData = arg;}
```
- 함수가 데이터보다 다루기 쉬움
  - 데이터는 참조하는 모든 부분을 한 번에 바꿔야만 코드가 제대로 작동함 (전역 데이터가 문제인 이유)
- 데이터를 함수로 캡슐화하면, '데이터 재구성' 대신 '함수 재구성'으로 더 쉽게 해결 할 수 있음
- 데이터를 사용하는 곳을 쉽게 찾아서 변경 전 검증, 변경 후 로직 추가 등이 쉬워짐
- 불변 데이터는 굳이 캡슐화를 안해도 됨
#### 절차
1. 변수 접근 / 갱신을 전담하는 캡슐화 함수 생성
2. 정적 검사 수행
3. 변수를 직접 참조하는 코드 → 캡슐화 함수 호출 코드로 변경 / 테스트
4. 변수의 접근 범위 제한
   - 제한 할 수 없는 경우, 변수 이름을 바꿔서 테스트하면 참조하는 곳을 찾기 쉬움 
5. 테스트
6. 변수 값이 레코드일 경우 → 레코드 캡슐화하기(7.1) 고려
#### 예시
##### 간단한 기본 캡슐화
```javascript
let defaultOwner = {firstName: "마틴", lastName: "파울러"}; // 전역 변수
spaceship.owner = defaultOwner; // 참조하는 코드
defaultOwner = {firstName: "레베카", lastName: "파슨스"}; // 갱신하는 코드
```
▼
```javascript
let defaultOwner = {firstName: "마틴", lastName: "파울러"};
function getDefaultOwner()       {return defaultOwner;} // 1. 읽고 쓰는 함수 정의
function setDefaultOwner(arg)    {defaultOwner = arg;}
spaceship.owner = getDefaultOwner(); // 3. 참조하는 코드 → 게터 함수 호출로 변경 후 테스트
setDefaultOwner({firstName: "레베카", lastName: "파슨스"}); // 3. 대입하는 코드 → 세터 함수 호출로 변경 후 테스트
```
▼
```javascript
// 4. 다른 파일로 옮김. 변수의 가시 범위 제한
let defaultOwner = {firstName: "마틴", lastName: "파울러"};
export function getDefaultOwner()       {return defaultOwner;}
export function setDefaultOwner(arg)    {defaultOwner = arg;}
```
- 데이터의 접근이나 구조 자체를 다시 대입하는 행위 제어 할 수 있음
- 필드 값을 변경하는 일은 제어할 수 없음
##### 값 캡슐화
- 변수에 담긴 내용을 변경하는 행위까지 제어하고 싶을 경우 사용
```javascript   
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"};
export function defaultOwner()          {return Object.assign({}, defaultOwnerData);} // 게터가 데이터의 복제본을 반환
export function setDefaultOwner(arg)    {defaultOwnerData = arg;}
```
- 원본 데이터를 변경해야 할 수도 있는 경우 → 레코드 캡슐화하기(7.1)
  
▼
```javascript
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"};
export function defaultOwner()          {return new Person(defaultOwnerData);} // 게터가 새 레코드를 생성해서 반환
export function setDefaultOwner(arg)    {defaultOwnerData = arg;}

class Person {
    constructor(data) {
        this._lastName = data.lastName;
        this._firstName = data.firstName;
    }
    get lastName() {return this._lastName;}
    get firstName() {return this._firstName;}
}
```
- defaultOwnerData의 속성을 다시 대입하는 연산을 무시할 수 있음?

### 6.7 변수 이름 바꾸기 (Rename Variable)
```javascript
let a = height * width;
```
▼
```javascript
let area = height * width;
```
- 이름짓기 is very important!
  - 한 줄짜리 람다식과 같이 맥락으로부터 변수의 목적을 정확히 알 수 있는 경우는 짧게 지어도 됨
- 동적 타입 언어라면 이름의 앞 부분에 타입을 붙여도 됨
#### 절차
1. 폭넓게 쓰이는 변수일 경우 → 변수 캡슐화하기(6.6) 고려
2. 해당 변수를 참조하는 곳을 모두 찾아서, 하나씩 변경
   - 외부에 공개된 변수(다른 코드베이스에서 참조하는 변수)에는 적용 불가
   - 변수 값이 변하지 않을 경우 → 다른 이름으로 복제본을 만들어서 점진적으로 변경
3. 테스트
#### 예시
##### 간단한 변수 이름 바꾸기
```javascript
let tpHd = "untitled";
result += '<h1>${tpHd}</h1>';
tpHd = obj['articleTitle'];
```
▼
```javascript
let tpHd = "untitled";
result += '<h1>${title()}</h1>';
setTitle(obj['articleTitle']);

function title() {return tpHd;} // 1. 변수 캡슐화하기
function setTitle(arg) {tpHd = arg;}
```
▼
```javascript
let _title = "untitled";  // 2. 변수 이름 바꾸기
result += '<h1>${title()}</h1>';
setTitle(obj['articleTitle']);

function title() {return _title;}
function setTitle(arg) {_title = arg;}
```
##### 상수 이름 바꾸기
```javascript
const cpyNm = "애크미 구스베리";
```
▼
```javascript
const companyName = "애크미 구스베리"; // 1. 원본의 이름을 변경하고,
const cpyNm = companyName; //  원본의 기존 이름과 같은 복제본 생성

// 2. 참조하는 코드들을 점진적으로 변경
```
### 6.8 매개변수 객체 만들기 (Introduce Parameter Object)
```javascript
function amountInvoiced(startDate, endDate) {...}
function amountReceived(startDate, endDate) {...}
function amountOverdue(startDate, endDate) {...}
```
▼
```javascript
function amountInvoiced(aDateRange) {...}
function amountReceived(aDateRange) {...}
function amountOverdue(aDateRange) {...}
```
- 데이터 항목 여러 개가 함께 몰려다닐 경우 → 데이터 구조 하나로 모아주기
- '매개변수 객체 만들기' 리팩터링은 코드 구조를 근본적으로 바꾸는 시작점이 됨 (새로운 데이터 구조를 활용)
  - 데이터에 대한 함수 추출
    - 공용함수 나열
    - 클래스 생성
#### 절차
1. 적당한 데이터 구조가 없다면 새로 생성
   - 클래스로 만들면 나중에 동작까지 함께 묶기 좋다.
2. 테스트
3. 함수 선언 바꾸기(6.5) (새 데이터 구조를 매개변수로 추가)
4. 테스트
5. 함수 호출 시 새로운 데이터 구조 인스턴스를 넘기도록 하나씩 수정 후 테스트
6. 기존 매개변수를 사용하던 코드 → 새 데이터 구조의 원소를 사용하는 코드로 변경
7. 기존 매개변수 제거 후 테스트
#### 예시
```javascript
const station = {name: "ZB1",
                readings: [
                    {temp: 47, time: "2016-11-10 09:10"},
                    {temp: 53, time: "2016-11-10 09:20"}
                ]};
function readingOutsideRange(station, min, max) {
    return station.readings.filter(r => r.temp < min || r.temp > max);
}
alerts = readingOutsideRange(station, operationPlan.temperatureFloor, operationPlan.temperatureCeiling);
```
▼
```javascript
const station = {name: "ZB1",
                readings: [
                    {temp: 47, time: "2016-11-10 09:10"},
                    {temp: 53, time: "2016-11-10 09:20"}
                ]};

class NumberRange { // 1. 묶은 데이터를 표현하는 클래스 생성
    constructor(min, max) {
        this._data = {min: min, max: max};
    }
    get min() {return this._data.min;}
    get max() {return this._data.max;}
}

function readingOutsideRange(station, min, max, range) { // 3. 함수 선언 바꾸기
    return station.readings.filter(r => r.temp < min || r.temp > max);
}
alerts = readingOutsideRange(station, operationPlan.temperatureFloor, operationPlan.temperatureCeiling, null); // 매개변수 자리에 임시로 null 넣기
```
▼
```javascript
function readingOutsideRange(station, min, max, range) { // 6. 기존 매개변수를 사용하는 코드 하나씩 변경 후 테스트
    return station.readings.filter(r => r.temp < range.min || r.temp > range.max);
}
alerts = readingOutsideRange(station, operationPlan.temperatureFloor, operationPlan.temperatureCeiling, range); // 5. 호출문 바꾸기
```
▼
```javascript
function readingOutsideRange(station, range) { // 7. 기존 매개변수 제거
    return station.readings.filter(r => r.temp < range.min || r.temp > range.max);
}
alerts = readingOutsideRange(station, range);
```
▼
```javascript
function readingOutsideRange(station, range) { // 7. 기존 매개변수 제거
    return station.readings.filter(r => !range.contains(r.temp));
}
class NumberRange { // 1. 묶은 데이터를 표현하는 클래스 생성
    constructor(min, max) {
        this._data = {min: min, max: max};
    }
    get min() {return this._data.min;}
    get max() {return this._data.max;}
    contains(arg) {return (arg >= this.min && arg <= this.max);} // 진정한 값 객체로 발전시키기 
}

```
### 6.9
```javascript

```
▼
```javascript
```