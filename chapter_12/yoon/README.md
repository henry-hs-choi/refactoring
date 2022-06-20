# 챕터 내용 정리

## 12장 - 상속 다루기

> 상속은 발등에 불이 떨어져서야 비로소 잘못 사용했음을 알아차리는 경우가 많다.

### 12.1 메서드 올리기 (Pull Up Method)

```javascript
class Employee { /* ... */ }
class Salesperson extends Employee {
    get name() {/* ... */}
}
class Engineer extends Employee {
    get name() {/* ... */}
}
```
▼
```javascript
class Employee {
    get name() {/* ... */}
}
class Salesperson extends Employee {/* ... */}
class Engineer extends Employee {/* ... */}
```

- 중복 코드 제거는 중요함
    - 중복코드의 단점 : 한 쪽의 변경이 다른 쪽에는 반영되지 않을 수 있음
- 메서드 올리기를 적용하기 위해서는 중복 코드 간 차이점을 잘 찾아야 함
    - *질의 함수는 모두 부수효과가 없어야 함* : 명령-질의 분리(Command-Query Separation)
    - 값을 반환하면서 부수효과도 있는 함수 → 상태를 변경하는 부분과 질의하는 부분을 분리할 것!

#### 절차

1. 똑같이 동작하는 메서드인지 면밀하게 살펴보기
    - 실질적으로 동일한 일을 하더라도 코드가 다르다면 본문 코드가 똑같아질 때까지 리팩터링
2. 메서드 본문에서 호출하는 메서드와 참조하는 필드들을 슈퍼클래스에서도 호출하고 참조할 수 있는지 확인
3. 메서드 시그니처가 다르다면 → 슈퍼클래스에서 사용하고 싶은 형태로 통일 : 함수 선언 바꾸기(6.5)
4. 슈퍼클래스에 새로운 메서드를 생성하고, 대상 메서드의 코드를 복사
5. 정적 검사 수행
6. 서브클래스 중 하나의 메서드를 제거
7. 테스트
8. 6 ~ 7 반복

#### 예시
```javascript
class Employee extends Party {

    get annualCost() {
        return this.monthlyCost * 12;
    }
}

class Department extends Party {

    get totalAnnualCost() {
        return this.monthlyCost * 12;
    }
}

// 2. monthlyCost() 속성은 슈퍼클래스에는 없으나, 서브클래스 모두에 존재함
//    - 자바스크립트는 동적 언어이므로 문제 없음
//    - 정적 언어일 경우 슈퍼클래스인 Party 에 추상 메서드를 정의해야 함
```
▼
```javascript
class Department extends Party {
    get annualCost() { // 3. 함수 선언 바꾸기(6.5) 로 이름 통일
        return this.monthlyCost * 12;
    }
}

class Party {
    get annualCost() { // 4. 서브클래스 중 하나의 메서드를 복사해 슈퍼클래스에 붙여넣음
        return this.monthlyCost * 12;
    }
}

// 6. 서브클래스 한 곳에서 메서드를 제거하고
// 7. 테스트
// 8. 반복 
```

### 12.2 필드 올리기 (Pull Up Field)
↔ 필드 내리기(12.5)
```java
class Employee {/* ... */}
class Salesperson extends Employee {
    private String name;
}
class Engineer extends Employee {
    private String name;
}
```
▼
```java
class Employee {
    private String name;
}
class Salesperson extends Employee {/* ... */}
class Engineer extends Employee {/* ... */}
```

- 서브클래스들이 독립적으로 개발되었거나, 뒤늦게 하나의 계층구조로 리팩터링 된 경우 → 일부 기능이 중복된 경우가 있음
    - 특히 필드가 중복되기 쉬움
- 필드 중복 해결의 장점
    - 데이터 중복 선언을 없앨 수 있음
    - 해당 필드를 사용하는 동작을 서브클래스에서 슈퍼클래스로 옮길 수 있음
- 동적언어의 경우 필드가 클래스 정의에 포함되지 않음
    - → 필드를 올리기 전에 반드시 생성자 본문부터 올리기(12.3) 

#### 절차
1. 후보 필드들을 사용하는 곳 모두가 똑같은 방식으로 사용하는지 면밀히 검토
2. 필드들의 이름이 다를 경우 → 똑같은 이름으로 변경 : 필드 이름 바꾸기(9.2)
3. 슈퍼클래스에 새로운 필드 생성
    - 서브클래스에 접근할 수 있어야 함 (대부분은 protected)
4. 서브클래스의 필드 제거
5. 테스트

### 12.3 생성자 본문 올리기 (Pull Up Constructor Body)
```javascript
// before
class Party {/* ... */}
class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super();
        this._id = id;
        this._name = name;
        this._monthlyCost  = monthlyCost;
    }
}
```
▼
```javascript
class Party {
    constructor(name) {
        this._name = name;
    }
}
class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super(name);
        this._id = id;
        this._monthlyCost  = monthlyCost;
    }
}
```

- 생성자는 다루기 까다로움
    - 생성자에서 하는 일에 제약을 두는게 좋음
    - 기능이 같은 메서드들을 발견 → 함수 추출하기(6.1) → 메서드 올리기(12.1)
    - 생성자의 경우 → 할 수 있는 일과 호출 순서에 제약이 있음
