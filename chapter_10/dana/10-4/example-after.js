function plumages(birds) {
    return new Map(birds
                    .map(b => createBird(b)
                    .map(bird -> [bird.name, bird.plumage]));
}

function speeds(birds) {
    return new Map(birds
                    .map(b => createBird(b)
                    .map(bird -> [bird.name, bird.airSpeedVelocity]));
}

class Bird {
    constructor(birdObject) {
        Object.assign(this, birdObject);
    }

    get plumage() {
        return "알 수 없다.";
    }

    get airSpeedVelocity() {
        return null;
    }
}

class EuropeanSwallow extends Bird {
    get plumage() { // 오버라이드
        return "보통이다";
    }

    get airSpeedVelocity() {
        return 35;
    }
}

function createBird(bird) {
        switch (bird.type) {
        case '유럽 제비':
            return new EuropeanSwallow(bird);
        case '아프리카 제비':
            return new AfricanSwallow(bird);
        case '노르웨이 파랑 앵무':
            return new NorwegianBlueParrot(bird);
        default:
            return new Bird(bird);
        }
}

