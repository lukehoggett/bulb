'use strict';

/* jshint esnext: true */
let electron = require('electron');
let app = electron.app;
const ipcMain = require('electron').ipcMain;
let crashReporter = require('crash-reporter');
let BrowserWindow = require('browser-window');
let noble = require('noble');

crashReporter.start({
  productName: 'es6-ng-electron',
  companyName: 'FooBar',
  submitURL: 'http://localhost:3000/',
  autoSubmit: true
});

var mainWindow = null;

ipcMain.on('crash', (event, arg) => {
  console.log("Crash", arg);
  process.crash(arg);
});

ipcMain.on('devTools', (event, arg) => {
  console.log("DevTools", arg);
  mainWindow.openDevTools();
});

app.on('window-all-closed', () => {
  // force app termination on OSX when mainWindow has been closed
  if (process.platform == 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  console.log("App Ready");
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    x: 300,
    y: 300
  });

  var webContents = mainWindow.webContents;
  
  
  ipcMain.on('startScan', function() {
    // Start scanning only if already powered up.
    if (noble.state === 'poweredOn') {
      console.log('Starting scan... ');
      noble.startScanning();
    }
  });

  ipcMain.on('stopScan', function() {
    // Stop scanning for devices.
    console.log('Stopping scan...');
    noble.stopScanning();
  });

  noble.on('discover', function(peripheral) {
    
    if (typeof peripheral.advertisement.manufacturerData !== 'undefined') {
      console.log("manufacturerData", peripheral.advertisement);
      if (peripheral.advertisement.manufacturerData.toString('hex') === "4d49504f57") {
        // noble.stopScanning();
        console.log("Sending data about ", peripheral.advertisement.localName);
        webContents.send('discover', peripheral);
        // noble.startScanning();
        // need mechanism for timing out once all suspected devices have been found
      }
    }
    
  });


  mainWindow.loadURL('file://' + __dirname + '/../browser/index.html');
  mainWindow.webContents.on('did-finish-load', () => {
    console.log("Window Did Load");
    mainWindow.setTitle(app.getName());



  });
  mainWindow.on('closed', () => {
    console.log("Window Closed");
    mainWindow = null;
  });
});
