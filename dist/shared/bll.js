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
        // Distribution accessors.
        this._distribution = undefined;
        this.name = name;
        this.selectors = selectors;
    }
    // Entry accessors.
    get numPeople() {
        return this.people.length;
    }
    // Count accessors.
    _getNum(array) {
        return _(array).sum();
    }
    get numPantsOnFire() { return this._getNum(this.pantsOnFireArray); }
    get numFalse() { return this._getNum(this.falseArray); }
    get numMostlyFalse() { return this._getNum(this.mostlyFalseArray); }
    get numHalfTrue() { return this._getNum(this.halfTrueArray); }
    get numMostlyTrue() { return this._getNum(this.mostlyTrueArray); }
    get numTrue() { return this._getNum(this.trueArray); }
    get numTotal() { return this._getNum(this.totalArray); }
    // Percent accessors.
    _getPercent(numerator) {
        return helpers.round(100 * numerator / this.numTotal, 2);
    }
    get percentPantsOnFire() { return this._getPercent(this.numPantsOnFire); }
    get percentFalse() { return this._getPercent(this.numFalse); }
    get percentMostlyFalse() { return this._getPercent(this.numMostlyFalse); }
    get percentHalfTrue() { return this._getPercent(this.numHalfTrue); }
    get percentMostlyTrue() { return this._getPercent(this.numMostlyTrue); }
    get percentTrue() { return this._getPercent(this.numTrue); }
    _getDistribution(accessor) {
        if (!this._distribution) {
            var total = 100;
            var distributionPantsOnFire = Math.floor(this.percentPantsOnFire);
            var distributionFalse = Math.floor(this.percentFalse);
            var distributionMostlyFalse = Math.floor(this.percentMostlyFalse);
            var distributionHalfTrue = Math.floor(this.percentHalfTrue);
            var distributionMostlyTrue = Math.floor(this.percentMostlyTrue);
            var distributionTrue = Math.floor(this.percentTrue);
            total -= distributionPantsOnFire + distributionFalse + distributionMostlyFalse + distributionHalfTrue + distributionMostlyTrue + distributionTrue;
            var distribution = {
                distributionPantsOnFire,
                distributionFalse,
                distributionMostlyFalse,
                distributionHalfTrue,
                distributionMostlyTrue,
                distributionTrue
            };
            var deltas = {
                distributionPantsOnFire: this.percentPantsOnFire - distributionPantsOnFire,
                distributionFalse: this.percentFalse - distributionFalse,
                distributionMostlyFalse: this.percentMostlyFalse - distributionMostlyFalse,
                distributionHalfTrue: this.percentHalfTrue - distributionHalfTrue,
                distributionMostlyTrue: this.percentMostlyTrue - distributionMostlyTrue,
                distributionTrue: this.percentTrue - distributionTrue
            };
            while (total > 0) {
                var max = 0;
                var maxK = '';
                for (var k in deltas) {
                    if (deltas[k] > max) {
                        max = deltas[k];
                        maxK = k;
                    }
                }
                deltas[maxK] = 0;
                distribution[maxK]++;
                total--;
            }
            this._distribution = distribution;
        }
        return this._distribution[accessor];
    }
    get distributionPantsOnFire() { return this._getDistribution('distributionPantsOnFire'); }
    get distributionFalse() { return this._getDistribution('distributionFalse'); }
    get distributionMostlyFalse() { return this._getDistribution('distributionMostlyFalse'); }
    get distributionHalfTrue() { return this._getDistribution('distributionHalfTrue'); }
    get distributionMostlyTrue() { return this._getDistribution('distributionMostlyTrue'); }
    get distributionTrue() { return this._getDistribution('distributionTrue'); }
    // Standard deviation accessors.
    _getMoePercent(array) {
        var zipped = _.zip(array, this.totalArray);
        var percentages = _(zipped).map(z => z[0] / z[1]).value();
        var s = new fast_stats_1.Stats();
        s.push(percentages);
        return helpers.round(100 * s.moe(), 2);
    }
    get moePercentPantsOnFire() { return this._getMoePercent(this.pantsOnFireArray); }
    get moePercentFalse() { return this._getMoePercent(this.falseArray); }
    get moePercentMostlyFalse() { return this._getMoePercent(this.mostlyFalseArray); }
    get moePercentHalfTrue() { return this._getMoePercent(this.halfTrueArray); }
    get moePercentMostlyTrue() { return this._getMoePercent(this.mostlyTrueArray); }
    get moePercentTrue() { return this._getMoePercent(this.trueArray); }
    // String helpers.
    toPrettyString() {
        var percentString;
        var output = [];
        output.push('\n');
        output.push(`Selectors: [ ${this.selectors.join(', ')} ]\n`.bold.underline.bgBlue.green);
        output.push('\n');
        output.push(`Number of people in selection: ${this.numPeople} ${this.numPeople < 20 ? ('[ ' + _(this.people).map(p => p.name_slug).value().join(', ') + ' ]').yellow : ''}\n`);
        output.push(`Number of statements in selection: ${this.numTotal}\n`);
        output.push(`Honesty score: ${(this.percentTrue + this.percentMostlyTrue).toFixed(2).toString().green}%\n`);
        output.push(`Lying score: ${(this.percentPantsOnFire + this.percentFalse + this.percentMostlyFalse).toFixed(2).toString().red}%\n`);
        output.push('\n');
        output.push(`${helpers.tab}         True : [${helpers.percentBar(this.distributionTrue).green}] ${this.percentTrue} ± ${this.moePercentTrue}% (${this.numTrue})\n`);
        output.push(`${helpers.tab}  Mostly True : [${helpers.percentBar(this.distributionMostlyTrue).blue}] ${this.percentMostlyTrue} ± ${this.moePercentMostlyTrue}% (${this.numMostlyTrue})\n`);
        output.push(`${helpers.tab}    Half True : [${helpers.percentBar(this.distributionHalfTrue).grey}] ${this.percentHalfTrue} ± ${this.moePercentHalfTrue}% (${this.numHalfTrue})\n`);
        output.push(`${helpers.tab} Mostly False : [${helpers.percentBar(this.distributionMostlyFalse).yellow}] ${this.percentMostlyFalse} ± ${this.moePercentMostlyFalse}% (${this.numMostlyFalse})\n`);
        output.push(`${helpers.tab}        False : [${helpers.percentBar(this.distributionFalse).magenta}] ${this.percentFalse} ± ${this.moePercentFalse}% (${this.numFalse})\n`);
        output.push(`${helpers.tab}Pants On Fire : [${helpers.percentBar(this.distributionPantsOnFire).red}] ${this.percentPantsOnFire} ± ${this.moePercentPantsOnFire}% (${this.numPantsOnFire})\n`);
        output.push('\n');
        output.push('Distribution:\n\n');
        output.push(`${helpers.tab}${this.toCompareString()}`);
        output.push('\n');
        return output.join('');
    }
    toPlainString() {
        return colors.strip(this.toPrettyString());
    }
    toCompareString() {
        var output = [];
        output.push(`[${helpers.percentBar(this.distributionTrue, '<').green}${helpers.percentBar(this.distributionMostlyTrue, '-').blue}${helpers.percentBar(this.distributionHalfTrue, '=').grey}${helpers.percentBar(this.distributionMostlyFalse, '~').yellow}${helpers.percentBar(this.distributionFalse, '-').magenta}${helpers.percentBar(this.distributionPantsOnFire, '>').red}]`);
        return output.join('');
    }
    toPlainCompareString() {
        return colors.strip(this.toCompareString());
    }
}
exports.Statistics = Statistics;
String.prototype.replaceAll = function (o, n) {
    return this.split(o).join(n);
};
class Selection {
    constructor() {
        this.global = [], this.groups = [];
    }
}
exports.Selection = Selection;
;
class Selector {
    constructor(property, operator, value) {
        this.property = property;
        this.operator = operator;
        this.value = value;
    }
    toString() {
        return `${this.property} ${helpers.operatorToString(this.operator)} ${this.value}`;
    }
}
exports.Selector = Selector;
(function (Operator) {
    Operator[Operator["GreaterEqual"] = 0] = "GreaterEqual";
    Operator[Operator["LessEqual"] = 1] = "LessEqual";
    Operator[Operator["NotEqual"] = 2] = "NotEqual";
    Operator[Operator["Greater"] = 3] = "Greater";
    Operator[Operator["Less"] = 4] = "Less";
    Operator[Operator["Equal"] = 5] = "Equal";
})(exports.Operator || (exports.Operator = {}));
var Operator = exports.Operator;
//# sourceMappingURL=bll.js.map