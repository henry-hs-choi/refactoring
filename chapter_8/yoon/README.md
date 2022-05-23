# 챕터 내용 정리

## 8장 - 기능 이동

### 8.1 함수 옮기기 (Move Function)

```javascript
class Account {
    get overdraftCharge() { /*...*/ }
}
```
▼
```javascript
class AccountType {
    get overdraftCharge() { /*...*/ }
}
class Account {
    /*...*/
}
```

> 좋은 소프트웨어 설계의 핵심은 모듈화가 얼마나 잘 되어 있느냐를 뜻하는 모듈성(modularity) (...)
> 프로그램의 어딘가를 수정하려 할 때 해당 기능과 깊이 관련된 작은 일부만 이해해도 가능하게 해주는 능력

- 개발을 지속하며 이해도 상승 → 소프트웨어 반영 (요소들을 이리저리 옮겨야 함)
- 함수를 옮길지 말지 결정하기 : 현재 / 옮길 곳의 컨텍스트를 살펴보기
    - Caller, Callee, 데이터 
- 함수들을 한 컨텍스트에 두더라도 작업하다보면 옮길 곳을 깨닫게 됨

#### 절차

1. 함수가 현재 컨텍스트에서 사용 중인 요소 중 함께 옮겨야 할 것 판단하기
   - 호출되는 함수가 있다면 먼저 옮기기 (영향이 적은 함수부터 옮기기)
   - 하위 함수의 호출자가 해당 함수 하나뿐일 경우 → 인라인한 다음 함수를 옮긴 후 다시 개별함수로 추출
2. 함수가 다형 메서드인지 확인
   - 객체지향일 경우 슈퍼/서브클래스 고려
3. 함수를 타깃 컨텍스트로 복사하고 다듬기
    - 소스 컨텍스트에서 사용하는 요소들을 매개변수로 넘기거나, 소스 컨텍스트 자체를 참조로 넘겨주기
    - 새로운 컨텍스트에 걸맞는 이름으로 변경하기
4. 정적 분석
5. 소스 컨텍스트에서 타깃 함수를 참조할 방법을 찾아 반영
6. 소스 함수를 타깃 함수의 위임 함수가 되도록 수정
7. 테스트
8. 소스 함수를 인라인(6.2)할지 판단
    - 타깃함수를 직접 호출해도 된다면 위임 단계는 제거하자

