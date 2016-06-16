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
