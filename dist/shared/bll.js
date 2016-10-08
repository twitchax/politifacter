"use strict";
const _ = require('lodash');
const colors = require('colors');
colors /* peg this for compile */;
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
    // String helpers.
    toPrettyString(newLine) {
        var percentString = '=';
        if (!newLine)
            newLine = '\n';
        var output = [];
        output.push(newLine);
        output.push(`Selectors: [ ${this.selectors.join(', ')} ]${newLine}`.bold.underline.bgBlue.green);
        output.push(newLine);
        output.push(`Number of people in selection: ${this.numPeople} ${this.numPeople < 20 ? ('[ ' + _(this.people).map(p => p.name_slug).value().join(', ') + ' ]').yellow : ''}${newLine}`);
        output.push(`Number of statements in selection: ${this.numTotal}${newLine}`);
        output.push(`Honesty score: ${(this.percentTrue + this.percentMostlyTrue).toFixed(2).toString().green}%${newLine}`);
        output.push(`Lying score: ${(this.percentPantsOnFire + this.percentFalse + this.percentMostlyFalse).toFixed(2).toString().red}%${newLine}`);
        output.push(newLine);
        output.push(`            True : [${_.repeat(percentString, this.percentTrue).green}] ${this.percentTrue} ± ${this.moePercentTrue}% (${this.numTrue})${newLine}`);
        output.push(`     Mostly True : [${_.repeat(percentString, this.percentMostlyTrue).blue}] ${this.percentMostlyTrue} ± ${this.moePercentMostlyTrue}% (${this.numMostlyTrue})${newLine}`);
        output.push(`       Half True : [${_.repeat(percentString, this.percentHalfTrue).grey}] ${this.percentHalfTrue} ± ${this.moePercentHalfTrue}% (${this.numHalfTrue})${newLine}`);
        output.push(`    Mostly False : [${_.repeat(percentString, this.percentMostlyFalse).yellow}] ${this.percentMostlyFalse} ± ${this.moePercentMostlyFalse}% (${this.numMostlyFalse})${newLine}`);
        output.push(`           False : [${_.repeat(percentString, this.percentFalse).magenta}] ${this.percentFalse} ± ${this.moePercentFalse}% (${this.numFalse})${newLine}`);
        output.push(`   Pants On Fire : [${_.repeat(percentString, this.percentPantsOnFire).red}] ${this.percentPantsOnFire} ± ${this.moePercentPantsOnFire}% (${this.numPantsOnFire})${newLine}`);
        output.push(newLine);
        return output.join('');
    }
    toString(newLine) {
        return colors.strip(this.toPrettyString(newLine));
    }
}
exports.Statistics = Statistics;
//# sourceMappingURL=bll.js.map