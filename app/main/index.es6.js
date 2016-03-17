'use strict';

/* jshint esnext: true */
let electron = require('electron');
let app = electron.app;
const ipcMain = require('electron').ipcMain;
let crashReporter = require('crash-reporter');
let BrowserWindow = require('browser-window');
let noble = require('noble');
let bunyan = require('bunyan');

const storage = require('node-persist');

crashReporter.start({
  productName: 'es6-ng-electron',
  companyName: 'FooBar',
  submitURL: 'http://localhost:3000/',
  autoSubmit: true
});

let log = bunyan.createLogger(
  {name: 'bulb'}
);

var mainWindow = null;

var storedDevices = {};

log.info(__dirname + '/../data/');
// initialise storage
storage.initSync({
    dir: __dirname + '/../data/device-storage',
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,  // can also be custom logging function
    continuous: true,
    interval: false,
    ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
});

// get the keys (UUIDs) of all the devices in persistent storage 

// loadDevicesFromStorage();

// load all currently stored devices
function loadDevicesFromStorage() {
  log.info("loadDevicesFromStorage");
  let storedDeviceKeys = storage.keys();
  storedDeviceKeys.forEach(function(uuid, index) {
    
    let storedDevice = storage.getItem(uuid, function(error, device) {
      if (error) {
        console.error(error);
      }
    });
    
    log.info("loadDevicesFromStorage: StoredDevice UUID", storedDevice.uuid);
    
    storedDevice.stored = true;
    storedDevice.power = false;
    storedDevices[storedDevice.uuid] = storedDevice;
    
  });
  log.info("Stored", storedDevices);
  return storedDevices;
}

ipcMain.on('crash', (event, arg) => {
  log.info("Crash", arg);
  process.crash(arg);
});

ipcMain.on('devTools', (event, arg) => {
  log.info("DevTools", arg);
  mainWindow.openDevTools();
});

