class Points {
    constructor() {
        this.cumulativePoints = parseInt(localStorage.getItem("cumulativePoints")) || 0;
    }

    getCumulativePoints() {
        return this.cumulativePoints;
    }

    addPoints(points) {
        if (points < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        this.cumulativePoints += points;
        localStorage.setItem("cumulativePoints", this.cumulativePoints);
    }
}
