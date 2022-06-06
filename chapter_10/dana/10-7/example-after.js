checkForMiscreants(people);


function checkForMiscreants(people) {
    for (const p of people) {
        if (p === "조커") {
            setAlert();
            return;
        }

        if (p === "사루만") {
            setAlert();
            return;
        }
    }
}

// 더 나은 코드

function checkForMiscreants(people) {
    if (people.some(p => ["조커", "사루만"].includes(p))) sendAlert();
}