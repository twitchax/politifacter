#! /usr/bin/env node

import * as program from 'commander';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
var pkginfo = require('pkginfo')(module);

import * as server from '../server/server';
import * as commands from '../shared/commands';
import * as helpers from '../shared/helpers';

// Variables.

const cacheDirectory = '.pfcache';
const peopleFile = `${cacheDirectory}/people.json`;
const statementsFile = `${cacheDirectory}/statements.json`;

// Helpers.

function ensureFile(fileName: string, force: boolean = false) : Promise<{}> {
    return new Promise(async (resolve: () => void, reject: (x: Error) => void) => {
        if (!fs.existsSync(cacheDirectory)){
            fs.mkdirSync(cacheDirectory);
        }

        if(force || !fs.existsSync(fileName)) {
            console.log();
            console.log('Obtaining data...');

            switch(fileName) {
                case peopleFile:
                    var result = await commands.downloadAndSavePeople(fileName) as any[];
                    break;
                case statementsFile:
                    var result = await commands.downloadAndSaveStatements(fileName) as any[];
                    break;
                default:
                    reject(Error('Unknown file type.'));
                    return;
            }

            console.log(`The file was saved (${result.length})!`);
        }

        resolve();
    });
}

// Global defines.

program
    .version(module.exports.version);

// Analyze commands.

program
    .command('analyze <selectionString>')
    .description('analyzes stored JSON people file (or downloads) and selects the data by <selectionString> (optional selectors, e.g., "party.party=Democrat,total_count>=20).')
    .action(async (selectionString) => {
        await ensureFile(peopleFile);

        var stat = await commands.analyze(peopleFile, selectionString);
        console.log(stat.toPrettyString());
    });

// Search commands.

program
    .command('search <terms...>')
    .description('searches all statements for the specified <terms...>.')
    .action(async (terms) => {
        await ensureFile(statementsFile);

        var statements = await commands.search(statementsFile, terms);
        console.log(JSON.stringify(statements, null, 4));
    });

// Compare commands.

program
    .command('compare <selectionString>')
    .description('compares groups selected by <selectionString> (optional selectors, e.g., "name_slug=barack-obama").')
    .action(async (selectionString) => {
        await ensureFile(peopleFile);

        var stats = await commands.compare(peopleFile, selectionString);
        console.log(helpers.getStatisticsCompareString(stats));
    });

// Example commands.

program
    .command('example <type>')
    .description('gets an example <type> object.')
    .action(async (type) => {
        switch(type) {
            case 'person':
                var fileName = peopleFile;
                break;
            case 'statement':
                var fileName = statementsFile;
                break;
            default:
                throw Error('Unknown type.');
        }
        
        await ensureFile(fileName);

        var o = await commands.example(fileName);
        console.log(JSON.stringify(o, null, 4));
    });

// Clean commands.

program
    .command('clean')
    .description('deletes cache directory.')
    .action(async () => {
        await fse.remove(cacheDirectory);
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
    .command('get <type>')
    .description('gets <type> (statements/people) as JSON and save.')
    .action((type) => {
        switch(type) {
            case 'people':
                ensureFile(peopleFile, true /* force */);
                break;
            case 'statements':
                ensureFile(statementsFile, true, /* force */);
                break;
            default:
                throw Error('Unknown type.');
        }
    });

// Global directives.

program.parse(process.argv);