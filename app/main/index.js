/* jshint esnext: true */
'use strict';

var electron = require('electron');
var app = electron.app;
var ipcMain = require('electron').ipcMain;
var crashReporter = require('crash-reporter');
var BrowserWindow = require('browser-window');
var noble = require('noble');

crashReporter.start({
    productName: 'es6-ng-electron',
    companyName: 'FooBar',
    submitURL: 'http://localhost:3000/',
    autoSubmit: true
});

var mainWindow = null;

ipcMain.on('crash', function (event, arg) {
    console.log("Crash", arg);
    process.crash(arg);
});

ipcMain.on('devTools', function (event, arg) {
    console.log("DevTools", arg);
    mainWindow.openDevTools();
});

app.on('window-all-closed', function () {
    // force app termination on OSX when mainWindow has been closed
    if (process.platform == 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    console.log("App Ready");
    mainWindow = new BrowserWindow({
        // width: 1280,
        // height: 1200,
        // x: 1280,
        // y: 100
        width: 1200,
        height: 800,
        x: 960,
        y: 100
    });

    // mainWindow.loadURL('file://' + __dirname + '/../browser/index.html');
    mainWindow.loadURL('file://' + __dirname + '/../browser/test.html');
    mainWindow.webContents.on('did-finish-load', function () {
        console.log("Window Did Load");
        mainWindow.setTitle(app.getName());

        console.log("Setting noble state change listener");
        // noble.on('stateChange', (state) => {
        //     console.log("Noble State Change", state);
        //     noble.startScanning();
        //    
        // });
    });
    mainWindow.on('closed', function () {
        console.log("Window Closed");
        mainWindow = null;
    });
});