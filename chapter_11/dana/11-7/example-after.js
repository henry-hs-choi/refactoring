class Person {
    get name() {return this_.name;}
    set name(arg) {this._name = arg;}
    get id() {return this._id;}

    constructor(id) {
        this._id = id;
    }
}

const martin = new Person("1234");
martin.name = "마틴";

// 여기서 id는 변경되면 안되는 필드이다.
