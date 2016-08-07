// config and logging modules
import * as C from './constants';
import {config} from './config';
import {log} from './logger';

// Modules for electron
import electron from 'electron';
import {app, BrowserWindow, ipcMain} from 'electron';

// bluetooth module
import noble from 'noble';
// util module
import util from 'util';
// cli arg parser
import yargs from 'yargs';

// local module for device storage and retrieval from persistent storage
import deviceStore from './device-store';
import {bulbStore} from './device-store';

// local module for handling bulb actions
import {Bulb} from './bulb';

(function() {
  'use strict';
  
  /* ------------------------------------------- */
  log.info('----------- Starting Bulb -----------');
  log.info('                 :');
  log.info('             \'.  _  .\'');
  log.info('            -=  (~)  =-');
  log.info('            .\'   #  \'.');
  log.info('');
  log.info('Electron Version', process.versions.electron);
  log.info('Chrome Version', process.versions.chrome);
  log.info('-------------------------------------');
  /* ------------------------------------------- */

  // yargs config @TODO
  let argv = yargs.usage('$0 <cmd> [args]').option('displaysize', {
      alias: 'd',
      describe: `Size to open the application window ${C.DISPLAYSIZE_SMALL}|${C.DISPLAYSIZE_MEDIUM}|${C.DISPLAYSIZE_LARGE}|${C.DISPLAYSIZE_FULL}`
    })
    .help('help').argv;
  // log.info('YAAARGS', argv, argv.displaysize);

  let win;

  let colorChar = null;
  let effectChar = null;
  let nameChar = null;
  
  
  process.on(C.PROCESS_UNCAUGHT_EXCEPTION, onProcessUncaughtException);
  
  function onProcessUncaughtException() {
    log.error('onProcessUncaughtException', arguments);
  }
  
  
  // handle quitting
  app.on(C.APP_WINDOW_ALL_CLOSED, onAppWindowAllClosed);
  app.on(C.APP_QUIT, onAppQuit);

  function onAppWindowAllClosed() {
    // force app termination on OSX when win has been closed
    if (process.platform == 'darwin') {
      app.quit();
    }
  }
  
  

  function onAppQuit() {
    disconnectAll();
  }

  function getWindowOptions(display) {
    let options = {};
    options = Object.assign(options, config.get('Window'));
    if (argv.displaysize) {
      Object.assign(options, config.get(`Args.DisplaySize.${argv.displaysize}`));
      
      // full screen needs x and y stripped out
      if (argv.displaysize === C.DISPLAYSIZE_FULL) {
        delete options.x;
        delete options.y;
      } 
    }
    return options;
  }

  // open window and handle event cycle
  app.on(C.APP_READY, () => {
    const {
      screen
    } = electron;
    log.info('App Ready');

    let primaryDisplay = screen.getPrimaryDisplay();

    win = new BrowserWindow(getWindowOptions(primaryDisplay));
    win.loadURL(`file://${process.cwd()}/browser/index.html`);

    // window events
    win.once(C.WINDOW_READY_TO_SHOW, onWindowReadyToShow);
    win.on(C.WINDOW_CLOSED, onWindowClosed);
    win.on(C.WINDOW_UNRESPONSIVE, onWindowUnresponsive);
    
    function onWindowReadyToShow() {
      log.debug('onWindowReadyToShow...');
      win.show();
    }
    
    function onWindowClosed() {
      log.info('onWindowClosed...');
      noble.stopScanning();
      win = null;
      app.quit();
    }
    
    function onWindowUnresponsive() {
      log.warn('onWindowUnresponsive...', arguments);
    }

    let webContents = win.webContents;

    webContents.openDevTools({
      mode: 'undocked'
    });
    
    // webContent events
    webContents.on(C.WEBCONTENTS_DID_FINISH_LOAD, onWebContentsDidFinishLoad);
    webContents.on(C.WEBCONTENTS_CRASHED, onWebContentsCrashed);

    function onWebContentsDidFinishLoad() {
      log.info('onWebContentsDidFinishLoad...');
      // noble.on('stateChange', (state) => {
      if (noble.state === 'poweredOn') {
        setTimeout(() => {
          noble.startScanning();
          webContents.send(C.IPC_SCANNING_START);
        }, 2000);
      }
      // });
      win.setTitle(app.getName());
    }
    
    function onWebContentsCrashed() {
      log.error('onWebContentsCrashed', arguments);
    }


    // adding ipcMain listeners
    ipcMain.on(C.IPC_SCAN_START, onIpcScanStart);
    ipcMain.on(C.IPC_SCAN_STOP, onIpcScanStop);
    ipcMain.on(C.IPC_DEVICE_CONNECT, onIpcDeviceConnect);
    ipcMain.on(C.IPC_DEVICE_DISCONNECT, onIpcDeviceDisconnect);
    ipcMain.on(C.IPC_DEVICE_CHARACTERISTICS_GET, onIpcDeviceGetCharacteristics);
    ipcMain.on(C.IPC_DEVICE_CHARACTERISTIC_SET, onIpcDeviceSetCharacteristic);
    ipcMain.on(C.IPC_DEVICE_GET, onIpcDeviceGet);
    ipcMain.on(C.IPC_DEVICE_GET_STORED, onIpcDeviceGetStored);
    ipcMain.on(C.IPC_DEVICE_SET_STORED, onIpcDeviceSetStored);
    ipcMain.on(C.IPC_DEV_TOOLS_OPEN, onIpcDevToolsOpen);

    ipcMain.on(C.IPC_GROUP_CONNECT, onIpcGroupConnect);
    ipcMain.on(C.IPC_GROUP_DISCONNECT, onIpcGroupDisconnect);
    ipcMain.on(C.IPC_GROUP_SET_STORED, onIpcGroupSetStored);
    ipcMain.on(C.IPC_GROUP_DELETE_STORED, onIpcGroupDeleteStored);
    ipcMain.on(C.IPC_GROUP_GET_STORED, onIpcGroupGetStored);
    // ipcMain.on(C.IPC_GROUP_GET_STORED_REPLY, onIpc);

    // ipcMain listener functions
    function onIpcScanStart() {
      log.info('onIpcScanStart...');
      // Start scanning only if already powered up.
      if (noble.state === 'poweredOn') {
        log.info('onScanStart... poweredOn ');
        noble.startScanning();
      } else {
        log.warn(`Cannot scan as the Bluetooth adapter is: ${noble.state}`);
      }
    }

    function onIpcScanStop() {
      // Stop scanning for devices.
      log.info('onScanStop... ');
      noble.stopScanning();
    }

    function onIpcDeviceConnect(event, deviceUUID) {
      log.info('onDeviceConnect...');
      connect(deviceUUID)
      .then((device) => {
        webContents.send(C.IPC_DEVICE_CONNECTED, device);
      })
      .catch((error) => {
        log.error(error);
        webContents.send(C.IPC_ERROR, error);
      });
    }

    function onIpcDeviceDisconnect(event, deviceUUID) {
      log.info('onDeviceDisconnect...');
      disconnect(deviceUUID);
    }
    
    function onIpcGroupConnect(event, group) {
      log.info('onIpcGroupConnect', group, group.devices.length);
      
      if (group.devices.length > 0) {
        log.debug('more than once device in group');
        let all = [];
        group.devices.forEach((deviceUUID) => {
          log.debug(`Calling connect for device ${deviceUUID}`);
          all.push(connect(deviceUUID));
        });
        log.debug('*************** ghroupConnect All promises', all);
        
        Promise.all(all).then(values => {
          log.debug('GroupConnect Promise.all ', values);
        }, error => {
          log.error('GroupConnect Promise.all failed ', error);
        }).catch(error => {
          log.error('GroupConnect Promise.all catch ', error);
        });
        
      } else {
        log.debug('less than once device in group');
        log.warn(`Group ${group.name} has no devices`);
      }
    }
    
    function onIpcGroupDisconnect(event, group) {
      log.info('onIpcGroupDisconnect', group);
    }

    function onIpcDeviceGetCharacteristics(event, deviceUUID) {
      log.info('onDeviceGetCharacteristics...');
      let device = deviceStore.getByUUID(deviceUUID);
      log.info('service and characteristic discovery from get');
      discoverServicesAndCharacteristics(device);
    }

    function onIpcDeviceSetCharacteristic(event, deviceUUID, value, type) {
      log.info('onDeviceSetCharacteristic...');
      // get the characteristic
      let device = deviceStore.getByUUID(deviceUUID);
      log.info('device.characteristic.set device', device);
      writeCharacteristic(value, type, deviceUUID).catch(error => {
        log.error('write catch error from set characteristic event', error);
      });
    }

    function onIpcDeviceGet(event, deviceUUID) {
      log.info('onDeviceGet...');
      log.info('ipc: device.get', event, deviceUUID, deviceStore.getByUUID(deviceUUID));
    }

    function onIpcDevToolsOpen(event, arg) {
      log.info('onDevToolsOpen...');
      win.openDevTools();
    }

    function onIpcDeviceGetStored(event) {
      log.info('onDeviceGetStored...');
      bulbStore.getStoredDevices().forEach((device, uuid) => {
        // log.info('onDeviceGetStored sending ', device, uuid);
        event.sender.send(C.IPC_DEVICE_GET_STORED_REPLY, device);
      });
    }

    function onIpcDeviceSetStored(event, device) {
      log.info('onIpcDeviceSetStored...', device);
      bulbStore.setStoredDevice(device);
    }
    
    
    

    function onIpcGroupSetStored(event, group) {
      log.info('onIpcGroupSetStored...', group);
      bulbStore.setStoredGroup(group);
    }

    function onIpcGroupDeleteStored(event, group) {
      bulbStore.deleteStoredGroup(group);
    }

    function onIpcGroupGetStored(event) {
      // log.info('onIpcGroupGetStored...', bulbStore.getStoredGroups());
      bulbStore.getStoredGroups().forEach((group, uuid) => {
        // log.info('onIpcGroupGetStored sending', group);
        event.sender.send(C.IPC_GROUP_GET_STORED_REPLY, group);
      });

    }


    // noble event listeners
    noble.on(C.NOBLE_DISCOVER, onNobleDiscovered);

    noble.on(C.NOBLE_SCAN_START, () => {
      log.info('noble on scanStart');
    });

    noble.on(C.NOBLE_SCAN_STOP, () => {
      log.info('noble on scanStop');
    });

    noble.on(C.NOBLE_WARNING, (message) => {
      log.warn('noble on warning', message);
    });

    function onNobleDiscovered(device) {
      log.info('onNobleDiscovered...');
      // check for Mipow devices
      if (typeof device.advertisement.manufacturerData !== 'undefined' && device.advertisement.manufacturerData.toString('hex') === config.get('Bulb.MipowManufacturerData')) {
        device = Bulb.discovered(device);
        // send notification to renderer that a device has been discovered
        webContents.send(C.IPC_DEVICE_DISCOVERED, bulbStore.serializeDevice(device));
      } else {
        log.info('onNobleDiscovered: Ignoring non bulb device');
      }
    }

    function connect(uuid, inGroup = false) {
      
      return new Promise((resolve, reject) => {
        noble.stopScanning();
        webContents.send(C.IPC_SCANNING_STOP);
        log.info('connect: to uuid', uuid);

        let device = bulbStore.getDiscoveredDeviceByUUID(uuid);
        // log.info('connect device:', device);
        if (device) {
          if (device.state == 'connected') {
            // @TODO need to send data about device is it is already connected
            log.info(`connect: device ${device.uuid} already connected`);
          } else if (typeof device.connect === 'function') {
            device.connect(error => {
              if (error) {
                log.error('connect: error', error);
              } else {
                // store the device as discovered
                bulbStore.setDiscoveredDevice(device);

                // update the local storage copy ??? is this needed?
                // bulbStore.setStoredDevice(device);
                
                // timout needed for device to respond after connect
                setTimeout(() => {
                  log.debug('Timeout before discoverServicesAndCharacteristics');
                  discoverServicesAndCharacteristics(device);
                }, C.NOBLE_DISCOVER_TIMEOUT);
                
                resolve(bulbStore.serializeDevice(device));
              }
            });
          } else {
            let errorMessage = `Device ${ device.name } [${ uuid }] not connectable.`;
            reject(errorMessage);
          }
        } else {
          let errorMessage = `Device unknown not connectable.`;
          reject(errorMessage);
        }
      });
      
    }

    function discoverServicesAndCharacteristics(device) {
      discoverSomeServicesAndCharacteristics(device);
      // discoverAllServicesAndCharacteristics(device);
    }

    function discoverSomeServicesAndCharacteristics(device) {
      log.info('discoverSomeServicesAndCharacteristics...');
      // just discover defined services and characteristics
      let serviceUUIDs = getConfigServiceUUIDs('CANDLE');
      let characteristicUUIDs = getConfigCharacteristicUUIDs('CANDLE');

      device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
        if (error) {
          log.error('discoverSomeServicesAndCharacteristics', error);
        }
        mapDiscoveredCharacteristics(device.uuid, characteristics);
      });
    }

    function discoverAllServicesAndCharacteristics(device) {
      log.debug('discoverAllServicesAndCharacteristics...');
      // discover all - useful for dev and sniffing
      device.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        if (error) {
          log.error('discoverAllServicesAndCharacteristics', error);
        }

        mapDiscoveredCharacteristics(device.uuid, characteristics);

        log.info('%%%%% ALL Services', services);
        log.info('%%%%% ALL Characteristics', characteristics);

        characteristics.map(c => {
          c.read((error, data) => {
            if (error) {
              log.error('Could not read characteristic', c.uuid, error);
            }

            log.info('ALL Characteristic data',
              'Characteristic UUID', c.uuid,
              'Service UUID', c._serviceUuid,
              'Name', c.name,
              'Type', c.type,
              'DATA', data,
              'DATA JSON', data.toJSON(),
              'DATA STRING', data.toString()
            );
            
          });
        });
      });
    }

    function mapDiscoveredService(deviceUUID, services) {
      try {
        services.map(service => {
          log.info('mapDiscoveredService: service', service.deviceUUID, service.name);
        });
      } catch (e) {
        log.error('mapDiscoveredService()', e);
      } finally {
        log.info('finally');
      }
    }

    function mapDiscoveredCharacteristics(deviceUUID, characteristics) {
      let device = bulbStore.getDiscoveredDeviceByUUID(deviceUUID);

      device.characteristics = {};
      characteristics.map(characteristic => {
        device = addCharacteristicToDevice(device, characteristic);
      });

      // log.info('mapDiscoveredCharacteristics device', device);

      if (device.characteristics.color && device.characteristics.effect && device.characteristics.name && device.characteristics.battery) {
        let all = [
          readCharacteristic('color', device.characteristics.color),
          readCharacteristic('effect', device.characteristics.effect),
          readCharacteristic('name', device.characteristics.name),
          readCharacteristic('battery', device.characteristics.battery)
        ];

        Promise.all(all).then(values => {
          let device = bulbStore.getDiscoveredDeviceByUUID(deviceUUID);
          // log.info('mapDiscoveredCharacteristics: have required characteristics', deviceUUID);
          // send notification of values to ui
          bulbStore.setDiscoveredDevice(device);

          device = bulbStore.serializeCharacteristics(deviceUUID, values);
          // log.info('+_+_+_+_+_+_+_+_+_+ mapDiscoveredCharacteristics: ', device.uuid, 'device serialized', device);
          webContents.send(C.IPC_DEVICE_DISCOVERED, device);
        }, error => {
          log.error('Promise.all failed ', error);
        }).catch(error => {
          log.error('Promise.all catch ', error);
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
      log.debug('readCharacteristic...');
      return new Promise((resolve, reject) => {
        characteristic.read((error, data) => {
          if (error) {
            log.error('Could not read characteristic', characteristic.uuid, error);
            reject('Could not read characteristic', error);
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
      log.debug('writeCharacteristic: ...', value, type, uuid);
      let device = bulbStore.getDiscoveredDeviceByUUID(uuid);
      let wChar = device.characteristics[type];
      log.info(`writeCharacteristic: Writing ${ type } Characteristic with value`, value);

      return new Promise((resolve, reject) => {
        log.info('writeCharacteristic: Promise', wChar);
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
        case 'color':
          buffer = new Buffer([value.saturation, value.red, value.green, value.blue]);
          break;
        case 'effect':
          buffer = new Buffer([value.saturation, value.red, value.green, value.blue, value.mode, '00', value.speed, '00']);
          break;
        case 'name':
          buffer = new Buffer(value);
          break;
      }
      return buffer;
    }

    function colorCharacteristicChange(data, isNotification) {
      log.info('change', data, isNotification);
    }

    function effectsCharacteristicChange(data, isNotification) {
      log.info('change', data, isNotification);
    }

    function nameCharacteristicChange(data, isNotification) {
      log.info('change', data, isNotification);
    }

  });

  function disconnect(device) {
    // log.info('disconnect()', device);
    // if uuid, look up device
    if (typeof device == 'string') {
      device = bulbStore.getDiscoveredDeviceByUUID(device);
    }

    // log.info('before Disconnecting', device.uuid);
    device.disconnect(error => {
      if (error) {
        log.error('Disconnection error:', error);
      }
      // log.info('Disconnected', device.uuid);
      device.connected = false;
      // send disconnect event to the render process
      if (win !== null) {
        win.webContents.send(C.IPC_DEVICE_DISCONNECTED, device);
      }

    });
  }

  function disconnectAll() {
    // log.info('disconnectAll');
    let discoveredDevices = bulbStore.getDiscoveredDevices();
    // log.info('disconnect devices', discoveredDevices);
    for (let uuid in discoveredDevices) {
      if (typeof discoveredDevices[uuid].disconnect === 'function') {
        disconnect(discoveredDevices[uuid]);
      }
    }
  }

  // utility functions
  function getConfigCharacteristicUUIDs(type) {
    return getUUIDfromConfig(type, 'characteristic');
  }

  function getConfigServiceUUIDs(type) {
    return getUUIDfromConfig(type, 'service');
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
