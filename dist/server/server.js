"use strict";
const express = require('express');
const Commands = require('../shared/commands');
var app = express();
var port = process.env.PORT || 3000;
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
app.get('/api/analyze/:selectors/statistics', (req, res) => {
    Commands.analyze(fileName, req.params.selectors.split(',')).then((stats) => {
        res.send(stats);
    });
});
app.get('/api/analyze/:selectors/text', (req, res) => {
    Commands.analyze(fileName, req.params.selectors.split(',')).then((stats) => {
        res.send(stats.toString());
    });
});
app.get('/api/analyze/:selectors/prettytext', (req, res) => {
    Commands.analyze(fileName, req.params.selectors.split(',')).then((stats) => {
        res.send(stats.toPrettyString());
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
//# sourceMappingURL=server.js.map