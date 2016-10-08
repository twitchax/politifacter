import * as _ from 'lodash';
import { Stats } from 'fast-stats';

import * as helpers from './helpers';

export interface Party {
    id: number;
    party: string;
    party_slug: string;
    resource_uri: string;
}

export interface PrimaryEdition {
    edition: string;
    edition_slug: string;
    id: number;
    meter_name: string;
    resource_uri: string;
}

export interface Person {
    barely_true_count: number;
    current_job: string;
    false_count: number;
    first_name: string;
    half_true_count: number;
    home_state: string;
    id: number;
    last_name: string;
    mostly_true_count: number;
    name_slug: string;
    pants_count: number;
    party: Party;
    photo: string;
    primary_edition: PrimaryEdition;
    promise_meter_cutout?: any;
    resource_uri: string;
    total_count: number;
    true_count: number;
    website: string;
}

export class Statistics {

    // Properties.

    name: string;
    selectors: string[];

    people: Person[] = [];

    pantsOnFireArray: number[] = [];
    falseArray: number[] = [];
    mostlyFalseArray: number[] = [];
    halfTrueArray: number[] = [];
    mostlyTrueArray: number[] = [];
    trueArray: number[] = [];
    totalArray: number[] = [];

    constructor(name: string, selectors: string[]) {
        this.name = name;
        this.selectors = selectors;
    }

    // Entry accessors.

    get numPeople() {
        return this.people.length;
    }

    // Count accessors.

    private getNum(array: number[]) {
        return _(array).sum();
    }

    get numPantsOnFire() : number { return this.getNum(this.pantsOnFireArray); }
    get numFalse() : number { return this.getNum(this.falseArray); }
    get numMostlyFalse() : number { return this.getNum(this.mostlyFalseArray); }
    get numHalfTrue() : number { return this.getNum(this.halfTrueArray); }
    get numMostlyTrue() : number { return this.getNum(this.mostlyTrueArray); }
    get numTrue() : number { return this.getNum(this.trueArray); }
    get numTotal() : number { return this.getNum(this.totalArray); }

    // Percent accessors.

    private getPercent(numerator: number) {
        return helpers.round(100 * numerator / this.numTotal, 2);
    }
    
    get percentPantsOnFire() { return this.getPercent(this.numPantsOnFire); }
    get percentFalse() { return this.getPercent(this.numFalse); }
    get percentMostlyFalse() { return this.getPercent(this.numMostlyFalse); }
    get percentHalfTrue() { return this.getPercent(this.numHalfTrue); }
    get percentMostlyTrue() { return this.getPercent(this.numMostlyTrue); }
    get percentTrue() { return this.getPercent(this.numTrue); }

    // Standard deviation accessors.

    private getMoePercent(array: number[]) {
        var zipped = _.zip(array, this.totalArray);
        var percentages = _(zipped).map(z => z[0] / z[1]).value();

        if(_(percentages).filter(p => isNaN(p)).value().length > 0)
            console.log('wtf');
        
        var s = new Stats();
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