- 본 리팩터링이 간단히 끝날 것 같지 않을 경우 → 생성자를 팩터리 함수로 바꾸기(11.8) 고려

#### 절차
1. 서브클래스의 생성자들에서 생성자가 호출되는지 확인
    - 슈퍼클래스에 생성자가 없을 경우 정의
2. 공통 문장 모두를 super() 호출 직후로 옮기기 : 문장 슬라이드하기(8.6)
3. 공통 코드를 슈퍼클래스에 추가하고 서브클래스들에서 제거. 생성자 매개변수 중 공통 코드에서 참조하는 값들을 모두 super()로 넘겨주기
4. 테스트
5. 생성자 시작 부분으로 옮길 수 없는 공통 코드가 있을 경우 → 함수 추출하기(6.1) → 메서드 올리기(12.1)

#### 예시
```javascript
class Party {
}

class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super();
        this._id = id;
        this._name = name; // 공통 코드
        this._monthlyCost = monthlyCost;
    }

    // rest of class...
}

class Department extends Party {
    constructor(name, staff) {
        super();
        this._name = name; // 공통 코드
        this._staff = staff;
    }

    // rest of class...
}
```
▼
```javascript
class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super();
        this._name = name; // super() 호출 바로 아래로 옮기기 : 문장 슬라이드하기(8.6)
        this._id = id;
        this._monthlyCost = monthlyCost;
    }

    // rest of class...
}

// 2. 테스트
```
▼
```javascript
class Party {
    constructor(name){ 
        this._name = name; // 3. 공통 코드를 슈퍼클래스로 옮기기
    }
}

class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super(name); // 3. name 을 참조하므로 슈퍼클래스 생성자에 매개변수로 건네주기
        this._id = id;
        this._monthlyCost = monthlyCost;
    }

    // rest of class...
}

class Department extends Party {
    constructor(name, staff){
        super(name);
        this._staff = staff;
    }

    // rest of class...
}

// 4. 테스트
```
##### 예시 : 공통 코드가 나중에 올 때
```javascript
class Employee {
    constructor (name) { /* ... */}

    get isPrivileged() {/* ... */}

    assignCar() {/* ... */}
}

class Manage extends Employee {
    constructor(name, grade) {
        super(name);
        this._grade = grade;
        if (this.isPrivileged) this.assignCar(); // 모든 서브클래스가 수행하는 코드
    }

    get isPrivileged() {
        return this._grade > 4;
    }
}
```
▼
```javascript

class Manage extends Employee {
    constructor(name, grade) {
        super(name);
        this._grade = grade;
        this.finishConstruction();
    }

    finishConstruction() { // 5. 공통 코드를 함수로 추출(6.1)
        if (this.isPrivileged) this.assignCar();
    }
}
```
▼
```javascript
class Employee {
    constructor (name) { /* ... */}

    get isPrivileged() {/* ... */}

    assignCar() {/* ... */}

    finishConstruction() { // 추출한 메서드를 슈퍼클래스로 옮기기 : 메서드 올리기(12.1)
        if (this.isPrivileged) this.assignCar();
    }
}
```

### 12.4 메서드 내리기 (Push Down Method)
↔ 메서드 올리기(12.1)
```javascript
class Employee {
    get quota() {/* ... */}
}
class Engineer extends Employee {/* ... */}
class Salesperson extends Employee {/* ... */}
```
▼
```javascript
class Employee {/* ... */}
class Engineer extends Employee {/* ... */}
class Salesperson extends Employee {
    get quota() {/* ... */}
}
```

- 특정 서브클래스 소수와만 관련된 메서드 → 서브클래스로 내리는게 깔끔함
- 서브클래스가 정확히 무엇인지 호출자가 알지 못할 경우 → 서브클래스에 따라 다르게 동작 : 다형석으로 변경(10.4)

#### 절차
1. 대상 메서드를 모든 서브클래스에 복사
2. 슈퍼클래스에서 해당 메서드 제거
3. 테스트
4. 메서드를 사용하지 않는 모든 서브클래스에서 제거
5. 테스트

### 12.5 필드 내리기 (Push Down Field)
↔ 필드 올리기(12.2)
```java
class Employee {
    private String quota;
}
class Engineer extends Employee {/* ... */}
class Salesperson extends Employee {/* ... */}
```
▼
```java
class Employee {/* ... */}
class Engineer extends Employee {/* ... */}
class Salesperson extends Employee {
    protected String quota;
}
```

#### 절차
1. 대상 필드를 모든 서브클래스에 정의
2. 슈퍼클래스에서 해당 필드 제거
3. 테스트
4. 해당 필드를 사용하지 않는 모든 서브클래스에서 제거
5. 테스트

### 12.6 타입 코드를 서브클래스로 바꾸기 (Replace Type Code with Subclasses)
↔ 서브클래스 제거하기(12.7)
- 하위 리팩터링
    - 타입 코드를 상태/전략 패턴으로 바꾸기
    - 서브클래스 추출하기
