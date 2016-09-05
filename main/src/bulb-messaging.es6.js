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
import deviceCache from './device-store';
const bulbStore = deviceCache.bulbStore;

export default class BulbMessaging {

  constructor(webContents) {
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
    log.debug('BulbMessaging onGet', 'event', event, 'request', request, 'this', this);

    switch (request.type) {
      case 'device.cached':
        log.debug('BulbMessaging onGet device.cached');
        bulbStore.getCachedDevices()
          .forEach((device, uuid) => {
            // log.info('onDeviceGetCached sending ', device, uuid);
            event.sender.send(C.IPC_DEVICE_GET_CACHED_REPLY, device);
            log.debug('sending', C.IPC_MAIN_POST, {type: 'device.cache', action: 'POST', data: device});
            this.send(event, C.IPC_MAIN_POST, {type: 'device.cache', action: 'POST', data: device});
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
