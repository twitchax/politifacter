import * as request from 'request';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as async from 'async';
import * as ProgressBar from 'progress';

import * as helpers from '../shared/helpers';
import { Statistics, Person, Statement } from '../shared/bll';

// Analyze commands.

export function analyze(source: string, selectors: string[]) : Promise<Statistics> {
    return new Promise((resolve: (stats: Statistics) => void, reject: (err: Error) => void) => {
        fs.readFile(source, (err, d) => {
            if (err) {
                reject(err);
            }

            tryOrReject(() => {
                var data = JSON.parse(d.toString());
            
                var selected: Person[] = data;
                _(selectors).forEach(selector => {
                    selected = filter(selected, selector);
                });

                if(selected.length === 0) {
                    throw 'No people matched the criteria.';
                }
                
                var selectedStatistics = _(selected).reduce(helpers.aggregateStatsForPeople, new Statistics('', selectors));
                
                helpers.printStatistics(selectedStatistics);
                resolve(selectedStatistics);
            }, reject);
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

// Command helpers.

function tryOrReject(func: () => void, reject: (err: Error) => void) {
    try {
        func();
    } catch(e) {
        reject(e);
    }
} 

function filter(array: Person[], selector: string) : Person[] {
    if(selector.includes('>=')) {
        var selectSplit = selector.split('>=');
        var mode = 'greaterEqual';
    } else if (selector.includes('<=')) {
        var selectSplit = selector.split('<=');
        var mode = 'lessEqual';
    } else if (selector.includes('!=')) {
        var selectSplit = selector.split('!=');
        var mode = 'notEqual';
    } else if (selector.includes('<>')) {
        var selectSplit = selector.split('<>');
        var mode = 'notEqual';
    } else if (selector.includes('>')) {
        var selectSplit = selector.split('>');
        var mode = 'greater';
    } else if (selector.includes('<')) {
        var selectSplit = selector.split('<');
        var mode = 'less';
    } else if (selector.includes('=')) {
        var selectSplit = selector.split('=');
        var mode = 'equal';
    } else {
        throw Error('Operator not found.');
    }

    var path = selectSplit[0];
    var value = selectSplit[1];

    switch(mode) {
        case 'greaterEqual':
            var filter = d => _.get(d, path) >= parseFloat(value);
            break;
        case 'lessEqual':
            var filter = d => _.get(d, path) <= parseFloat(value);
            break;
        case 'notEqual':
            var filter = d => _.get(d, path) != value;
            break;
        case 'greater':
            var filter = d => _.get(d, path) > parseFloat(value);
            break;
        case 'less':
            var filter = d => _.get(d, path) < parseFloat(value);
            break;
        case 'equal':
            var filter = d => _.get(d, path) == value;
            break;
        default:
            throw Error('Invalid operator.');
    }

    return _(array).filter(filter).value();
}