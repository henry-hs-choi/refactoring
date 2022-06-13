function score(candidate, medicalExam, scoringGuide) {
    return new Scorer(candidate, medicalExam, scoringGuide).execute();
}

class Scorer {
    constructor(candidate) {
        this._candidate = candidate;
        this._medicalExam = medicalExam;
        this._scoringGuide = scoringGuide;
    }

    execute() {
        this._result = 0;
        this._healthLevel = 0;
        this._highMedicalRiskFlag = false;

        this.scoreSmoking();
        this._certificationGrade = "regular";
        if (scoringGuide.stateWithLowCertification(candidate.originState)) {
            this._certificationGrade = "low";
            result -= 5;
        }

        // 비슷한 코드가 한참 이어짐
        result -= Math.max(this._healthLevel - 5, 0);
        return result;
    }

    scoreSmoking() {
        if (medicalExam.isSmoker) {
                this._healthLevel += 10;
                this._highMedicalRiskFlag = true;
        }
    }
}