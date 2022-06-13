class HeatingPlan {
    get targetTemperature() {
        return this.targetTemperature(thermostat.selectedTemperature); // 단순 호출만 남게된다.
    }

    targetTemperature(selectedTemperature) {
        // thermostat은 전역객체
        if (selectedTemperature > this._max) return this._max;
        else if (selectedTemperature < this._min) return this._min;
        else return selectedTemperature;
    }

}

// 호출자
if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
else setOff();

