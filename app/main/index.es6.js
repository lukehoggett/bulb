'use strict';

/* jshint esnext: true */
let electron = require('electron');
let app = electron.app;
const ipcMain = require('electron').ipcMain;
let crashReporter = require('crash-reporter');
let BrowserWindow = require('browser-window');
let noble = require('noble');
const storage = require('node-persist');

crashReporter.start({
  productName: 'es6-ng-electron',
  companyName: 'FooBar',
  submitURL: 'http://localhost:3000/',
  autoSubmit: true
});

var mainWindow = null;

var storedDevices = {};

console.log(__dirname + '/../data/');
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

loadDevicesFromStorage();
// load all currently stored devices
function loadDevicesFromStorage() {
  console.log("loadDevicesFromStorage");
  let storedDeviceKeys = storage.keys();
  storedDeviceKeys.forEach(function(uuid, index) {
    
    let storedDevice = storage.getItem(uuid, function(error, device) {
      if (error) {
        console.error(error);
      }
    });
    
    console.log("loadDevicesFroStorage: StoredDevice UUID", storedDevice.uuid);
    
    storedDevice.stored = true;
    storedDevices[storedDevice.uuid] = storedDevice;
    
  });
  
  return storedDevices;
}

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
    width: 2000,
    height: 1200,
    x: 2560,
    // x: 300,
    y: 100
  });

  var webContents = mainWindow.webContents;
  
  ipcMain.on('request-stored-devices', function(event) {
    let storedDeviceKeys = storage.keys();
    let storedDevices = loadDevicesFromStorage();
    
    for (var uuid in storedDevices) {
      if (storedDevices.hasOwnProperty(uuid)) {
          event.sender.send('send-stored-devices', storedDevices[uuid], uuid);
      }
    }
  
  });
  
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

  ipcMain.on('connect', function(event, deviceUUID) {
    noble.stopScanning();
    var device = devices[deviceUUID];
    device.connect(function(error) {
      console.log("error", error);
      var characteristicsAndServices = device.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
        console.log("error", error);
        console.log("services", services);
        console.log("characteristics", characteristics);
        event.sender.send('services', {deviceUUID: device.uuid, services: serializeServices(services)});
        event.sender.send('characteristics', {deviceUUID: device.uuid, characteristics: characteristics});
      });
    });
  });
  
  ipcMain.on('get-characteristics', function(event, deviceUUID) {
    var device = storedDevices[deviceUUID];
    var characteristicsAndServices = device.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
      console.log("error", error);
      console.log("services", services);
      console.log("characteristics", characteristics);
    });
  });
  
  
  noble.on('discover', function(device) {
    
    if (typeof device.advertisement.manufacturerData !== 'undefined') {
      console.log("manufacturerData", device.advertisement);
      if (device.advertisement.manufacturerData.toString('hex') === "4d49504f57") {
        
        // check if the device is in the stored device
        devices.forEach(function(device, index) {
          console.log("onDiscover", device, index);
        })
        // store in persistent form for node
        storage.setItem(device.uuid, serializeDevice(device), function(error) {
          if (error) {
            console.log("Storage error: ", error);
          }
          storage.getItem(device.uuid, function(error, value) {
            console.log(error, value);
          });
        });
        
        console.log("Sending data about ", device.advertisement.localName, device.uuid);
        let serializedDevice = serializeDevice(device);
        devices[device.uuid] = device;
        webContents.send('discover', serializedDevice);
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
