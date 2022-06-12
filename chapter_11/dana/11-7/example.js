class Person {
    get name() {return this_.name;}
    set name(arg) {this._name = arg;}
    get id() {return this._id;}
    set id(arg) {this._id = arg;}
}

const martin = new Person();
martin.name = "마틴";
martin.id = "1234";

// 여기서 id는 변경되면 안되는 필드이다.
