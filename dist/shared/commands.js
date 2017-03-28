"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const _ = require("lodash");
const fs = require("fs");
const async = require("async");
const ProgressBar = require("progress");
const helpers = require("../shared/helpers");
const bll_1 = require("../shared/bll");
// Analyze commands.
function analyze(fileSource, selectionString /* comma-separated list */) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileSource, (err, d) => {
            if (err) {
                reject(err);
                return;
            }
            helpers.tryOrReject(() => {
                var data = JSON.parse(d.toString());
                var selection = helpers.parseSelection(selectionString);
                var selectors = selection.groups[0] /* should only have one group */;
                var selected = data;
                _(selectors).forEach(selector => {
                    selected = helpers.filter(selected, selector);
                });
                if (selected.length === 0) {
                    return;
                }
                var selectedStatistics = _(selected).reduce(helpers.aggregateStatsForPeople, new bll_1.Statistics('', selectors));
                resolve(selectedStatistics);
            }, reject);
        });
    });
}
exports.analyze = analyze;
// Search commands.
function search(fileSource, terms) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileSource, (err, d) => {
            if (err) {
                reject(err);
                return;
            }
            helpers.tryOrReject(() => {
                var data = JSON.parse(d.toString());
                var result = data;
                _(terms).forEach(term => {
                    result = _(result).filter(s => s.ruling_comments.toLowerCase().includes(term)).value();
                });
                resolve(result);
            }, reject);
        });
    });
}
exports.search = search;
// Compare commands.
function compare(fileSource, selectionString /* semicolon-separated list of comma-separated lists */) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileSource, (err, d) => {
            if (err) {
                reject(err);
                return;
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
                resolve(statistics);
            }, reject);
        });
    });
}
exports.compare = compare;
// Example commands.
function example(fileSource) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileSource, (err, d) => {
            if (err) {
                reject(err);
                return;
            }
            var object = JSON.parse(d.toString())[0];
            resolve(object);
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
function downloadAndSavePeople(fileTarget) {
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
            if (err) {
                reject(err);
                return;
            }
            var people = _(results).flattenDeep().orderBy((p) => p.total_count).reverse().value();
            fs.writeFile(fileTarget, JSON.stringify(people, null, 4), err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(people);
            });
        });
    });
}
exports.downloadAndSavePeople = downloadAndSavePeople;
function downloadAndSaveStatements(fileTarget) {
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
            if (err) {
                reject(err);
                return;
            }
            var statements = _.flattenDeep(results);
            fs.writeFile(fileTarget, JSON.stringify(statements), err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(statements);
            });
        });
    });
}
exports.downloadAndSaveStatements = downloadAndSaveStatements;
//# sourceMappingURL=commands.js.map