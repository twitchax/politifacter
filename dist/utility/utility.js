#! /usr/bin/env node
"use strict";
const program = require('commander');
const fs = require('fs');
var pkginfo = require('pkginfo')(module);
const server = require('../server/server');
const Commands = require('../shared/commands');
// Global defines.
program
    .version(module.exports.version);
// Analyze commands.
program
    .command('analyze [selectors]')
    .description('analyzes stored JSON people file (or downloads) and selects the data by [selectors] (optional selectors, e.g., "party.party=Democrat,total_count>=20).')
    .action((selector) => {
    var fileName = 'people.json';
    if (!fs.existsSync(fileName)) {
        console.log();
        console.log('Obtaining data...');
        Commands.downloadAndSavePeople(fileName).then(() => {
            Commands.analyze(fileName, selector).catch(console.error);
        });
    }
    else {
        Commands.analyze(fileName, selector).catch(console.error);
    }
});
// Compare commands.
program
    .command('compare [groups]')
    .description('compares groups selected by [selectors] (optional selectors, e.g., "name_slug=barack-obama").')
    .action((groups) => {
    var fileName = 'people.json';
    if (!fs.existsSync(fileName)) {
        console.log();
        console.log('Obtaining data...');
        Commands.compare(fileName, groups).catch(console.error);
    }
    else {
        Commands.compare(fileName, groups).catch(console.error);
    }
});
// Example commands.
program
    .command('example')
    .description('gets and example Person object.')
    .action(() => {
    var fileName = 'people.json';
    if (!fs.existsSync(fileName)) {
        console.log();
        console.log('Obtaining data...');
        Commands.downloadAndSavePeople(fileName).then(() => {
            Commands.example(fileName).catch(console.error);
        });
    }
    else {
        Commands.example(fileName).catch(console.error);
    }
});
// Clean commands.
program
    .command('clean [fileName]')
    .description('deletes file at path <fileName>.')
    .action((fileName) => {
    fs.unlinkSync(fileName);
});
// Server commands.
program
    .command('server [port]')
    .description('starts the politifacter server.')
    .action((port) => {
    server.start(port);
});
// Get commands.
program
    .command('get <type> <dest>')
    .description('gets <type> (statements/people) as JSON and save to <dest> (file path).')
    .action((type, dest) => {
    if (type === 'people') {
        Commands.downloadAndSavePeople(dest).catch(console.error);
    }
    else if (type === 'statements') {
        Commands.downloadAndSaveStatements(dest).catch(console.error);
    }
    else {
        throw 'Unknown type.';
    }
});
// Global directives.
program.parse(process.argv);
//# sourceMappingURL=utility.js.map