#### 예시
##### 중첩함수 → 최상위로 옮기기
GPS 추적 기록의 총 거리를 계산하는 프로그램
```javascript
function trackSummary(points) {
    const totalTime = calculateTime();
    const totalDistance = calculateDistance();
    const pace = totalTime / 60 / totalDistance;
    return {
        time: totalTime,
        distance: totalDistance,
        pace: pace
    };

    function calculateDistance() {  // 총 거리 계산
        let result = 0;
        for (let i = 0; i < points.length; i++) {
            result += distance(points[i - 1], points[i]);
        }
        return result;
    }

    function distance(p1, p2) { /* ... */    } // 두 지점의 거리 계산
    function radians(degrees) { /* ... */    } // 라디안 값으로 변환
    function calculateTime() { /* ... */     } // 총 시간 계산. 해당 함수를 옮길 예정
}
```
▼
```javascript
function trackSummary(points) {
    const totalTime = calculateTime();
    const totalDistance = calculateDistance();
    const pace = totalTime / 60 / totalDistance;
    return {
        time: totalTime,
        distance: totalDistance,
        pace: pace
    };

    function calculateDistance() {  // 총 거리 계산
        let result = 0;
        for (let i = 0; i < points.length; i++) {
            result += distance(points[i - 1], points[i]);
        }
        return result;
    }

    function distance(p1, p2) { /* ... */    }
    function radians(degrees) { /* ... */    }
    function calculateTime() { /* ... */     }
}

function top_calculateDistance() { // 3. 함수를 최상위로 복사
    let result = 0;
    for (let i = 0; i < points.length; i++) {
        result += distance(points[i - 1], points[i]);
    }
    return result;
}
```
▼
```javascript
function trackSummary(points) {
    const totalTime = calculateTime();
    const totalDistance = calculateDistance();
    const pace = totalTime / 60 / totalDistance;
    return {
        time: totalTime,
        distance: totalDistance,
        pace: pace
    };

    function calculateDistance() {
        let result = 0;
        for (let i = 0; i < points.length; i++) {
            result += distance(points[i - 1], points[i]);
        }
        return result;

        function distance(p1, p2) { /* ... */        } // 필요한 함수 인라인
        function radians(degrees) { /* ... */        } // 필요한 함수 인라인
    }

    function calculateTime() { /* ... */    }
}

function top_calculateDistance(points) { // 3. 매개변수 다듬기
    let result = 0;
    for (let i = 0; i < points.length; i++) {
        result += distance(points[i - 1], points[i]);
    }
    return result;

    function distance(p1, p2) { /* ... */    } // 복사
    function radians(degrees) { /* ... */    } // 복사
}

// 4. 정적분석
```
▼
```javascript
function trackSummary(points) {
    const totalTime = calculateTime();
    const totalDistance = calculateDistance();
    const pace = totalTime / 60 / totalDistance;
    return {
        time: totalTime,
        distance: totalDistance,
        pace: pace
    };

    function calculateDistance() {
        return top_calculateDistance(points); // 소스 함수에서 타깃 함수 호출 위임
    }

    function calculateTime() { /* ... */    }
}

function top_calculateDistance(points) {
    let result = 0;
    for (let i = 0; i < points.length; i++) {
        result += distance(points[i - 1], points[i]);
    }
    return result;

    function distance(p1, p2) { /* ... */    }
    function radians(degrees) { /* ... */    }
}

// 7. 이 시점에서 반드시 모든 테스트를 수행하여 정상인지 확인할것
```
▼
```javascript
function trackSummary(points) {
    const totalTime = calculateTime();
    const totalDistance = top_calculateDistance(); // 8. 타깃 함수 직접 호출
    const pace = totalTime / 60 / totalDistance;
    return {
        time: totalTime,
        distance: totalDistance,
        pace: pace
    };

    // 8. 불필요 소스 함수 제거

    function calculateTime() { /* ... */
    }
}

function top_calculateDistance(points) {
    let result = 0;
    for (let i = 0; i < points.length; i++) {
        result += distance(points[i - 1], points[i]);
    }
    return result;

    function distance(p1, p2) { /* ... */    }
    function radians(degrees) { /* ... */    }
}
```
▼
```javascript
function trackSummary(points) {
    const totalTime = calculateTime();
    const pace = totalTime / 60 / totalDistance;
    return {
        time: totalTime,
        distance: totalDistance(points), // 변수 인라인하기(6.4)
        pace: pace
    };

    function calculateTime() { /* ... */
    }
}

function totalDistance(points) { // 함수 명 변경
    let result = 0;
    for (let i = 0; i < points.length; i++) {
        result += distance(points[i - 1], points[i]);
    }
    return result;

}
function distance(p1, p2) { /* ... */    }  // 의존성이 없는 함수이므로 최상위로 이동 고려
function radians(degrees) { /* ... */    }  // 의존성이 없는 함수이므로 최상위로 이동 고려
```
- 중첩 함수를 사용할 경우, 숨겨진 데이터끼리 상호작용하게 되기 쉬우니 중첩함수는 가능하면 피하기
##### 다른 클래스로 옮기기
```javascript
class Account {
    get bankCharge() { // 은행 이자 계산
        let result = 4.5;
        if (this._daysOverdrawn > 0) result += this.overdraftCharge;
        return result;
    }

    // 1. 메서드가 사용하는 기능 확인, 옮길 범위 확인
    get overdraftCharge() { // 초과 인출 이자 계산
        if (this.type.isPremium) {
            const baseCharge = 10;
            if (this.daysOverdrawn <= 7)
                 return baseCharge;
            else 
                return baseCharge + (this.daysOverdrawn - 7) * 0.85;
        } else 
            return this.daysOverdrawn * 1.75;
    }
}
```
▼
```javascript
class AccountType {
    overdraftCharge(daysOverdrawn) { // 3. 메서드 복사
        if (this.isPremium) { // 호출범위 조정
            const baseCharge = 10;
            if (daysOverdrawn <= 7)
                 return baseCharge;
            else 
                return baseCharge + (daysOverdrawn - 7) * 0.85;
        } else 
            return daysOverdrawn * 1.75;
    }
}
```
▼
```javascript
class Account {
    get bankCharge() {
        let result = 4.5;
        if (this._daysOverdrawn > 0) result += this.overdraftCharge;
        return result;
    }

    get overdraftCharge() {  // 6. 소스 메서드를 위임메서드로 만들기
        return this.type.overdraftCharge(this.daysOverdrawn);
    }
}
```
▼
```javascript
class Account {
    get bankCharge() {
        let result = 4.5;
        if (this._daysOverdrawn > 0)
            result += this.this.type.overdraftCharge(this.daysOverdrawn); // 8. 판단하여 인라인하기
        return result
    }
}
```

