let found = false;
for (const p of people) {
    if (!found) {
        if ( p === "조커") {
            setAlert();
            found = true;
        }

        if ( p === "사루만") {
            setAlert();
            found = true;
        }
    }
}

