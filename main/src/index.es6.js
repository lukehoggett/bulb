// config and logging modules
import * as C from './constants';
import {
  config
} from './config';
import {
  log
} from './logger';

// Modules for electron
import electron from 'electron';
import {
  app,
  BrowserWindow,
  ipcMain
} from 'electron';

// bluetooth module
import noble from 'noble';
// util module
import util from 'util';
// cli arg parser
import yargs from 'yargs';

// local module for device storage and retrieval from persistent storage
import deviceCache from './device-store';
import {
  bulbStore
} from './device-store';

// local module for handling bulb actions
import
  Bulb
 from './bulb';

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
  let argv = yargs.usage('$0 <cmd> [args]')
    .option('displaysize', {
      alias: 'd',
      describe: `Size to open the application window ${C.DISPLAYSIZE_SMALL}|${C.DISPLAYSIZE_MEDIUM}|${C.DISPLAYSIZE_LARGE}|${C.DISPLAYSIZE_FULL}`
    })
    .help('help')
    .argv;
  // log.info('YAAARGS', argv, argv.displaysize);

  let win;

  let colorChar = null;
  let effectChar = null;
  let nameChar = null;
  
  let bulb = null;


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
    win.loadURL(`file://${process.cwd()}/renderer/index.html`);

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
    
    bulb = new Bulb(webContents);

    webContents.openDevTools({
      mode: 'undocked'
    });

    // webContent events
    webContents.on(C.WEBCONTENTS_DID_FINISH_LOAD, onWebContentsDidFinishLoad);
    webContents.on(C.WEBCONTENTS_CRASHED, onWebContentsCrashed);

    function onWebContentsDidFinishLoad() {
      log.info('onWebContentsDidFinishLoad...');
      // noble.on('stateChange', (state) => {
      startScanning();
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
    ipcMain.on(C.IPC_DEVICE_GET_CACHED, onIpcDeviceGetCached);
    ipcMain.on(C.IPC_DEVICE_SET_CACHED, onIpcDeviceSetCached);
    ipcMain.on(C.IPC_DEV_TOOLS_OPEN, onIpcDevToolsOpen);

    ipcMain.on(C.IPC_GROUP_CONNECT, onIpcGroupConnect);
    ipcMain.on(C.IPC_GROUP_DISCONNECT, onIpcGroupDisconnect);
    ipcMain.on(C.IPC_GROUP_SET_CACHED, onIpcGroupSetCached);
    ipcMain.on(C.IPC_GROUP_DELETE_CACHED, onIpcGroupDeleteCached);
    ipcMain.on(C.IPC_GROUP_GET_CACHED, onIpcGroupGetCached);
    // ipcMain.on(C.IPC_GROUP_GET_CACHED_REPLY, onIpc);

    // ipcMain listener functions
    function onIpcScanStart() {
      log.info('onIpcScanStart...');
      // Start scanning only if already powered up.
      startScanning();
    }

    function onIpcScanStop() {
      // Stop scanning for devices.
      log.info('onScanStop... ');
      noble.stopScanning();
    }

    function onIpcDeviceConnect(event, deviceUUID) {
      log.info('onDeviceConnect...');
      
      
      
      let device = bulb.connectAndReadCharacteristics(deviceUUID, webContents);
      
      
    }

    function onIpcDeviceDisconnect(event, deviceUUID) {
      log.info('onDeviceDisconnect...');
      disconnect(deviceUUID);
    }

    function onIpcGroupConnect(event, group) {
      log.info('onIpcGroupConnect', group, group.devices.length);

      if (group.devices.length > 0) {
        log.debug('More than once device in group');
        let all = [];
        group.devices.forEach((deviceUUID) => {
          log.debug(`Calling connect for device ${deviceUUID}`);
          all.push(connect(deviceUUID));
        });
        log.debug('*************** groupConnect All promises', all);

        Promise.all(all)
          .then(values => {
            log.debug('GroupConnect Promise.all ', values);
          }, error => {
            log.error('GroupConnect Promise.all failed ', error);
          })
          .catch(error => {
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
      let device = deviceCache.getByUUID(deviceUUID);
      log.info('service and characteristic discovery from get');
      discoverServicesAndCharacteristics(device);
    }

    function onIpcDeviceSetCharacteristic(event, deviceUUID, value, type) {
      log.info('onDeviceSetCharacteristic...');
      // get the characteristic
      let device = deviceCache.getByUUID(deviceUUID);
      log.info('device.characteristic.set device', device);
      writeCharacteristic(value, type, deviceUUID)
        .catch(error => {
          log.error('Write catch error from set characteristic event', error);
        });
    }

    function onIpcDeviceGet(event, deviceUUID) {
      log.info('onDeviceGet...');
      log.info('ipc: device.get', event, deviceUUID, deviceCache.getByUUID(deviceUUID));
    }

    function onIpcDevToolsOpen(event, arg) {
      log.info('onDevToolsOpen...');
      win.openDevTools();
    }

    function onIpcDeviceGetCached(event) {
      log.info('onDeviceGetCached...');
      bulbStore.getCachedDevices()
        .forEach((device, uuid) => {
          // log.info('onDeviceGetCached sending ', device, uuid);
          event.sender.send(C.IPC_DEVICE_GET_CACHED_REPLY, device);
        });
    }

    function onIpcDeviceSetCached(event, device) {
      log.info('onIpcDeviceSetCached...', device);
      bulbStore.setCachedDevice(device);
    }




    function onIpcGroupSetCached(event, group) {
      log.info('onIpcGroupSetCached...', group);
      bulbStore.setCachedGroup(group);
    }

    function onIpcGroupDeleteCached(event, group) {
      bulbStore.deleteCachedGroup(group);
    }

    function onIpcGroupGetCached(event) {
      // log.info('onIpcGroupGetCached...', bulbStore.getCachedGroups());
      bulbStore.getCachedGroups()
        .forEach((group, uuid) => {
          // log.info('onIpcGroupGetCached sending', group);
          event.sender.send(C.IPC_GROUP_GET_CACHED_REPLY, group);
        });

    }


    // noble event listeners
    noble.on(C.NOBLE_DISCOVER, onNobleDiscovered);

    noble.on(C.NOBLE_STATE_CHANGE, (state) => {
      log.info('Noble State Change to: ', state);
    });

    noble.on(C.NOBLE_SCAN_START, () => {
      log.info('noble on scanStart');
    });

    noble.on(C.NOBLE_SCAN_STOP, () => {
      log.info('noble on scanStop');
    });

    noble.on(C.NOBLE_DISCONNECT, (message) => {
      log.warn('noble on disconnect', message);
    });

    noble.on(C.NOBLE_WARNING, (message) => {
      log.warn('noble on warning', message);
    });


    function onNobleDiscovered(device) {
      log.info('onNobleDiscovered...');
      // check for Mipow devices
      if (typeof device.advertisement.manufacturerData !== 'undefined' && device.advertisement.manufacturerData.toString('hex') === config.get('Bulb.MipowManufacturerData')) {
        device = bulb.discovered(device);
        // send notification to renderer that a device has been discovered
        webContents.send(C.IPC_DEVICE_DISCOVERED, bulbStore.serializeDevice(device));
      } else {
        log.info('onNobleDiscovered: Ignoring non bulb device');
      }
    }


    function startScanning() {
      log.debug('startScanning...');
      if (noble.state === 'poweredOn') {
        setTimeout(() => {
          noble.startScanning();
          webContents.send(C.IPC_SCANNING_START);
        }, 2000);
      } else {
        log.warn(`Cannot scan as the Bluetooth adapter is: ${noble.state}`);
        app.quit();
        // process.exit(1);
      }
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

  
})();