### 8.2 필드 옮기기 (Move Field)
```javascript
class Customer {
    get plan() { return this._plan; }
    get discountRate() { return this._discountRate; }
}
```
▼
```javascript
class Customer {
    get plan() { return this._plan; }
    get discountRate() { return this.plan.discountRate; }
}
```

> 프로그램의 진짜 힘은 데이터 구조에서 나온다.
- 필드 옮기기 릭팩터링은 더 큰 변경을 하기 위해 수행하기 좋음
    - ex) 필드 옮기기 → 호출 코드들도 옮기기

#### 절차
1. 소스 필드 캡슐화하기
2. 테스트
3. 타깃 객체에 필드 및 접근자 메서드 생성하기
4. 정적 검사 수행
5. 소스 객체에서 타깃 객체를 참조할 수 있는지 확인
6. 접근자들이 타깃 필드를 사용하도록 수정
    1. (여러 소스에서 타깃을 공유할 경우) 세터를 수정하여 타깃과 소스 필드 모두를 갱신하도록 보장
        - 예외를 찾기 위해 어서션 추가(10.6)
    2. 접근자들이 타깃 필드를 사용하도록 수정
7. 테스트
8. 소스필드 제거
9. 테스트

#### 예시
##### 단순한 예시
```javascript
class Customer {
    constructor(name, discountRate) {
        this._name = name;
        this._discountRate = discountRate; // 옮기고 싶은 필드
        this._contract = new CustomerContract(dateToday());
    }
    get discountRate() { return this._discountRate; }
    becomePreferred() {
        this._discountRate += 0.03;
    }
    applyDiscount(amount) {
        return amount.subtract(amount.multiply(this._discountRate));
    }
}

class CustomerContract {
    constructor(startDate) {
        this._startDate = startDate;
    }
}
```
▼
```javascript
class Customer {
    constructor(name, discountRate) {
        this._name = name;
        this._setDiscountRate(discountRate); 
        this._contract = new CustomerContract(dateToday());
    }
    get discountRate() { return this._discountRate; }
    _setDiscountRate(aNumber) { this._discountRate = aNumber; } // 1. 변수 캡슐화 (6.6)
    becomePreferred() { this._setDiscountRate(this.discountRate + 0.03); }
    applyDiscount(amount) {
        return amount.subtract(amount.multiply(this._discountRate));
    }
}
```
▼
```javascript
class Customer {
    constructor(name, discountRate) {
        this._name = name;
        this._contract = new CustomerContract(dateToday()); // 문장 슬라이드하기(8.6)
        this._setDiscountRate(discountRate);
    }
    get discountRate() { return this._contract._discountRate; } // 6. Customer 의 접근자들이 새로운 필드 사용하도록 수정
    _setDiscountRate(aNumber) { this._contract._discountRate = aNumber; }
    becomePreferred() { this._setDiscountRate(this.discountRate + 0.03); }
    applyDiscount(amount) {
        return amount.subtract(amount.multiply(this._discountRate));
    }
}

class CustomerContract {
    constructor(startDate, discountRate) { // 3. 타깃 클래스에 필드와 접근자 추가
        this._startDate = startDate;
        this._discountRate = discountRate;
    }
    
    get discountRate() { return this._discountRate; }
    set discountRate(arg) { this._discountRate = arg; }
}
```

