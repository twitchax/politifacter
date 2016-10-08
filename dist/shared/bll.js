"use strict";
const _ = require('lodash');
const fast_stats_1 = require('fast-stats');
const helpers = require('./helpers');
class Statistics {
    constructor(name, selectors) {
        this.people = [];
        this.pantsOnFireArray = [];
        this.falseArray = [];
        this.mostlyFalseArray = [];
        this.halfTrueArray = [];
        this.mostlyTrueArray = [];
        this.trueArray = [];
        this.totalArray = [];
        this.name = name;
        this.selectors = selectors;
    }
    // Entry accessors.
    get numPeople() {
        return this.people.length;
    }
    // Count accessors.
    getNum(array) {
        return _(array).sum();
    }
    get numPantsOnFire() { return this.getNum(this.pantsOnFireArray); }
    get numFalse() { return this.getNum(this.falseArray); }
    get numMostlyFalse() { return this.getNum(this.mostlyFalseArray); }
    get numHalfTrue() { return this.getNum(this.halfTrueArray); }
    get numMostlyTrue() { return this.getNum(this.mostlyTrueArray); }
    get numTrue() { return this.getNum(this.trueArray); }
    get numTotal() { return this.getNum(this.totalArray); }
    // Percent accessors.
    getPercent(numerator) {
        return helpers.round(100 * numerator / this.numTotal, 2);
    }
    get percentPantsOnFire() { return this.getPercent(this.numPantsOnFire); }
    get percentFalse() { return this.getPercent(this.numFalse); }
    get percentMostlyFalse() { return this.getPercent(this.numMostlyFalse); }
    get percentHalfTrue() { return this.getPercent(this.numHalfTrue); }
    get percentMostlyTrue() { return this.getPercent(this.numMostlyTrue); }
    get percentTrue() { return this.getPercent(this.numTrue); }
    // Standard deviation accessors.
    getMoePercent(array) {
        var zipped = _.zip(array, this.totalArray);
        var percentages = _(zipped).map(z => z[0] / z[1]).value();
        if (_(percentages).filter(p => isNaN(p)).value().length > 0)
            console.log('wtf');
        var s = new fast_stats_1.Stats();
        s.push(percentages);
        return helpers.round(100 * s.moe(), 2);
    }
    get moePercentPantsOnFire() { return this.getMoePercent(this.pantsOnFireArray); }
    get moePercentFalse() { return this.getMoePercent(this.falseArray); }
    get moePercentMostlyFalse() { return this.getMoePercent(this.mostlyFalseArray); }
    get moePercentHalfTrue() { return this.getMoePercent(this.halfTrueArray); }
    get moePercentMostlyTrue() { return this.getMoePercent(this.mostlyTrueArray); }
    get moePercentTrue() { return this.getMoePercent(this.trueArray); }
}
exports.Statistics = Statistics;
//# sourceMappingURL=bll.js.map