```javascript
function createEmployee(name, type) {
    return new Employee(name, type);
}
```
▼
```javascript
function createEmployee(name, type) {
    switch (type) {
        case 'engineer':
            return new Engineer(name);
        case 'salesperson':
            return new Salesperson(name);
        case 'manager':
            return new Manager(name);
    }
}
```

- 타입 코드(type code) : 비슷한 대상을 특정 특성에 따라 구분해야 할 때 사용. 열거형, 심볼, 문자열, 숫자 등으로 표현. 
- 서브클래스가 필요할 때 리팩터링 적용 
    - 서브클래스의 장점
        - 조건에 따라 다르게 동작하는 다형성 제공 : 조건부 로직을 다형성으로 바꾸기(10.4)
            - 타입코드에 따라 동작이 달라지는 함수가 많을수록 유용
        - 특정 타입에서만 의미가 있는 값을 사용하는 필드나 메서드가 있을 경우 : 필드 내리기(12.5)
- 적용 대상 고려 필요
    1. 대상클래스에 적용할지
        - 직원의 하위 타입인 엔지니어 생성
        - 타입 코드에 기본형을 객체로 바꾸기(7.3) 먼저 적용 후 본 리팩터링 적용
    2. 타입 코드에 적용할지 
        - 직원에게 '직원 유형' *속성* 부여, 해당 속성을 클래스로 정의

#### 절차
1. 타입 코드 필드를 자가 탭슐화
2. 타입 코드 값 하나에 해당하는 서브클래스 생성. 타입 코드 게터 메서드를 오버라이드하여 해당 타입 코드의 리터럴 값을 반환하게 하기
3. 매개변수로 받은 타입 코드와 방금 만든 서브클래스를 매핑하는 선택 로직 생성
    - 직접 상속일 경우 → 생성자를 팩터리 함수로 바꾸기(11.8) 후 선택 로직을 팩터리에 넣기
    - 간접 상속일 경우 → 선택 로직을 생성자에 넣기
4. 테스트
5. 타입 코드 값 각각에 대해 서브클래스 생성과 선택 로직 추가를 반복 / 테스트
6. 타입 코드 필드 제거
7. 테스트
8. 타입 코드 접근자를 이용하는 메서드 모두에 메서드 내리기(12.4)와 조건부 로직을 다형성으로 바꾸기(10.4) 적용

#### 예시
##### 직접 상속할 때
```javascript
class Employee{
    constructor(name, type){
        this.validateType(type);
        this._name = name;
        this._type = type; // 타입변수
    }
    validateType(arg) {
        if (!["engineer", "manager", "salesman"].includes(arg))
            throw new Error(`Employee cannot be of type ${arg}`);
    }
    toString() {return `${this._name} (${this._type})`;}
}
```
▼
```javascript
class Employee{
    get type() {return this._type;} // 1. 타입 코드 변수를 자가 캡슐화(6.6)
    toString() {return `${this._name} (${this.type})`;} // toString() 에서 게터를 사용하도록 변경
}

class Engineer extends Employee { // 2. 타입 코드 중 하나를 서브클래싱
    get type() {return "engineer";} // 타입 코드 게터를 오버라이드하여 리터럴 값 반환
}

// 선택 로직을 생성자에 넣을 경우, 필드 초기화와 로직이 꼬일 수 있음
function createEmployee(name, type) { // 3. 생성자를 팩터리 함수로 바꾸기(11.8) - 선택 로직을 담을 별도 장소 마련 
    return new Employee(name, type);
}
```
▼
```javascript
function createEmployee(name, type) {
    switch (type) { // 선택 로직을 팩터리에 추가
        case "engineer": return new Engineer(name, type);
    }
    return new Employee(name, type);
}

// 4. 테스트
```
▼
```javascript
class Salesman extends Employee { // 5. 반복 / 테스트
    get type() {return "salesman";}
}

class Manager extends Employee {
    get type() {return "manager";}
}

function createEmployee(name, type) {
    switch (type) {
        case "engineer": return new Engineer(name, type);
        case "salesman": return new Salesman(name, type);
        case "manager":  return new Manager (name, type);
    }
    return new Employee(name, type);
}
```
▼
```javascript
class Employee{
    constructor(name, type){
        this.validateType(type);
        this._name = name;
        // this._type = type; // 6. 슈퍼클래스의 타입 코드 필드 제거
    }

    // get type() {return this._type;} // 6. 슈퍼클래스의 타입 코드 게터 제거
    toString() {return `${this._name} (${this.type})`;}
}
```
▼
```javascript
class Employee{
    constructor(name, type){
        // this.validateType(type); // 7. 검증 로직 제거
        this._name = name;
    }
}
function createEmployee(name, type) {
    switch (type) {
        case "engineer": return new Engineer(name, type);
        case "salesman": return new Salesman(name, type);
        case "manager":  return new Manager (name, type);
        default: throw new Error(`Employee cannot be of type ${type}`);
    }
    // return new Employee(name, type); // 7. 검증 로직 제거
}
```
▼
```javascript
class Employee{
    constructor(name){ // 생성자에서 타입 코드 제거 : 함수 선언 바꾸기(6.5)
        this._name = name;
    }
}
function createEmployee(name, type) {
    switch (type) {
        case "engineer": return new Engineer(name);
        case "salesman": return new Salesman(name);
        case "manager":  return new Manager (name);
        default: throw new Error(`Employee cannot be of type ${type}`);
    }
}

// 8. 서브클래스에는 타입 코드 게터가 남아있음
// - 해당 메서드를 이용하는 코드가 남아있을 수 있으므로
//     1. 로직을 다형성으로 바꾸기(10.4)
//     2. 메서드 내리기(12.4)
//      → 죽은 코드 제거하기 (8.9)
```