##### 공유 객체로 이동하기
- 이자율을 계좌별로 설정하는 프로그램
```javascript
class Account {
    constructor(number, type, interestRate) {
        this._number = number;
        this._type = type;
        this._interestRate = interestRate; // 이자율이 계좌 종류에 따라 정해지도록 변경하고 싶음
    }

    get interestRate() { return this._interestRate; }
}

class AccountType {
    constructor(nameString) {
        this._name = nameString;
    }
}
```
▼
```javascript
class Account {
    constructor(number, type, interestRate) {
        this._number = number;
        this._type = type;
        this._interestRate = interestRate; // 이자율이 계좌 종류에 따라 정해지도록 변경하고 싶음
    }

    get interestRate() { return this._interestRate; } // 1. 이미 캡슐화되어 있음
}

class AccountType {
    constructor(nameString, interestRate) {
        this._name = nameString;
        this._interestRate = interestRate; // 3. 타깃 클래스에 필드와 접근자 메서드 생성
    }

    get interestRate() { return this._interestRate; }
}
```
▼
```javascript
class Account {
    constructor(number, type, interestRate) {
        this._number = number;
        this._type = type;
        assert(interestRate === this._type.interestRate); // 4. 어서션을 적용하여 예외 케이스 여부 확인 
        this._interestRate = interestRate;
    }

    get interestRate() { return this._interestRate; }
}

class AccountType {
    constructor(nameString, interestRate) {
        this._name = nameString;
        this._interestRate = interestRate;
    }

    get interestRate() { return this._interestRate; }
}
```
▼
```javascript
class Account {
    constructor(number, type, interestRate) {
        this._number = number;
        this._type = type;
         // 6. 시스템의 겉보기 동작이 달라지지 않는다는 확신이 섰을 경우 변경
    }

    get interestRate() { return this._type._interestRate; } // 8. 소스 클래스에서 이자율을 직접 수정하던 코드 제거
}

class AccountType {
    constructor(nameString, interestRate) {
        this._name = nameString;
        this._interestRate = interestRate;
    }

    get interestRate() { return this._interestRate; }
}
```

### 8.3 문장을 함수로 옮기기 (Move Statements into Function)
↔ 문장을 호출한 곳으로 옮기기(8.4)
```javascript
result.push(`<p>제목: ${person.photo.title}</p>`);
result.concat(photoData(person.photo));

function photoData(aPhoto) {
    return [
        `<p>위치: ${aPhoto.location}</p>`,
        `<p>날짜: ${aPhoto.date.toDateString()}</p>`
    ];
}
```
▼
```javascript
result.concat(photoData(person.photo));

function photoData(aPhoto) {
    return [
        `<p>제목: ${aPhoto.title}</p>`,
        `<p>위치: ${aPhoto.location}</p>`,
        `<p>날짜: ${aPhoto.date.toDateString()}</p>`
    ];
}
```

> 중복 제거는 코드를 건강하게 관리하는 가장 효과적인 방법
- 문장들을 함수로 옮기려면 해당 문장들이 함수의 일부라고 확신할 수 있어야 함
    - 함수와 한 몸은 아니지만 함께 호출되어야 할 경우 → 새 함수로 추출(6.1)

#### 절차
1. 문장 슬라이드하기(8.6) : 반복된 코드와 함수 호출 모으기
2. 타깃 함수를 호출하는 곳이 한 곳뿐일 경우 → 소스 위치에서 해당 코드를 잘라내어 복사하고 테스트 후 리팩터링 종료
3. 호출자가 둘 이상 → 호출자 중 하나에서 타깃 함수 호출 부분과 그 함수로 옮기려는 문장들을 함께 다른 함수로 추출(6.1)
    - 추출한 함수에 기억하기 쉬운 임시 이름 사용
4. 다른 호출자 모두가 추출한 함수를 사용하도록 수정 / 테스트
5. 원래 함수를 새로운 함수 안으로 인라인한(6.2) 후 원래 함수 제거
6. 함수 이름 바꾸기(6.5) : 새로운 함수의 이름을 적절히 변경

