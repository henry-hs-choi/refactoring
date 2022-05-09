# 챕터 내용 정리

## 7장 - 캡슐화

> 모듈을 분리하는 가장 중요한 기준은 아마도 시스템에서
> 각 모듈이 자신을 제외한 다른 부분에 드러내지 않아야 할 비밀을
> 얼마나 잘 숨기느냐에 있을 것이다.

### 7.1 레코드 캡슐화하기 (Encapsulate Record)

```javascript
organization = {name: "애크미 구스베리", country: "GB"};
```
▼
```javascript
class Organization {
    constructor(data) {
        this._name = data.name;
        this._country = data.country;
    }
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    get country() {return this._name;}
    set country(arg) {this._country = arg;}
}
```

- 데이터 레코드는 여러 데이터를 직관적인 방식으로 묶을 수 있으나, 계산해서 얻을 수 있는 값과 그렇지 않은 값을 구분해 저장하기 번거로움
- 그러므로 **가변** 데이터는 객체가 더 나음 (**불변** 일 경우에는 비슷하지만)
  - 객체일 경우 캡슐화하기 좋으며, 필드 이름이 변경되어도 메서드로 기존 방식을 동일하게 제공하여 점진적 수정 가능

#### 절차

1. 레코드를 담은 변수를 캡슐화(6.6)
   - 레코드를 캡슐화하는 함수의 이름은 검색하기 쉽게 지어야 함
2. 레코드를 감싼 단순한 클래스로 해당 변수의 내용을 교체
   - 클래스에 원본 레코드를 반환하는 접근자 정의
   - 변수를 캡슐화하는 함수들이 해당 접근자를 이용
3. 테스트
4. (1)원본 레코드 대신 (2)새로 정의한 클래스 객체를 반환하는 함수 만들기
5. 레코드를 반환하는 예전 함수(1)를 사용하는 코드 → 새로 만든 함수(2)를 사용하도록 변경
    - 필드에 접근할 때는 객체의 접근자 이용
    - 한 부분 변경시마다 테스트
    - 중첩된 구조와 같이 복잡한 레코드일 경우, 클라이언트가 데이터를 읽기만 한다면 데이터의 복제본이나 프락시를 반환하는 것도 고려할것
6. 클래스에서 원본 데이터를 반환하는 접근자와 원본 레코드를 반환하는 함수(절차 1) 제거
7. 테스트
8. 레코드의 필드도 데이터 구조인 중첩 구조일 경우, 레코드 캡슐화하기와 컬렉션 캡슐화하기(7.2) 재귀적 적용

