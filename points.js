class Points {
    constructor() {
        this.points = 0;
    }

    addPoints(value) {
        if (value < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        this.points += value;
    }

    removePoints(value) {
        if (value < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        this.points = Math.max(0, this.points - value); // Ensure points do not go below zero
    }

    getPoints() {
        return this.points;
    }

    setPoints(value) {
        if (value < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        this.points = value;
    }
}
