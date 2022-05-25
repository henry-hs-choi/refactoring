function renderPerson(outStream, person) {
    const result = [];
    result.push('<p>${person.name}');
    result.push(renderPhoto(person.photo));
    result.push('<p>제목: ${person.photo.title}</p>'); // 제목 출력
    result.push(emitPhotoData(person.pthoto));
    return result.join("\n");
}

function photoDiv(p) {
    return [
        "<div>",
        emitPhotoData(p),
        "</div>"
    ].join("\n");
}

function emitPhotoData(p) {
    return[
        '<p>제목: ${p.title}</p>',
        '<p>위치: ${p.location}</p>',
        '<p>날짜: ${p.date.toDateString()}</p>',
        emitPhotoData(p),
    ].join("\n");
}