import * as _ from 'lodash';
import * as colors from 'colors';

import { Statistics, Person, CliOperators, Selection, Selector, Operator } from './bll';

// Math helpers.

export function aggregateStatsForPeople(agg : Statistics, person : Person) : Statistics {
    var total = person.pants_count + person.false_count + person.barely_true_count + person.half_true_count + person.mostly_true_count + person.true_count;

    if(total === 0)
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

export function round(num: number, decimalPlaces?: number) : number {
    if(!decimalPlaces)
        decimalPlaces = 0;
    
    var factor = Math.pow(10, decimalPlaces)
    return Math.round(factor * num) / factor;
}

// String generators.

export var commandLineOperators = { newLine: '\n', space: ' ', directive: '' } as CliOperators;
export var htmlOperators = { newLine: '<br/>', space: '&nbsp;', directive: '<style>*{font-family:"Courier New"}</style>' } as CliOperators;
export var tab = _.repeat(' ', 3);

export function getStatisticsCompareString(stats: Statistics[]) : string {
    var output = [];

    output.push('\n');
    _(stats).forEach(s => {
        output.push(`[ ${s.selectors.join(`, `)} ]\n`.bold.underline.bgBlue.green)
        output.push(`${tab}${s.toCompareString()}`);
        output.push('\n\n');
    });

    return output.join('');
}

export function getPlainStatisticsCompareString(stats: Statistics[]) : string {
    return colors.strip(getStatisticsCompareString(stats));
}

export function convertString(str: string, operators: CliOperators = commandLineOperators) {
    return operators.directive + str.replaceAll('\n', operators.newLine).replaceAll(' ', operators.space);
}

export function percentBar(num: number, str?: string) {
    if(!str) 
        str = '=';
    
    return _.repeat(str, num);
}

export function operatorToString(operator: Operator) {
    switch(operator) {
        case Operator.GreaterEqual:
            return '>=';
        case Operator.LessEqual:
            return '<=';
        case Operator.NotEqual:
            return '!=';
        case Operator.Greater:
            return '>';
        case Operator.Less:
            return '<';
        case Operator.Equal:
            return '==';
        default:
            throw Error('Invalid operator.');
    }
}

// Command helpers.

export function tryOrReject(func: () => void, reject: (err: Error) => void) {
    try {
        func();
    } catch(e) {
        reject(e);
    }
}

var globalDelimiter = '|';
var groupDelimiter = ';';
var selectorDelimiter = ',';

export function parseSelection(str: string) : Selection {
    var result = new Selection();

    var globalSplit = str.split(globalDelimiter);
    if(globalSplit.length === 1) {
        result.global = [];

        var groups = globalSplit[0];
    } else if (globalSplit.length === 2) {
        result.global = parseSelectors(globalSplit[0]);

        var groups = globalSplit[1]
    } else {
        throw Error('Incorrect number of global splits.');
    }

    var groupSplit = groups.split(groupDelimiter);
    for(var group of groupSplit) {
        result.groups.push(parseSelectors(group));
    }

    return result;
}

export function parseSelectors(str: string) : Selector[] {

    var result = [];

    for(var s of str.split(',')) {
        if(s.includes('>=')) {
            var selectSplit = s.split('>=');
            var operator = Operator.GreaterEqual;
        } else if (s.includes('<=')) {
            var selectSplit = s.split('<=');
            var operator = Operator.LessEqual;
        } else if (s.includes('!=')) {
            var selectSplit = s.split('!=');
            var operator = Operator.NotEqual;
        } else if (s.includes('<>')) {
            var selectSplit = s.split('<>');
            var operator = Operator.NotEqual;
        } else if (s.includes('==')) {
            var selectSplit = s.split('==');
            var operator = Operator.Equal;
        } else if (s.includes('>')) {
            var selectSplit = s.split('>');
            var operator = Operator.Greater;
        } else if (s.includes('<')) {
            var selectSplit = s.split('<');
            var operator = Operator.Less;
        } else if (s.includes('=')) {
            var selectSplit = s.split('=');
            var operator = Operator.Equal;
        } else {
            throw Error('Operator not found.');
        }

        var property = selectSplit[0].trim();
        var value = selectSplit[1].trim();

        result.push(new Selector(property, operator, value));
    }

    return result;
}

export function filter(array: Person[], selector: Selector) : Person[] {
    switch(selector.operator) {
        case Operator.GreaterEqual:
            var filter = d => _.get(d, selector.property) >= parseFloat(selector.value);
            break;
        case Operator.LessEqual:
            var filter = d => _.get(d, selector.property) <= parseFloat(selector.value);
            break;
        case Operator.NotEqual:
            var filter = d => _.get(d, selector.property) != selector.value;
            break;
        case Operator.Greater:
            var filter = d => _.get(d, selector.property) > parseFloat(selector.value);
            break;
        case Operator.Less:
            var filter = d => _.get(d, selector.property) < parseFloat(selector.value);
            break;
        case Operator.Equal:
            var filter = d => _.get(d, selector.property) == selector.value;
            break;
        default:
            throw Error('Invalid operator.');
    }

    return _(array).filter(filter).value();
}