'use strict';

import * as C from './constants';
// import {
//   config
// } from './config';
import {
  log
} from './logger';
import electron from 'electron';
const ipcMain = electron.ipcMain;
// import noble from 'noble';
// import BulbSerializer from './bulb-serializer';
// import deviceCache from './device-store';
// const bulbStore = deviceCache.bulbStore;

import bulbStore from './bulb-store';
import bulbData from './bulb-data';

export default class BulbMessaging {

  constructor(webContents) {
    log.debug('BulbMessaging.constructor()');
    this.webContents = webContents;
    // setup listeners
    this.listen();
  }

  send(event, message, data) {
    event.sender.send(message, data);
  }

  listen() {
    ipcMain.on(C.IPC_RENDERER_GET, (event, message) => this.onGet(event, message));
    ipcMain.on(C.IPC_RENDERER_POST, (event, message) => this.onPost(event, message));
    ipcMain.on(C.IPC_RENDERER_PATCH, (event, message) => this.onPatch(event, message));
    ipcMain.on(C.IPC_RENDERER_DELETE, (event, message) => this.onDelete(event, message));
  }

  onGet(event, request) {
    log.debug('BulbMessaging.onGet() request', request);

    switch (request.message) {
      case 'device.cached':
        log.debug('BulbMessaging.onGet() device.cached');
        log.debug('BulbMessaging.onGet() storedDevices', bulbStore.getStoredDevices().data);
        bulbStore.getStoredDevices()
          .forEach((device, uuid) => {
            // log.info('onDeviceGetCached sending ', device, uuid);
            // event.sender.send(C.IPC_DEVICE_GET_CACHED_REPLY, device);
            log.debug('BulbMessageing.onGet() sending', C.IPC_MAIN_GET, {message: 'device.cache', action: 'GET', data: device});
            this.send(event, C.IPC_MAIN_GET, {message: 'device.cache', action: 'GET', data: device});
          });
        break;
      default:

    }
  }

  onPost(event) {

  }

  onPatch(event) {

  }

  onDelete(event) {

  }

}
