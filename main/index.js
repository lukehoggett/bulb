/* jshint esnext: true */
(function() {
  "use strict";

  let electron = require("electron");
  let app = electron.app;
  const ipcMain = require("electron").ipcMain;
  // let crashReporter = require("crash-reporter");
  let BrowserWindow = require("browser-window");
  let noble = require("noble");
  let bunyan = require("bunyan");
  const util = require("util");

  // const storage = require("node-persist");
  const deviceStorage = require("./device-storage");
  // hold a local copy of augmented device objects
  let storedDevices = {};
  
  let log = bunyan.createLogger({
    name: "bulb"
  });
  
  let win;

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
  
  // open dev tools
  ipcMain.on("devTools", (event, arg) => {
    log.info("DevTools", arg);
    win.openDevTools();
  });

  // handle quitting
  app.on("window-all-closed", () => {
    // force app termination on OSX when win has been closed
    if (process.platform == "darwin") {
      app.quit();
    }
  });
  
  // open window and handle event cycle
  app.on("ready", () => {
    log.info("App Ready");
    win = new BrowserWindow({
      width: 2000,
      // width: 1000,
      height: 1200,
      x: 2560,
      // x: 4000,
      // x: 560,
      y: 100
    });

    var webContents = win.webContents;
    
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
      log.info("Stored Devices Requested by renderer");
      storedDevices = deviceStorage.getAll();
      for (var uuid in storedDevices) {
        if (storedDevices.hasOwnProperty(uuid)) {
          event.sender.send("get-stored-devices-reply", storedDevices[uuid], uuid);
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

      let device = deviceStorage.getByUUID(deviceUUID);
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
        let storedDevice = deviceStorage.getByUUID(uuid);
        storedDevice.name = name;
        storedDevice.advertisement.advertisement = name;
        log.info("))))))))))))))))))))", storedDevice, ")))))))))))))))))))))", serializeDevice(storedDevice), "((((((((((((((((()))))))))))))))))");
        // save device to persistent storage
        deviceStorage.set(uuid, serializeDevice(storedDevice));
        
      });
      // nameChar.once("write", true, arg => {
        // update storage and local devices
        // log.info(/*storedDevice, */storedDevice.advertisement);
        
      // });
    });

    ipcMain.on("device.get", (event, uuid) => {
      log.info("ipc: device.get", event, uuid, deviceStorage.getByUUID(uuid));
    });
    
    ipcMain.on("device.get-characteristics", (event, uuid) => {
      let device = deviceStorage.getByUUID(uuid);
      log.info("ipc: device.get-characteristics: ", uuid, device.state, device);
      // device.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
      //   log.info("Connect: discover services and characteristics", services, characteristics); 
      //   log.info("Discovering services and characteristics on connect");
      //   if (error) {
      //     log.error("discoverAllServicesAndCharacteristics", error);
      //   }
      // });
    });

    noble.on("discover", device => {

      if (typeof device.advertisement.manufacturerData !== "undefined") {
        
        if (device.advertisement.manufacturerData.toString("hex") === "4d49504f57") {
          log.info("Discovered Playbulb device with UUID", device.uuid);
          // on discovery check if device is in stored devices, if not update stored
          let match = deviceStorage.storage.valuesWithKeyMatch(device.uuid);
          if (match.length === 0) {
            // save discovered device to persistent storage
            let serializedDevice = serializeDevice(device);
            log.info("Adding serialized device to storage", serializedDevice);
            deviceStorage.set(device.uuid, serializedDevice);
          }
          
          device.stored = true;
          device.power = true;
          // check if device is in the local variable and update stored devices local variable with some extra data (powered on etc)
          if (!(device.uuid in deviceStorage.getAll())) {
            log.info("Device " + device.uuid + " not in local variable");
          }
          
          // this is needed to add the noble extra object stuff that can't be stored in the persistent storage
          storedDevices[device.uuid] = device;
          // log.info("discover: updating stored devices", storedDevices);

          // send notification to renderer that a device has been dicovered
          log.info("Sending updated data about discovered device to renderer:", device.uuid);
          webContents.send("discovered", serializeDevice(device));

          // add listeners for service and characteristic discovery
          // device.once("servicesDiscover", mapDiscoveredService.bind(this, device.uuid));

        }
      }
    });

    function connect(uuid) {
      noble.stopScanning();
      log.info("Connect: to uuid", uuid);
      let device = deviceStorage.getByUUID(uuid);
      if (typeof device.connect === "function") {
        device.connect(error => {
          if (error) {
            log.error("Connect: error", error);
          } else {
            log.info("Connect: success", uuid);
            
            // send message to notify of connection
            webContents.send("connected", serializeDevice(device));
            
            device.once("servicesDiscover", mapDiscoveredService.bind(this, uuid));
            
            // @TODO fix up to use generic arrays for candle and color
            let serviceUUIDs = ["1800", "ff02"];
            let characteristicUUIDs = ["2a00", "fffb", "fffc"];
            device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, error => { 
              log.info("Connect: discover services and characteristics"); 
              log.info("Discovering services and characteristics on connect");
              if (error) {
                log.error("discoverAllServicesAndCharacteristics", error);
              }
            });
          }
        });
        
      } else {
        log.error("Device not found");
      }
      
    }
    
    function mapDiscoveredService(deviceUUID, services) {
      log.info("DICOVER SERVICES START #######################################");
      services.map(service => {
        log.info("mapDiscoveredService: service", service.deviceUUID, service.name);
        service.once("characteristicsDiscover", mapDiscoveredCharacteristics.bind(this, deviceUUID));
      });
      log.info("DICOVER SERVICES END #######################################");
    }
    
    var colorChar = null, 
        effectsChar = null,
        nameChar = null;
        
    function mapDiscoveredCharacteristics(deviceUUID, characteristics) {
      
      log.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", deviceUUID);
      characteristics.map(characteristic => {
        if (characteristic.uuid === types.CANDLE.colorUuid) {
          colorChar = characteristic;
        } else if (characteristic.uuid === types.CANDLE.effectsUuid) {
          effectsChar = characteristic;
        } else if (characteristic.uuid === types.CANDLE.nameUuid) {
          nameChar = characteristic;
        }
        
        
        
        
        // storedDevices[deviceUUID].services = services;
        // let serializedServices = serializeServices(deviceUUID);

        // event.sender.send("services", {deviceUUID: device.uuid, services: serializeServices(services)});
        // event.sender.send("characteristics", {deviceUUID: device.uuid, characteristics: characteristics});
      });
      
      if (colorChar && effectsChar && nameChar) {
        log.info("Have all required characteristics, getting values");
        let all = [readCharacteristic(colorChar), readCharacteristic(effectsChar), readCharacteristic(nameChar)];
        log.info(all);
        Promise.all(all)
        .then(values => {
          log.info("All Values", values);
        });
        // readCharacteristic(effectsChar)
        // .then((data) => {
        //   log.info("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&7");
        //   log.info("Effects characteristic data then", data);
        //   log.info("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&7");
        // });
      }
      log.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    }
    
    function readCharacteristic(characteristic) {
      // log.info("readCharacteristic", characteristic);
      return new Promise((resolve, reject) => {
        characteristic.read((error, data) => {
          if (error) {
            log.error("Could not read characteristic", characteristic.uuid, error);
            reject("Could not read characteristic", error);
          }
          log.info("Characteristic data", characteristic.uuid, data.toJSON());
          resolve({characteristic: characteristic, data: data.toJSON()});
        });
      });
    }
    
    function writeCharacteristic() {
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
    }

    win.loadURL("file://" + __dirname + "/../browser/index.html");
    win.webContents.on("did-finish-load", () => {
      log.info("Window Did Load");
      win.setTitle(app.getName());
    });
    win.on("closed", () => {
      log.info("Window Closed");
      win = null;
      app.quit();
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
      let device = deviceStorage.getByUUID(uuid);
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
  
  function disconnect(device) {
    log.info("Disconnecting", device.uuid);
    device.disconnect(error => {
      if (error) {
        log.error();
      }
    });
  }

  function disconnectAll() {
    log.info("disconnectAll");
    for (let uuid in storedDevices) {
      if (typeof storedDevices[uuid].disconnect === "function") {
        
        disconnect(storedDevices[uuid]);
      }
    }
  }

  app.on("quit", function() {
    // Make sure device is disconnected before exiting.
    disconnectAll();
  });
})();
