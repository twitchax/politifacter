import * as _ from 'lodash';
import * as colors from 'colors'; colors /* peg this for compile */;
import { Stats } from 'fast-stats';

import * as helpers from './helpers';

export class Statistics {

    // Properties.

    name: string;
    selectors: Selector[];

    people: Person[] = [];

    pantsOnFireArray: number[] = [];
    falseArray: number[] = [];
    mostlyFalseArray: number[] = [];
    halfTrueArray: number[] = [];
    mostlyTrueArray: number[] = [];
    trueArray: number[] = [];
    totalArray: number[] = [];

    constructor(name: string, selectors: Selector[]) {
        this.name = name;
        this.selectors = selectors;
    }

    // Entry accessors.

    get numPeople() {
        return this.people.length;
    }

    // Count accessors.

    private _getNum(array: number[]) {
        return _(array).sum();
    }

    get numPantsOnFire() : number { return this._getNum(this.pantsOnFireArray); }
    get numFalse() : number { return this._getNum(this.falseArray); }
    get numMostlyFalse() : number { return this._getNum(this.mostlyFalseArray); }
    get numHalfTrue() : number { return this._getNum(this.halfTrueArray); }
    get numMostlyTrue() : number { return this._getNum(this.mostlyTrueArray); }
    get numTrue() : number { return this._getNum(this.trueArray); }
    get numTotal() : number { return this._getNum(this.totalArray); }

    // Percent accessors.

    private _getPercent(numerator: number) : number {
        return helpers.round(100 * numerator / this.numTotal, 2);
    }
    
    get percentPantsOnFire() { return this._getPercent(this.numPantsOnFire); }
    get percentFalse() { return this._getPercent(this.numFalse); }
    get percentMostlyFalse() { return this._getPercent(this.numMostlyFalse); }
    get percentHalfTrue() { return this._getPercent(this.numHalfTrue); }
    get percentMostlyTrue() { return this._getPercent(this.numMostlyTrue); }
    get percentTrue() { return this._getPercent(this.numTrue); }

    // Distribution accessors.

    private _distribution = undefined;
    private _getDistribution(accessor: string) : number {
        if(!this._distribution) {
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
            }

            while (total > 0) {
                var max = 0;
                var maxK = '';

                for(var k in deltas) {
                    if(deltas[k] > max) {
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

    private _getMoePercent(array: number[]) {
        var zipped = _.zip(array, this.totalArray);
        var percentages = _(zipped).map(z => z[0] / z[1]).value();
        
        var s = new Stats();
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

    toPrettyString() : string {
        var percentString
        var output = [];

        output.push('\n');
        output.push(`Selectors: [ ${this.selectors.join(', ')} ]\n`.bgBlue.green.underline);
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

    toPlainString() : string {
        return colors.strip(this.toPrettyString());
    }

    toCompareString() : string {
        var output = [];

        output.push(`[${helpers.percentBar(this.distributionTrue, '<').green}${helpers.percentBar(this.distributionMostlyTrue, '-').blue}${helpers.percentBar(this.distributionHalfTrue, '=').grey}${helpers.percentBar(this.distributionMostlyFalse, '~').yellow}${helpers.percentBar(this.distributionFalse, '-').magenta}${helpers.percentBar(this.distributionPantsOnFire, '>').red}]`);

        return output.join('');
    }

    toPlainCompareString() : string {
        return colors.strip(this.toCompareString());
    }
}

// Extensions.

declare global {
    interface String {
        replaceAll(old: string, nnew: string): string;
    }
}

String.prototype.replaceAll = function(o: string, n: string) : string {
    return this.split(o).join(n);
}

// Helper objects.

export type CliOperators = {
    newLine: string;
    space: string;
    directive: string;
}

export class Selection {
    global: Selector[]; 
    groups: Selector[][];

    constructor() { this.global = [], this.groups = []; }
};

export class Selector {
    property: string;
    operator: Operator;
    value: string;

    constructor(property: string, operator: Operator, value: string) {
        this.property = property;
        this.operator = operator;
        this.value = value;
    }

    toString() {
        return `${this.property} ${helpers.operatorToString(this.operator)} ${this.value}`; 
    }
}

export enum Operator {
    GreaterEqual, 
    LessEqual, 
    NotEqual, 
    Greater, 
    Less, 
    Equal
}

// Politifact exports.

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

export interface ResourceType {
    id: number;
    name: string;
    resource_uri: string;
}

export interface Art {
    brightcove: string;
    caption: string;
    id: number;
    ndn: string;
    ndnid: string;
    other: string;
    photo: string;
    resource_type: ResourceType;
    resource_uri: string;
    title: string;
    youtube: string;
    youtubeID: string;
}

export interface Publication {
    id: number;
    publication_name: string;
    resource_uri: string;
}

export interface Author {
    email_address: string;
    first_name: string;
    id: number;
    last_name: string;
    name_slug: string;
    photo?: any;
    publication: Publication;
    resource_uri: string;
    title: string;
}

export interface Edition {
    edition: string;
    edition_slug: string;
    id: number;
    meter_name: string;
    resource_uri: string;
}

export interface Researcher {
    email_address: string;
    first_name: string;
    id: number;
    last_name: string;
    name_slug: string;
    photo?: any;
    publication: Publication;
    resource_uri: string;
    title: string;
}

export interface Ruling {
    id: number;
    resource_uri: string;
    ruling: string;
    ruling_graphic: string;
    ruling_slug: string;
}

export interface PrimaryEdition {
    edition: string;
    edition_slug: string;
    id: number;
    meter_name: string;
    resource_uri: string;
}

export interface StatementType {
    id: number;
    resource_uri: string;
    statement_type: string;
    type_description: string;
}

export interface Subject {
    description: string;
    id: number;
    photo: string;
    resource_uri: string;
    subject: string;
    subject_slug: string;
    used_in_edition: string[];
}

export interface Statement {
    art: Art[];
    author: Author[];
    canonical_url: string;
    edition: Edition;
    editor: Author[];
    facebook_headline: string;
    id: number;
    in_future: boolean;
    is_pundit: boolean;
    make_public: boolean;
    preview: boolean;
    researcher: Researcher[];
    resource_uri: string;
    ruling: Ruling;
    ruling_comments: string;
    ruling_comments_date: Date;
    ruling_date: Date;
    ruling_headline: string;
    ruling_headline_slug: string;
    ruling_link_text: string;
    ruling_state?: any;
    source_documents?: any;
    sources: string;
    speaker: Person;
    statement: string;
    statement_context: string;
    statement_date: string;
    statement_type: StatementType;
    subject: Subject[];
    target: Person[];
    twitter_headline: string;
}