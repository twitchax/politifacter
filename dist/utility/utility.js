#!/usr/bin/env node
"use strict";
const program = require('commander');
const fs = require('fs');
const Commands = require('../shared/commands');
program
    .version('1.0.0');
// Analyze commands.
program
    .command('analyze [selectors...]')
    .description('analyzes stored JSON people file (or downloads) and selects the data by [selectors] (optional selectors, e.g., "name_slug=barack-obama").')
    .action((selectors) => {
    var fileName = 'people.json';
    if (!fs.existsSync(fileName)) {
        console.log();
        console.log('Obtaining data...');
        Commands.downloadAndSavePeople(fileName, () => {
            Commands.analyze(fileName, selectors);
        });
    }
    else {
        Commands.analyze(fileName, selectors);
    }
});
// Clean commands.
program
    .command('clean')
    .description('deletes all JSON files in path.')
    .action((source, selectors) => {
    // delete all JSON files.
});
// Get commands.
program
    .command('get <type> <dest>')
    .description('gets <type> (statements/people) as JSON and save to <dest> (file path).')
    .action((type, dest) => {
    if (type === 'people') {
        Commands.downloadAndSavePeople(dest);
    }
    else if (type === 'statements') {
        Commands.downloadAndSaveStatements(dest);
    }
    else {
        throw 'Unknown type.';
    }
});
program.parse(process.argv);
//# sourceMappingURL=utility.js.map