import * as express from 'express';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';

import * as helpers from '../shared/helpers';
import * as commands from '../shared/commands';

var app = express();
var cachePath = process.env.CACHE_PATH || '.pfcache';
//var defaultPort = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 80;
var defaultPort = 80;
var fileName = `${cachePath}/people.json`;
var updateInterval = 60 * 60 * 1000;

// Create cache folder.

mkdirp.sync(cachePath);

// Global settings.

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routes.

app.get('/', (req, res) => {
    res.send('YAY');
});

app.get('/api/analyze/:selectorString/statistics', (req, res) => {
    commands.analyze(fileName, req.params.selectorString).then((stats) => {
        res.send(stats);
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get('/api/analyze/:selectorString/text', (req, res) => {
    commands.analyze(fileName, req.params.selectorString).then((stats) => {
        res.send(stats.toPlainString());
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get('/api/analyze/:selectorString/prettytext', (req, res) => {
    commands.analyze(fileName, req.params.selectorString).then((stats) => {
        res.send(stats.toPrettyString());
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get('/api/analyze/:selectorString/html', async (req, res) => {
    commands.analyze(fileName, req.params.selectorString).then((stats) => {
        res.send(helpers.convertString(stats.toPlainString(), helpers.htmlOperators));
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get('/api/compare/:selectorString/text', (req, res) => {
    commands.compare(fileName, req.params.selectorString).then((stats) => {
        res.send(helpers.getPlainStatisticsCompareString(stats));
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get('/api/compare/:selectorString/prettytext', (req, res) => {
    commands.compare(fileName, req.params.selectorString).then((stats) => {
        res.send(helpers.getStatisticsCompareString(stats));
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get('/api/compare/:selectorString/html', async (req, res) => {
    commands.compare(fileName, req.params.selectorString).then((stats) => {
        res.send(helpers.convertString(helpers.getPlainStatisticsCompareString(stats), helpers.htmlOperators));
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get('/api/example', (req, res) => {
    commands.example(fileName).then((person) => {
        res.send(person);
    }).catch(err => {
        res.status(500);
        res.send(err);
    });
});

export function start(port?: number) {
    if(!port)
        port = defaultPort;

    // Get new people every hour.
    setInterval(() => {
        commands.downloadAndSavePeople(fileName);
    }, updateInterval);

    // Download people and start server.
    if(!fs.existsSync(fileName)) {
        commands.downloadAndSavePeople(fileName).then(() => {
            app.listen(port, () => {
                console.log(`Listening on port ${port}!`);
            });
        });
    } else {
        app.listen(port, () => {
            console.log(`Listening on port ${port}!`);
        });
    }
}