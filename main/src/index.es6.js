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
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

// bluetooth module
import noble from 'noble';
// util module
// import util from 'util';
// cli arg parser
import yargs from 'yargs';

import BulbSerializer from './bulb-serializer';
// local module for device storage and retrieval from persistent storage
// import deviceCache from './device-store';
// const bulbStore = deviceCache.bulbStore;
// import {
//   bulbStore
// } from './device-store';
// log.debug('BulbStore', bulbStore);

import bulbStore from './bulb-store';
import bulbData from './bulb-data';

// local module for handling bulb actions
import
  Bulb
 from './bulb';

import
  BulbMessaging
from './bulb-messaging';

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

  let bulb = null;
  let bulbMessaging = null;

  process.on(C.PROCESS_UNCAUGHT_EXCEPTION, onProcessUncaughtException);

  function onProcessUncaughtException() {
    log.error('onProcessUncaughtException', arguments);
  }

  // handle quitting
  app.on(C.APP_WINDOW_ALL_CLOSED, onAppWindowAllClosed);
  app.on(C.APP_QUIT, onAppQuit);

  function onAppWindowAllClosed() {
    // force app termination on OSX when win has been closed
    if (process.platform === 'darwin') {
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
    log.info('app.on(ready)');

    let primaryDisplay = screen.getPrimaryDisplay();

    win = new BrowserWindow(getWindowOptions(primaryDisplay));
    win.loadURL(`file://${process.cwd()}/renderer/index.html`);

    // window events
    win.once(C.WINDOW_READY_TO_SHOW, onWindowReadyToShow);
    win.on(C.WINDOW_CLOSED, onWindowClosed);
    win.on(C.WINDOW_UNRESPONSIVE, onWindowUnresponsive);

    function onWindowReadyToShow() {
      log.debug('win.onWindowReadyToShow()');
      win.show();
    }

    function onWindowClosed() {
      log.info('win.onWindowClosed()');
      noble.stopScanning();
      disconnectAll();
      win = null;
      app.quit();
    }

    function onWindowUnresponsive() {
      log.warn('win.onWindowUnresponsive()');
    }

    let webContents = win.webContents;

    bulb = new Bulb(webContents);
    bulbMessaging = new BulbMessaging(webContents);

    webContents.openDevTools({
      mode: 'undocked'
    });

    // webContent events
    webContents.on(C.WEBCONTENTS_DID_FINISH_LOAD, onWebContentsDidFinishLoad);
    webContents.on(C.WEBCONTENTS_CRASHED, onWebContentsCrashed);

    function onWebContentsDidFinishLoad() {
      log.info('webContents.onWebContentsDidFinishLoad()');
      // noble.on('stateChange', (state) => {
      startScanning();
      // });
      win.setTitle(app.getName());
    }

    function onWebContentsCrashed() {
      log.error('webContents.onWebContentsCrashed()');
    }

    // adding ipcMain listeners
    ipcMain.on(C.IPC_SCAN_START, onIpcScanStart);
    ipcMain.on(C.IPC_SCAN_STOP, onIpcScanStop);
    ipcMain.on(C.IPC_DEVICE_CONNECT, onIpcDeviceConnect);
    ipcMain.on(C.IPC_DEVICE_DISCONNECT, onIpcDeviceDisconnect);
    ipcMain.on(C.IPC_DEVICE_CHARACTERISTICS_GET, onIpcDeviceGetCharacteristics);
    ipcMain.on(C.IPC_DEVICE_CHARACTERISTIC_SET, onIpcDeviceSetCharacteristic);
    ipcMain.on(C.IPC_DEVICE_GET, onIpcDeviceGet);
    ipcMain.on(C.IPC_DEVICE_GET_CACHED, onIpcDeviceGetStored);
    ipcMain.on(C.IPC_DEVICE_SET_CACHED, onIpcDeviceSetStored);
    ipcMain.on(C.IPC_DEV_TOOLS_OPEN, onIpcDevToolsOpen);

    ipcMain.on(C.IPC_GROUP_CONNECT, onIpcGroupConnect);
    ipcMain.on(C.IPC_GROUP_DISCONNECT, onIpcGroupDisconnect);
    ipcMain.on(C.IPC_GROUP_SET_CACHED, onIpcGroupSetStored);
    ipcMain.on(C.IPC_GROUP_DELETE_CACHED, onIpcGroupDeleteStored);
    ipcMain.on(C.IPC_GROUP_GET_CACHED, onIpcGroupGetStored);
    // ipcMain.on(C.IPC_GROUP_GET_CACHED_REPLY, onIpc);

    // ipcMain listener functions
    function onIpcScanStart() {
      log.info('ipcMain.onIpcScanStart()');
      // Start scanning only if already powered up.
      startScanning();
    }

    function onIpcScanStop() {
      // Stop scanning for devices.
      log.info('ipcMain.onScanStop()');
      noble.stopScanning();
    }

    function onIpcDeviceConnect(event, deviceUUID) {
      log.info('ipcMain.onDeviceConnect()');
      bulb.connectAndReadCharacteristics(deviceUUID, webContents);
    }

    function onIpcDeviceDisconnect(event, deviceUUID) {
      log.info('ipcMain.onDeviceDisconnect()');
      disconnect(deviceUUID);
    }

    function onIpcGroupConnect(event, group) {
      log.info('ipcMain.onIpcGroupConnect()', group, group.devices.length);

      if (group.devices.length > 0) {
        log.debug('More than once device in group');
        let all = [];
        group.devices.forEach((deviceUUID) => {
          log.debug(`Calling connect for device ${deviceUUID}`);
          all.push(bulb.connectAndReadCharacteristics(deviceUUID));
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
      bulb.discoverServicesAndCharacteristics(device);
    }

    function onIpcDeviceSetCharacteristic(event, deviceUUID, value, type) {
      log.info('onDeviceSetCharacteristic...');
      // get the characteristic
      let device = deviceCache.getByUUID(deviceUUID);
      log.info('device.characteristic.set device', device);
      bulb.writeCharacteristic(value, type, deviceUUID)
        .then((device) => {
          log.debug('device.characteristics', device.characteristics);
          // @TODO move this to own function for clean chaining

          // save to cache
          bulbStore.setStoredDevice(device);
        })
        .catch(error => {
          log.error('Write catch error from set characteristic event', error);
        });
    }

    function onIpcDeviceGet(event, deviceUUID) {
      log.info('ipcMain.onDeviceGet()');
      log.info('ipc: device.get', event, deviceUUID, deviceCache.getByUUID(deviceUUID));
    }

    function onIpcDevToolsOpen(event, arg) {
      log.info('onDevToolsOpen...');
      win.openDevTools();
    }

    function onIpcDeviceGetStored(event) {
      log.debug('ipcMain.onIpcDeviceGetStored()', bulbStore.getStoredDevices());
      bulbStore.getStoredDevices()
        .forEach((device, uuid) => {
          log.info('ipcMain.onIpcDeviceGetStored() sending ', device, uuid);
          event.sender.send(C.IPC_DEVICE_GET_CACHED_REPLY, device);
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
      // log.info('onIpcGroupGetStored...', bulbStore.getCachedGroups());
      bulbStore.getStoredGroups()
        .forEach((group, uuid) => {
          // log.info('onIpcGroupGetStored sending', group);
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

    function onNobleDiscovered(peripheral) {
      log.info('onNobleDiscovered...');
      // check for Mipow peripherals

      bulb.discovered(peripheral)
      .then((device) => {
        // send notification to renderer that a device has been discovered
        log.debug('onNobleDiscovered serializedDevice', BulbSerializer.serializeDevice(device));
        webContents.send(C.IPC_DEVICE_DISCOVERED, BulbSerializer.serializeDevice(device));
      })
      .catch((error) => {
        log.error('Discover error:', error);
      });
    }

    function startScanning() {
      log.debug('startScanning()');
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
  });

  function disconnect(device) {
    log.info('disconnect()', device.state);
    // if uuid, look up device
    if (typeof device === 'string') {
      device = bulbStore.getDiscoveredDeviceByUUID(device);
    }

    // log.info('before Disconnecting', device.uuid);
    device.disconnect(error => {
      if (error) {
        log.error('Disconnection error:', error);
      }
      log.info('Disconnected', device.uuid, device.state);
      device.connected = false;
      // send disconnect event to the render process
      if (win !== null) {
        win.webContents.send(C.IPC_DEVICE_DISCONNECTED, device);
      }
    });
  }

  function disconnectAll() {
    log.info('disconnectAll');
    let discoveredDevices = bulbStore.getDiscoveredDevices();
    for (let uuid in discoveredDevices) {
      if (typeof discoveredDevices[uuid].disconnect === 'function') {
        disconnect(discoveredDevices[uuid]);
      }
    }
  }
})();
