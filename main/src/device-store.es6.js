import {log} from './logger';
import * as C from './constants';

import storage from 'node-persist';

(function() {
  'use strict';

  // initialise storage
  let storageConfig = {
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,
    continuous: true,
    interval: false,
    ttl: false
  };

  let deviceCacheConfig = Object.assign({
    dir: `${process.cwd()}/data/device-storage`
  }, storageConfig);
  let deviceCache = storage.create(deviceCacheConfig);
  deviceCache.initSync();

  let groupCacheConfig = Object.assign({
    dir: `${process.cwd()}/data/group-storage`
  }, storageConfig);
  let groupCache = storage.create(groupCacheConfig);
  groupCache.initSync();

  let devices = {};
  const serializedDevices = new Map();
  const discoveredDevices = {};

  const serializedGroups = new Map();

  class BulbStore {
    constructor() {
      // read from persistent storage
      this.getDevicesFromCache();
      this.getGroupsFromCache();
    }

    getDevicesFromCache() {
      // @TODO implement caching in local variable, or not as needed
      log.info('BulbCache: getDevicesFromCache');
      let haveCached = Object.keys(devices).length !== 0 && devices.constructor === Object;
      if (!haveCached) {

        let deviceKeys = deviceCache.keys();
        deviceKeys.forEach((uuid, index) => {

          let device = deviceCache.getItem(uuid, (error, device) => {
            if (error) {
              log.error(error);
            }
          });

          device.stored = true;
          device.power = false;
          device.state = C.DISCONNECTED;
          // log.info('getDevicesFromCache device', device, uuid);
          serializedDevices.set(uuid, device);
        });
      }
      // log.info('getDevicesFromCache serializedDevices', serializedDevices);
      return serializedDevices;
    }

    getGroupsFromCache() {
      let groupKeys = groupCache.keys();
      groupKeys.forEach((uuid, index) => {

        let group = groupCache.getItem(uuid, (error, group) => {
          if (error) {
            log.error(error);
          }
        });

        // log.info('getGroupsFromCache group', group, uuid);
        serializedGroups.set(uuid, group);
      });

      return serializedGroups;
    }

    getCachedDevices() {
      return serializedDevices;
    }

    getCachedGroups() {
      return serializedGroups;
    }

    getCachedDeviceByUUID(uuid) {
      if (!serializedDevices.has(uuid)) {
        log.error(`Device ${uuid} is not in deviceCache.`);
        // @TODO handle error
      }
      return serializedDevices.get(uuid);
    }

    getCachedGroupByUUID(uuid) {
      if (!serializedGroups.has(uuid)) {
        log.error(`Group ${uuid} is not in groupCache.`);
        // @TODO handle error
      }
      return serializedGroups.get(uuid);
    }

    setCachedDevices(devices) {
      devices.forEach((device) => {
        this.setCachedDevice(device);
      });
    }

    setCachedDevice(device) {
      device.stored = true;
      device.state = C.DISCONNECTED;
      let serializedDevice = this.serializeDevice(device);
      deviceCache.setItem(serializedDevice.uuid, serializedDevice, error => {
        if (error) {
          log.error('Cache error: on set', error);
        }
      });
      this.getDevicesFromCache();
    }

    setCachedGroups(groups) {
      groups.forEach((group) => {
        this.setCachedGroup(group);
      });
    }

    setCachedGroup(group) {
      log.info('bulbCache setCachedGroup', group);
      // remove properties not needed to be stored
      groupCache.setItem(group.uuid, group, error => {
        if (error) {
          log.error('Cache error: on set', error);
        }
      });
      this.getGroupsFromCache();
    }

    hasCachedDevice(uuid) {
      return serializedDevices.has(uuid);
    }

    getDiscoveredDevices() {
      return discoveredDevices;
    }

    getDiscoveredDeviceByUUID(uuid) {
      if (!Object.keys(discoveredDevices).includes(uuid)) {
        log.error(`Device ${uuid} has not been discovered.`);
        // @TODO handle error
      }
      return discoveredDevices[uuid];
    }

    setDiscoveredDevices(devices) {
      devices.forEach((device) => {
        tis.setDiscoveredDevice(device);
      });
    }

    setDiscoveredDevice(device) {
      discoveredDevices[device.uuid] = device;
    }

    deleteCachedGroup(group) {
      log.info('bulbCache deleteCachedGroup group', group);
    }

    /**
     * Prepare a Noble device for serialization to send to a renderer process.
     Copies out all the attributes the renderer might need.  Seems to be
     necessary as Noble's objects don't serialize well and lose attributes when
     pass around with the ipc class.
     log.info('Serializing device', device);
     * @return {[type]} [description]
     */
    serializeDevice(device) {
      return {
        id: device.id,
        name: device.advertisement.localName,
        address: device.address,
        state: device.state, // should we store whether it is connected
        advertisement: device.advertisement,
        // rssi: device.rssi,
        uuid: device.uuid,
        addressType: device.addressType,
        connectable: device.connectable,
        discovered: device.discovered || false,
        stored: device.stored || false,
        lastSeen: Date.now()
      };
    }

    serializeCharacteristics(deviceUUID, characteristicValues) {
      let device = this.serializeDevice(this.getDiscoveredDeviceByUUID(deviceUUID));
      let charList = {};
      characteristicValues.forEach(c => {
        charList[c.type] = {
          uuid: c.characteristic.uuid,
          name: c.characteristic.name,
          type: c.characteristic.type,
          value: c.data
        };
      });
      device.characteristics = charList;
      return device;
    }
  }

  exports.bulbStore = new BulbStore();



  // load all currently stored devices
  let getAll = function() {
    // @TODO implement caching in local variable, or not as needed
    log.info('device-deviceCache: getAll');
    let haveCached = Object.keys(devices).length !== 0 && devices.constructor === Object;
    if (!haveCached) {

      let deviceKeys = deviceCache.keys();
      deviceKeys.forEach((uuid, index) => {
        let device = deviceCache.getItem(uuid, (error, device) => {
          if (error) {
            log.error(error);
          }
        });

        log.info('device-deviceCache: loaded UUID', device.uuid);

        device.stored = true;
        device.power = false;
        devices[uuid] = device;
      });
    }
    return devices;
  };

  let getByUUID = function(uuid) {
    let devices = getAll();
    if (!Object.keys(devices).includes(uuid)) {
      log.error(`Device ${uuid} is not in deviceCache.`);
      // @TODO handle error
    }
    return devices[uuid];
  };

  let set = function(uuid, serializedDevice) {
    deviceCache.setItem(uuid, serializedDevice, error => {
      if (error) {
        log.error('Cache error: on set', error);
      }
    });
  };

  exports.deviceCache = deviceCache;
  exports.getAll = getAll;
  exports.getByUUID = getByUUID;
  exports.set = set;

})();
