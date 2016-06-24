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
          device.state = 'disconnected';
          // log.info("getDevicesFromStorage device", device, uuid);
          serializedDevices.set(uuid, device);
        });
      }
      // log.info("getDevicesFromStorage serializedDevices", serializedDevices);
      return serializedDevices;
    }
    
    getStoredDevices() {
      return serializedDevices;
    }
    
    getStoredDeviceByUUID(uuid) {
      if (!serializedDevices.has(uuid)) {
        log.error(`Device ${uuid} is not in storage.`);
        // @TODO handle error
      }
      return serializedDevices.get(uuid);
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
      // remove properties not needed to be stored
      storage.setItem(serializedDevice.uuid, serializedDevice, error => {
        if (error) {
          log.error("Storage error: on set", error);
        }
      });
      this.getDevicesFromStorage();
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
      log.info("\n\n<><><><><><><> bulbStore setDiscoveredDevice", device.state, "\n\n");
      discoveredDevices[device.uuid] = device;
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
        lastSeen: Date.now()
      };
    }
    
    serializeCharacteristics(deviceUUID, characteristicValues) {
      log.info("bulbStore.serializeCharacteristics... full", this.getDiscoveredDeviceByUUID(deviceUUID));
      let device = this.serializeDevice(this.getDiscoveredDeviceByUUID(deviceUUID));
      log.info("bulbStore.serializeCharacteristics input", device);
      let charList = {};
      characteristicValues.forEach(c => {
        log.info(c.characteristic.uuid, c.type);
        charList[c.type] = {
          uuid: c.characteristic.uuid,
          name: c.characteristic.name,
          type: c.characteristic.type,
          value: c.data
        };
      });
      device.characteristics = charList;
      // log.info("device", device);
      log.info("bulbStore.serializeCharacteristics output", device);
      return device;
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
