function alertForMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            setOffAlarms();
            return;
        }
        if (p === "사루만") {
            setOffAlarms();
            return;
        }
    }
    return;
}

// 함수 복제, 질의 목적에 맞는 이름 짓기
function findMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            return "조커";
        }
        if (p === "사루만") {
            return "사루만";
        }
    }
    return "";
}

// 더 가다듬기
function alertForMiscreant(people) {
    if (findMiscreant(people) !== "") setOffAlarms();
}