var __dirname = "/home/luke/Dropbox/projects/electron/bulb/app";
var APP_ROOT = "/home/luke/Dropbox/projects/electron/bulb/app";

var noble = require('noble');
var electron = require('electron');
var app = electron.app;
var async = require('async');
var dialog = require('dialog');
var os = require('os');

// var Playbulb = require('playbulb');

// var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.

// Report crashes to our server.
// require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    console.log("Electron Ready", process.versions['electron']);
    
    // Check running as root on Linux (usually required for noble).
    if (os.platform() === 'linux' && !runningAsRoot()) {
      // Throw an error dialog when not running as root.
      dialog.showErrorBox('Bulb', 'WARNING: This program should be run as a root user with sudo!');
    }
    
    playbulbExperiment();

    // playbulbExplore();
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1600, height: 1200});

    // // and load the index.html of the app.
    mainWindow.loadURL(__dirname + '/browser/index.html');

    // Open the devtools.
    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });
});

function playbulbExperiment() {
  console.log("playbulbExperiment()");
  noble.on('stateChange', function(state) {
    if (state == 'poweredOn') {
        noble.startScanning();
    }
  });
  
  noble.on('discover', function(peripheral) {
    // console.info(peripheral);
    noble.stopScanning();
    // console.log("Discovered peripheral", peripheral);
    
    peripheral.connect(function(err) {
      if (err) {
        throw err;
      }
      
      peripheral.discoverAllServicesAndCharacteristics();
      peripheral.on('servicesDiscover', function(services) {
        services.map(function(service) {
          service.on('characteristicsDiscover', function(characteristics) {
            characteristics.map(function(characteristic) {
              if (characteristic.uuid === 'fffc') {
                console.log(characteristic.uuid, characteristic)
                var r = 0, g = 0, b = 0; 
                var colorBytes = new Buffer([255, r, g, b]);
                characteristic.write(colorBytes, true, function(err) {
                  console.log(err);
                });
              }
            });
          });
        });
      });
    });
  });
}

// function playbulbExplore() {
//     console.log("Playbulb Exploring");
//     var pb = new Playbulb.PlaybulbCandle('04');
//     console.log("pb object ", pb);
//     pb.ready(function() {
//         // console.log("pb ready");
//         pb.setColor(0, 255, 0, 255); // set fixed color in Saturation, R, G, B
//     });
// 
// }
// 
function runningAsRoot() {
  // Check if the user is running as root on a POSIX platform (Linux/OSX).
  // Returns true if it can be determined the user is running as root, otherwise
  // false.
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    return process.getuid() === 0;
  }
  else {
    return false;
  }
}
