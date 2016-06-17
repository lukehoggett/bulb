/* jshint esnext: true */
(function () {
  "use strict";

  const electron = require("electron");

  // Modules for electron
  const {app, BrowserWindow, ipcMain} = electron;
  // bluetooth module
  const noble = require("noble");
  // logging module
  const bunyan = require("bunyan");
  // util module
  const util = require("util");
  // local module for device storage and retrieval from persistent storage
  const deviceStorage = require("./device-storage");
  // cli arg parser
  const yargs = require("yargs");

  // configure bunyan logging
  let log = bunyan.createLogger({
    name: "bulb"
  });
  
  /* ------------------------------------------- */
  log.info("Electron Version", process.versions.electron);
  log.info("Chrome Version", process.versions.chrome);
  /* ------------------------------------------- */
  
  // yargs config @TODO
  let argv = yargs.usage("$0 <cmd> [args]").option("displaysize", {
    alias: "d",
    describe: "what size to open the application window sm|md|lg|full"
  })
  .help("help").argv;
  // log.info("YAAARGS", argv, argv.displaysize);

  let win;
  let windowOptions = {
    width: 2000,
    height: 1200,
    minwidth: 800,
    minHeight: 480,
    backgroundColor: "#000",
    x: 2560,
    y: 100
  };

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

  // hold a local copy of augmented (Noble) device objects
  let discoveredDevices = {};

  let colorChar = null;
  let effectChar = null;
  let nameChar = null;

  // handle quitting
  app.on("window-all-closed", onAppWindowAllClosed);
  
  function onAppWindowAllClosed() {
    // force app termination on OSX when win has been closed
    if (process.platform == "darwin") {
      app.quit();
    }
  }

  function getWindowOptions(display) {
    let options = windowOptions;
    if (parseInt(display.bounds.width) > 800 && false) {
      options.width = Math.floor(display.bounds.width * (2 / 3));
      options.height = Math.floor(display.bounds.height * (2 / 3));
    } else {
      // options.width = display.bounds.width;
      // options.height = display.bounds.height;
      options.width = 800;
      options.height = 480;
      options.frame = false;
    }
    return options;
  }

  // open window and handle event cycle
  app.on("ready", () => {
    const { screen } = electron;
    log.info("App Ready");

    let primaryDisplay = screen.getPrimaryDisplay();

    win = new BrowserWindow(getWindowOptions(primaryDisplay));

    let webContents = win.webContents;

    webContents.openDevTools({ mode: "undocked" });

    webContents.on("did-finish-load", onWebContentsDidFinishLoad);
    
    function onWebContentsDidFinishLoad() {
      log.info("Web contents finished loading");
      // noble.on("stateChange", (state) => {
      if (noble.state === "poweredOn") {
        setTimeout(() => {
          noble.startScanning();
          log.info("Noble State = poweredOn - Sending scanning");
          webContents.send("scanning.start");
        }, 1500);
      }
      // });
    }


    // adding ipcMain listeners
    ipcMain.on("scan.start", onIpcScanStart);
    ipcMain.on("scan.stop", onIpcScanStop);
    ipcMain.on("device.connect", onIpcDeviceConnect);
    ipcMain.on("device.disconnect", onIpcDeviceDisconnect);
    ipcMain.on("device.characteristics.get", onIpcDeviceGetCharacteristics);
    ipcMain.on("device.characteristic.set", onIpcDeviceSetCharacteristic);
    ipcMain.on("device.get", onIpcDeviceGet);
    ipcMain.on("dev.tools.open", onIpcDevToolsOpen);
    ipcMain.on("device.get.stored", onIpcDeviceGetStored);
    
    // ipcMain listener functions
    function onIpcScanStart() {
      // Start scanning only if already powered up.
      if (noble.state === "poweredOn") {
        log.info("onScanStart... ");
        noble.startScanning();
      }
    }
    
    function onIpcScanStop() {
      // Stop scanning for devices.
      log.info("onScanStop... ");
      noble.stopScanning();
    }
    
    function onIpcDeviceConnect(event, deviceUUID) {
      log.info("onDeviceConnect...");
      connect(deviceUUID);
    }
    
    function onIpcDeviceDisconnect(event, deviceUUID) {
      log.info("onDeviceDisconnect...");
      disconnect(deviceUUID);
    }
    
    function onIpcDeviceGetCharacteristics(event, deviceUUID) {
      log.info("onDeviceGetCharacteristics...");
      let device = deviceStorage.getByUUID(deviceUUID);
      log.info("service and characteristic discovery from get");
      discoverServicesAndCharacteristics(device);
    }

    function onIpcDeviceSetCharacteristic(event, deviceUUID, value, type) {
      log.info("onDeviceSetCharacteristic...");
      // get the characteristic
      let device = deviceStorage.getByUUID(deviceUUID);
      log.info("device.characteristic.set device \n", device);
      writeCharacteristic(value, type, deviceUUID).catch(error => {
        log.error("write catch error from set characteristic event", error);
      });
    }
    
    function onIpcDeviceGet(event, deviceUUID) {
      log.info("onDeviceGet...");
      log.info("ipc: device.get", event, deviceUUID, deviceStorage.getByUUID(deviceUUID));
    }
    
    function onIpcDevToolsOpen(event, arg) {
      log.info("onDevToolsOpen...");
      win.openDevTools();
    }
    
    function onIpcDeviceGetStored(event) {
      log.info("onDeviceGetStored...");
      // discoveredDevices = deviceStorage.getAll();
      let storedDevices = deviceStorage.getAll();
      for (var uuid in storedDevices) {
        if (storedDevices.hasOwnProperty(uuid)) {
          event.sender.send("device.get.stored.reply", storedDevices[uuid], uuid);
        }
      }
    }
    
    // noble event listeners
    noble.on("discover", onNobleDiscovered);
    
    function onNobleDiscovered(device) {
      log.info("onNobleDiscovered...");
      // check for Mipow devices
      if (typeof device.advertisement.manufacturerData !== "undefined" && device.advertisement.manufacturerData.toString("hex") === "4d49504f57") {
        log.info("onNobleDiscovered: Discovered Playbulb device with UUID", device.uuid);
        
        // on discovery check if device is in stored devices, if not update stored
        let match = deviceStorage.storage.valuesWithKeyMatch(device.uuid);
        if (match.length === 0) {
          // save discovered device to persistent storage
          log.info("onNobleDiscovered: Adding serialized device to storage", devie.uuid);
          deviceStorage.set(device.uuid, serializeDevice(device));
        }
        
        // add properties to the device
        device.stored = true;
        device.discovered = true;

        // this is needed to add the noble extra object stuff that can't be stored in the persistent storage
        discoveredDevices[device.uuid] = device;
        log.info("onNobleDiscovered: Updating stored devices", device.uuid);

        // send notification to renderer that a device has been discovered
        log.info("onNobleDiscovered: Sending updated data about discovered device to renderer", device.uuid);
        webContents.send("discovered", serializeDevice(device));
      }
    }

    function connect(uuid) {
      noble.stopScanning();
      webContents.send("scanning.stop");
      log.info("connect: to uuid", uuid);

      let device = discoveredDevices[uuid];
      // log.info("connect device:", device);
      if (device.state == 'connected') {
        log.info(`connect: device ${device.uuid} already connected`);
      } else if (typeof device.connect === "function") {
        device.connect(error => {
          if (error) {
            log.error("connect: error", error);
          } else {
            log.info("connect: success", uuid);
            log.info("connect: device", serializeDevice(device));
            // device.state = "connected";
            log.info("connect: serializedDevice", serializeDevice(device));
            // send message to notify of connection
            webContents.send("connected", serializeDevice(device));
            
            // store the device as discovered
            discoveredDevices[uuid] = device;
            
            // update the local storage copy
            deviceStorage.set(device.uuid, serializeDevice(device));
            
             
            // @TODO fix up to use generic arrays for candle and color
            log.info("service and characteristic discovery from connect");
            setTimeout(() => {
              log.info("Timeout before discoverServicesAndCharacteristics");
              discoverServicesAndCharacteristics(device);
            }, 50);
          }
        });
      } else {
        webContents.send("error", `Device ${ device.name } [${ uuid }] not connectable.`);
        log.error("Device not found");
      }
    }

    function discoverServicesAndCharacteristics(device) {

      // just discover known name, color and effects
      let serviceUUIDs = ["1800", "ff02"];
      let characteristicUUIDs = ["2a00", "fffb", "fffc"];
      log.info("discoverServicesAndCharacteristics: ", serviceUUIDs, characteristicUUIDs);
      device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
        log.info("discoverServicesAndCharacteristics: some");

        if (error) {
          log.error("discoverSomeServicesAndCharacteristics", error);
        }
        // log.info("Services", services);
        // log.info("Characteristics", characteristics);
        mapDiscoveredCharacteristics(device.uuid, characteristics);
      });

      // discover all - useful for dev and sniffing
      // device.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
      //   log.info("discoverServicesAndCharacteristics: all");
      //  
      //   if (error) {
      //     log.error("discoverAllServicesAndCharacteristics", error);
      //   }
      //   log.info("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
      //   // log.info("%%%%% ALL Services", services);
      //   // log.info("%%%%% ALL Characteristics", characteristics);
      //   log.info("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
      //   characteristics.map(c => {
      //     c.read((error, data) => {
      //       if (error) {
      //         log.error("Could not read characteristic", c.uuid, error);
      //       }
      //    
      //       log.info("ALL Characteristic data",
      //         "\nCharacteristic UUID", c.uuid,
      //         "\Service UUID", c._serviceUuid,
      //         "\nName", c.name,
      //         "\nType", c.type,
      //         "\nDATA", data,
      //         "\nDATA JSON", data.toJSON(),
      //         "\nDATA STRING", data.toString()
      //       );
      //     });
      //   });
      // });
    }

    function mapDiscoveredService(deviceUUID, services) {
      try {
        services.map(service => {
          log.info("mapDiscoveredService: service", service.deviceUUID, service.name);
        });
      } catch (e) {
        log.error("mapDiscoveredService()", e);
      } finally {
        log.info("finally");
      }
    }

    function mapDiscoveredCharacteristics(deviceUUID, characteristics) {
      let device = discoveredDevices[deviceUUID];
      log.info("mapDiscoveredCharacteristics: START \n\n", "deviceUUID\n\n", deviceUUID, "device\n\n", device, "discoveredDevices\n\n", discoveredDevices);
      device.characteristics = {};
      characteristics.map(characteristic => {
        
        if (characteristic.uuid === types.CANDLE.colorUuid) {
          device.characteristics.color = characteristic;
        } else if (characteristic.uuid === types.CANDLE.effectsUuid) {
          device.characteristics.effect = characteristic;
        } else if (characteristic.uuid === types.CANDLE.nameUuid) {
          device.characteristics.name = characteristic;
        }
      });
      
      log.info("mapDiscoveredCharacteristics: END \n\n", "deviceUUID\n\n", deviceUUID, "device\n\n", device, "discoveredDevices\n\n", discoveredDevices);

      if (device.characteristics.color && device.characteristics.effect && device.characteristics.name) {
        let all = [readCharacteristic("color", device.characteristics.color), readCharacteristic("effect", device.characteristics.effect), readCharacteristic("name", device.characteristics.name)];

        Promise.all(all).then(values => {
          log.info("mapDiscoveredCharacteristics: have required characteristics");
          // send notification of values to ui
          let device = serializeCharacteristics(deviceUUID, values);
          log.info("mapDiscoveredCharacteristics: sending updated data about discovered device to renderer uuid", device.uuid, "device serialized", device);
          webContents.send("discovered", device);
        }, error => {
          log.error("Promise.all failed ", error);
        }).catch(error => {
          log.error("Promise.all catch ", error.message, error.name);
        });
      }
    }

    function readCharacteristic(type, characteristic) {
      log.info("readCharacteristic...");
      return new Promise((resolve, reject) => {
        characteristic.read((error, data) => {
          if (error) {
            log.error("Could not read characteristic", characteristic.uuid, error);
            reject("Could not read characteristic", error);
          }
          resolve({ type: type, characteristic: characteristic, data: data });
        });
      });
    }

    function writeCharacteristic(value, type, uuid) {
      log.info("writeCharacteristic: ...");
      let wChar = discoveredDevices[uuid].characteristics[type];
      log.info(`writeCharacteristic: Writing ${ type } Characteristic with value`, value);
      
      return new Promise((resolve, reject) => {
        log.info("writeCharacteristic: Promise", wChar);
        wChar.write(getWriteValueBuffer(type, value), true, error => {
          if (error) {
            let errorMessage = `Could not write characteristic ${ type } with value ${ value }. Error: ${ error }`;
            log.error(errorMessage);
            reject(errorMessage);
          }
          log.info(`writeCharacteristic: wrote characteristic ${ type } with value`, value);
          resolve(true);
        });
      });
    }
    
    function getWriteValueBuffer(type, value) {
      let buffer = null;
      switch (type) {
        case "color":
          buffer = new Buffer([value.saturation, value.red, value.green, value.blue]);
          break;
        case "effect":
          buffer = new Buffer([value.saturation, value.red, value.green, value.blue, value.mode, "00", value.speed, "00"]);
          break;
        case "name":
          buffer = new Buffer(value);
          break;    
      }
      return buffer;
    }

    function colorCharacteristicChange(data, isNotification) {
      log.info("change", data, isNotification);
    }

    function effectsCharacteristicChange(data, isNotification) {
      log.info("change", data, isNotification);
    }

    function nameCharacteristicChange(data, isNotification) {
      log.info("change", data, isNotification);
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
        discovered: device.discovered || false,
        stored: device.stored || false,
        lastSeen: Date.now()
      };
    }

    function serializeCharacteristics(deviceUUID, characteristicValues) {
      // log.info("serializeCharacteristics", deviceUUID, characteristicValues);
      let device = serializeDevice(discoveredDevices[deviceUUID]);
      let charList = {};
      characteristicValues.forEach(c => {
        log.info(c.characteristic.uuid, c.type);
        charList[c.type] = {
          uuid: c.characteristic.uuid,
          name: c.characteristic.name,
          type: c.characteristic.type,
          value: c.data
        };
      });
      device.characteristics = charList;
      // log.info("device", device);
      return device;
    }

    function disconnect(device) {
      if (typeof device == "string") {
        device = deviceStorage.getByUUID(device);
      }
      log.info("Disconnecting", device.uuid);
      device.disconnect(error => {
        if (error) {
          log.error();
        }
        webContents.send("disconnected", serializeDevice(device));
      });
    }
  });

  function disconnectAll() {
    log.info("disconnectAll");
    for (let uuid in discoveredDevices) {
      if (typeof discoveredDevices[uuid].disconnect === "function") {

        // disconnect(discoveredDevices[uuid]);
      }
    }
  }

  app.on("quit", function () {
    // Make sure device is disconnected before exiting.
    disconnectAll();
  });
})();
