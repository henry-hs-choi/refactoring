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
    get isAdvanced() {return this.isAdvanced;}
}

// Client
numAdvancedCourses = aPerson.courses
    .filter(c => c.isAdvanced)
    .length
;

// 악덕 클라이언트
//const basicCourseNames = readBasicCourseNames(fileName);
//aPerson.courses = basicCourseNames.map(name => new Course(name, false));

for(const name of readBasicCourseNames(fileName)) {
    aPerson.cources.push(new Course(name, false));
}