class Points {
    constructor() {
        this.points = 0;
        this.cumulativePoints = parseInt(localStorage.getItem("cumulativePoints")) || 0;
    }

    addPoints(value) {
        if (value < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        this.points += value;
        this.cumulativePoints += value;
        localStorage.setItem("cumulativePoints", this.cumulativePoints);
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

    getCumulativePoints() {
        return this.cumulativePoints;
    }
}
