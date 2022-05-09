class Order {
    constructor(data) {
        this.priority = data.priority;
    }

    get priorityString() {return this._priority.toString();}
    set priority {this._priority = new Priority(aString);}
}

class Priority {
    constructor(value) {
        this.value = value;
    }

    toString() {return this._value;} // 속성이 아닌 문자열로 표현한 값을 요청
}

// client
highPriorityCount = orders.filter(o => "high" === o.priorityString || "rush" === o.priorityString)
                           .length;
)                                  