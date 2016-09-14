import {log} from './logger';
import * as C from './constants';
import BulbSerializer from './bulb-serializer';
import storage from 'node-persist';

let storeInstance = null;
class BulbStore {
  constructor() {
    if (!storeInstance) {
      storeInstance = this;
    }
    this.deviceStorage = null;
    this.groupStorage = null;
    let defaultConfig = this.getStorageConfig();
    this.initDeviceStorage(defaultConfig);
    this.initGroupStorage(defaultConfig);

    log.debug('BulbStore.constructor() storeInstance', storeInstance);
    return storeInstance;
  }

  getStorageConfig() {
    let storageConfig = {
      stringify: JSON.stringify,
      parse: JSON.parse,
      encoding: 'utf8',
      logging: false,
      continuous: true,
      interval: false,
      ttl: false
    };
    return storageConfig;
  }

  initDeviceStorage(config) {
    let deviceConfig = Object.assign({
      dir: `${process.cwd()}/data/device-storage`
    }, config);
    this.deviceStorage = storage.create(deviceConfig);
    this.deviceStorage.initSync();
  }

  initGroupStorage(config) {
    let groupConfig = Object.assign({
      dir: `${process.cwd()}/data/group-storage`
    }, config);
    this.groupStorage = storage.create(groupConfig);
    this.groupStorage.initSync();
  }

  getStoredDevices() {
    let devices = new Map();
    // @TODO implement caching in local variable, or not as needed
    // log.info('BulbCache: getDevicesFromCache');
    let haveCached = Object.keys(devices).length !== 0 && devices.constructor === Object;
    if (!haveCached) {
      let deviceKeys = this.deviceStorage.keys();
      // log.debug('getDevicesFromCache deviceKeys', deviceKeys);
      deviceKeys.forEach((uuid, index) => {
        // log.debug('getDevicesFromCache uuid index', uuid, index);
        let device = this.getStoredDevice(uuid);

        device.power = false;
        device.state = C.DISCONNECTED;
        // log.info('getDevicesFromCache device', device, uuid);
        devices.set(uuid, device);
      });
    }
    // log.info('getDevicesFromCache device', devices);
    return devices;
  }

  getStoredDevice(uuid) {
    let device = this.deviceStorage.getItemSync(uuid, (error, device) => {
      // log.debug('getDevicesFromCache device', device);
      if (error) {
        log.error(error);
      }
    });
    return device;
  }

  getStoredGroups() {
    let groups = new Map();
    let groupKeys = this.groupStorage.keys();
    groupKeys.forEach((uuid, index) => {
      let group = this.getStoredGroup(uuid);
      groups.set(uuid, group);
    });
    return groups;
  }

  getStoredGroup(uuid) {
    let group = this.groupStorage.getItemSync(uuid, (error, group) => {
      if (error) {
        log.error(error);
      } else {
        group.state = C.DISCONNECTED;
      }
    });
    return group;
  }

  setStoredDevice(device) {
    device.state = C.DISCONNECTED;
    let serializedDevice = BulbSerializer.serializeDevice(device);
    log.debug('########################### setStoredDevice serializedDevice', serializedDevice);
    this.deviceStorage.setItem(serializedDevice.uuid, serializedDevice, error => {
      if (error) {
        log.error('Storgae error: on set', error);
      }
    });
    return this.getStoredDevices();
  }

  setStoredDevices(devices) {
    devices.forEach((device) => {
      this.setStoredDevice(device);
    });
  }

  setStoredGroup(group) {
    log.debug('bulbCache setStoredGroup', group);
    // remove properties not needed to be stored
    this.groupStorage.setItem(group.uuid, group, error => {
      if (error) {
        log.error('Cache error: on set', error);
      }
    });
    this.getStoredGroups();
  }

  setStoredGroups(groups) {
    groups.forEach((group) => {
      this.setStoredGroup(group);
    });
  }
}

let bulbStore = new BulbStore();
export default bulbStore;
