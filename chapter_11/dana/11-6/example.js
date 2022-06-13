class HeatingPlan {
    get targetTemperature() {
        // thermostat은 전역객체
        if (thermostat.selectedTemperature > this._max) return this._max;
        else if (thermostat.selectedTemperature < this._min) return this._min;
        else return thermostat.selectedTemperature;
    }
}

// 호출자
if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
else setOff();