#### 예시
##### 간단한 레코드의 경우
```javascript
const organization = {name: "애크미 구스베리", country: "GB"};

result += '<h1>${organization.name}</h1>'; // 읽기 예시
organization.name = newName; // 쓰기 예시
```
▼
```javascript
function getRawDataOfOrganization() {return organization;} // 1. 캡슐화

result += '<h1>${getRawDataOfOrganization().name}</h1>'; // 읽기 예시
getRawDataOfOrganization().name = newName; // 쓰기 예시
```
- 임시로 사용하는 게터이므로, 찾기 쉬운 이름을 붙임
▼
```javascript
class Organization { // 2. 레코드를 클래스로 바꾸기
    constructor(data) {
        this._data = data;
    }
}

const organization = new Organization({name: "애크미 구스베리", country: "GB"});
function getRawDataOfOrganization() {return organization._data;}
function getOrganization() {return organization;} // 새 클래스의 인스턴스를 반환하는 함수 새로 생성
```
▼
```javascript
class Organization {
    constructor(data) {
        this._data = data;
    }
    set name(aString) {this._data.name = aString;} // 5. 세터 생성
    get name() {return this._data.name;} // 5. 게터 생성
}
// ...
getOrganization().name = newName; // 5. 기존 레코드를 갱신하던 코드 → 세터 이용
result += '<h1>${getOrganization().name}</h1>'; // 5. 기존 레코드를 읽던 코드 → 게터 이용

// function getRawDataOfOrganization() {return organization._data;}
// 6. 기존 임시 함수 제거
```
▼
###### option 1 : data의 필드를 펼쳐놓기
```javascript
class Organization {
    constructor(data) {
        this._name = data.name; // data의 필드를 펼쳐놓기
        this._country = data.country;
    }
    get name() {return this._name;}
    set name(aString) {this._name = aString;}
    get country() {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}
```
###### option 2 : data를 대입할 때 복제한 객체를 이용
```javascript
class Organization {
    constructor(data) {
        this._data = JSON.parse(JSON.stringify(data)); // data를 대입할 때 복제한 객체를 이용
    }
    set name(aString) {this._data.name = aString;}
    get name() {return this._data.name;}
}
```
- 입력 데이터 레코드와 연결을 끊을 수 있음 (데이터 레코드를 참조하는 코드들의 변경으로부터 안전하게 하기)
##### 중첩된 레코드를 캡슐화하는 경우
- 고객 정보를 저장한 해시맵 (key : 고객 ID)
```text
"1920": {
    name: "마틴 파울러",
    id: "1920",
    usage: {
      "2016": {
        "1": 50,
        "2": 55,
        // 그 외 달(month)는 생략
      },
      "2015": {
        "1": 70,
        "2": 63,
        // ...
      }
    }
},
"38673": {
    name: "닐 포드",
    id: "38673",
    // ...
}
```
```javascript
customerData[customerID].usage[year][month] = amount; // 쓰기 예시
function compareUsage(customerID, laterYear, month) { // 읽기 예시
    const later = customerData[customerID].usage[lastYear][month];
    const earlier = customerData[customerID].usage[lastYear - 1][month];
    return {laterAmount: later, change: later - earlier};
}
```
▼
- 변수 캡슐화(6.6)
```javascript
function getRawDataOfCustomer() {return customerData;}
function setRawDataOfCustomer(arg) {customerData = arg;}

getRawDataOfCustomer()[customerID].usage[year][month] = amount; // 쓰기 예시
function compareUsage(customerID, laterYear, month) { // 읽기 예시
    const later = getRawDataOfCustomer()[customerID].usage[lastYear][month];
    const earlier = getRawDataOfCustomer()[customerID].usage[lastYear - 1][month];
    return {laterAmount: later, change: later - earlier};
}
```
▼
- 전체 데이터 구조를 표현하는 클래스 정의, 해당 클래스 객체를 반환하는 함수 생성
```javascript
class CustomerData {
    constructor(data) {
        this._data = data;
    }
}

function getCustomerData() {return customerData;}
function getRawDataOfCustomer() {return customerData._data;}
function setRawDataOfCustomer(arg) {customerData = new CustomerData(arg);}
```
▼
- 데이터 구조 안으로 깊이 들어가는 부분들을 세터로 뽑아내기 : 함수 추출하기(6.1)
```javascript
// 기존 : getRawDataOfCustomer()[customerID].usage[year][month] = amount;
setUsage(customerID, year, month, amount); // 쓰기 예시

function setUsage(customerID, year, month, amount) {
    getRawDataCustomer()[customerID].usage[year][month] = amount;
}
```
▼
- 함수를 클래스 내부로 옮김 : 함수 옮기기(8.1)
```javascript
getCustomerData().setUsage(customerID, year, month, amount);

class CustomerData {
    //...
    
    setUsage(customerID, year, month, amount) {
        this._data[customerID].usage[year][month] = amount;
    }
}
```
▼
###### 쓰기 처리 방법
- 캡슐화에서는 값을 수정하는 부분들을 빠뜨리지 않는 것이 굉장히 중요함
  1. option 1 : 빠진 부분 검증을 위해 깊은 복사 이용
  2. option 2 : 읽기 전용 프락시를 반환 (클라이언트에서 내부 객체 수정 시 예외 발생)
  3. option 3 : 복제본을 생성하고 이를 재귀적으로 동결(freeze)하여 쓰기 감지
  - → 테스트 커버리지를 통해 검증 가능
