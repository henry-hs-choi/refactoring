class ProductionPlan {
    get production() {
        return this._adjustments
            .reduce((sum, a) => sum + a.amount, 0)
    }

    applyAdjustment(anAdjustment) {
        this._adjustments.push(anAdjustment);
    }
}