function acquireDate(input) {
    const lines = input.split("\n"); // 컬렉션
    return lines
        .slice(1)
        .filter (line => line.trim() !== "")
        .map    (line => line.split(","))
        .filter (fields => record[1].trim() === "India")
        .map    (fields => ({city: fields[0].trim(), phone: fields[2].trim()}));
}