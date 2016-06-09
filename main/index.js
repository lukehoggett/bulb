/* jshint esnext: true */

// import electron from "electron"; 
import { app, BrowserWindow, ipcMain } from "electron";

(function () {
  "use strict";

  // const electron = require("electron");

  // Modules for electron
  // const {app, BrowserWindow, ipcMain} = electron;
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

  /* ------------------------------------------- */
  console.info("Electron Version", process.versions.electron);
  console.info("Chrome Version", process.versions.chrome);
  /* ------------------------------------------- */

  let log = bunyan.createLogger({
    name: "bulb"
  });

  let argv = yargs.usage("$0 <cmd> [args]").option("displaysize", {
    alias: "d",
    describe: "what size to open the application window sm|md|lg|full"
  })
  // .command("hello", "welcome ter yargs!", {}, function (argv) {
  //   log.info("hello", argv.name, "welcome to yargs!");
  // })
  .help("help").argv;

  log.info("YAAARGS", argv, argv.displaysize);

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

  // hold a local copy of augmented device objects
  let storedDevices = {};

  let colorChar = null;
  let effectsChar = null;
  let nameChar = null;

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

  function getWindowOptions(display) {

    let options = windowOptions;
    log.info("DISPLAY", display, display.bounds.width);
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

    log.info("Window Options ", options);

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

    webContents.on("did-finish-load", ev => {

      log.info("Did Finish Load");
      // noble.on("stateChange", (state) => {
      if (noble.state === "poweredOn") {
        setTimeout(() => {
          noble.startScanning();
          log.info("Noble State = poweredOn - Sending scanning");
          webContents.send("scanning.start");
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

    ipcMain.on("device.disconnect", (event, deviceUUID) => {
      disconnect(deviceUUID);
    });

    ipcMain.on("device.characteristics.get", (event, deviceUUID) => {

      let device = deviceStorage.getByUUID(deviceUUID);
      log.info("service and characteristic discovery from get");
      discoverServicesAndCharacteristics(device);
    });

    ipcMain.on("device.characteristic.get", (event, deviceUUID, characteristic) => {
      log.info("device.characteristic.get", deviceUUID, characteristic);
    });

    ipcMain.on("device.characteristic.set", (event, deviceUUID, characteristic, value, type) => {
      log.info("device.characteristic.set", deviceUUID, characteristic, value, type);
      writeCharacteristic(characteristic, value, type);
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
          device.discovered = true;
          // check if device is in the local variable and update stored devices local variable with some extra data (powered on etc)
          if (!(device.uuid in deviceStorage.getAll())) {
            log.info("Device " + device.uuid + " not in local variable");
          }

          // this is needed to add the noble extra object stuff that can't be stored in the persistent storage
          storedDevices[device.uuid] = device;
          // log.info("discover: updating stored devices", storedDevices);

          // send notification to renderer that a device has been discovered
          log.info("Discover: Sending updated data about discovered device to renderer", device.uuid);
          webContents.send("discovered", serializeDevice(device));

          // add listeners for service and characteristic discovery
          // device.once("servicesDiscover", mapDiscoveredService.bind(this, device.uuid));
        }
      }
    });

    function connect(uuid) {
      noble.stopScanning();
      webContents.send("scanning.stop");
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

            // device.on("servicesDiscover", mapDiscoveredService.bind(this, uuid));

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
      log.info("Discovering services and characteristics for ", serviceUUIDs, characteristicUUIDs);
      device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
        log.info("Discovering SOME services and characteristics");

        if (error) {
          log.error("discoverSomeServicesAndCharacteristics", error);
        }
        log.info("Services", services);
        log.info("Characteristics", characteristics);
        mapDiscoveredCharacteristics(device.uuid, characteristics);
      });

      // discover all - useful for dev and sniffing
      // device.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
      //   log.info("Discovering ALL services and characteristics");
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
        log.info("DISCOVER SERVICES START #######################################", services, deviceUUID);
        services.map(service => {
          log.info("mapDiscoveredService: service", service.deviceUUID, service.name);
          service.on("characteristicsDiscover", mapDiscoveredCharacteristics.bind(this, deviceUUID));
        });
        log.info("DISCOVER SERVICES END #######################################");
      } catch (e) {
        log.info("mapDiscoveredService()", e);
      } finally {
        log.info("finally");
      }
    }

    function mapDiscoveredCharacteristics(deviceUUID, characteristics) {

      log.info("DISCOVER CHARACTERISTICS START >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", deviceUUID);
      characteristics.map(characteristic => {
        if (characteristic.uuid === types.CANDLE.colorUuid) {
          colorChar = characteristic;
          // colorChar.on("read", colorCharacteristicChange);
        } else if (characteristic.uuid === types.CANDLE.effectsUuid) {
            effectsChar = characteristic;
            // colorChar.on("read", effectsCharacteristicChange);
          } else if (characteristic.uuid === types.CANDLE.nameUuid) {
              nameChar = characteristic;
              // colorChar.on("read", nameCharacteristicChange);
            }

        // storedDevices[deviceUUID].services = services;
        // let serializedServices = serializeServices(deviceUUID);

        // event.sender.send("services", {deviceUUID: device.uuid, services: serializeServices(services)});
        // event.sender.send("characteristics", {deviceUUID: device.uuid, characteristics: characteristics});
      });

      if (colorChar && effectsChar && nameChar) {
        log.info("Have all required characteristics, getting values");
        let all = [readCharacteristic("color", colorChar), readCharacteristic("effects", effectsChar), readCharacteristic("name", nameChar)];
        log.info(all);
        Promise.all(all).then(values => {
          log.info("Have all characteristics");
          // send notification of values to ui
          let device = serializeCharacteristics(deviceUUID, values);
          log.info("mapDiscoveredCharacteristics: Sending updated data about discovered device to renderer", device.uuid);
          webContents.send("discovered", device);
        }, error => {
          log.error("Promise.all failed ", error);
        }).catch(error => {
          log.error("Promise.all catch ", error.message, error.name);
        });
      }
      log.info("DISCOVER CHARACTERISTICS END >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    }

    function readCharacteristic(type, characteristic) {
      // log.info("readCharacteristic", characteristic);
      return new Promise((resolve, reject) => {
        characteristic.read((error, data) => {
          if (error) {
            log.error("Could not read characteristic", characteristic.uuid, error);
            reject("Could not read characteristic", error);
          }
          let saturation = Math.floor(Math.random() * 256);
          let r = Math.floor(Math.random() * 256);
          let g = Math.floor(Math.random() * 256);
          let b = Math.floor(Math.random() * 256);
          log.info("Color", saturation, r, g, b);

          // write color
          // let colorBytes = new Buffer([saturation, r, g, b]);
          // writeCharacteristic(characteristic, colorBytes, type)
          // .catch((error) => {
          //   log.error("write catch error", error);
          // });

          // write effect 
          let mode = "0" + (Math.floor(Math.random() * 4) + 1);
          let speed = "0" + (Math.floor(Math.random() * 2) + 1);
          let effectBytes = new Buffer([saturation, r, g, b, mode, "00", speed, "00"]);
          writeCharacteristic(characteristic, effectBytes, type).catch(error => {
            log.error("write catch error", error);
          });

          log.info(`Characteristic data for ${ type }`, characteristic.uuid, data.toJSON(), data);
          resolve({ type: type, characteristic: characteristic, data: data });
        });
      });
    }

    function writeCharacteristic(characteristic, value, type) {
      log.info(`Writing ${ type } Characteristic with value ${ value }`);
      return new Promise((resolve, reject) => {
        characteristic.write(value, true, error => {
          if (error) {
            let errorMessage = `Could not write characteristic ${ type } with value ${ value }. Error: ${ error }`;
            log.error(errorMessage);
            reject(errorMessage);
          }
          log.info(`Wrote characteristic ${ type } with value ${ value }`);
          resolve(true);
        });
      });
    }

    // function writeCharacteristic() {
    //   // let r = Math.floor(Math.random() * 256);
    //   // let g = Math.floor(Math.random() * 256);
    //   // let b = Math.floor(Math.random() * 256);
    //   // log.info("Color", r, g, b);
    //   // let colorBytes = new Buffer([0, r, g, b]);
    //   // colorChar.write(colorBytes, true, (error) => {
    //   //   if (error) {
    //   //     log.error("Could not color name characteristic");
    //   //   }
    //   //   // @TODO update stored device
    //   //   log.info("Wrote color characteristic");
    //   // });
    // }

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
      let device = serializeDevice(deviceStorage.getByUUID(deviceUUID));
      let charList = {};
      characteristicValues.forEach(c => {
        log.info(c.characteristic.uuid, c.type);
        charList[c.type] = {
          uuid: c.characteristic.uuid,
          name: c.characteristic.name,
          type: c.characteristic.type,
          value: c.data
        };
        log.info("####################### DATA", c.type, c.data);
      });
      device.characteristics = charList;
      // log.info("device", device);
      return device;
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
    for (let uuid in storedDevices) {
      if (typeof storedDevices[uuid].disconnect === "function") {

        // disconnect(storedDevices[uuid]);
      }
    }
  }

  app.on("quit", function () {
    // Make sure device is disconnected before exiting.
    disconnectAll();
  });
})();