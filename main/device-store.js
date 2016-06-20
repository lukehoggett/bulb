(function() {
  "use strict";
  
  

  

  const storage = require("node-persist");
  let bunyan = require("bunyan");

  let log = bunyan.createLogger({
    name: "bulb"
  });

  // initialise storage
  storage.initSync({
    dir: __dirname + "/../data/device-storage",
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: "utf8",
    logging: false,
    continuous: true,
    interval: false,
    ttl: false
  });

  let devices = {};
  const serializedDevices = new Map();
  const discoveredDevices = {};
  
  class BulbStore {
    constructor() {
      // read from persistent storage
      this.getDevicesFromStorage();
    }
    
    getDevicesFromStorage() {
      // @TODO implement caching in local variable, or not as needed
      log.info("BulbStore: getDevicesFromStorage");
      let haveCached = Object.keys(devices).length !== 0 && devices.constructor === Object;
      if (!haveCached) {
        
        let deviceKeys = storage.keys();
        deviceKeys.forEach((uuid, index) => {
          
          let device = storage.getItem(uuid, (error, device) => {
            if (error) {
              log.error(error);
            }
          });

          device.stored = true;
          device.power = false;
          log.info("getDevicesFromStorage device", device, uuid);
          serializedDevices.set(uuid, device);
        });
      }
      log.info("getDevicesFromStorage serializedDevices", serializedDevices);
      return serializedDevices;
    }
    
    getStoredDevices() {
      return serializedDevices;
    }
    
    getStoredDeviceByUUID(uuid) {
      if (!serializedDevice.has(uuid)) {
        log.error(`Device ${uuid} is not in storage.`);
        // @TODO handle error
      }
      return serializedDevices.get(uuid);
    }
    
    setStoredDevices() {
      
    }
    
    setStoredDeviceByUUID(device) {
      let serializedDevice = this.serializeDevice(device);
      storage.setItem(serializeDevice.uuid, serializedDevice, error => {
        if (error) {
          log.error("Storage error: on set", error);
        }
      });
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
      
    }
    
    setDiscoveredDeviceByUUID(device) {
      discoveredDevices[device.uuid] = device;
    }
    
    serializeDevice() {
      
    }
    
    serializeCharacteristics() {
      
    }
  }
  
  exports.bulbStore = new BulbStore();
  


  // load all currently stored devices
  let getAll = function () {
    // @TODO implement caching in local variable, or not as needed
    log.info("device-storage: getAll");
    let haveCached = Object.keys(devices).length !== 0 && devices.constructor === Object;
    if (!haveCached) {
      
      let deviceKeys = storage.keys();
      deviceKeys.forEach((uuid, index) => {
        let device = storage.getItem(uuid, (error, device) => {
          if (error) {
            log.error(error);
          }
        });

        log.info("device-storage: loaded UUID", device.uuid);

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
      log.error(`Device ${uuid} is not in storage.`);
      // @TODO handle error
    }
    return devices[uuid];
  };

  let set = function(uuid, serializedDevice) {
    storage.setItem(uuid, serializedDevice, error => {
      if (error) {
        log.error("Storage error: on set", error);
      }
    });
  };

  exports.storage = storage;
  exports.getAll = getAll;
  exports.getByUUID = getByUUID;
  exports.set = set;

})();