##### 간접 상속할 때
- 기존에 이미 서브클래스가 있을 경우
- 직원 유형을 변경하는 기능을 유지하고 싶을 경우
```javascript
class Employee{
    constructor(name, type){
        this.validateType(type);
        this._name = name;
        this._type = type;
    }
    validateType(arg) {
        if (!["engineer", "manager", "salesman"].includes(arg))
            throw new Error(`Employee cannot be of type ${arg}`);
    }
    get type()    {return this._type;}
    set type(arg) {this._type = arg;}

    get capitalizedType() {
        return this._type.charAt(0).toUpperCase() + this._type.substr(1).toLowerCase();
    }
    toString() {
        return `${this._name} (${this.capitalizedType})`;
    }
}
```
▼
```javascript
class EmployeeType { // 타입 코드를 객체로 바꾸기 : 기본형을 객체로 바꾸기(7.3)
    constructor(aString) {
        this._value = aString;
    }
    toString() {return this._value;}
}

class Employee{
    constructor(name, type){
        this.validateType(type);
        this._name = name;
        this.type = type;
    }
    validateType(arg) {
        if (!["engineer", "manager", "salesman"].includes(arg))
            throw new Error(`Employee cannot be of type ${arg}`);
    }
    get typeString()    {return this._type.toString();}
    get type()    {return this._type;}
    set type(arg) {this._type = new EmployeeType(arg);}

    get capitalizedType() {
        return this.typeString.charAt(0).toUpperCase()
            + this.typeString.substr(1).toLowerCase();
    }
    toString() {
        return `${this._name} (${this.capitalizedType})`;
    }
}
```
▼
- 이전과 동일하게 리팩터링
```javascript
class Employee{
    constructor(name, type){
        this.validateType(type);
        this._name = name;
        this.type = type;
    }
    validateType(arg) {
        if (!["engineer", "manager", "salesman"].includes(arg))
            throw new Error(`Employee cannot be of type ${arg}`);
    }
    get typeString()    {return this._type.toString();}
    get type()    {return this._type;}
    set type(arg) {this._type = Employee.createEmployeeType(arg);}

    static createEmployeeType(aString) {
        switch(aString) {
            case "engineer": return new Engineer();
            case "manager": return new Manager ();
            case "salesman": return new Salesman();
            default: throw new Error(`Employee cannot be of type ${aString}`);
        }
    }

    get capitalizedType() {
        return this.typeString.charAt(0).toUpperCase()
            + this.typeString.substr(1).toLowerCase();
    }
    toString() {
        return `${this._name} (${this.capitalizedType})`;
    }
}


class EmployeeType {
}
class Engineer extends EmployeeType {
    toString() {return "engineer";}
}
class Manager extends EmployeeType {
    toString() {return "manager";}
}
class Salesman extends EmployeeType {
    toString() {return "salesman";}
}
```
▼
- 빈 EmployeeType 은 제거해도 괜찮지만 장점이 있음
    - 다양한 서브클래스 사이의 관계를 알려주기 좋음
    - 공통 기능을 옮겨놓기 편리함
```javascript
class Employee{
    toString() {
        return `${this._name} (${this.type.capitalizedName})`;
    }
}


class EmployeeType {
    get capitalizedName() {
        return this.toString().charAt(0).toUpperCase()
            + this.toString().substr(1).toLowerCase();
    }
}
class Engineer extends EmployeeType {
    toString() {return "engineer";}
}
class Manager extends EmployeeType {
    toString() {return "manager";}
}
class Salesman extends EmployeeType {
    toString() {return "salesman";}
}
```

### 12.7 서브클래스 제거하기 (Remove Subclass)
↔ 타입 코드를 서브클래스로 바꾸기(12.6)
```javascript
class Person {
    get genderCode() {
        return 'X';
    }
}
class Male extends Person {
    get genderCode() {
        return 'M';
    }
}
class Female extends Person {
    get genderCode() {
        return 'F';
    }
}
```
▼
```javascript
class Person {
    get genderCode() {
        return this._genderCode;
    }
}
```

- 더 이상 사용되지 않는 서브클래스는 코드의 복잡성만 높임

#### 절차
1. 서브클래스의 생성자를 팩터리 함수로 변경(11.8)
    - 생성자를 사용하는 측에서 어떤 서브클래스를 생성할지 결정할 경우 → 결정로직을 슈퍼클래스의 팩터리 메서드에 삽입 
