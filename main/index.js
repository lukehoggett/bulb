/* jshint esnext: true */
(function() {
  "use strict";

  let electron = require("electron");
  let app = electron.app;
  const ipcMain = require("electron").ipcMain;
  let crashReporter = require("crash-reporter");
  let BrowserWindow = require("browser-window");
  let noble = require("noble");
  let bunyan = require("bunyan");
  const util = require("util");

  const storage = require("node-persist");

  crashReporter.start({
    productName: "bulb",
    companyName: "FooBar",
    submitURL: "http://localhost:3000/",
    autoSubmit: true
  });

  let log = bunyan.createLogger({
    name: "bulb"
  });

  var mainWindow = null;

  var storedDevices = {};
  
  var types = {
    COLOR: {
        colorUuid: "0018",
        effectsUuid: "0016",
        modes: {
            FLASH: 0,
            PULSE: 1,
            RAINBOWJUMP: 2,
            RAINBOWFADE: 3
        },
        nameUuid: "001c"
    },
    CANDLE: {
        colorUuid: "fffc",
        effectsUuid: "fffb",
        modes: {
            FADE: 0,
            JUMPRGB: 1,
            FADERGB: 2,
            FLICKER: 3
        },
        nameUuid: "2a00"
    }
};

  log.info("__dirname", __dirname + "/../data/");
  // initialise storage
  storage.initSync({
    dir: __dirname + "/../data/device-storage",
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: "utf8",
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

  ipcMain.on("crash", (event, arg) => {
    log.info("Crash", arg);
    process.crash(arg);
  });

  ipcMain.on("devTools", (event, arg) => {
    log.info("DevTools", arg);
    mainWindow.openDevTools();
  });

  app.on("window-all-closed", () => {
    // force app termination on OSX when mainWindow has been closed
    if (process.platform == "darwin") {
      app.quit();
    }
  });

  app.on("ready", () => {
    log.info("App Ready");
    mainWindow = new BrowserWindow({
      width: 2000,
      // width: 1000,
      height: 1200,
      // x: 2560,
      // x: 4000,
      x: 560,
      y: 100
    });

    var webContents = mainWindow.webContents;
    
    webContents.openDevTools();
    
    webContents.on("did-finish-load", (ev) => {
      
      log.info("Did Finish Load");
      // noble.on("stateChange", (state) => {
        if (noble.state === "poweredOn") {
          setTimeout(() => {
            noble.startScanning();
            log.info("Noble State = poweredOn - Sending scanning");
            webContents.send("scanning");
          }, 1500);
          
        }
      // });
    });
    
    
    

    ipcMain.on("get-stored-devices", event => {
      let storedDeviceKeys = storage.keys();
      log.info("Stored Devices Requested by renderer");
      let devicesFromStorage = loadDevicesFromStorage();

      for (var uuid in devicesFromStorage) {
        if (devicesFromStorage.hasOwnProperty(uuid)) {
          event.sender.send("get-stored-devices-reply", devicesFromStorage[uuid], uuid);
        }
      }
    });

    ipcMain.on("scan.start", () => {
      // Start scanning only if already powered up.
      if (noble.state === "poweredOn") {
        log.info("Starting scan... ");
        noble.startScanning();
      }
    });

    ipcMain.on("scan.stop", () => {
      // Stop scanning for devices.
      log.info("Stopping scan...");
      noble.stopScanning();
    });

    ipcMain.on("device.connect", (event, deviceUUID) => {
      connect(deviceUUID);
    });

    ipcMain.on("device.characteristics.get", (event, deviceUUID) => {

      let device = storedDevices[deviceUUID];
      log.info("device.characteristics.get", deviceUUID, device);
      device.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        if (error) {
          console.error(error);
        }
        log.info(">>>>>>>>>>>>>>>>> services", services, ">>>>>>>>>>>>>> characteristics", characteristics);
        
      });
    });
    
    ipcMain.on("device.characteristic.get", (event, deviceUUID, characteristic) => {
      log.info("device.characteristic.get", deviceUUID, characteristic);
    });

    ipcMain.on("device.set-name", (event, uuid, name) => {
      log.info("device.set-name", uuid, name, nameChar);
      var data = new Buffer(name);
      nameChar.write(data, true, error => {
        if (error) {
          console.error("Write Error");
        }
        
        connect(uuid);
        storedDevices[uuid].name = name;
        storedDevices[uuid].advertisement.advertisement = name;
        log.info("))))))))))))))))))))", storedDevices[uuid], ")))))))))))))))))))))", serializeDevice(storedDevices[uuid]), "((((((((((((((((()))))))))))))))))");
        storage.setItem(uuid, serializeDevice(storedDevices[uuid]), error => {
          if (error) {
            log.info("Storage error: on name change", error);
          }
        });
      });
      // nameChar.once("write", true, arg => {
        // update storage and local devices
        // log.info(/*storedDevices[uuid], */storedDevices[uuid].advertisement);
        
      // });
    });

    ipcMain.on("device.get", (event, uuid) => {
      log.info(event, uuid, storedDevices[uuid]);
    });

    noble.on("discover", device => {

      if (typeof device.advertisement.manufacturerData !== "undefined") {
        log.info("Discovered device with UUID", device.uuid);
        if (device.advertisement.manufacturerData.toString("hex") === "4d49504f57") {
          log.info("Device matches mipow device");
          // on discovery check if device is in stored devices, if not update stored
          let match = storage.valuesWithKeyMatch(device.uuid);
          if (match.length === 0) {
            log.info("Adding device to storage");
            let serializedDevice = serializeDevice(device);
            log.info("serializedDevice", serializedDevice);
            storage.setItem(device.uuid, serializedDevice, error => {
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
          log.info("Sending discovered device to renderer", device.uuid);
          webContents.send("discovered", serializedDevice);

          // add listeners for service and characteristic discovery
          device.once("servicesDiscover", mapDiscoveredService.bind(this, device.uuid));

        }
        log.info("===========================================");
      }
    });
    
    function getDeviceFromUUID(uuid) {
      return storedDevices[uuid];
    }

    function connect(uuid) {
      noble.stopScanning();
      log.info("Connect: deviceUUID", uuid);
      let device = getDeviceFromUUID(uuid);
      if (typeof device.connect === "function") {
        device.connect(error => {
          if (error) {
            log.error("Connect error", error);
          } else {
            log.info("Connected to device: ", uuid);
            // send message to notify of connection
            webContents.send("connected", serializeDevice(device));
            
            // @TODO fix up to use generic arrays for candle and color
            let serviceUUIDs = ["1800", "ff02"];
            let characteristicUUIDs = ["2a00", "fffb", "fffc"];
            device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, error => {  
              
              log.info("Discovering services and characteristics on connect");
              if (error) {
                console.error("discoverAllServicesAndCharacteristics", error);
              }
            });
          }
        });
      } else {
        log.info("Device not found");
      }
      
    }
    
    function disconnect(uuid) {
      let device = getDeviceFromUUID(uuid);
      
      device.disconnect(error => {
        if (error) {
          console.error();
        }
      });
    }

    function mapDiscoveredService(deviceUUID, services) {
      log.info("UUIDUUIDUUID", deviceUUID, services);
      log.info("SERVICES START #######################################");
      services.map(service => {
        log.info("mapDiscoveredService: service", service.deviceUUID, service.name);
        service.once("characteristicsDiscover", mapDiscoveredCharacteristics.bind(this, deviceUUID));
      });
      log.info("SERVICES END #######################################");
    }
    
    var colorChar = null, 
        effectsChar = null,
        nameChar = null;
        
    function mapDiscoveredCharacteristics(deviceUUID, characteristics) {
      
      log.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", deviceUUID);
      characteristics.map(characteristic => {
          if (characteristic.uuid === types.CANDLE.colorUuid) {
            colorChar = characteristic;
            log.info("+++++ color characteristic", util.inspect(colorChar, { showHidden: true, depth: 2 }));
            colorChar.read((error, data) => {
              if (error) {
                log.error("Could not read characteristic", error);
              } 
              log.info("color Char data", data.toJSON());
              // let r = Math.floor(Math.random() * 256);
              // let g = Math.floor(Math.random() * 256);
              // let b = Math.floor(Math.random() * 256);
              // log.info("Color", r, g, b);
              // let colorBytes = new Buffer([0, r, g, b]);
              // colorChar.write(colorBytes, true, (error) => {
              //   if (error) {
              //     log.error("Could not color name characteristic");
              //   }
              //   // @TODO update stored device
              //   log.info("Wrote color characteristic");
              // });
            });
          } else if (characteristic.uuid === types.CANDLE.effectsUuid) {
            effectsChar = characteristic;
            log.info("+++++ effects characteristic", util.inspect(effectsChar, { showHidden: true, depth: 2 }));
            effectsChar.read((error, data) => {
              if (error) {
                log.error("Could not read characteristic", error);
              } 
              log.info("effects Char data", data.toJSON());
            });
          } else if (characteristic.uuid === types.CANDLE.nameUuid) {
            nameChar = characteristic;
            log.info("+++++ name characteristic", util.inspect(nameChar, { showHidden: true, depth: 2 }));
            nameChar.read((error, data) => {
            if (error) {
              log.error("Could not read characteristic", error);
            } 
            log.info("name Char data", data.toString());
            // nameChar.write(new Buffer("hello"), false, (error) => {
            //   if (error) {
            //     log.error("Could not write name characteristic");
            //   }
            //   // @TODO update stored device
            //   log.info("Wrote name characteristic");
            // });
           });
          }
        
        
        
        
        // storedDevices[deviceUUID].services = services;
        // let serializedServices = serializeServices(deviceUUID);

        // event.sender.send("services", {deviceUUID: device.uuid, services: serializeServices(services)});
        // event.sender.send("characteristics", {deviceUUID: device.uuid, characteristics: characteristics});
      });
      log.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    }

    mainWindow.loadURL("file://" + __dirname + "/../browser/index.html");
    mainWindow.webContents.on("did-finish-load", () => {
      log.info("Window Did Load");
      mainWindow.setTitle(app.getName());
    });
    mainWindow.on("closed", () => {
      log.info("Window Closed");
      mainWindow = null;
    });

    function serializeDevice(device) {
      // Prepare a Noble device for serialization to send to a renderer process.
      // Copies out all the attributes the renderer might need.  Seems to be
      // necessary as Noble"s objects don"t serialize well and lose attributes when
      // pass around with the ipc class.
      // log.info("Serializing device", device);
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
        stored: device.stored || false,
        lastSeen: Date.now()
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

  app.on("quit", function() {
    // Make sure device is disconnected before exiting.
    // disconnectAll();
  });
})();
