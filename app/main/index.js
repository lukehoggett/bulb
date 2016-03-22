/* jshint esnext: true */
(function() {
  'use strict';



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

  let log = bunyan.createLogger({
    name: 'bulb'
  });

  var mainWindow = null;

  var storedDevices = {};

  log.info("__dirname", __dirname + '/../data/');
  // initialise storage
  storage.initSync({
    dir: __dirname + '/../data/device-storage',
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,
    continuous: true,
    interval: false,
    ttl: false
  });

  // load all currently stored devices
  function loadDevicesFromStorage() {
    let storedDeviceKeys = storage.keys();
    storedDeviceKeys.forEach((uuid, index) => {

      let storedDevice = storage.getItem(uuid, (error, device) => {
        if (error) {
          console.error(error);
        }
      });

      log.info("loadDevicesFromStorage: StoredDevice UUID", storedDevice.uuid);

      storedDevice.stored = true;
      storedDevice.power = false;
      storedDevices[uuid] = storedDevice;
    });
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
      // width: 1000,
      height: 1200,
      // x: 2560,
      x: 4000,
      // x: 300,
      y: 100
    });

    var webContents = mainWindow.webContents;

    ipcMain.on('get-stored-devices', event => {
      let storedDeviceKeys = storage.keys();
      log.info("Stored Devices Requested by renderer");
      let devicesFromStorage = loadDevicesFromStorage();

      for (var uuid in devicesFromStorage) {
        if (devicesFromStorage.hasOwnProperty(uuid)) {
          event.sender.send('get-stored-devices-reply', devicesFromStorage[uuid], uuid);
        }
      }
    });

    ipcMain.on('scan.start', () => {
      // Start scanning only if already powered up.
      if (noble.state === 'poweredOn') {
        log.info('Starting scan... ');
        noble.startScanning();
      }
    });

    ipcMain.on('scan.stop', () => {
      // Stop scanning for devices.
      log.info('Stopping scan...');
      noble.stopScanning();
    });

    ipcMain.on('device.connect', (event, deviceUUID) => {
      noble.stopScanning();
      log.info("Connect: deviceUUID", deviceUUID);
      log.info("Connect: storedDevices", storedDevices[deviceUUID]);
      let device = storedDevices[deviceUUID];
      log.info("Connecting to device", device);

      device.connect(error => {
        if (error) {
          log.error("connect error", error);
        } else {
          log.info("Connected to device: ", deviceUUID, device);
          device.discoverAllServicesAndCharacteristics();
        }
      });
    });

    ipcMain.on('device.get-characteristics', (event, deviceUUID) => {
      let device = storedDevices[deviceUUID];
      device.discoverAllServicesAndCharacteristics();
    });

    ipcMain.on('device.set-name', (event, uuid, name) => {
      console.log('device.set-name', uuid, name);
    });

    ipcMain.on('device.get', (event, uuid) => {
      log.info(event, uuid, storedDevices[uuid]);
    });

    noble.on('discover', device => {

      if (typeof device.advertisement.manufacturerData !== 'undefined') {
        log.info("discovered manufacturerData", device.uuid);
        if (device.advertisement.manufacturerData.toString('hex') === "4d49504f57") {

          // on discovery check if device is in stored devices, if not update stored
          let match = storage.valuesWithKeyMatch(device.uuid);
          log.info(">>>>>>>>>>>>>> Match", match);
          if (match.length === 0) {
            log.info("Adding devic to storage");
            storage.setItem(device.uuid, serializeDevice(device), error => {
              if (error) {
                log.info("Storage error: ", error);
              }
            });
          }
          device.stored = true;
          device.power = true;
          // check if device is in the local variable and update storted devices local variable with some extra data (powered on etc)
          if (!(device.uuid in storedDevices)) {
            log.info("Device " + device.uuid + " not in local variable");
          }
          storedDevices[device.uuid] = device;

          // log.info(webContents);
          // send notification to renderer that a device has been dicovered
          let serializedDevice = serializeDevice(device);
          log.info("Sending discovered device to renderer", serializedDevice);
          webContents.send('discovered', serializedDevice);
        }
        log.info("===========================================");
      }
    });

    noble.on('servicesDiscover', mapDiscoveredService);

    function mapDiscoveredService(services) {
      log.info("mapDiscoveredService: services", services);
      services.map(service => {
        noble.on('characteristicsDiscover', mapDiscoveredCharacteristics);
      });
    }

    function mapDiscoveredCharacteristics(characteristics) {
      characteristics.map(characteristic => {

        log.info("characteristics", characteristics);
        // storedDevices[deviceUUID].services = services;
        // let serializedServices = serializeServices(deviceUUID);

        // event.sender.send('services', {deviceUUID: device.uuid, services: serializeServices(services)});
        // event.sender.send('characteristics', {deviceUUID: device.uuid, characteristics: characteristics});
      });
    }

    mainWindow.loadURL('file://' + __dirname + '/../browser/index.html');
    mainWindow.webContents.on('did-finish-load', () => {
      log.info("Window Did Load");
      mainWindow.setTitle(app.getName());
    });
    mainWindow.on('closed', () => {
      log.info("Window Closed");
      mainWindow = null;
    });

    function serializeDevice(device) {
      // Prepare a Noble device for serialization to send to a renderer process.
      // Copies out all the attributes the renderer might need.  Seems to be
      // necessary as Noble's objects don't serialize well and lose attributes when
      // pass around with the ipc class.
      log.info("Serializing device", device);
      return {
        id: device.id,
        name: device.advertisement.localName,
        address: device.address,
        state: device.state,
        advertisement: device.advertisement,
        rssi: device.rssi,
        uuid: device.uuid,
        addressType: device.addressType,
        connectable: device.connectable,
        power: device.power || false,
        stored: device.stored || false
      };
    }

    function serializeServices(uuid) {
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
      let device = storedDevices[uuid];
      log.info("serializeServices", device);
      let services = device.services.map(s => {
        return {
          uuid: s.uuid,
          name: s.name,
          type: s.type,
          characteristics: s.characteristics.map(c => {
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

  // function disconnectAll() {
  //  
  // }

  app.on('quit', function() {
    // Make sure device is disconnected before exiting.
    // disconnectAll();
  });
})();
