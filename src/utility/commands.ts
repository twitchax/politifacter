import * as request from 'request';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as async from 'async';
import * as ProgressBar from 'progress';

import * as helpers from '../shared/helpers';
import { Statistics, Person } from '../shared/bll';

// Analyze commands.

export function analyze(source: string, selectors: string[]) {
    fs.readFile(source, (err, d) => {
        if (err) {
            throw err;
        }

        var data = JSON.parse(d.toString());
        
        var selected: Person[] = data;
        _(selectors).forEach(selector => {
            var selectSplit = selector.split('=');
            var path = selectSplit[0];
            var value = selectSplit[1];

            selected = _(selected).filter(d => _.get(d, path) === value).value();
        });

        if(selected.length === 0) {
            throw 'No people matched the criteria.';
        }
        
        var selectedStatistics = _(selected).reduce(helpers.aggregateStatsForPeople, new Statistics('', selectors));
        
        helpers.printStatistics(selectedStatistics);
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

export function downloadAndSavePeople(filename: string, callback?: () => void) {
    var bar = new ProgressBar('   downloading [:bar] :percent :etas', { total: batchMax / batchSize });

    var functions = _(offsets).map(o => {
        return function(callback) {
            baseRequest.get(`/api/v/2/person/?limit=${batchSize}&offset=${o}&format=json`, (e, r, b) => {
                if(e) {
                    callback(e, null);
                    throw e;
                }

                var data = b.objects;

                bar.tick();
                callback(null, data);
            });
        };
    }).value();

    async.parallel(functions, (err, results) => {
        if(err)
            throw err;

        var superResult = _(results).flattenDeep().orderBy((p: any) => p.total_count).reverse().value();

        fs.writeFile(filename, JSON.stringify(superResult, null, 4), err => {
                if(err) {
                    throw err;
                }

                console.log("The file was saved!");
                callback();
            });
    });
}

export function downloadAndSaveStatements(filename: string) {
    var bar = new ProgressBar('   downloading [:bar] :percent :etas', { total: batchMax / batchSize });

    var functions = _(offsets).map(o => {
        return function(callback) {
            baseRequest.get(`/api/v/2/statement/?order_by=-ruling_date&limit=${batchSize}&offset=${o}&edition__edition_slug=truth-o-meter&format=json`, (e, r, b) => {
                if(e) {
                    callback(e, null);
                    throw e;
                }

                var data = b.objects;

                bar.tick();
                callback(null, data);
            });
        };
    }).value();

    async.parallel(functions, (err, results) => {
        if(err)
            throw err;

        var superResult = _.flattenDeep(results);

        fs.writeFile(filename, JSON.stringify(superResult), err => {
                if(err) {
                    throw err;
                }

                console.log("The file was saved!");
            });
    });
}