"use strict";
const _ = require('lodash');
const colors = require('colors');
function aggregateStatsForPeople(agg, person) {
    var total = person.pants_count + person.false_count + person.barely_true_count + person.half_true_count + person.mostly_true_count + person.true_count;
    if (total === 0)
        return agg;
    agg.people.push(person);
    agg.pantsOnFireArray.push(person.pants_count);
    agg.falseArray.push(person.false_count);
    agg.mostlyFalseArray.push(person.barely_true_count);
    agg.halfTrueArray.push(person.half_true_count);
    agg.mostlyTrueArray.push(person.mostly_true_count);
    agg.trueArray.push(person.true_count);
    agg.totalArray.push(total);
    return agg;
}
exports.aggregateStatsForPeople = aggregateStatsForPeople;
function round(num, decimalPlaces) {
    var factor = Math.pow(10, decimalPlaces);
    return Math.round(factor * num) / factor;
}
exports.round = round;
var percentString = '=';
function printStatistics(stats) {
    console.log();
    console.log(`Selectors: [${stats.selectors}]`.bold.underline.bgBlue.green);
    console.log();
    console.log(`Number of people in selection: ${stats.numPeople} ${stats.numPeople < 20 ? ('[' + _(stats.people).map(p => p.name_slug).value() + ']').yellow : ''}`);
    console.log(`Number of statements in selection: ${stats.numTotal}`);
    console.log(`Honesty score: ${colors.green(round(stats.percentTrue + stats.percentMostlyTrue, 2).toString())}%`);
    console.log(`Lying score: ${colors.red(round(stats.percentPantsOnFire + stats.percentFalse + stats.percentMostlyFalse, 2).toString())}%`);
    console.log();
    console.log(`            True : [${colors.green(_.repeat(percentString, stats.percentTrue))}] ${stats.percentTrue} ± ${stats.moePercentTrue}% (${stats.numTrue})`);
    console.log(`     Mostly True : [${colors.blue(_.repeat(percentString, stats.percentMostlyTrue))}] ${stats.percentMostlyTrue} ± ${stats.moePercentMostlyTrue}% (${stats.numMostlyTrue})`);
    console.log(`       Half True : [${colors.grey(_.repeat(percentString, stats.percentHalfTrue))}] ${stats.percentHalfTrue} ± ${stats.moePercentHalfTrue}% (${stats.numHalfTrue})`);
    console.log(`    Mostly False : [${colors.yellow(_.repeat(percentString, stats.percentMostlyFalse))}] ${stats.percentMostlyFalse} ± ${stats.moePercentMostlyFalse}% (${stats.numMostlyFalse})`);
    console.log(`           False : [${colors.magenta(_.repeat(percentString, stats.percentFalse))}] ${stats.percentFalse} ± ${stats.moePercentFalse}% (${stats.numFalse})`);
    console.log(`   Pants On Fire : [${colors.red(_.repeat(percentString, stats.percentPantsOnFire))}] ${stats.percentPantsOnFire} ± ${stats.moePercentPantsOnFire}% (${stats.numPantsOnFire})`);
    console.log();
}
exports.printStatistics = printStatistics;
//# sourceMappingURL=helpers.js.map