#### 예시
- 사진 관련 데이터를 HTML 로 내보내는 코드
```javascript
function renderPerson(outStream, person) {
    const result = [];
    result.push(`<p>${person.name}</p>`);
    result.push(renderPhoto(person.photo));
    result.push(`<p>제목: ${person.photo.title}</p>`); // 제목 출력
    result.push(emitPhotoData(person.photo));
    return result.join('\n');
}

function photoDiv(p) {
    return [
        '<div>',
        `<p>제목: ${p.title}</p>`, // 제목 출력
        emitPhotoData(p),
        '</div>'
    ].join('\n');
}

function emitPhotoData(aPhoto) {
    const result = [];
    result.push(`<p>위치: ${aPhoto.location}</p>`);
    result.push(`<p>날짜: ${aPhoto.date.toDateString()}</p>`);
    return result.join('\n');
}
```
▼
```javascript
function photoDiv(p) {
    return [
        '<div>', 
        zznew(p), 
        '</div>'
    ].join('\n');

    function zznew(p) { // 3. 호출자 중 하나에 함수 추출하기(6.1)
        return [
            `<p>제목: ${p.title}</p>`, 
            emitPhotoData(p)
        ].join('\n')
    }
}
```
▼
```javascript
function renderPerson(outStream, person) {
    const result = [];
    result.push(`<p>${person.name}</p>`);
    result.push(renderPhoto(person.photo));
    result.push(zznew(person.photo)); // 4. 하나씩 새로운 함수를 호출하도록 수정 
    return result.join('\n');
}

function zznew(p) {
    return [
        `<p>제목: ${p.title}</p>`,
        `<p>위치: ${aPhoto.location}</p>`, // 5. 함수 인라인하기(6.2)
        `<p>날짜: ${aPhoto.date.toDateString()}</p>`, // 5. 함수 인라인하기(6.2)
    ].join('\n');
}
```
▼
```javascript
function renderPerson(outStream, person) {
    const result = [];
    result.push(`<p>${person.name}</p>`);
    result.push(renderPhoto(person.photo));
    result.push(emitPhotoData(person.photo));
    return result.join('\n');
}

function photoDiv(p) {
    return [
        '<div>', 
        emitPhotoData(p), 
        '</div>'
    ].join('\n');
}

function emitPhotoData(p) { // 6. 함수 이름 바꾸기(6.5)
    return [
        `<p>제목: ${p.title}</p>`,
        `<p>위치: ${aPhoto.location}</p>`,
        `<p>날짜: ${aPhoto.date.toDateString()}</p>`,
    ].join('\n');
}
```

### 8.4 문장을 호출한 곳으로 옮기기 (Move Statements to Callers)
↔ 문장을 함수로 옮기기(8.3)
```javascript
emitPhotoData(outStream, person.photo);

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>`);
    outStream.write(`<p>위치: ${photo.location}</p>`);
}
```
▼
```javascript
emitPhotoData(outStream, person.photo);
outStream.write(`<p>위치: ${person.photo.location}</p>`);

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>`);
}
```
> 함수는 프로그래머가 쌓아 올리는 추상화의 기본 빌딩 블록이다.
- 코드베이스의 기능 범위가 달라짐에 따라 추상화의 경계는 계속 달라짐
    - 작은 변경 일 경우 → 문장을 호출한 곳으로 옮기기
    - 완전히 다시 경계를 그어야 할 경우 → 함수 인라인하기(6.2) 후 문장 슬라이드하기(8.6), 함수 추출하기(6.1)

#### 절차
1. 호출자가 한두 개뿐이고 피호출 함수도 간단한 단순한 상황 → 피호출 함수의 처음/마지막 줄들을 잘라내어 호출자들로 복사하고 수정하여 리팩터링 종료
2. 더 복잡한 경우 → 이동하지 않을 모든 문장을 함수로 추출(6.1) 후 검색하기 쉬운 임시 이름 붙이기
3. 원래 함수를 인라인
4. 함수 이름 바꾸기(6.5) : 함수의 이름을 적절히 변경

#### 예시
##### 호출자가 둘 뿐인 경우
```javascript
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>\n`);
    renderPhoto(outStream, person.photo);
    emitPhotoData(outStream, person.photo);
}

function listRecentPhotos(outStream, photos) {
    photos
        .filter(p => p.date > recentDateCutoff())
        .forEach(p => {
            outStream.write("<div>\n");
            emitPhotoData(outStream, p); // 여기에서 위치 정보를 다르게 렌더링해야 할 필요사항이 생겼을 경우
            outStream.write("</div>\n");
        });
}

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>title: ${photo.title}</p>\n`);
    outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
    outStream.write(`<p>location: ${photo.location}</p>\n`);
}
```
▼
```javascript
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>\n`);
    renderPhoto(outStream, person.photo);
    emitPhotoData(outStream, person.photo);
}

