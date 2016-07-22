/* jshint esnext: true */
(function() {
  "use strict";

  // config and logging modules
  const config = require('./config').config;
  const log = require('./logger').log;

  // Modules for electron
  const electron = require("electron");
  const {
    app,
    BrowserWindow,
    ipcMain
  } = electron;
  // bluetooth module
  const noble = require("noble");
  // util module
  const util = require("util");
  // cli arg parser
  const yargs = require("yargs");

  // local module for device storage and retrieval from persistent storage
  const deviceStore = require("./device-store");
  const bulbStore = deviceStore.bulbStore;

  // local module for handling bulb actions
  const Bulb = require('./bulb').Bulb;



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

  let colorChar = null;
  let effectChar = null;
  let nameChar = null;

  // handle quitting
  app.on("window-all-closed", onAppWindowAllClosed);
  app.on("quit", onAppQuit);

  function onAppWindowAllClosed() {
    // force app termination on OSX when win has been closed
    if (process.platform == "darwin") {
      app.quit();
    }
  }

  function onAppQuit() {
    disconnectAll();
  }

  function getWindowOptions(display) {
    let options = config.get('Window');
    if (argv.displaysize) {
      Object.assign(options, config.get('Args.DisplaySize'));
    }
    return options;
  }

  // open window and handle event cycle
  app.on("ready", () => {
    const {
      screen
    } = electron;
    log.info("App Ready");

    let primaryDisplay = screen.getPrimaryDisplay();

    win = new BrowserWindow(getWindowOptions(primaryDisplay));
    win.loadURL("file://" + __dirname + "/../browser/index.html");

    // window events
    win.on("closed", onWindowClosed);


    let webContents = win.webContents;

    // we content events
    webContents.openDevTools({
      mode: "undocked"
    });
    webContents.on("did-finish-load", onWebContentsDidFinishLoad);


    function onWindowClosed() {
      log.info("Window Closed");
      noble.stopScanning();
      win = null;
      app.quit();
    }


    function onWebContentsDidFinishLoad() {
      log.info("onWebContentsDidFinishLoad...");
      // noble.on("stateChange", (state) => {
      if (noble.state === "poweredOn") {
        setTimeout(() => {
          noble.startScanning();
          webContents.send("scanning.start");
        }, 2000);
      }
      // });
      win.setTitle(app.getName());
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
      log.info("onIpcScanStart...");
      // Start scanning only if already powered up.
      if (noble.state === "poweredOn") {
        log.info("onScanStart... poweredOn ");
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
      log.info("onIpcGroupSetStored...", group);
      bulbStore.setStoredGroup(group);
    }

    function onIpcGroupDeleteStored(event, group) {
      bulbStore.deleteStoredGroup(group);
    }

    function onIpcGroupGetStored(event) {
      // log.info("onIpcGroupGetStored...", bulbStore.getStoredGroups());
      bulbStore.getStoredGroups().forEach((group, uuid) => {
        // log.info("onIpcGroupGetStored sending", group);
        event.sender.send("group.get.stored.reply", group);
      });

    }


    // noble event listeners
    noble.on("discover", onNobleDiscovered);

    noble.on('scanStart', () => {
      log.info("noble on scanStart");
    });

    noble.on('scanStop', () => {
      log.info("noble on scanStop");
    });

    noble.on('warning', (message) => {
      log.warn("noble on warning", message);
    });

    function onNobleDiscovered(device) {
      log.info("onNobleDiscovered...");
      // check for Mipow devices
      if (typeof device.advertisement.manufacturerData !== "undefined" && device.advertisement.manufacturerData.toString("hex") === config.get('Bulb.MipowManufacturerData')) {
        device = Bulb.discovered(device);
        // send notification to renderer that a device has been discovered
        webContents.send("device.discovered", bulbStore.serializeDevice(device));
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
          // @TODO need to send data about device is it is already connected
          log.info(`connect: device ${device.uuid} already connected`);
        } else if (typeof device.connect === "function") {
          device.connect(error => {
            if (error) {
              log.error("connect: error", error);
            } else {
              // send message to notify of connection
              // confirm method is correct one to use and whether we could just get teh value from the store
              log.info("connect: sending serialized device to renderer", bulbStore.serializeDevice(device));
              webContents.send("connected", bulbStore.serializeDevice(device));

              // store the device as discovered
              bulbStore.setDiscoveredDevice(device);

              // update the local storage copy ??? is this needed?
              // bulbStore.setStoredDevice(device);


              // @TODO fix up to use generic arrays for candle and color
              // log.info("connect: service and characteristic discovery", device);
              setTimeout(() => {
                log.info("Timeout before discoverServicesAndCharacteristics");
                discoverServicesAndCharacteristics(device);
              }, 100);
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
      log.info("discoverSomeServicesAndCharacteristics...");
      // just discover defined services and characteristics
      let serviceUUIDs = getConfigServiceUUIDs("CANDLE");
      let characteristicUUIDs = getConfigCharacteristicUUIDs("CANDLE");

      device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
        if (error) {
          log.error("discoverSomeServicesAndCharacteristics", error);
        }
        mapDiscoveredCharacteristics(device.uuid, characteristics);
      });
    }

    function discoverAllServicesAndCharacteristics(device) {
      log.debug("discoverAllServicesAndCharacteristics...");
      // discover all - useful for dev and sniffing
      device.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        if (error) {
          log.error("discoverAllServicesAndCharacteristics", error);
        }

        mapDiscoveredCharacteristics(device.uuid, characteristics);

        log.info("%%%%% ALL Services", services);
        log.info("%%%%% ALL Characteristics", characteristics);

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

      device.characteristics = {};
      characteristics.map(characteristic => {
        device = addCharacteristicToDevice(device, characteristic);
      });

      log.info("mapDiscoveredCharacteristics device", device);

      if (device.characteristics.color && device.characteristics.effect && device.characteristics.name && device.characteristics.battery) {
        let all = [
          readCharacteristic("color", device.characteristics.color),
          readCharacteristic("effect", device.characteristics.effect),
          readCharacteristic("name", device.characteristics.name),
          readCharacteristic("battery", device.characteristics.battery)
        ];

        Promise.all(all).then(values => {
          let device = bulbStore.getDiscoveredDeviceByUUID(deviceUUID);
          log.info("mapDiscoveredCharacteristics: have required characteristics", deviceUUID);
          // send notification of values to ui
          bulbStore.setDiscoveredDevice(device);

          device = bulbStore.serializeCharacteristics(deviceUUID, values);
          log.info("+_+_+_+_+_+_+_+_+_+ mapDiscoveredCharacteristics: ", device.uuid, "device serialized", device);
          webContents.send("device.discovered", device);
        }, error => {
          log.error("Promise.all failed ", error);
        }).catch(error => {
          log.error("Promise.all catch ", error);
        });
      }
    }

    function addCharacteristicToDevice(device, characteristic) {
      // @TODO handle color
      let typeConfig = config.get('Bulb.Types.CANDLE');

      switch (characteristic.uuid) {
        case typeConfig.color.characteristicUUID:
          device.characteristics.color = characteristic;
          break;
        case typeConfig.effects.characteristicUUID:
          device.characteristics.effect = characteristic;
          break;
        case typeConfig.name.characteristicUUID:
          device.characteristics.name = characteristic;
          break;
        case typeConfig.battery.characteristicUUID:
          device.characteristics.battery = characteristic;
          break;
      }
      return device;
    }

    function readCharacteristic(type, characteristic) {
      log.debug("readCharacteristic...");
      return new Promise((resolve, reject) => {
        characteristic.read((error, data) => {
          if (error) {
            log.error("Could not read characteristic", characteristic.uuid, error);
            reject("Could not read characteristic", error);
          }
          resolve({
            type: type,
            characteristic: characteristic,
            data: data
          });
        });
      });
    }

    function writeCharacteristic(value, type, uuid) {
      log.debug("writeCharacteristic: ...");
      let device = bulbStore.getDiscoveredDeviceByUUID(uuid);
      let wChar = device.characteristics[type];
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

  });

  function disconnect(device) {
    log.info("disconnect()", device);
    // if uuid, look up device
    if (typeof device == "string") {
      device = bulbStore.getDiscoveredDeviceByUUID(device);
    }

    log.info("before Disconnecting", device.uuid);
    device.disconnect(error => {
      if (error) {
        log.error("Disconnection error:", error);
      }
      log.info("Disconnected", device.uuid);
      device.connected = false;
      // send disconnect event to the render process
      if (win !== null) {
        win.webContents.send('device.disconnected', device);
      }

    });
  }

  function disconnectAll() {
    log.info("disconnectAll");
    let discoveredDevices = bulbStore.getDiscoveredDevices();
    log.info("disconnect devices", discoveredDevices);
    for (let uuid in discoveredDevices) {
      if (typeof discoveredDevices[uuid].disconnect === "function") {
        disconnect(discoveredDevices[uuid]);
      }
    }
  }

  // utility functions
  function getConfigCharacteristicUUIDs(type) {
    return getUUIDfromConfig(type, "characteristic");
  }

  function getConfigServiceUUIDs(type) {
    return getUUIDfromConfig(type, "service");
  }

  function getUUIDfromConfig(type, property) {
    let types = config.get(`Bulb.Types.${type}`);
    let uuids = [];
    for (let name in types) {
      let typeUUID = types[name][`${property}UUID`];
      if (uuids.indexOf(typeUUID) === -1) {
        uuids.push(typeUUID);
      }
    }
    uuids.sort();
    return uuids;
  }
})();
