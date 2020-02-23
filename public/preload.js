const {sep} = require('path');
const { dialog } = require('electron').remote;

window.APPLICATION_DIR = `${process.env.HOME}${sep}.nelly${sep}`;
window.CONFIG_DIR = `${window.APPLICATION_DIR}${sep}config${sep}`;
window.LOGS_DIR = `${window.APPLICATION_DIR}${sep}logs${sep}`;
window.DATABASE_DIR = window.APPLICATION_DIR;


window.electron = {};
window.electron.dialog = dialog;