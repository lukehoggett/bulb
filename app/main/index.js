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
    // width: 1280,
    // height: 1200,
    // x: 1280,
    // y: 100
    width: 1200,
    height: 800,
    x: 960,
    y: 100
  });

  var webContents = mainWindow.webContents;

  console.log("Setting noble state change listener what");
  noble.on('stateChange', state => {
    console.log("Noble State Change", state);

    if (state == 'poweredOn') {
      console.log("Startng Scan");
      noble.startScanning();
    } else {
      noble.stopScaning();
    }
  });

  noble.on('discover', function (peripheral) {

    webContents.send('discover', peripheral);
    // console.log("onDiscover", peripheral.advertisement.manufacturerData.toString('hex'), peripheral);
    // console.info(peripheral);
    // noble.stopScanning();
    // console.log("Discovered peripheral", peripheral);

    console.log('peripheral discovered (' + peripheral.id + ' with address <' + peripheral.address + ', ' + peripheral.addressType + '>,' + ' connectable ' + peripheral.connectable + ',' + ' RSSI ' + peripheral.rssi + ':');
    console.log('\thello my local name is:');
    console.log('\t\t' + peripheral.advertisement.localName);
    console.log('\tcan I interest you in any of the following advertised services:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));

    var serviceData = peripheral.advertisement.serviceData;
    if (serviceData && serviceData.length) {
      console.log('\there is my service data:');
      for (var i in serviceData) {
        console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
      }
    }
    if (peripheral.advertisement.manufacturerData) {
      console.log('\there is my manufacturer data:');
      console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
    }
    if (peripheral.advertisement.txPowerLevel !== undefined) {
      console.log('\tmy TX power level is:');
      console.log('\t\t' + peripheral.advertisement.txPowerLevel);
    }

    console.log();
    // peripheral.connect(function(err) {
    //   if (err) {
    //     throw err;
    //   }
    //  
    //   peripheral.discoverAllServicesAndCharacteristics();
    //   peripheral.on('servicesDiscover', function(services) {
    //     services.map(function(service) {
    //       service.on('characteristicsDiscover', function(characteristics) {
    //         characteristics.map(function(characteristic) {
    //           if (characteristic.uuid === 'fffc') {
    //             console.log(characteristic.uuid, characteristic)
    //             var r = 0, g = 0, b = 0;
    //             var colorBytes = new Buffer([255, r, g, b]);
    //             characteristic.write(colorBytes, true, function(err) {
    //               console.log(err);
    //             });
    //           }
    //         });
    //       });
    //     });
    //   });
    // });
  });

  // mainWindow.loadURL('file://' + __dirname + '/../browser/index.html');
  mainWindow.loadURL('file://' + __dirname + '/../browser/test.html');
  mainWindow.webContents.on('did-finish-load', () => {
    console.log("Window Did Load");
    mainWindow.setTitle(app.getName());
  });
  mainWindow.on('closed', () => {
    console.log("Window Closed");
    mainWindow = null;
  });
});