"use strict";
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const async = require('async');
const ProgressBar = require('progress');
const helpers = require('../shared/helpers');
const bll_1 = require('../shared/bll');
// Analyze commands.
function analyze(source, selectionString /* comma-separated list */) {
    return new Promise((resolve, reject) => {
        fs.readFile(source, (err, d) => {
            if (err) {
                reject(err);
            }
            helpers.tryOrReject(() => {
                var data = JSON.parse(d.toString());
                var selection = helpers.parseSelection(selectionString);
                var selectors = selection.groups[0];
                var selected = data;
                _(selectors).forEach(selector => {
                    selected = helpers.filter(selected, selector);
                });
                if (selected.length === 0) {
                    return;
                }
                var selectedStatistics = _(selected).reduce(helpers.aggregateStatsForPeople, new bll_1.Statistics('', selectors));
                console.log(selectedStatistics.toPrettyString());
                resolve(selectedStatistics);
            }, reject);
        });
    });
}
exports.analyze = analyze;
// Compare commands.
function compare(source, selectionString /* semicolon-separated list of comma-separated lists */) {
    return new Promise((resolve, reject) => {
        fs.readFile(source, (err, d) => {
            if (err) {
                reject(err);
            }
            helpers.tryOrReject(() => {
                var data = JSON.parse(d.toString());
                var selection = helpers.parseSelection(selectionString);
                var statistics = [];
                _(selection.groups).forEach(group => {
                    var selected = data;
                    var selectors = group.concat(selection.global);
                    _(selectors).forEach(selector => {
                        selected = helpers.filter(selected, selector);
                    });
                    if (selected.length === 0) {
                        return;
                    }
                    var selectedStatistics = _(selected).reduce(helpers.aggregateStatsForPeople, new bll_1.Statistics('', selectors));
                    statistics.push(selectedStatistics);
                });
                statistics = _(statistics).orderBy(s => s.percentPantsOnFire + s.percentFalse + s.percentMostlyFalse).value();
                console.log(statistics.length);
                console.log(helpers.getStatisticsCompareString(statistics));
                resolve(statistics);
            }, reject);
        });
    });
}
exports.compare = compare;
// Example commands.
function example(source) {
    return new Promise((resolve, reject) => {
        fs.readFile(source, (err, d) => {
            if (err)
                reject(err);
            var person = JSON.parse(d.toString())[0];
            console.log(JSON.stringify(person, null, 4));
            resolve(person);
        });
    });
}
exports.example = example;
// Get commands.
var batchSize = 100;
var batchMax = 5000;
var offsets = _.range(0, batchMax, batchSize);
var baseRequest = request.defaults({
    baseUrl: 'http://www.politifact.com/',
    json: true
});
function downloadAndSavePeople(filename) {
    return new Promise((resolve, reject) => {
        var bar = new ProgressBar('   downloading [:bar] :percent :etas', { total: batchMax / batchSize });
        var functions = _(offsets).map(o => {
            return function (callback) {
                baseRequest.get(`/api/v/2/person/?limit=${batchSize}&offset=${o}&format=json`, (e, r, b) => {
                    if (e)
                        callback(e, null);
                    var data = b.objects;
                    bar.tick();
                    callback(null, data);
                });
            };
        }).value();
        async.parallel(functions, (err, results) => {
            if (err)
                reject(err);
            var superResult = _(results).flattenDeep().orderBy((p) => p.total_count).reverse().value();
            fs.writeFile(filename, JSON.stringify(superResult, null, 4), err => {
                if (err)
                    reject(err);
                console.log("The file was saved!");
                resolve(superResult);
            });
        });
    });
}
exports.downloadAndSavePeople = downloadAndSavePeople;
function downloadAndSaveStatements(filename) {
    return new Promise((resolve, reject) => {
        var bar = new ProgressBar('   downloading [:bar] :percent :etas', { total: batchMax / batchSize });
        var functions = _(offsets).map(o => {
            return function (callback) {
                baseRequest.get(`/api/v/2/statement/?order_by=-ruling_date&limit=${batchSize}&offset=${o}&edition__edition_slug=truth-o-meter&format=json`, (e, r, b) => {
                    if (e)
                        callback(e, null);
                    var data = b.objects;
                    bar.tick();
                    callback(null, data);
                });
            };
        }).value();
        async.parallel(functions, (err, results) => {
            if (err)
                reject(err);
            var statements = _.flattenDeep(results);
            fs.writeFile(filename, JSON.stringify(statements), err => {
                if (err)
                    reject(err);
                resolve(statements);
                console.log("The file was saved!");
            });
        });
    });
}
exports.downloadAndSaveStatements = downloadAndSaveStatements;
//# sourceMappingURL=commands.js.map