2. 서브클래스의 타입을 검사하는 코드가 있을 경우 → 검사 코드에 함수 추출하기(6.1) → 슈퍼클래스로 옮기기 : 함수 옮기기(8.1)
3. 서브클래스의 타입을 나타내는 필드를 슈퍼클래스에 생성
4. 서브클래스를 참조하는 메서드가 방금 만든 타입 필드를 이용하도록 수정
5. 서브클래스 제거
6. 테스트

- 다수의 서브클래스에 한꺼번에 적용할 경우
    - 팩터리 함수를 추가하고 타입 검사 코드를 옮기는 캡슐화 단계(1, 2)를 먼저 실행

#### 예시
```javascript
class Person {
    constructor(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    get genderCode() {
        return "X";
    }
}

class Male extends Person {
    get genderCode() {
        return "M";
    }
}

class Female extends Person {
    get genderCode() {
        return "F";
    }
}

// 클라이언트 코드 확인
const numberOfMales = people.filter(p => p instanceof Male).length;
```
▼

------------------
##### 1. 무언가의 표현 방법을 바꿀 때 → 캡슐화 : 클라이언트의 코드에 주는 영향 최소화
    - 서브클래스 만들기의 경우 → 생성자를 팩터리 함수로 바꾸기(11.8)
###### option 1 : 생성자 하나당 하나씩 팩터리 메서드 생성
```javascript
function createPerson(name) {
    return new Person(name);
}
function createMale(name) {
    return new Male(name);
}
function createFemale(name) {
    return new Female(name);
}
```

###### option 2 : 생성할 클래스를 선택하는 로직을 함수로 추출(6.1) 후 팩터리 함수로 만들기
- 성별 코드를 사용하는 곳에서 직접 생성될 경우
```javascript
function loadFromInput(data) {
    const result = [];
    data.forEach(aRecord => {
        let p;
        switch (aRecord.gender) {
            case 'M': p = new Male(aRecord.name); break;
            case 'F': p = new Female(aRecord.name); break;
            default: p = new Person(aRecord.name);
        }
        result.push(p);
    });
    return result;
}
```
▼
```javascript
function createPerson(aRecord) {
    let p;
    switch (aRecord.gender) {
        case 'M': p = new Male(aRecord.name); break;
        case 'F': p = new Female(aRecord.name); break;
        default: p = new Person(aRecord.name);
    }
    return p;
}

function loadFromInput(data) {
    const result = [];
    data.forEach(aRecord => {
        result.push(createPerson(aRecord));
    });
    return result;
}
```
▼
```javascript
function createPerson(aRecord) {
    switch (aRecord.gender) {
        case 'M': return new Male  (aRecord.name); // 변수 인라인(6.4)
        case 'F': return new Female(aRecord.name);
        default:  return new Person(aRecord.name);
    }
}

function loadFromInput(data) {
    return data.map(aRecord => createPerson(aRecord)); // 반복문을 파이프라인으로 변경(8.8)
}
```
------------------
##### 2. 클라이언트에서 instanceof 를 직접적으로 사용하는 경우 
```javascript
const numberOfMales = people.filter(p => p instanceof Male).length;
```
▼
```javascript
const numberOfMales = people.filter(p => isMale(p)).length;

function isMale(aPerson) {return aPerson instanceof Male;} // 검사 코드를 함수 추출(6.1)
```
▼
```javascript
class Person {
    get isMale() {return this instanceof Male;} // 추출한 함수 옮기기(8.1)
}

// 클라이언트
const numberOfMales = people.filter(p => p.isMale).length;
```
------------------
▼
```javascript
class Person {

    constructor(name, genderCode) { // 3. 서브클래스의 차이(성별)를 나타낼 필드 추가
        this._name = name;
        this._genderCode = genderCode || "X";
    }

    get genderCode() {return this._genderCode;}
}
```
▼
```javascript
function createPerson(aRecord) {
    switch (aRecord.gender) {
        case 'M': return new Person(aRecord.name, "M"); // 4. 한 경우의 로직을 슈퍼클래스로 옮김
        case 'F': return new Female(aRecord.name);
        default:  return new Person(aRecord.name);
    }
}

class Person {
    get isMale() {return "M" === this._genderCode;} // 팩터리의 반환형이 Person 이 되기도 하므로, 검사 코드 수정
}

// 5. 테스트 성공 시 Male 서브클래스 제거
// 6. 다시 테스트하여 성공 시 4~5 반복
```
▼
```javascript
function createPerson(aRecord) {
    switch (aRecord.gender) {
        case 'M': return new Person(aRecord.name, "M");
        case 'F': return new Person(aRecord.name, "F");
        default:  return new Person(aRecord.name);
    }
}
```

### 12.8 슈퍼클래스 추출하기 (Extract Superclass)
```javascript
class Department {
    get totalAnnualCost() {/* ... */}
    get name() {/* ... */}
    get headCount() {/* ... */}
}
class Employee {
    get annualCost() {/* ... */}
    get name() {/* ... */}
    get id() {/* ... */}
}
```
▼
```javascript
class Party {
    get name() {/* ... */}
    get annualCost() {/* ... */}
}
class Department extends Party {
    get annualCost() {/* ... */}
    get headCount() {/* ... */}
}
class Employee extends Party {
    get annualCost() {/* ... */}
    get id() {/* ... */}
}
```

