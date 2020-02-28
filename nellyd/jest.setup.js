const { sep } = require('path');
const { mkdirSync, existsSync } = require('fs');
const { sync } = require('rimraf');

process.env.APPLICATION_DIR = process.env.PWD;
process.env.CONFIG_DIR = `${process.env.APPLICATION_DIR}${sep}testresources${sep}`;
process.env.LOGS_DIR = `${process.env.APPLICATION_DIR}${sep}testresources${sep}logs${sep}`;
process.env.DATABASE_FOLDER = `${process.env.APPLICATION_DIR}${sep}testresources${sep}`;

if (!existsSync(process.env.CONFIG_DIR))
    mkdirSync(process.env.CONFIG_DIR);