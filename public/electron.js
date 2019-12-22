const electron = require('electron');
const path = require('path');
const url = require('url');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const NODE_ENV = process.env.NODE_ENV;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadURL(NODE_ENV === 'development' ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });
    
    if (NODE_ENV === 'development')
        mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () 
{
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () 
{
    if (mainWindow === null) {
        createWindow();
    }
});