- 슈퍼클래스 추출하기의 대안 : 클래스 추출하기(7.5)
    - 중복 동작을 위임으로 해결할 경우 → 클래스 추출
    - 중복 동작을 상속으로 해결할 경우 → 슈퍼클래스 추출 (더 간단할 경우가 많음)
        - 추후에 슈퍼클래스를 위임으로 바꾸기(12.11) 적용도 간단함
    
#### 절차
1. 빈 슈퍼클래스 생성 후 상속하도록 원래 클래스들 수정
    - 필요한 경우 생성자에 함수 선언 바꾸기(6.5) 적용
2. 테스트
3. 공통 원소를 슈퍼클래스로 옮기기 : 생성자 본문 올리기(12.3), 메서드 올리기(12.1), 필드 올리기(12.2) 적용
4. 서브클래스에 남은 메서드들을 검토
    - 공통되는 부분이 있을 경우 → 함수로 추출(6.1) → 메서드 올리기(12.1)
5. 원래 클래스들을 사용하는 코드를 검토하여 슈퍼클래스의 인터페이스를 사용하게 할지 고려

#### 예시
- 연간 비용, 월간 비용, 이름을 공통으로 사용하는 코드
```javascript
class Employee {
    constructor(name, id, monthlyCost) {
        this._id = id;
        this._name = name;
        this._monthlyCost = monthlyCost;
    }
    get monthlyCost() {return this._monthlyCost;}
    get name() {return this._name;}
    get id() {return this._id;}

    get annualCost() {
        return this.monthlyCost * 12;
    }
}

class Department {
    constructor(name, staff){
        this._name = name;
        this._staff = staff;
    }
    get staff() {return this._staff.slice();}
    get name() {return this._name;}

    get totalMonthlyCost() {
        return this.staff
            .map(e => e.monthlyCost)
            .reduce((sum, cost) => sum + cost);
    }
    get headCount() {
        return this.staff.length;
    }
    get totalAnnualCost() {
        return this.totalMonthlyCost * 12;
    }
}
```
▼
```javascript
class Party { // 1. 빈 슈퍼클래스 생성
}

class Employee extends Party { // 1. 상속
    constructor(name, id, monthlyCost) {
        super();
        this._id = id;
        this._name = name;
        this._monthlyCost = monthlyCost;
    }

    // rest of class...
}

class Department extends Party {
    constructor(name, staff) {
        super();
        this._name = name;
        this._staff = staff;
    }

    // rest of class...
}
```
▼
```javascript
class Party {
    constructor(name){
        this._name = name; // 3. 생성자에서 공통 데이터를 위로 올리기
    }
}

class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super(name);
        this._id = id;
        this._name = name;
        this._monthlyCost = monthlyCost;
    }

    // rest of class...
}

class Department extends Party {
    constructor(name, staff) {
        super(name);
        this._name = name;
        this._staff = staff;
    }

    // rest of class...
}
```
▼
```javascript
class Party {
    constructor(name){
        this._name = name;
    }
    get name() {return this._name;} // 데이터와 관련된 메서드 올리기(12.1)
}

class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super(name);
        this._id = id;
        this._name = name;
        this._monthlyCost = monthlyCost;
    }
    // get name() {return this._name;} // 제거
    // rest of class...
}

class Department extends Party {
    constructor(name, staff) {
        super(name);
        this._name = name;
        this._staff = staff;
    }
    // get name() {return this._name;} // 제거
    // rest of class...
}
```
▼
```javascript
// monthlyCost() 와 totalMonthlyCost() 에도 비슷하게 적용
```

### 12.9 계층 합치기 (Collapse Hierarchy)
```javascript
class Employee {/* ... */}
class Salesperson extends Employee {/* ... */}
```
▼
```javascript
class Employee {/* ... */}
```

- 계층구조가 변경되며 어떤 클래스와 그 부모가 너무 비슷해져서 독립적으로 존재할 필요가 없을 때 적용

#### 절차
1. 두 클래스 중 제거할 것 선택
2. 모든 요소를 하나의 클래스로 이동 : 필드 올리기(12.2)와 메서드 올리기(12.1) or 필드 내리기(12.5)와 메서드 내리기(12.4) 적용하여 
3. 제거할 클래스를 참조하던 모든 코드가 남겨질 클래스를 참조하도록 수정
4. 빈 클래스 제거
5. 테스트

### 12.10 서브클래스를 위임으로 바꾸기 (Replace Subclass with Delegate)
```javascript
class Order {
    get daysToShip() {
        return this._warehouse.daysToShip;
    }
}
class PriorityOrder extends Order {
    get daysToShip() {
        return this._priorityPlan_.daysToShip;
    }
}
```
▼
```javascript
class Order {
    get daysToShip() {
        return this._priorityDelegate
            ? this._priorityDelegate.daysToShip
            : this._warehouse.daysToShip;
    }
}
class PriorityOrder extends Order {
    get daysToShip() {
        return this._priorityPlan_.daysToShip;
    }
}
```

