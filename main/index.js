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
  const deviceStore = require("./device-store");
  const bulbStore = deviceStore.bulbStore;
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


  // log.info("BulbStore", deviceStore.bulbStore);




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
  
  let displaySizeArgs = {
    sm: {
      width: 800,
      height: 600
    },
    md: {
      width: 1280,
      height: 768
    },
    lg: {
      width: 1920,
      height: 1080
    },
    full: {
      fullscreen: true,
      frame: false
    }
  };


  const MIPOW_MANUFACTURER_DATA = "4d49504f57";
  let types = {
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
    if (argv.displaysize) {
      Object.assign(options, displaySizeArgs[argv.displaysize]);
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
    ipcMain.on("device.set.stored", onIpcDeviceSetStored);
    
    ipcMain.on("group.set.stored", onIpcGroupSetStored);
    ipcMain.on("group.delete.stored", onIpcGroupDeleteStored);
    ipcMain.on("group.get.stored", onIpcGroupGetStored);
    // ipcMain.on("group.get.stored.reply", onIpc);
    
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
      let device = deviceStore.getByUUID(deviceUUID);
      log.info("service and characteristic discovery from get");
      discoverServicesAndCharacteristics(device);
    }

    function onIpcDeviceSetCharacteristic(event, deviceUUID, value, type) {
      log.info("onDeviceSetCharacteristic...");
      // get the characteristic
      let device = deviceStore.getByUUID(deviceUUID);
      log.info("device.characteristic.set device \n", device);
      writeCharacteristic(value, type, deviceUUID).catch(error => {
        log.error("write catch error from set characteristic event", error);
      });
    }
    
    function onIpcDeviceGet(event, deviceUUID) {
      log.info("onDeviceGet...");
      log.info("ipc: device.get", event, deviceUUID, deviceStore.getByUUID(deviceUUID));
    }
    
    function onIpcDevToolsOpen(event, arg) {
      log.info("onDevToolsOpen...");
      win.openDevTools();
    }
    
    function onIpcDeviceGetStored(event) {
      log.info("onDeviceGetStored...");
      bulbStore.getStoredDevices().forEach((device, uuid) => {
        // log.info("onDeviceGetStored sending ", device, uuid);
        event.sender.send("device.get.stored.reply", device);
      });
    }
    
    function onIpcDeviceSetStored(event, device) {
      log.info("onIpcDeviceSetStored...", device);
      bulbStore.setStoredDevice(device);
    }
    
    function onIpcGroupSetStored(event, group) {
      log.info("onIpcGroupSetStored...");
      bulbStore.setStoredGroup(group);
    }
    
    function onIpcGroupDeleteStored(event, group) {
      bulbStore.deleteStoredGroup(group);
    }
    
    function onIpcGroupGetStored(event) {
      log.info("onIpcGroupGetStored...", bulbStore.getStoredGroups());
      bulbStore.getStoredGroups().forEach((group, uuid) => {
        log.info("onIpcGroupGetStored sending", group);
        event.sender.send("group.get.stored.reply", group);
      });
      
    }
    
    
    // noble event listeners
    noble.on("discover", onNobleDiscovered);
    
    function onNobleDiscovered(device) {
      log.info("onNobleDiscovered...");
      // check for Mipow devices
      if (typeof device.advertisement.manufacturerData !== "undefined" && device.advertisement.manufacturerData.toString("hex") === MIPOW_MANUFACTURER_DATA) {
        log.info("onNobleDiscovered: Discovered Playbulb device with UUID", device.uuid);
        
        // on discovery check if device is in stored devices, if not update stored
        if (!bulbStore.hasStoredDevice(device.uuid)) {
          // save discovered device to persistent storage
          bulbStore.setStoredDevice(device);
        }
        
        // add properties to the device
        device.discovered = true;

        // this is needed to add the noble extra object stuff that can't be stored in the persistent storage
        bulbStore.setDiscoveredDevice(device);

        // send notification to renderer that a device has been discovered
        log.info("onNobleDiscovered: sending discovered message to renderer", bulbStore.serializeDevice(device));
        webContents.send("discovered", bulbStore.serializeDevice(device));
        
      } else {
        log.info("onNobleDiscovered: Ignoring non bulb device");
      }
    }

    function connect(uuid) {
      noble.stopScanning();
      webContents.send("scanning.stop");
      log.info("connect: to uuid", uuid);

      let device = bulbStore.getDiscoveredDeviceByUUID(uuid);
      // log.info("connect device:", device);
      if (device) {
        if (device.state == 'connected') {
          log.info(`connect: device ${device.uuid} already connected`);
        } else if (typeof device.connect === "function") {
          device.connect(error => {
            if (error) {
              log.error("connect: error", error);
            } else {
              // send message to notify of connection
              // confirm method is correct one to use and whether we could just get teh value from the store
              log.info("connect: sending serialized device to renderer", bulbStore.serializeDevice(device), "\n\ndevice\n\n", device);
              webContents.send("connected", bulbStore.serializeDevice(device));
              
              // store the device as discovered
              bulbStore.setDiscoveredDevice(device);
              
              // update the local storage copy ??? is this needed?
              // bulbStore.setStoredDevice(device);
              
               
              // @TODO fix up to use generic arrays for candle and color
              log.info("connect: service and characteristic discovery", device);
              setTimeout(() => {
                log.info("Timeout before discoverServicesAndCharacteristics");
                discoverServicesAndCharacteristics(device);
              }, 50);
            }
          });
        } else {
          webContents.send("error", `Device ${ device.name } [${ uuid }] not connectable.`);
          log.error("Device not connectable");
        }
      } else {
        webContents.send("error", `Device unknown not connectable.`);
        log.error("Device unknown not connectable");
      }
      
    }

    function discoverServicesAndCharacteristics(device) {

      discoverSomeServicesAndCharacteristics(device);

      // discoverAllServicesAndCharacteristics(device);
    }
    
    function discoverSomeServicesAndCharacteristics(device) {
      // just discover known name, color and effects
      let serviceUUIDs = ["1800", "ff02"];
      let characteristicUUIDs = ["2a00", "fffb", "fffc"];
      log.info("discoverSomeServicesAndCharacteristics: ", serviceUUIDs, characteristicUUIDs);
      device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
        log.info("discoverSomeServicesAndCharacteristics: some");

        if (error) {
          log.error("discoverSomeServicesAndCharacteristics", error);
        }
        // log.info("Services", services);
        // log.info("Characteristics", characteristics);
        mapDiscoveredCharacteristics(device.uuid, characteristics);
      });
    }
    
    function discoverAllServicesAndCharacteristics(device) {
      // discover all - useful for dev and sniffing
      device.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        log.info("discoverServicesAndCharacteristics: all");
       
        if (error) {
          log.error("discoverAllServicesAndCharacteristics", error);
        }
        log.info("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        // log.info("%%%%% ALL Services", services);
        // log.info("%%%%% ALL Characteristics", characteristics);
        log.info("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        characteristics.map(c => {
          c.read((error, data) => {
            if (error) {
              log.error("Could not read characteristic", c.uuid, error);
            }
         
            log.info("ALL Characteristic data",
              "\nCharacteristic UUID", c.uuid,
              "\Service UUID", c._serviceUuid,
              "\nName", c.name,
              "\nType", c.type,
              "\nDATA", data,
              "\nDATA JSON", data.toJSON(),
              "\nDATA STRING", data.toString()
            );
          });
        });
      });
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
      let device = bulbStore.getDiscoveredDeviceByUUID(deviceUUID);
      log.info("mapDiscoveredCharacteristics: START \n\n", "deviceUUID\n\n", deviceUUID, "device\n\n", device);
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
      
      log.info("mapDiscoveredCharacteristics: END \n\n", "deviceUUID\n\n", deviceUUID, "device\n\n", device);

      if (device.characteristics.color && device.characteristics.effect && device.characteristics.name) {
        let all = [readCharacteristic("color", device.characteristics.color), readCharacteristic("effect", device.characteristics.effect), readCharacteristic("name", device.characteristics.name)];
log.info("BEFORE Promise All", device);
        Promise.all(all).then(values => {
          let device = bulbStore.getDiscoveredDeviceByUUID(deviceUUID);
          log.info("mapDiscoveredCharacteristics: have required characteristics", deviceUUID);
          // send notification of values to ui
          bulbStore.setDiscoveredDevice(device);
          
          log.info("3", device);
          device = bulbStore.serializeCharacteristics(deviceUUID, values);
          log.info("4", device);
          log.info("+_+_+_+_+_+_+_+_+_+ mapDiscoveredCharacteristics: sending updated data about discovered device to renderer uuid", device.uuid, "device serialized", device);
          webContents.send("discovered", device);
        }, error => {
          log.error("Promise.all failed ", error);
        }).catch(error => {
          log.error("Promise.all catch ", error);
        });
      }
    }
    
    function sendCharacteristicsToRenderer(values) {
      
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
      let wChar = bulbStore.getDiscoveredDeviceByUUID(uuid).characteristics[type];
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

    function disconnect(device) {
      if (typeof device == "string") {
        device = deviceStore.getByUUID(device);
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
    let discoveredDevices = bulbStore.getDiscoveredDevices;
    for (let uuid in discoveredDevices) {
      if (typeof discoveredDevices[uuid].disconnect === "function") {
        disconnect(discoveredDevices[uuid]);
      }
    }
  }

  app.on("quit", function () {
    // Make sure device is disconnected before exiting.
    disconnectAll();
  });
})();
