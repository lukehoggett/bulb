(function() {
  "use strict";





  const storage = require("node-persist");
  let bunyan = require("bunyan");

  let log = bunyan.createLogger({
    name: "bulb"
  });

  // initialise storage


  let storageConfig = {
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: "utf8",
    logging: false,
    continuous: true,
    interval: false,
    ttl: false
  };

  let deviceStorageConfig = Object.assign({
    dir: __dirname + "/../data/device-storage"
  }, storageConfig);
  let deviceStorage = storage.create(deviceStorageConfig);
  deviceStorage.initSync();

  let groupStorageConfig = Object.assign({
    dir: __dirname + "/../data/group-storage"
  }, storageConfig);
  let groupStorage = storage.create(groupStorageConfig);
  groupStorage.initSync();

  let devices = {};
  const serializedDevices = new Map();
  const discoveredDevices = {};

  const serializedGroups = new Map();

  class BulbStore {
    constructor() {
      // read from persistent storage
      this.getDevicesFromStorage();
      this.getGroupsFromStorage();
    }

    getDevicesFromStorage() {
      // @TODO implement caching in local variable, or not as needed
      log.info("BulbStore: getDevicesFromStorage");
      let haveCached = Object.keys(devices).length !== 0 && devices.constructor === Object;
      if (!haveCached) {

        let deviceKeys = deviceStorage.keys();
        deviceKeys.forEach((uuid, index) => {

          let device = deviceStorage.getItem(uuid, (error, device) => {
            if (error) {
              log.error(error);
            }
          });

          device.stored = true;
          device.power = false;
          device.state = 'disconnected';
          // log.info("getDevicesFromStorage device", device, uuid);
          serializedDevices.set(uuid, device);
        });
      }
      // log.info("getDevicesFromStorage serializedDevices", serializedDevices);
      return serializedDevices;
    }

    getGroupsFromStorage() {
      let groupKeys = groupStorage.keys();
      groupKeys.forEach((uuid, index) => {

        let group = groupStorage.getItem(uuid, (error, group) => {
          if (error) {
            log.error(error);
          }
        });

        // log.info("getGroupsFromStorage group", group, uuid);
        serializedGroups.set(uuid, group);
      });

      return serializedGroups;
    }

    getStoredDevices() {
      return serializedDevices;
    }

    getStoredGroups() {
      return serializedGroups;
    }

    getStoredDeviceByUUID(uuid) {
      if (!serializedDevices.has(uuid)) {
        log.error(`Device ${uuid} is not in deviceStorage.`);
        // @TODO handle error
      }
      return serializedDevices.get(uuid);
    }

    getStoredGroupByUUID(uuid) {
      if (!serializedGroups.has(uuid)) {
        log.error(`Group ${uuid} is not in groupStorage.`);
        // @TODO handle error
      }
      return serializedGroups.get(uuid);
    }

    setStoredDevices(devices) {
      devices.forEach((device) => {
        this.setStoredDevice(device);
      });
    }

    setStoredDevice(device) {
      device.stored = true;
      device.state = 'disconnected';
      let serializedDevice = this.serializeDevice(device);
      deviceStorage.setItem(serializedDevice.uuid, serializedDevice, error => {
        if (error) {
          log.error("Storage error: on set", error);
        }
      });
      this.getDevicesFromStorage();
    }

    setStoredGroups(groups) {
      groups.forEach((group) => {
        this.setStoredGroup(group);
      });
    }

    setStoredGroup(group) {
      log.info("bulbStore setStoredGroup", group);
      // remove properties not needed to be stored
      groupStorage.setItem(group.uuid, group, error => {
        if (error) {
          log.error("Storage error: on set", error);
        }
      });
      this.getGroupsFromStorage();
    }

    hasStoredDevice(uuid) {
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

    deleteStoredGroup(group) {
      log.info("bulbStore deleteStoredGroup group", group);
    }

    /**
     * Prepare a Noble device for serialization to send to a renderer process.
     Copies out all the attributes the renderer might need.  Seems to be
     necessary as Noble"s objects don"t serialize well and lose attributes when
     pass around with the ipc class.
     log.info("Serializing device", device);
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
        lastSeen: Date.now(),
        group: device.group || null
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
    log.info("device-deviceStorage: getAll");
    let haveCached = Object.keys(devices).length !== 0 && devices.constructor === Object;
    if (!haveCached) {

      let deviceKeys = deviceStorage.keys();
      deviceKeys.forEach((uuid, index) => {
        let device = deviceStorage.getItem(uuid, (error, device) => {
          if (error) {
            log.error(error);
          }
        });

        log.info("device-deviceStorage: loaded UUID", device.uuid);

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
      log.error(`Device ${uuid} is not in deviceStorage.`);
      // @TODO handle error
    }
    return devices[uuid];
  };

  let set = function(uuid, serializedDevice) {
    deviceStorage.setItem(uuid, serializedDevice, error => {
      if (error) {
        log.error("Storage error: on set", error);
      }
    });
  };

  exports.deviceStorage = deviceStorage;
  exports.getAll = getAll;
  exports.getByUUID = getByUUID;
  exports.set = set;

})();
