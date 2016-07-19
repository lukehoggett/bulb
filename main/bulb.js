(function() {
  "use strict";
  
  const log = require('./logger').log;

  class Bulb {
    
    constructor() {}
    
    discovered(device) {
      // check which type of device it is
      switch (device.advertisement.serviceUUIDs) {
        case config.get('Bulb.AdvertisedServiceUUIDs.CANDLE'):
          playbulbType = config.get('Bulb.Types.CANDLE');
          break;
          playbulbType = config.get('Bulb.Types.COLOR');
          playbulbType = type.COLOR;
          break;
        default:
          
      }
      device.type = playbulbType;
      log.info("onNobleDiscovered: Discovered Playbulb device with UUID", device.uuid);
      log.info("onNobleDiscovered: device.advertisement.serviceUuids", device.advertisement.serviceUuids);
      // on discovery check if device is in stored devices, if not update stored
      // if (!bulbStore.hasStoredDevice(device.uuid)) {
        // save discovered device to persistent storage
        bulbStore.setStoredDevice(device);
        
      // }
      
      // add properties to the device
      device.discovered = true; // we don't save discovered so need to add it here
      device.stored = true; // doesn't feel like we should have to add stored her, but ok till I find a better way
      
      // this is needed to add the noble extra object stuff that can't be stored in the persistent storage
      bulbStore.setDiscoveredDevice(device);

      // send notification to renderer that a device has been discovered
      log.info("onNobleDiscovered: sending discovered device to renderer", device.uuid, device);
      webContents.send("device.discovered", bulbStore.serializeDevice(device));
      return "hello";
    }
    
    test() {
      log.info("test function");
      return "tested";
    }
  }

  exports.Bulb = new Bulb();
  // 
})();
