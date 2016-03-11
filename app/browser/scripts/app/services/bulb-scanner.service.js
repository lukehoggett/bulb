/* jshint esnext: true */
/* jshint node: true */
'use strict';
const ipc = require('electron').ipcRenderer;

class BulbScannerService {
    constructor($rootScope) {
      console.log("BulbScannerService() constructor");
      this.devices = {};
      this.scanning = false;
      
      this.$rootScope = $rootScope;
      

      ipc.on('discover', function(event, device) {
        console.log("BulbScannerService: Discovered Device", device);
        
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
      
      ipc.send('request-stored-devices', function(event) {
        console.log("BulbScannerService: request stored devices", event, arguments);
      });
      
      ipc.on('send-stored-devices', function(event, device) {
        console.log("BulbScannerService: send stored devices", device);
        this.devices[device.uuid] = device;
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
