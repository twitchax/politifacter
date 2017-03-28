import * as request from 'request';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as async from 'async';
import * as ProgressBar from 'progress';

import * as helpers from '../shared/helpers';
import { Statistics, Person, Statement, Selection } from '../shared/bll';

// Analyze commands.

export function analyze(fileSource: string, selectionString: string /* comma-separated list */) : Promise<Statistics> {
    return new Promise((resolve: (stats: Statistics) => void, reject: (err: Error) => void) => {
        fs.readFile(fileSource, (err, d) => {
            if (err) {
                reject(err);
                return;
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
                
                resolve(selectedStatistics);
            }, reject);
        });
    });
}

// Search commands.

export function search(fileSource: string, terms: string[]) : Promise<Statement[]> {
    return new Promise((resolve: (stats: Statement[]) => void, reject: (err: Error) => void) => {
        fs.readFile(fileSource, (err, d) => {
            if (err) {
                reject(err);
                return;
            }

            helpers.tryOrReject(() => {
                var data = JSON.parse(d.toString());
                var result: Statement[] = data;
                
                _(terms).forEach(term => {
                    result = _(result).filter(s => s.ruling_comments.toLowerCase().includes(term)).value();
                });
                
                resolve(result);
            }, reject);
        });
    });
}

// Compare commands.

export function compare(fileSource: string, selectionString: string /* semicolon-separated list of comma-separated lists */) : Promise<Statistics[]> {
    return new Promise((resolve: (stats: Statistics[]) => void, reject: (err: Error) => void) => {
        fs.readFile(fileSource, (err, d) => {
            if (err) {
                reject(err);
                return;
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
                
                resolve(statistics);
            }, reject);
        });
    });
}

// Example commands.

export function example(fileSource: string) : Promise<Person | Statement> {
    return new Promise((resolve: (stats: Person | Statement) => void, reject: (err: Error) => void) => {
        fs.readFile(fileSource, (err, d) => {
            if(err) {
                reject(err);
                return;
            }

            var object = JSON.parse(d.toString())[0];

            resolve(object);
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

export function downloadAndSavePeople(fileTarget: string) : Promise<Person[]> {
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

        async.parallel(functions, (err: Error, results) => {
            if(err) {
                reject(err);
                return;
            }

            var people = _(results).flattenDeep().orderBy((p: Person) => p.total_count).reverse().value() as Person[];

            fs.writeFile(fileTarget, JSON.stringify(people, null, 4), err => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(people);
            });
        });
    });
}

export function downloadAndSaveStatements(fileTarget: string) : Promise<Statement[]> {
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

        async.parallel(functions, (err: Error, results) => {
            if(err) {
                reject(err);
                return;
            }

            var statements = _.flattenDeep(results) as Statement[];

            fs.writeFile(fileTarget, JSON.stringify(statements), err => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(statements);
            });
        });
    });
}