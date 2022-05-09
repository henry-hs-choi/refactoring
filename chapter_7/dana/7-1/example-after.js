// 요렇게 읽고
result += `<h1>${getOrganization().name}</h1>`;
// 이렇게 씀
getOrganization().name = newName;

class Organization {
    constructor(data) {
        this._name = data.name;
        this._country = data.country;
    }

    set name(aString) {this._name = aString;}
    get name(aString) {return this._name;}
    set country(aString) {this._country = aCountryCode;}
    get name(aString) {return this._country}
}

const organization = new Organization({name: "다나닷", country: "ROK"});
//function getRawDataOfOrganization() {return organization._data;} 제거
function getOrganization() {return organization;}


