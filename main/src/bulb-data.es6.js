import {log} from './logger';
// import * as C from './constants';
// import BulbSerializer from './bulb-serializer';
import Immutable from 'immutable';

let dataInstance = null;
export default class BulbData {
  constructor() {
    if (!dataInstance) {
      dataInstance = this;
    }
    this.devices = {};
    return dataInstance;
  }

  get(uuid) {
    return this.devices[uuid];
  }

  getAll() {
    return this.devices;
  }

  set(device) {
    let deviceData = Immutable.Map(device);
    this.devices[device.uuid] = {};
    this.devices[device.uuid].data = deviceData;
    this.devices[device.uuid]._noble = device.peripheral._noble;
    return this.devices[device.uuid];
  }

  setAll(devices) {
    devices.forEach((device) => {
      this.set(device);
    });
    return this.getAll();
  }

}

let bulbData = new BulbData();
export default bulbData;
