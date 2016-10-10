"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const express = require('express');
const fs = require('fs');
const helpers = require('../shared/helpers');
const Commands = require('../shared/commands');
var app = express();
var defaultPort = process.env.PORT || 3000;
var fileName = 'people.json';
var updateInterval = 60 * 60 * 1000;
// Global settings.
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// Routes.
app.get('/', (req, res) => {
    res.send('YAY');
});
app.get('/api/analyze/:selectorString/statistics', (req, res) => {
    Commands.analyze(fileName, req.params.selectorString).then((stats) => {
        res.send(stats);
    }).catch(err => {
        res.status(500).send(err);
    });
});
app.get('/api/analyze/:selectorString/text', (req, res) => {
    Commands.analyze(fileName, req.params.selectorString).then((stats) => {
        res.send(stats.toPlainString());
    }).catch(err => {
        res.status(500).send(err);
    });
});
app.get('/api/analyze/:selectorString/prettytext', (req, res) => {
    Commands.analyze(fileName, req.params.selectorString).then((stats) => {
        res.send(stats.toPrettyString());
    }).catch(err => {
        res.status(500).send(err);
    });
});
app.get('/api/analyze/:selectorString/htmltext', (req, res) => __awaiter(this, void 0, void 0, function* () {
    Commands.analyze(fileName, req.params.selectorString).then((stats) => {
        res.send(helpers.convertString(stats.toPlainString(), helpers.htmlOperators));
    }).catch(err => {
        res.status(500).send(err);
    });
}));
app.get('/api/compare/:selectorString/text', (req, res) => {
    Commands.compare(fileName, req.params.selectorString).then((stats) => {
        res.send(helpers.getPlainStatisticsCompareString(stats));
    }).catch(err => {
        res.status(500).send(err);
    });
});
app.get('/api/compare/:selectorString/prettytext', (req, res) => {
    Commands.compare(fileName, req.params.selectorString).then((stats) => {
        res.send(helpers.getStatisticsCompareString(stats));
    }).catch(err => {
        res.status(500).send(err);
    });
});
app.get('/api/compare/:selectorString/htmltext', (req, res) => __awaiter(this, void 0, void 0, function* () {
    Commands.compare(fileName, req.params.selectorString).then((stats) => {
        res.send(helpers.convertString(helpers.getPlainStatisticsCompareString(stats), helpers.htmlOperators));
    }).catch(err => {
        res.status(500).send(err);
    });
}));
app.get('/api/example', (req, res) => {
    Commands.example(fileName).then((person) => {
        res.send(person);
    }).catch(err => {
        res.send(500, err);
    });
});
function start(port) {
    if (!port)
        port = defaultPort;
    // Get new people every hour.
    setInterval(() => {
        Commands.downloadAndSavePeople(fileName);
    }, updateInterval);
    // Download people and start server.
    if (!fs.existsSync(fileName)) {
        Commands.downloadAndSavePeople(fileName).then(() => {
            app.listen(port, () => {
                console.log(`Listening on port ${port}!`);
            });
        });
    }
    else {
        app.listen(port, () => {
            console.log(`Listening on port ${port}!`);
        });
    }
}
exports.start = start;
// If this script was called as main, then start server.
if (require.main === module) {
    start();
}
//# sourceMappingURL=server.js.map