function listRecentPhotos(outStream, photos) {
    photos
        .filter(p => p.date > recentDateCutoff())
        .forEach(p => {
            outStream.write("<div>\n");
            emitPhotoData(outStream, p);
            outStream.write("</div>\n");
        });
}

function emitPhotoData(outStream, photo) {
    zztmp(outStream, photo);
    outStream.write(`<p>location: ${photo.location}</p>\n`);
}

function zztmp(outStream, photo) { // 2. 남길 코드를 함수로 추출(6.1)
    outStream.write(`<p>title: ${photo.title}</p>\n`);
    outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
}
```
▼
```javascript
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>\n`);
    renderPhoto(outStream, person.photo);
    zztmp(outStream, person.photo);
    outStream.write(`<p>location: ${person.photo.location}</p>\n`); // 3. 피호출 함수를 호출자들로 하나씩 인라인(6.2)
}

function listRecentPhotos(outStream, photos) {
    photos
        .filter(p => p.date > recentDateCutoff())
        .forEach(p => {
            zztmp(outStream, p);
            outStream.write(`<p>location: ${p.location}</p>\n`); // 3. 피호출 함수를 호출자들로 하나씩 인라인(6.2)
            outStream.write("</div>\n");
        });
}

// 원래 함수 지우기

function zztmp(outStream, photo) {
    outStream.write(`<p>title: ${photo.title}</p>\n`);
    outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
}
```
▼
```javascript
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>\n`);
    renderPhoto(outStream, person.photo);
    emitPhotoData(outStream, person.photo);
    outStream.write(`<p>location: ${person.photo.location}</p>\n`);
}

function listRecentPhotos(outStream, photos) {
    photos
        .filter(p => p.date > recentDateCutoff())
        .forEach(p => {
            outStream.write("<div>\n");
            emitPhotoData(outStream, p);
            outStream.write(`<p>location: ${p.location}</p>\n`);
            outStream.write("</div>\n");
        });
}