app.on('window-all-closed', () => {
  // force app termination on OSX when mainWindow has been closed
  if (process.platform == 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  log.info("App Ready");
  mainWindow = new BrowserWindow({
    width: 2000,
    height: 1200,
    x: 2560,
    // x: 300,
    y: 100
  });

  var webContents = mainWindow.webContents;
  
  ipcMain.on('get-stored-devices', function(event) {
    let storedDeviceKeys = storage.keys();
    log.info("Stored Devices Requested by renderer");
    let storedDevices = loadDevicesFromStorage();
    
    for (var uuid in storedDevices) {
      if (storedDevices.hasOwnProperty(uuid)) {
          event.sender.send('get-stored-devices-reply', storedDevices[uuid], uuid);
      }
    }
  });
  
  ipcMain.on('startScan', function() {
    // Start scanning only if already powered up.
    if (noble.state === 'poweredOn') {
      log.info('Starting scan... ');
      noble.startScanning();
    }
  });

  ipcMain.on('stopScan', function() {
    // Stop scanning for devices.
    log.info('Stopping scan...');
    noble.stopScanning();
  });

  ipcMain.on('connect', function(event, deviceUUID) {
    noble.stopScanning();
    var device = devices[deviceUUID];
    device.connect(function(error) {
      log.info("error", error);
      var characteristicsAndServices = device.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
        log.info("error", error);
        log.info("services", services);
        log.info("characteristics", characteristics);
        event.sender.send('services', {deviceUUID: device.uuid, services: serializeServices(services)});
        event.sender.send('characteristics', {deviceUUID: device.uuid, characteristics: characteristics});
      });
    });
  });
  
  ipcMain.on('get-characteristics', function(event, deviceUUID) {
    var device = storedDevices[deviceUUID];
    var characteristicsAndServices = device.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
      log.info("error", error);
      log.info("services", services);
      log.info("characteristics", characteristics);
    });
  });
  
  
  noble.on('discover', function(device) {
    
    if (typeof device.advertisement.manufacturerData !== 'undefined') {
      // log.info("manufacturerData", device.advertisement);
      if (device.advertisement.manufacturerData.toString('hex') === "4d49504f57") {
        
        
        // on dicovery check if device is in stored devices, if not update stored
        let match = storage.valuesWithKeyMatch(device.uuid);
        log.info("Match storage", match);
        if (match.length === 0) {
          storage.setItem(device.uuid, serializeDevice(device), function(error) {
            if (error) {
              log.info("Storage error: ", error);
            }
          });
        }
        
        // check if device is in the local variable and update storted devices local variable with some extra data (powered on etc)
        if (device.uuid in storedDevices) {
          log.info("Device " +  device.uuid + " in local varaible");
        }
        // send notification to renderer that a device has been dicovered
        
        
        
        // check if the device is in the stored device, 
        // need to also check if it is changed
        // let deviceIsStored = false;
        // let deviceisUptoDate = false;
        // for (var uuid in storedDevices) {
        //   if (storedDevices.hasOwnProperty(uuid)) {
        //     if (device.uuid === uuid && storedDevices[uuid] == serializeDevice(device)) {
        //       deviceisUptoDate = true;
        //     }
        //     log.info(deviceisUptoDate, "storedDevice", storedDevices[uuid]);
        //     log.info("~~~~~~~~~~~~~~~~~~~");
        //     log.info("scanned device", serializeDevice(device));
        //     log.info("~~~~~~~~~~~~~~~~~~~");
        //     // if () {
        //     //   deviceIsStored = true;
        //     // }
        //   }
        // }
        // log.info("Device ", device.uuid, "isStored", deviceIsStored, " is up to date", deviceisUptoDate);
        // 
        // 
        // // store in persistent form for node
        // // this might cover update but doesn't determine whetehr to re-send
        // 
        // 
        // if (!deviceIsStored) {
        //   log.info(">>> Sending data about ", device.advertisement.localName, device.uuid);
        //   let serializedDevice = serializeDevice(device);
        //   serializedDevice.power = true;
        //   // devices[device.uuid] = device;
        //   
        // }
        // 
        // webContents.send('discover', serializedDevice.uuid);
        
        // noble.startScanning();
        // need mechanism for timing out once all suspected devices have been found
      }
    }
    log.info("===========================================");
  });
  
  


  mainWindow.loadURL('file://' + __dirname + '/../browser/index.html');
  mainWindow.webContents.on('did-finish-load', () => {
    log.info("Window Did Load");
    mainWindow.setTitle(app.getName());



  });
  mainWindow.on('closed', () => {
    log.info("Window Closed");
    mainWindow = null;
  });
  
  function serializeDevice(device/*, index*/) {
    // Prepare a Noble device for serialization to send to a renderer process.
    // Copies out all the attributes the renderer might need.  Seems to be
    // necessary as Noble's objects don't serialize well and lose attributes when
    // pass around with the ipc class.
  
    return {
      id: device.id,
      name: device.advertisement.localName,
      address: device.address,
      state: device.state,
      advertisement: device.advertisement,
      rssi: device.rssi,
      uuid:device.uuid,
      address:device.address,
      addressType:device.addressType,
      connectable:device.connectable/*,
      index: index*/
    };
  }

  function serializeServices(index) {
    // Prepare all the services & characteristics for a device to be serialized
    // and sent to the rendering process.  This will be an array of service objects
    // where each one looks like:
    //  { uuid: <service uuid, either short or long>,
    //    name: <friendly service name, if known>,
    //    type: <service type, if known>
    //    characteristics: [<list of characteristics (see below)>] }
    //
    // For each service its characteristics attribute will be a list of
    // characteristic objects that look like:
    //  { uuid: <char uuid>,
    //    name: <char name, if known>
    //    type: <char type, if known>
    //    properties: [<list of properties for the char>],
    //    value: <last known characteristic value, or undefined if not known>
    //  }
    let device = devices[index];
    let services = device.services.map(function(s) {
      return {
        uuid: s.uuid,
        name: s.name,
        type: s.type,
        characteristics: s.characteristics.map(function(c) {
          return {
            uuid: c.uuid,
            name: c.name,
            type: c.type,
            properties: c.properties
          };
        })
      };
    });
    return services;
  }
});
