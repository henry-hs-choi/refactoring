class Order {
    constructor(data) {
        this.priority = data.priority;
    }
}

// client
highPriorityCount = orders.filter(o => "high" === o.priority || "rush" === o.priority)
                           .length;
)