function emitPhotoData(outStream, photo) { // 4. 함수 이름 변경
    outStream.write(`<p>title: ${photo.title}</p>\n`);
    outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
}
```

### 8.5 인라인 코드를 함수 호출로 바꾸기 (Replace Inline Code with Function Call)
```javascript
let appliesToMass = false;
for (const s of states) {
    if (s === 'MA') appliesToMass = true;
}
```
▼
```javascript
appliesToMass = states.includes('MA');
```
- 함수로 여러 동작을 묶으면, 동작 방식보다는 목적을 말해주므로 코드를 이해하기가 쉬워짐
- 함수는 중복을 없애는 데도 효과적임
- 함수 추출하기(6.1) 와 동일함 

#### 절차
1. 인라인 코드를 함수 호출로 대체
2. 테스트

### 8.6 문장 슬라이드하기 (Slide Statements)
```javascript
const pricingPlan = retrievePricingPlan();
const order = retrieveOrder();
let charge;
const chargePerUnit = pricingPlan.unit;
```
▼
```javascript
const pricingPlan = retrievePricingPlan();
const chargePerUnit = pricingPlan.unit;
const order = retrieveOrder();
let charge;
```
- 관련된 코드들은 모여 있을 때 이해하기 더 쉬움
    - 명확히 구분되는 함수로 추출하는 게 그저 한 데로 모으는 것보다 나음
    - 그러나 코드가 모여 있지 않은 경우 애초에 함수 추출 불가 (함수 추출하기(6.1)의 준비 단계)

#### 절차
1. 문장을 이동할 목표 위치 찾기. 변경 시 문제가 있다면 리팩터링 포기
    - 문장에서 참조하는 요소를 선언하는 문장 앞으로는 이동할 수 없음
    - 문장을 참조하는 요소의 뒤로는 이동할 수 없음
    - 문장에서 참조하는 요소를 수정하는 문장을 건너뛰어 이동할 수 없음
    - 문장이 수정하는 요소를 참조하는 요소를 건너뛰어 이동할 수 없음 
2. 문장 위치 이동 : 원래 위치 → 목표 위치
3. 테스트

#### 예시
- 슬라이드 할 때 체크 할 것
    - 무엇을 슬라이드 할지
    - 슬라이드 할 수 있는지

```javascript
/*1 */ const pricingPlan = retrievePricingPlan();
/*2 */ const order = retreiveOrder(); // 부수 효과가 없다면 6번 줄 위로 옮겨도 됨
/*3 */ const baseCharge = pricingPlan.base;
/*4 */ let charge;
/*5 */ const chargePerUnit = pricingPlan.unit;
/*6 */ const units = order.units;
/*7 */ let discount; // 여기까지는 선언이므로 이동하기 쉬움
/*8 */ charge = baseCharge + units * chargePerUnit; // 11번 줄 위치까지 이동 가능
/*9 */ let discountableUnits = Math.max(units - pricingPlan.discountThreshold, 0);
/*10*/ discount = discountableUnits * pricingPlan.discountFactor;
/*11*/ if (order.isRepeat) discount += 20; // 12번 줄 아래로 갈 수 없음
/*12*/ charge = charge - discount;
/*13*/ chargeOrder(charge); // 12번 줄 위로 알수 없음
```
- 함수의 내부에서 부수효과 없음을 잘 확인해야 함
    - [명령-질의 분리 원칙(Command-Query Separation)](https://martinfowler.com/bliki/CommandQuerySeparation.html) 적용
- 슬라이드가 안전한지 판단하기 위해 관련된 연산과 구성을 완벽히 이해해야 함
- 상태 갱신이 특히 중요
    - 상태를 갱신하는 코드 자체를 최대한 제거 : 변수 쪼개기(9.1)
- 슬라이드 후 테스트가 실패했을 경우 → 더 작게 슬라이드하기
    - 해당 슬라이드를 수행할 가치가 없거나, 다른 것을 먼저 해야할 수도 있음

##### 조건문이 있을 때의 슬라이드
```javascript
let result;
if (availableResources.length === 0) {
    result = createResource();
    allocatedResources.push(result); // 중복된 문장
} else {
    result = availableResources.pop();
    allocatedResources.push(result); // 중복된 문장
}
return result;
```
▼
```javascript
let result;
if (availableResources.length === 0) {
    result = createResource();
} else {
    result = availableResources.pop();
}
allocatedResources.push(result); // 2. 위치 이동
return result;
```
### 8.7 반복문 쪼개기 (Split Loop)
```javascript
let averageAge = 0;
let totalSalary = 0;
for (const p of people) {
    averageAge += p.age;
    totalSalary += p.salary;
}
averageAge = averageAge / people.length;
```
▼
```javascript
let totalSalary = 0;
for (const p of people) {
    totalSalary += p.salary;
}

let averageAge = 0;
for (const p of people) {
    averageAge += p.age;
}
averageAge = averageAge / people.length;
```
- 반복문 하나에서 두가지 일을 수행할 경우, 수정 시 마다 두가지 일 모두를 잘 이해하고 진행해야만 함
    - 서로 다른 일들이 한 함수에서 이뤄지고 있다는 신호일 수도 있음
        - 반복문 쪼개기 → 함수 추출하기(6.1)
- 반복문 분리 시에는 구조체 등을 사용하지 않고도 값을 반환하기 쉬움
- 리팩터링과 최적화를 구분하자

#### 절차
1. 반복문을 복제
2. 반복문이 중복되어 생기는 부수효과를 파악, 제거 
3. 테스트
4. 각 반복문을 함수로 추출(6.1)할지 판단

#### 예시
- 전체 급여와 가장 어린 나이를 계산하는 프로그램
```javascript
let youngest = people[0] ? people[0].age : Infinity;
let totalSalary = 0;
for (const p of people) {
    if (p.age < youngest) youngest = p.age;
    totalSalary += p.salary;
}

return `youngestAge: ${youngest}, totalSalary: ${totalSalary}`;
```
▼
```javascript
let youngest = people[0] ? people[0].age : Infinity;
let totalSalary = 0;
for (const p of people) {
    if (p.age < youngest) youngest = p.age;
    totalSalary += p.salary;
}

for (const p of people) { // 1. 반복문 복제
    if (p.age < youngest) youngest = p.age;
    totalSalary += p.salary;
}

