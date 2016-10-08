import * as _ from 'lodash';

import { Statistics, Person } from './bll';

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

export function round(num: number, decimalPlaces: number) : number {
    var factor = Math.pow(10, decimalPlaces)
    return Math.round(factor * num) / factor;
}