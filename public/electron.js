const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

const path = require('path');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        webPreferences: { 
            nodeIntegration: true, 
            preload : `${__dirname}${path.sep}preload.js` 
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    
    if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = 'production';
    
    if (process.env.NODE_ENV !== 'production')
        mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    })

    mainWindow.webContents.on('crashed', () => {
        console.log(`mainWindow crashed. re-creating.`)
        mainWindow.destroy();
        createWindow();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});