"use strict";
const _ = require('lodash');
const colors = require('colors');
const bll_1 = require('./bll');
// Math helpers.
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
    if (!decimalPlaces)
        decimalPlaces = 0;
    var factor = Math.pow(10, decimalPlaces);
    return Math.round(factor * num) / factor;
}
exports.round = round;
// String generators.
exports.commandLineOperators = { newLine: '\n', space: ' ', directive: '' };
exports.htmlOperators = { newLine: '<br/>', space: '&nbsp;', directive: '<style>*{font-family:"Courier New"}</style>' };
exports.tab = _.repeat(' ', 3);
function getStatisticsCompareString(stats) {
    var output = [];
    output.push('\n');
    _(stats).forEach(s => {
        output.push(`[ ${s.selectors.join(`, `)} ]\n`.bold.underline.bgBlue.green);
        output.push(`${exports.tab}${s.toCompareString()}`);
        output.push('\n\n');
    });
    return output.join('');
}
exports.getStatisticsCompareString = getStatisticsCompareString;
function getPlainStatisticsCompareString(stats) {
    return colors.strip(getStatisticsCompareString(stats));
}
exports.getPlainStatisticsCompareString = getPlainStatisticsCompareString;
function convertString(str, operators = exports.commandLineOperators) {
    return operators.directive + str.replaceAll('\n', operators.newLine).replaceAll(' ', operators.space);
}
exports.convertString = convertString;
function percentBar(num, str) {
    if (!str)
        str = '=';
    return _.repeat(str, num);
}
exports.percentBar = percentBar;
function operatorToString(operator) {
    switch (operator) {
        case bll_1.Operator.GreaterEqual:
            return '>=';
        case bll_1.Operator.LessEqual:
            return '<=';
        case bll_1.Operator.NotEqual:
            return '!=';
        case bll_1.Operator.Greater:
            return '>';
        case bll_1.Operator.Less:
            return '<';
        case bll_1.Operator.Equal:
            return '==';
        default:
            throw Error('Invalid operator.');
    }
}
exports.operatorToString = operatorToString;
// Command helpers.
function tryOrReject(func, reject) {
    try {
        func();
    }
    catch (e) {
        reject(e);
    }
}
exports.tryOrReject = tryOrReject;
var globalDelimiter = '|';
var groupDelimiter = ';';
var selectorDelimiter = ',';
function parseSelection(str) {
    var result = new bll_1.Selection();
    var globalSplit = str.split(globalDelimiter);
    if (globalSplit.length === 1) {
        result.global = [];
        var groups = globalSplit[0];
    }
    else if (globalSplit.length === 2) {
        result.global = parseSelectors(globalSplit[0]);
        var groups = globalSplit[1];
    }
    else {
        throw Error('Incorrect number of global splits.');
    }
    var groupSplit = groups.split(groupDelimiter);
    for (var group of groupSplit) {
        result.groups.push(parseSelectors(group));
    }
    return result;
}
exports.parseSelection = parseSelection;
function parseSelectors(str) {
    var result = [];
    for (var s of str.split(',')) {
        if (s.includes('>=')) {
            var selectSplit = s.split('>=');
            var operator = bll_1.Operator.GreaterEqual;
        }
        else if (s.includes('<=')) {
            var selectSplit = s.split('<=');
            var operator = bll_1.Operator.LessEqual;
        }
        else if (s.includes('!=')) {
            var selectSplit = s.split('!=');
            var operator = bll_1.Operator.NotEqual;
        }
        else if (s.includes('<>')) {
            var selectSplit = s.split('<>');
            var operator = bll_1.Operator.NotEqual;
        }
        else if (s.includes('==')) {
            var selectSplit = s.split('==');
            var operator = bll_1.Operator.Equal;
        }
        else if (s.includes('>')) {
            var selectSplit = s.split('>');
            var operator = bll_1.Operator.Greater;
        }
        else if (s.includes('<')) {
            var selectSplit = s.split('<');
            var operator = bll_1.Operator.Less;
        }
        else if (s.includes('=')) {
            var selectSplit = s.split('=');
            var operator = bll_1.Operator.Equal;
        }
        else {
            throw Error('Operator not found.');
        }
        var property = selectSplit[0].trim();
        var value = selectSplit[1].trim();
        result.push(new bll_1.Selector(property, operator, value));
    }
    return result;
}
exports.parseSelectors = parseSelectors;
function filter(array, selector) {
    switch (selector.operator) {
        case bll_1.Operator.GreaterEqual:
            var filter = d => _.get(d, selector.property) >= parseFloat(selector.value);
            break;
        case bll_1.Operator.LessEqual:
            var filter = d => _.get(d, selector.property) <= parseFloat(selector.value);
            break;
        case bll_1.Operator.NotEqual:
            var filter = d => _.get(d, selector.property) != selector.value;
            break;
        case bll_1.Operator.Greater:
            var filter = d => _.get(d, selector.property) > parseFloat(selector.value);
            break;
        case bll_1.Operator.Less:
            var filter = d => _.get(d, selector.property) < parseFloat(selector.value);
            break;
        case bll_1.Operator.Equal:
            var filter = d => _.get(d, selector.property) == selector.value;
            break;
        default:
            throw Error('Invalid operator.');
    }
    return _(array).filter(filter).value();
}
exports.filter = filter;
//# sourceMappingURL=helpers.js.map