import * as _ from 'lodash';
import { Stats } from 'fast-stats';

import * as helpers from './helpers';

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