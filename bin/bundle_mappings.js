#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

const dir = './mappings';

readdir(dir)
    .then(files => files.filter(file => file.match(/\.json$/)))
    .then(files =>
        Promise.all(
            files.map(file =>
                readFile(path.join(dir, file), 'utf8').then(contents =>
                    JSON.parse(contents)
                )
            )
        )
    )
    .then(files => process.stdout.write(`${JSON.stringify(files, null, 2)}\n`));
