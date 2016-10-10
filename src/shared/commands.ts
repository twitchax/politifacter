import * as request from 'request';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as async from 'async';
import * as ProgressBar from 'progress';

import * as helpers from '../shared/helpers';
import { Statistics, Person, Statement, Selection } from '../shared/bll';

// Analyze commands.

export function analyze(source: string, selectionString: string /* comma-separated list */) : Promise<Statistics> {
    return new Promise((resolve: (stats: Statistics) => void, reject: (err: Error) => void) => {
        fs.readFile(source, (err, d) => {
            if (err) {
                reject(err);
            }

            helpers.tryOrReject(() => {
                var data = JSON.parse(d.toString());
                var selection = helpers.parseSelection(selectionString);
                var selectors = selection.groups[0] /* should only have one group */;
            
                var selected: Person[] = data;
                _(selectors).forEach(selector => {
                    selected = helpers.filter(selected, selector);
                });

                if(selected.length === 0) {
                    return;
                }
                
                var selectedStatistics = _(selected).reduce(helpers.aggregateStatsForPeople, new Statistics('', selectors));
                
                console.log(selectedStatistics.toPrettyString());
                resolve(selectedStatistics);
            }, reject);
        });
    });
}

// Compare commands.

export function compare(source: string, selectionString: string /* semicolon-separated list of comma-separated lists */) : Promise<Statistics[]> {
    return new Promise((resolve: (stats: Statistics[]) => void, reject: (err: Error) => void) => {
        fs.readFile(source, (err, d) => {
            if (err) {
                reject(err);
            }

            helpers.tryOrReject(() => {
                var data = JSON.parse(d.toString());
                var selection = helpers.parseSelection(selectionString);

                var statistics = [] as Statistics[];

                _(selection.groups).forEach(group => {
                    var selected: Person[] = data;
                    var selectors = group.concat(selection.global);

                    _(selectors).forEach(selector => {
                        selected = helpers.filter(selected, selector);
                    });

                    if(selected.length === 0) {
                        return;
                    }
                    
                    var selectedStatistics = _(selected).reduce(helpers.aggregateStatsForPeople, new Statistics('', selectors));

                    statistics.push(selectedStatistics);
                });
            
                statistics = _(statistics).orderBy(s => s.percentPantsOnFire + s.percentFalse + s.percentMostlyFalse).value();

                console.log(statistics.length);
                
                console.log(helpers.getStatisticsCompareString(statistics))
                resolve(statistics);
            }, reject);
        });
    });
}

// Example commands.

export function example(source: string) : Promise<Person> {
    return new Promise((resolve: (stats: Person) => void, reject: (err: Error) => void) => {
        fs.readFile(source, (err, d) => {
            if(err)
                reject(err);

            var person = JSON.parse(d.toString())[0] as Person;

            console.log(JSON.stringify(person, null, 4));
            resolve(person);
        });
    });
}

// Get commands.

var batchSize = 100;
var batchMax = 5000;
var offsets = _.range(0, batchMax, batchSize);

var baseRequest = request.defaults({
    baseUrl: 'http://www.politifact.com/', 
    json: true
});

export function downloadAndSavePeople(filename: string) : Promise<Person[]> {
    return new Promise((resolve: (people: Person[]) => void, reject: (err: Error) => void) => {
        var bar = new ProgressBar('   downloading [:bar] :percent :etas', { total: batchMax / batchSize });

        var functions = _(offsets).map(o => {
            return function(callback) {
                baseRequest.get(`/api/v/2/person/?limit=${batchSize}&offset=${o}&format=json`, (e, r, b) => {
                    if(e)
                        callback(e, null);

                    var data = b.objects;

                    bar.tick();
                    callback(null, data);
                });
            };
        }).value();

        async.parallel(functions, (err, results) => {
            if(err)
                reject(err);

            var superResult = _(results).flattenDeep().orderBy((p: Person) => p.total_count).reverse().value() as Person[];

            fs.writeFile(filename, JSON.stringify(superResult, null, 4), err => {
                if(err)
                    reject(err);

                console.log("The file was saved!");
                resolve(superResult);
            });
        });
    });
}

export function downloadAndSaveStatements(filename: string) : Promise<Statement[]> {
    return new Promise((resolve: (statements: Statement[]) => void, reject: (err: Error) => void) => {
        var bar = new ProgressBar('   downloading [:bar] :percent :etas', { total: batchMax / batchSize });

        var functions = _(offsets).map(o => {
            return function(callback) {
                baseRequest.get(`/api/v/2/statement/?order_by=-ruling_date&limit=${batchSize}&offset=${o}&edition__edition_slug=truth-o-meter&format=json`, (e, r, b) => {
                    if(e)
                        callback(e, null);

                    var data = b.objects;

                    bar.tick();
                    callback(null, data);
                });
            };
        }).value();

        async.parallel(functions, (err, results) => {
            if(err)
                reject(err);

            var statements = _.flattenDeep(results) as Statement[];

            fs.writeFile(filename, JSON.stringify(statements), err => {
                if(err)
                    reject(err);

                resolve(statements);
                console.log("The file was saved!");
            });
        });
    });
}