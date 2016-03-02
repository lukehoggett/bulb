/* jshint esnext: true */
/* jshint node: true */
'use strict';
const ipc = require('electron').ipcRenderer;

class BulbScannerService {
    constructor($rootScope, $localForage) {
      console.log("BulbScannerService() constructor");
      this.devices = [];
      this.$localForage = $localForage;
      this.scanning = false;
      
      this.$rootScope = $rootScope;
      

      ipc.on('discover', function(event, device) {
        console.log("BulbScannerService: Discovered Device", device);
        
        // let uuid = device.uuid;
        // this.devices[uuid] = device;
        console.log("BulbScannerService this.devices", this.devices);
        let deviceKnown = false;
        this.devices.forEach(function(existingDevice, index) {
          if (existingDevice.uuid == device.uuid) {
            deviceKnown = true;
          }
        });
        
        if (!deviceKnown) {
          this.devices.push(device);
        }
        
        this.$localForage.setItem('devices', this.devices).then(function(data) {
          console.log("SetItem", data);
          this.$rootScope.$broadcast('devices_changed');
        }.bind(this));
      }.bind(this));
      
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
