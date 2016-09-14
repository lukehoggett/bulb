import {log} from './logger';
import * as C from './constants';
import BulbSerializer from './bulb-serializer';
import storage from 'node-persist';
import Immutable from 'immutable';

/**
 * @TODO
 * - fix setters to accept immutable data
 * - allow config to be dynamic
 * - remove duplication between device and groups logic for getStored(s) and initStorage
 */
let storeInstance = null;
class BulbStore {
  constructor() {
    if (!storeInstance) {
      storeInstance = this;
    }
    this.deviceStorage = null;
    this.groupStorage = null;
    this.cwd = process.cwd();
    let defaultConfig = this.getConfig();
    this.initDeviceStorage(defaultConfig);
    this.initGroupStorage(defaultConfig);

    log.debug('BulbStore.constructor() storeInstance', storeInstance);
    return storeInstance;
  }

  getConfig() {
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
      dir: `${this.cwd}${C.DATA_DEVICE_DIR}`
    }, config);
    this.deviceStorage = storage.create(deviceConfig);
    this.deviceStorage.initSync();
  }

  initGroupStorage(config) {
    let groupConfig = Object.assign({
      dir: `${this.cwd}${C.DATA_GROUP_DIR}}`
    }, config);
    this.groupStorage = storage.create(groupConfig);
    this.groupStorage.initSync();
  }

  getStoredDevices() {
    let devices = Immutable.Map();
    let deviceKeys = this.deviceStorage.keys();
    deviceKeys.forEach((uuid, index) => {
      devices = devices.set(uuid, this.getStoredDevice(uuid));
    });
    return devices;
  }

  getStoredDevice(uuid) {
    let device = this.deviceStorage.getItemSync(uuid, (error, device) => {
      if (error) {
        log.error(error);
      } else {
        device.power = false;
        device.state = C.DISCONNECTED;
      }
    });
    device = Immutable.fromJS(device);
    return device;
  }

  getStoredGroups() {
    let groups = Immutable.Map();
    let groupKeys = this.groupStorage.keys();
    groupKeys.forEach((uuid, index) => {
      groups = groups.set(uuid, this.getStoredGroup(uuid));
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
    group = Immutable.fromJS(group);
    return group;
  }

  setStoredDevice(device) {
    device.state = C.DISCONNECTED;
    let serializedDevice = BulbSerializer.serializeDevice(device);
    this.deviceStorage.setItem(serializedDevice.uuid, serializedDevice, error => {
      if (error) {
        log.error('Device Storage error', error);
      }
    });
    return this.getStoredDevices(serializedDevice.uuid);
  }

  setStoredDevices(devices) {
    devices.forEach((device) => {
      this.setStoredDevice(device);
    });
    return this.getStoredDevices();
  }

  setStoredGroup(group) {
    log.debug('bulbCache setStoredGroup', group);
    // remove properties not needed to be stored
    this.groupStorage.setItem(group.uuid, group, error => {
      if (error) {
        log.error('Group Storage error', error);
      }
    });
    return this.getStoredGroup(group.uuid);
  }

  setStoredGroups(groups) {
    groups.forEach((group) => {
      this.setStoredGroup(group);
    });
    return this.getStoredGroups();
  }
}

let bulbStore = new BulbStore();
export default bulbStore;
