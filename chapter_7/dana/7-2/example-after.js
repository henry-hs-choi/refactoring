class Person {
    constructor(name) {
        this._name = name;
        this._courses = [];
    }

    get name() {return this._name;}
    get courses() {return this._courses.slice();}

    addCourse(aCourse) {
        this._cousrse.push(aCourse);
    }

    removeCourse(aCourse, fnIfAbsent = () => {throw new RangeError();}) {
        const index = this._courses.indexOf(aCourse);
        if (index === -1) fnIfAbsent();
        else this._courses.splice(index, 1);
    }
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

for(const name of readBasicCourseNames(fileName)) {
    aPerson.addCourse(new Course(name, false));
}