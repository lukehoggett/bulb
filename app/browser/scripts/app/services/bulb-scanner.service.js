/* jshint esnext: true */
/* jshint node: true */
'use strict';
const ipc = require('electron').ipcRenderer;

class BulbScannerService {
    constructor($rootScope) {
      this.devices = {};
      this.scanning = false;
      
      this.$rootScope = $rootScope;
      
      // request any stored devices from the main process
      ipc.send('get-stored-devices', function(event) {
        console.log("BulbScannerService: get stored devices", event);
      });
      
      ipc.on('get-stored-devices-reply', function(event, device, uuid) {
        console.log("BulbScannerService: send stored devices", device, uuid);
        this.devices[device.uuid] = device;
      }.bind(this));

      ipc.on('discover', function(event, uuid) {
        console.log("BulbScannerService: Discovered Device", uuid);
        
        return;
        let newDeviceList = [];
        
        for (var uuid in this.devices) {
          if (this.devices.hasOwnProperty(uuid)) {
            console.log("for in this.devices", this.devies[uuid]);
          }
        }
        this.devices.forEach(function(dev, key) {
          console.log("each device", dev);
          newDeviceList.push(dev);
        });
        this.devices = newDeviceList;
        
        $rootScope.$broadcast('device-update');
        
        
      }.bind(this));
      
      
      
      
      
      ipc.on('services', function(event, services) {
        console.log("services", services);
      });
      ipc.on('characteristics', function(event, characteristics) {
        console.log("characteristics", characteristics);
      });
      
    }
    
    isScanning() {
      return this.scanning;
    }
    
    startScan() {
      ipc.send('startScan');
      this.scanning = true;
    }
    
    stopScan() {
      ipc.send('stopScan');
      this.scanning = false;
    }
    
    getDevices() {
      console.log("BulbScannerService getDevices called: ", this.devices);
      return this.devices;
    }
}
export {
  BulbScannerService
};