- 상속의 단점
    - 단일 상속만 가능함
    - 클래스들 간 관계를 너무 긴밀하게 결합함
- 위임의 장점
    - 다양한 클래스에 위임 가능
    - 상속보다 결합도가 낮음

> (클래스) 상속보다는 (객체) 컴포지션을 사용하라!
- 컴포지션(composition) : 위임
- 그러나 *서브클래스 → 위임* 변경은 쉬우므로 먼저 상속으로 접근하는게 좋음
- 디자인 패턴으로 이해하기
    - 서브클래스를 상태 패턴(State Pattern) / 전략 패턴(Strategy Pattern)으로 대체하는 것

#### 절차
1. 생성자를 호출하는 곳이 많을 경우 → 생성자를 팩터리 함수로 변경(11.8)
2. 위임으로 활용할 빈 클래스 생성
    - 이 클래스의 생성자는 서브클래스에 특화된 데이터를 전부 받아야함. 보통은 슈퍼클래스를 가리키는 역참조도 필요
3. 위임을 저장할 필드를 슈퍼클래스에 추가
4. 서브클래스 생성 코드를 수정하여 위임 인스턴스를 생성하고 위임 필드에 대입해 초기화
    - 보통 팩터리 함수가 수행
    - 생성자가 정확한 위임 인스턴스를 생성할 수 있을 경우 → 생성자가 수행
5. 서브클래스의 메서드 중 위임 클래스로 이동할 것 선택
6. 위임 클래스로 함수 옮기기(8.1). 원래 메서드에서 위임하는 코드는 지우지 않음
    - 메서드가 사용하는 원소 중 위임으로 옮길게 있을 경우 함께 옮기기
        - 슈퍼클래스에 유지해야 할 원소를 참조할 경우 슈퍼클래스를 참조하는 필드를 위임에 추가하기
7. 서브클래스 외부에도 원래 메서드를 호출하는 코드가 있을 경우 → 서브클래스의 위임 코드를 슈퍼클래스로 옮기기
    - 위임이 존재하는지를 검사하는 보호 코드로 감싸기
    - 호출하는 외부 코드가 없을 경우 → 원래 메서드는 죽은 코드가 되므로 제거(8.9)
    - 서브클래스가 둘 이상이고, 중복이 생겨날 경우 → 슈퍼클래스를 추출(12.8). 슈퍼클래스의 위임 메서드에는 보호 코드 필요 없음
8. 테스트
9. 5~8 반복
10. 서브클래스들의 생성자를 호출하는 코드 → 슈퍼클래스의 생성자를 사용하도록 수정
11. 테스트
12. 서브클래스 삭제 : 죽은 코드 제거하기(8.9)

#### 예시
##### 예시: 서브클래스가 하나일 때
- 공연 예약 클래스
```javascript
class Booking {
    constructor(show, date) {
        this._show = show;
        this._date = date;
    }

    get hasTalkback() {
        return this._show.hasOwnProperty('talkback') && !this.isPeakDay;
    }

    get basePrice() {
        let result = this._show.price;
        if (this.isPeakDay) result += Math.round(result * 0.15);
        return result;
    }
}

class PremiumBooking extends Booking {
    constructor(show, date, extras) {
        super(show, date);
        this._extras = extras;
    }

    get hasTalkback() {
        return this._show.hasOwnProperty('talkback');
    }

    get basePrice() {
        return Math.round(super.basePrice + this._extras.premiumFee);
    }

    get hasDinner() {
        return this._extras.hasOwnProperty('dinner') && !this.isPeakDay;
    }
}

// 클라이언트
aBooking = new Booking(show,date);
aBooking = new PremiumBooking(show, date, extras);
```
▼
```javascript
function createBooking(show, date) { // 1. 수정할 부분을 대비하여 캡슐화 : 생성자를 팩터리 함수로 바꾸기(11.8)
    return new Booking(show, date);
}
function createPremiumBooking(show, date, extras) {
    return new PremiumBooking (show, date, extras);
}

// 클라이언트
aBooking = createBooking(show, date);
aBooking = createPremiumBooking(show, date, extras);
```
▼
```javascript
class PremiumBookingDelegate { // 위임 클래스 생성
    constructor(hostBooking, extras) { // 서브클래스의 매개변수, 예약 객체로의 역참조를 매개변수로 받음
        this._host = hostBooking;
        this._extras = extras;
    }
}

// 역참조가 필요한 이유 : 서브클래스 메서드 중 슈퍼클래스에 저장된 데이터를 사용하는 경우가 있기 때문
```
▼
```javascript
function createPremiumBooking(show, date, extras) { // 3. 4. 위임 연결하기
    const result = new PremiumBooking (show, date, extras);
    result._bePremium(extras);
    return result;
}

class Booking {
    _bePremium(extras) {
        this._premiumDelegate = new PremiumBookingDelegate(this, extras);
    }
}
```
▼
```javascript
class PremiumBookingDelegate {
    get hasTalkback() { // 6. 서브클래스의 메서드를 위임으로 옮기기 : 함수 옮기기(8.1)
        return this._host._show.hasOwnProperty('talkback');
    }
}

class PremiumBooking extends Booking {
    // get hasTalkback() { // 7. 테스트 후 서브클래스 메서드 삭제
    //    return this._premiumDelegate.hasTalkback;
    // }
}

// 8. 다른 모든 기능에서 문제 없는지 테스트 수행
```
▼
```javascript
class PremiumBookingDelegate {
    extendBasePrice(base) {
        return Math.round(base + this._extras.premiumFee);
    }
}

class Booking {
    get basePrice() { 
        let result = this._show.price;
        if (this.isPeakDay) result += Math.round(result * 0.15);
        return (this._premiumDelegate)
            ? this._premiumDelegate.extendBasePrice(result) // super 가 사용되던 코드 → 위임 메서드를 재호출하도록 수정
            : result;
    }
}
// super 를 사용할 경우
// 1. 슈퍼클래스의 계산 로직을 함수로 추출(6.1) → 가격 계산과 분배 로직을 분리
// 2. 위임의 메서드를 기반 메서드의 확장 형태로 재호출
```
▼
```javascript
class PremiumBookingDelegate {
    get hasDinner() { // 서브클래스에만 존재하는 메서드 → 위임으로 이동
        return this._extras.hasOwnProperty('dinner') && !this.isPeakDay;
    }
}

class Booking {

    get hasDinner() { // 분배 로직 추가
        return (this._premiumDelegate)
            ? this._premiumDelegate.hasDinner
            : undefined;
    }
}
```
▼
```javascript
function createPremiumBooking(show, date, extras) {
    const result = new Booking (show, date, extras); // 10. // 팩터리 메서드가 슈퍼클래스를 반환하도록 수정
    result._bePremium(extras);
    return result;
}

// 11. 테스트
// 12. 서브클래스 제거
```

