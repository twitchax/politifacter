import * as express from 'express';
import * as fs from 'fs';

import * as Commands from '../shared/commands';

var app = express();
var port = process.env.PORT || 3000;
var fileName = 'people.json';
var updateInterval = 60 * 60 * 1000;

console.info(`Environment port: ${port}.`);

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

app.get('/api/analyze/:selectors/statistics', (req, res) => {
    Commands.analyze(fileName, req.params.selectors.split(',')).then((stats) => {
        res.send(stats);
    }).catch(err => {
        res.send(500, err);
    });
});

app.get('/api/analyze/:selectors/text', (req, res) => {
    Commands.analyze(fileName, req.params.selectors.split(',')).then((stats) => {
        res.send(stats.toString());
    }).catch(err => {
        res.send(500, err);
    });
});

app.get('/api/analyze/:selectors/prettytext', (req, res) => {
    Commands.analyze(fileName, req.params.selectors.split(',')).then((stats) => {
        res.send(stats.toPrettyString());
    }).catch(err => {
        res.send(500, err);
    });
});

app.get('/api/analyze/:selectors/htmltext', (req, res) => {
    Commands.analyze(fileName, req.params.selectors.split(',')).then((stats) => {
        res.send(stats.toString('<br />'));
    }).catch(err => {
        res.send(500, err);
    });
});

app.get('/api/example', (req, res) => {
    Commands.example(fileName).then((person) => {
        res.send(person);
    }).catch(err => {
        res.send(500, err);
    });
});

// Get new people every hour.

setInterval(() => {
    Commands.downloadAndSavePeople(fileName);
}, updateInterval);

// Download people and start server.

Commands.downloadAndSavePeople(fileName).then(() => {
    app.listen(port, () => {
        console.log(`Listening on port ${port}!`);
    });
});