class Account() {
    get bankCharge() { // 은행 이자 계산
        let result = 4.5;
        if (this._daysOverdrawn > 0) result += this.overdraftCharge;
        return result;
    }

    get overdraftCharge() { // 초과 인출 이자 계산
        return this.type.overdraftCharge(this.daysOverdrawn);
    }
}

class AccountType() {
    overdraftCharge(daysOverdrwan) { // 초과 인출 이자 계산
        if (this.isPremium) {
            const baseCharge = 10;
            if (daysOverdrawn <= 7)
                return baseCharge;
            else
                return baseCharge + (dayOverdrawn - 7) * 0.85;
        }
        else
            return daysOverdrawn * 1.75;
    }
}