### 12.11 슈퍼클래스를 위임으로 바꾸기 (Replace Superclass with Delegate)
```javascript
class List {/* ... */}
class Stack extends List {/* ... */}
```
▼
```javascript
class Stack {
    constructor() {
        this._storage = new List()
    }
}
class List {/* ... */}
```

- 자바의 Stack 클래스의 문제
    - List 를 잘못 상속받아서, 리스트의 연산 중 스택에는 적용되지 않는 것들도 인터페이스에 함께 노출되어버림 
- 슈퍼클래스의 기능들이 서브클래스에 어울리지 않을 때 → 해당 기능들을 상속을 통해 이용하면 안됨
- 제대로된 상속의 조건
    - 서브클래스가 슈퍼클래스의 모든 기능을 사용
    - 서브클래스의 인스턴스를 슈퍼클래스의 인스턴스로 취급할 수 있어야 함
- 위임의 단점
    - 호스트의 함수 모두를 전달 함수(forwarding function)으로 만들어야 함
        - but, 단순하므로 문제가 생길 일이 적음

#### 절차
1. 슈퍼클래스 객체를 참조하는 필드를 서브클래스에 생성. 위임 참조를 새로운 슈퍼클래스 인스턴스로 초기화
2. 슈퍼클래스의 동작 각각에 대응하는 전달 함수를 서브클래스에 생성. 서로 관련된 함수끼리 그룹으로 묶어 진행 / 테스트
    - 대부분은 전달 함수 각각을 테스트 할 수 있으나, 게터와 세터 쌍은 둘다 옮긴 후 테스트가 가능함
3. 상속 관계 끊기

#### 예시
- 고대 스크롤을 보관하고 있는 도서관
```javascript
class CatalogItem{
    constructor(id, title, tags) {
        this._id = id;
        this._title = title;
        this._tags = tags;
    }

    get id() {return this._id;}
    get title() {return this._title;}
    hasTag(arg) {return this._tags.includes(arg);}
}

class Scroll extends CatalogItem{
    constructor(id, title, tags, dateLastCleaned) {
        super(id, title, tags);
        this._lastCleaned = dateLastCleaned;
    }

    needsCleaning(targetDate) {
        const threshold = this.hasTag("revered") ? 700 : 1500;
        return this.daysSinceLastCleaning(targetDate) > threshold ;
    }
    daysSinceLastCleaning(targetDate) {
        return this._lastCleaned.until(targetDate, ChronoUnit.DAYS);
    }
}
```
▼
```javascript
class Scroll extends CatalogItem{
    constructor(id, title, tags, dateLastCleaned) {
        super(id, title, tags);
        this._catalogItem = new CatalogItem(id, title, tags); // 1. 카탈로그 아이템을 참조하는 속성을 만들고, 슈퍼클래스의 인스턴스를 생성하여 대입
        this._lastCleaned = dateLastCleaned;
    }

    get id() {return this._catalogItem.id;} // 2. 슈퍼클래스의 동작 각각에 대응하는 전달 메서드 생성
    get title() {return this._catalogItem.title;}
    hasTag(aString) {return this._catalogItem.hasTag(aString);}
}
```
▼
```javascript
class Scroll{ // 3. 상속 끊기
    constructor(id, title, tags, dateLastCleaned) {
        this._catalogItem = new CatalogItem(id, title, tags);
        this._lastCleaned = dateLastCleaned;
    }
}
```