return `youngestAge: ${youngest}, totalSalary: ${totalSalary}`;
```
▼
```javascript
let youngest = people[0] ? people[0].age : Infinity;
let totalSalary = 0;
for (const p of people) {
    totalSalary += p.salary; // 2. 중복에 따른 부수효과 제거
}

for (const p of people) { 
    if (p.age < youngest) youngest = p.age; // 2. 중복에 따른 부수효과 제거
}

return `youngestAge: ${youngest}, totalSalary: ${totalSalary}`;
```

### 8.8 반복문을 파이프라인으로 바꾸기 (Replace Loop with Pipeline)
```javascript
const name = [];
for (const i of input) {
    if (i.job === 'programmer') name.push(i.name);
}
```
▼
```javascript
const names = input
    .filter((i) => i.job === 'programmer')
    .map((i) => i.map);
```
- 논리를 파이프라인으로 표현할 경우, 객체가 파이프라인을 따라 흐르며 어떻게 처리되는지 읽기 쉬워짐

#### 절차
1. 반복문에서 사용하는 컬렉션을 가리키는 변수 생성
    - 기존 변수를 단순히 복사해도 됨
2. 반복문의 첫 줄부터, 각각의 단위 행위를 적절한 컬렉션 파이프라인 연산으로 대체
    - 1에서 만든 컬렉션 변수에서 시작하여, 이전 연산을 기초로 연쇄적으로 수행. 하나를 대체할 때마다 테스트
3. 반복문 자체를 삭제

#### 예시
- 데이터 (회사의 지점 사무실 정보)
```text
office, country, telephone
Chicago, USA, +1 312 373 1000
Beijing, China, +86 4008 900 505
Bangalore, India, +91 80 4064 9570
Porto Alegre, Brazil, +55 51 3079 3550
Chennai, India, +91 44 660 44766

... (more data follows)
```

- 인도 사무실을 찾아 도시명과 전화번호를 반환하는 프로그램
```javascript
function acquireData(input) {
    const lines = input.split("\n"); // 컬렉션
    let firstLine = true;
    const result = [];
    for (const line of lines) { // 반복문
        if (firstLine) {
            firstLine = false;
            continue;
        }
        if (line.trim() === "") continue;
        const record = line.split(",");
        if (record[1].trim() === "India") {
            result.push({city: record[0].trim(), phone: record[2].trim()});
        }
    }
    return result;
}
```
▼
```javascript
function acquireData(input) {
    const lines = input.split("\n");
    let firstLine = true;
    const result = [];
    const loopItems = lines // 1. 별도 변수 생성
    for (const line of loopItems) {
        if (firstLine) {
            firstLine = false;
            continue;
        }
        if (line.trim() === "") continue;
        const record = line.split(",");
        if (record[1].trim() === "India") {
            result.push({city: record[0].trim(), phone: record[2].trim()});
        }
    }
    return result;
}
```
▼
```javascript
function acquireData(input) {
    const lines = input.split("\n");
    let firstLine = true;
    const result = [];
    const loopItems = lines
        .slice(1); // 2. 파이프 라인 연산으로 하나씩 대체
    for (const line of loopItems) {
        // 2. 파이프 라인 연산으로 하나씩 대체
        if (line.trim() === "") continue;
        const record = line.split(",");
        if (record[1].trim() === "India") {
            result.push({city: record[0].trim(), phone: record[2].trim()});
        }
    }
    return result;
}
```
▼
```javascript
function acquireData(input) {
    const lines = input.split("\n");
    const result = lines
        .slice(1)
        .filter(line => line.trim() !== "")
        .map(line => line.split(","))
        .filter(record => record[1].trim() === "India")
        .map(record => ({city: record[0].trim(), phone: record[2].trim()}))
    ;
    // 3. 기존 반복문 제거
    return result;
}
```

### 8.9 죽은 코드 제거하기 (Remove Dead Code)
```javascript
if(false) {
    doSomethingThatUsedToMatter();
}
```
▼
```javascript

```
- 버전 관리 시스템이 있으므로 코드가 더 이상 사용되지 않을 경우 삭제
    - 어느 리비전에서 삭제했는지 커밋 메시지로 남겨도 됨

#### 절차
1. 죽은 코드를 외부에서 참조할 수 있는 경우 → 혹시라도 호출하는 곳이 있는지 확인
2. 없다면 죽은 코드를 제거
3. 테스트