```javascript
function getCustomerData() {return customerData;}
function getRawDataOfCustomer() {return customerData.rawData;}
function setRawDataOfCustomer() {customerData = new CustomerData(arg);}

class CustomerData {
    // ...
    get rawData() {
        return _.cloneDeep(this._data); // lodash 라이브러리의 cloneDeep()을 이용한 깊은 복사
    }
}
```
###### 읽기 처리 방법
1. option 1 : 세터와 같은 방법 적용 (읽는 코드를 모두 독립 함수로 추출 → 클래스로 이동)
    ```javascript
    class CustomerData {
        // ...
        usage(customerID, year, month) {
            return this._data[customerID].usage[year][month];
        }
    }
    function compareUsage(customerID, lastYear, month) {
        const later = getCustomerData().usage(customerID, laterYear, month);
        const earlier = getCustomerData().usage(customerID, laterYear - 1, month);
        return {laterAmount: later, change: later - earlier};
    }
    ```
   - 장점
     - customerData의 모든 쓰임을 명시적인 API로 제공 (클래스만 보고도 데이터 사용 방법 모두 파악 가능)
   - 단점
     - 읽는 패턴이 다양한 만큼 작성할 코드가 증가
   - [리스트-해시 (list-and-hash) 데이터 구조](https://martinfowler.com/bliki/ListAndHash.html)를 지원하는 언어에서는 쉽게 다룰수 있음
2. option 2 : 실제 데이터를 복제해서 제공
   ```javascript
    class CustomerData {
        // ...
        get rawData() {
            return _.cloneDeep(this._data);
        }
    }
    function compareUsage (customerID, laterYear, month) {
        const later = getCustomerData().rawData[customerID].usage[laterYear][month];
        const earlier = getCustomerData().rawData[customerID].usage[laterYear - 1][month]; 
        return {laterAmount: later, change: later - earlier};
    }
    ```
   - 단점
     - 데이터 구조가 클수록 복제 비용이 커짐 (실제로 측정해보고 판단하기)
     - 클라이언트가 원본 데이터를 수정한다고 착각할 수도 있음
       - 해결방법
         1. 읽기 전용 프락시 제공
         2. 복제본을 동결시키기
3. option 3 : [레코드 캡슐화를 재귀적으로 수행](https://martinfowler.com/articles/refactoring-document-load.html)
   - 단점
     - 할 일이 늘어남 (데이터 구조를 사용할 일이 많지 않다면 큰 효과도 없음)

### 7.2 컬렉션 캡슐화하기 (Encapsulate Collection)
```javascript
class Person {
    get courses() {return this._courses;}
    set courses(aList) {this._courses = aList;}
}
```
▼
```javascript
class Person {
    get courses() {return this._courses.slice();}
    addCourse(aCourse) {/*...*/}
    removeCourse(aCourse) {/*...*/}
}
```

- 가변 데이터를 모두 캡슐화해두면 데이터 구조가 언제 수정되는지 파악하기 좋고, 데이터 구조를 변경하기에도 좋음
- 컬렉션을 다룰 때 주의사항 : 게터가 컬렉션 자체를 반환하게 할 경우 해당 컬렉션을 감싼 클래스 모르게 컬렉션의 원소들이 바뀌어 버릴 수 있음
  - 클래스에 `add()`, `remove()` 이름의 컬렉션 변경자 메서드를 생성하여, 클래스를 통해서만 원소를 변경하도록 강제하기!
  - 컬렉션 게터가 원본 컬렉션을 반환하지 않게 만들어, 클라이언트가 실수로 컬렉션을 바꿀 가능성 차단하기!
#### 내부 컬렉션을 수정하지 못하게 막는 방법
1. 컬렉션 값 자체를 반환하지 않게 하기 (컬렉션에 접근하려면 클래스의 메서드를 반드시 거치게 하기)
    `aCustomer.orders.size()` → `aCustomer.numberOfOrders()`
   - 단점
     - 언어에서 지원하는 [컬렉션 파이프라인](https://martinfolwer.com/articles/collection-pipeline/)을 활용하지 못함
     - 전용 메서드들을 사용하게 강제함으로써 부가적인 코드가 상당히 늘어남
2. 컬렉션을 읽기전용으로 제공하기
    - ex) java : 읽기 전용 프락시 반환
      - 읽기는 허용하나, 쓰기는 예외를 던지는 식으로 막기
      - iterator, enum 객체 기반으로 컬렉션을 조합하는 라이브러리도 비슷한 방식을 사용함
3. 컬렉션 게터를 제공하되, 내부 컬렉션의 복제본을 반환
    - 단점
      - 클라이언트에서 컬렉션을 수정 시 원본 컬렉션도 수정될 거라 잘못 기대할 수 있음
      - 컬렉션의 크기가 크다면 성능 문제 발생
- 주의사항 : **코드 베이스에서 일관성 있는 정책을 적용하여, 컬렉션 접근 함수의 동작 방식을 통일하기**

#### 절차
1. 컬렉션 캡슐화하기 : 변수 캡슐화하기(6.6)
2. 컬렉션에 원소를 추가/제거하는 함수 생성
   - 컬렉션 자체를 통째로 바꾸는 세터는 제거(11.7)
     - 제거가 불가능하다면, 인수로 받은 컬렉션을 복제해 저장하도록 변경
3. 정적 검사 수행
4. 컬렉션을 참조하는 부분 모두 찾아, 컬렉션에 변경이 일어나는 부분을 2에서 생성한 함수를 호출하도록 변경 후 테스트
5. 컬렉션 게터를 수정하여 원본 내용을 수정할 수 없게 하기
    - 읽기전용 프락시 혹은 복제본 반환
6. 테스트

#### 예시
```javascript
class Person {
    constructor(name) {
        this._name = name;
        this._courses = [];
    }
    get name() {return this._name;}
    get courses() {return this._courses;}
    set courses(aList) {this._courses = aList;}
}

class Course {
    constructor(name, isAdvanced) {
        this._name = name;
        this._isAdvanced = isAdvanced;
    }
    get name() {return this._name;}
    get isAdvanced() {return this._isAdvanced;}
}

numAdvancedCourses = aPerson.courses
    .filter(c => c.isAdvanced)
    .length;

// 세터를 이용해 수업 컬렉션을 통째로 설정한 클라이언트가 이 컬렉션을 마음대로 수정할 수 있음
const basicCourseNames = readBasicCourseNames(filename);
aPerson.courses = basicCourseNames.map(name => new Course(name, false));
for(const name of readBasicCourseNames(filename)) {
    aPerson.courses.push(new Course(name, false)); // 필드 참조 과정만 캡슐화 되고, 필드에 담긴 내용은 캡슐화되지 않음!
}
```
▼
```javascript
class Person {
    //...
    addCourse(aCourse) { // 2. 원소를 추가 / 제거하는 함수 생성
        this._courses.push(aCourse);
    }
    removeCourse(aCourse, fnIfAbsent = () => {throw new RangeError();}) {
        const index = this._courss.indexOf(aCourse);
        if (index === -1) fnIfAbsent();
        else this._courses.splice(index, 1);
    }
}
```
▼
```javascript
for(const name of readBasicCourseNames(filename)) {
    aPerson.addCourse(new Course(name, false)); // 4. 컬렉션의 변경자를 직접 호출하던 코드 → 방금 추가한 메서드를 사용하는 코드
}

class Person {
    // ...
    
    // set courses(aList) {this._courses = aList;} // 세터 제거하기(11.7)
    set courses(aList) {this._courses = aList.slice();} // 세터를 제공해야할 특별한 이유가 있을 경우 복제본을 저장하도록 수정
    
    get courses() {return this._courses.slice();} // 5. 클래스에서 제공해주는 메서드를 사용하지 않으면 컬렉션을 변경할 수 없게 함 
}
```

### 7.3 기본형을 객체로 바꾸기 (Replace Primitive with Object)
```javascript
orders.filter(o => "high" === o.priority
                || "rush" === o.priority);
```
▼
```javascript
orders.filter(o => o.priority.higherThan(new Priority("normal")))
```
- 단순한 출력 이상의 기능이 필요해지는 순간 데이터에 대한 전용 클래스를 정의하는게 좋음
  - 프로그램이 커질수록 더 유용해짐

#### 절차
1. 변수를 캡슐화(6.6) 하기
2. 단순한 값 클래스(Value Object) 생성. 생성자는 기존 값을 인수로 받아 저장하고, 이 값을 반환하는 게터를 추가함
3. 정적 검사 수행
4. VO의 인스턴스를 새로 만들어서 필드에 저장하도록 세터 수정. 필드의 타입을 적절히 변경.
5. 새로 만든 클래스의 게터를 호출한 결과를 반환하도록 게터 수정.
6. 테스트
7. 함수 이름 변경(6.5)을 통해 원본 접근자의 동작을 더 잘 드러낼 수 있을지 검토
   - 참조를 값으로 바꾸기(9.4) 혹은 참조로 바꾸면(9.5) 새로 만든 객체의 역할이 더 잘 드러나는지 검토

#### 예시
- 레코드 구조에서 데이터를 읽어들이는 단순한 주문 클래스 프로그램
```javascript
class Order {
    constructor(data) {
        this.priority = data.priority;
    }
}

highPriorityCount = orders.filter(o => "high" === o.priority
                                    || "rush" === o.priority)
                            .length;
```
▼
```javascript
class Order {
    // ...
    get priority() {return this._priority;} // 1. 변수 캡슐화(6.6)
    set priority(aString) {this._priority = aString;}
}
```
▼
```javascript
class Priority { // 2. VO 클래스 Priority 생성
    constructor(value) {this._value = value;}
    toString() {return this._value;} // 게터보다 toString()을 사용함. 클라이언트 입장에서 해당 속성을 문자열로 표현한 값을 요청하므로.
}

class Order {
    // ...
    
    get priority() {return this._priority.toString();} // 5. 새로 만든 클래스를 사용하도록 게터 수정.
    set priority(aString) {this._priority = new Priority(aString);} // 4. 새로 만든 클래스를 사용하도록 세터 수정
}
```
- 게터가 항목 자체가 아니라 항목의 문자열을 반환하게 되어버림 → 함수 이름을 변경할 필요성

▼
```javascript
class Order {
    // ...
    
    get priorityString() {return this._priority.toString();} // 7. 게터 함수 선언 바꾸기(6.5)
    set priority(aString) {this._priority = new Priority(aString);}
}

highPriorityCount = orders.filter(o => "high" === o.priorityString
                                    || "rush" === o.priorityString)
                            .length;
```

### 7.4 임시 변수를 질의 함수로 바꾸기 (Replace Temp with Query)
```javascript
const basePrice = this._quantity * this._itemPrice;
if (basePrice > 1000)
    return basePrice * 0.95;
else
    return basePrice * 0.98;
```
▼
```javascript
get basePrice() {
    this._quantity * this._itemPrice;
}

if (basePrice > 1000)
    return basePrice * 0.95;
else
    return basePrice * 0.98;
```
- 값을 계산하는 중복 코드 → 임시변수 사용 → 함수로 만들어 사용
- 장점
  - 다른 함수에서도 사용 가능
  - 긴 함수의 한 부분을 함수로 추출할 때, 변수들을 각각의 함수로 만들어 둔다면 따로 전달할 필요가 사라짐
  - 추출한 함수와 원래 함수의 경계를 분명하게 함 → 부자연스러운 의존 관계 및 부수효과 제거에 도움이 됨
- 주의사항
  - 클래스 바깥의 최상위 함수로 사용할 경우, 매개변수가 너무 많아져서 함수의 장점이 줄어듬
  - 변수가 다음번에 사용될 때 수행해도 똑같은 결과를 내야 함 ('옛날 주소'와 같이 스냅샷 용도의 변수에는 적용하면 안됨)

#### 절차
1. 변수가 사용되기 전에 값이 확실히 결정되는지, 변수를 사용할 때마다 다른 결과를 내지는 않는지 체크
2. 읽기전용으로 만들수 있다면, 읽기전용으로 만들기
3. 테스트
4. 변수 대입문을 함수로 추출
   - 변수와 함수가 같은 이름을 가질 수 없을 경우 함수 이름을 임시로 짓기.
   - 추출한 함수가 부수효과를 일으키지는 않는지 체크
     - 질의 함수와 변경 함수 분리하기(11.1) 적용
5. 테스트
6. 임시 변수 제거 : 변수 인라인하기(6.4)

#### 예시
- 간단한 주문 클래스
```javascript
class Order {
    constructor(quantity, item) {
        this._quantity = quantity;
        this._item = item;
    }
    
    get price() {
        var basePrice = this._quantity * this._itemPrice;
        var discountFactor = 0.98;

        if (basePrice > 1000) discountFactor -= 0.03;
        return basePrice * discountFactor;
    }
}
```
▼
```javascript
class Order {
    constructor(quantity, item) {
        this._quantity = quantity;
        this._item = item;
    }
    
    get price() {
        const basePrice = this._quantity * this._itemPrice; // 2. 변수를 읽기전용으로 바꾸기, 3. 테스트 (재대입 코드가 없는지 확인)
        var discountFactor = 0.98;

        if (basePrice > 1000) discountFactor -= 0.03;
        return basePrice * discountFactor;
    }
}
```
▼
```javascript
class Order {
    constructor(quantity, item) {
        this._quantity = quantity;
        this._item = item;
    }
    
    get price() {
        const basePrice = this.basePrice; // 4. 대입문의 우변을 게터로 추출하기, 5. 테스트
        var discountFactor = 0.98;

        if (basePrice > 1000) discountFactor -= 0.03;
        return basePrice * discountFactor;
    }
    
    get basePrice() {
        return this._quantity * this._itemPrice;
    }
}
```
▼
```javascript
class Order {
    // ...
    get price() {
        return this.basePrice * this.discountFactor;  // 최종 코드
    }
    
    get basePrice() {
        return this._quantity * this._itemPrice;
    }
    get discountFactor() { // discountFactor 변수도 동일하게 처리
        var discountFactor = 0.98;
        if (basePrice > 1000) discountFactor -= 0.03;
        return discountFactor;
    }
}
```

### 7.5 클래스 추출하기 (Extract Class)
```javascript
class Person {
    get officeAreaCode() {return this._officeAreaCode;}
    get officeNumber() {return this._officeNumber;}
}
```
▼
```javascript
class Person {
    get officeAreaCode() {return this._telephoneNumber.areaCode;}
    get officeNumber() {return this._telephoneNumber.number;}
}

class TelephoneNumber {
    get areaCode() {return this._areaCode;}
    get number() {return this._number;}
}
```
- 클래스가 점점 비대해 질 경우, 메서드와 데이터가 너무 많아짐 → 적절한 분리 필요
  - 일부 데이터와 메서드를 따로 묶을 수 있으면 빨리 분리할 것
  - 함께 변경되는 일이 많거나 서로 의존하는 데이터들도 분리할 것
    - 특정 데이터나 메서드 일부를 제거하면 어떤 일이 일어날지 판단해보기 → 다른 필드나 메서드들이 논리적으로 문제가 없다면 분리할 수 있다는 의미

#### 절차
1. 클래스의 역할을 분리할 방법 정하기
2. 분리될 역할을 담당한 클래스를 새로 생성
   - 원 클래스에 남게 된 역할과 클래스 명이 어울리지 않을 경우 적절히 수정하기
3. 원 클래스의 생성자에서 새로운 클래스의 인스턴스를 생성해 필드에 저장하기
4. 필요한 필드들을 새 클래스로 옮기기 : 필드 옮기기(8.2). 매번 테스트하기
5. 메서드들을 새 클래스로 옮기기 : 함수 옮기기(8.1). 매번 테스트하기
   - 저수준 메서드(타 메서드 호출보다, 호출을 당하는 일이 많은 메서드)부터 옮기기
6. 양쪽 클래스의 인터페이스를 살펴보며 불필요 메서드 제거하기, 이름도 적절히 변경하기
7. 새 클래스를 외부로 노출할지 정하기
   - 노출 필요시 새 클래스에 참조를 값으로 바꾸기(9.4) 적용 고려해보기

#### 예시
- 단순한 Person 클래스
```javascript
class Person {
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    get telephoneNumber() {return '(${this.officeAreaCode}) ${this.officeNumber}';}
    get officeAreaCode() {return this._officeAreaCode;}
    set officeAreaCode(arg) {this._officeAreaCode = arg;}
    get officeNumber() {return this._officeNumber;}
    set officeNumber(arg) {this._officeNumber = arg;}
}
```
▼
```javascript
class TelephoneNumber { // 1. 전화번호 관련 동작 클래스 추출, 2. 빈 전화번호를 표현하는 TelephoneNumber 클래스 정의
}
```
▼
```javascript
class Person {
    constructor() {
        this._telephoneNumber = new TelephoneNumber(); // 3. 원본 클래스 인스턴스 생성자에 전화번호 인스턴스를 생성하도록 하기
    }
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    
    get telephoneNumber() {return this._telephoneNumber.telephoneNumber;}
    get officeAreaCode() {return this._telephoneNumber.officeAreaCode;}
    set officeAreaCode(arg) {this._telephoneNumber.officeAreaCode = arg;}
    get officeNumber() {return this._telephoneNumber.officeNumber;}
    set officeNumber(arg) {this._telephoneNumber.officeNumber = arg;}
}
class TelephoneNumber {
    get officeAreaCode() {return this._officeAreaCode;} // 4. 필드들을 하나씩 새 클래스로 옮기기(8.2)
    set officeAreaCode(arg) {this._officeAreaCode = arg;}
    
    get officeNumber() {return this._officeNumber;} // 4. 필드들을 하나씩 새 클래스로 옮기기(8.2)
    set officeNumber(arg) {this._officeNumber = arg;}

    get telephoneNumber() {return '(${this.officeAreaCode}) ${this.officeNumber}';} // 5. 메서드 옮기기
}
```
▼
```javascript
class Person {
    constructor() {
        this._telephoneNumber = new TelephoneNumber(); // 3. 원본 클래스 인스턴스 생성자에 전화번호 인스턴스를 생성하도록 하기
    }
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    
    get telephoneNumber() {return this._telephoneNumber.toString();}
    get officeAreaCode() {return this._telephoneNumber.areaCode;}
    set officeAreaCode(arg) {this._telephoneNumber.areaCode = arg;}
    get officeNumber() {return this._telephoneNumber.number;}
    set officeNumber(arg) {this._telephoneNumber.number = arg;}
}
class TelephoneNumber {
    get areaCode() {return this._areaCode;} // 6. 메서드 이름 적절히 바꿔주기
    set areaCode(arg) {this._areaCode = arg;}
    
    get number() {return this._number;}
    set number(arg) {this._number = arg;}

    toString() {return '(${this.areaCode}) ${this.number}';} // 6. 메서드 이름 적절히 바꿔주기
}
```

### 7.6 클래스 인라인하기 (Inline Class)
↔ 클래스 추출하기
```javascript
class Person {
    get officeAreaNumber() {return this._telephoneNumber.areaCode;}
    get officeNumber() {return this._telephoneNumber.number;}
}

class TelephoneNumber {
    get areaCode() {return this._areaCode;}
    get number() {return this._number;}
}
```
▼
```javascript
class Person {
    get officeAreaNumber() {return this._officeAreaCode;}
    get officeNumber() {return this._officeNumber;}
}
```
- 클래스 추출하기(7.5)와 반대되는 리팩터링
- 사용할 때
  1. 특정 클래스에 남은 역할이 거의 없을 때 사용 
  2. 두 클래스의 기능을 지금과 다르게 배분하고 싶을 때 사용
     - 상황에 따라 하나씩 옮기는 것보다 하나로 합친 후 분리하기가 쉬울 수도 있으므로.

#### 절차
1. 소스 클래스의 각 public 메서드에 대응하는 메서드들을 타깃 클래스에 생성
   - 작업은 단순히 소스 클래스로 위임해야 함
2. 소스 클래스의 메서드를 사용하는 코드를 모두 타깃 클래스의 메서드를 사용하도록 변경 후 테스트
3. 소스 클래스의 메서드와 필드를 모두 타깃 클래스로 이동 후 테스트
4. 소스 클래스 삭제

### 7.7 위임 숨기기 (Hide Delegate)
```javascript
manager = aPerson.department.manager;
```
▼
```javascript
manager = aPerson.manager;

class Person {
    get manager() {return this.department.manager;}
}
```
- 캡슐화 : 모듈들이 시스템의 다른 부분에 대해 알아야 할 부분을 줄여줌 → 고려해야 할 사항이 적어져서 코드 변경을 쉽게 함
- 위임 객체가 수정되더라도 서버 코드만 수정하고, 클라이언트는 영향을 받지 않게끔 해야 함

#### 절차
1. 위임 객체의 각 메서드에 해당하는 위임 메서드를 서버에 생성
2. 클라이언트가 위임 객체 대신 서버를 호출하도록 수정 후 테스트
3. 서버로부터 위임 객체를 얻는 접근자 제거
4. 테스트

#### 예시
- 사람과 사람이 속한 부서 클래스
```javascript
class Person {
    constructor(name) {
        this._name = name;
    }
    get name() {return this._name;}
    get department() {return this._department;}
    set department(arg) {this._department = arg;}
}

class Department {
    get chargeCode() {return this._chargeCode;}
    set chargeCode(arg) {this._chargeCode = arg;}
    get manager() {return this._manager;}
    set manager(arg) {this._manager = arg;}
}

manager = aPerson.department.manager; // 클라이언트가 부서 클래스의 내부를 알아야 함
```
▼
```javascript
class Person {
    // ...
    // get department() {return this._department;} // 3. 접근자 제거
    get manager() {return this._department.manager;} // 1. 위임 메서드 생성
}

manager = aPerson.manager; // 2. 클라이언트가 새 메서드를 사용하도록 수정
```

### 7.8 중개자 제거하기 (Remove Middle Man)
↔ 위임 숨기기
```javascript
manager = aPerson.manager;

class Person {
    get manager() {return this.department.manager;}
}
```
▼
```javascript
manager = aPerson.department.manager;
```
- 위임 숨기기(7.7)와 반대되는 리팩터링
- 클라이언트가 위임 객체의 다른 기능을 사용하려 할 때마다 서버에 위임 메서드가 추가됨 → 단순히 전달만 하는 위임 메서드들이 과해짐 → 서버 클래스가 중개자(middle man) 역할이 되어버림
  - 차라리 클라이언트가 위임 객체를 직접 호출하는게 나을 수 있음

#### 절차
1. 위임 객체를 얻는 게터 생성
2. 위임 메서드를 호출하는 클라이언트가 모두 이 게터를 거치도록 수정 후 테스트
3. 위임 메서드 삭제
   - 자동 리팩터링 도구를 사용할 경우, 위임 필드를 캡슐화(6.6) 후 모든 메서드를 인라인(6.2)하여 한 번에 고치기

### 7.9 알고리즘 교체하기 (Substitute Algorithm)
```javascript
function foundPerson(people) {
    for (let i = 0; i < people.length; i++) {
        if (people[i] === "Don") {
            return "Don";
        }
        if (people[i] === "John") {
            return "John";
        }
        if (people[i] === "Kent") {
            return "Kent";
        }
    }
    return "";
}
```
▼
```javascript
function foundPerson(people) {
    const candidates = ["Don", "John", "Kent"];
    return people.find(p => candidates.includes(p)) || '';
}
```
- 더 나은 알고리즘이 있다면 기존 코드를 간결하게 고침

#### 절차
1. 교체할 코드를 함수 하나에 모으기
2. 해당 함수만을 이용해 동작을 검증하는 테스트 생성
3. 대체할 알고리즘 생성
4. 정적 검사 수행
5. 기존 알고리즘과 새 알고리즘의 결과를 비교하는 테스트 수행
