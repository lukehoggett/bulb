/* jshint esnext: true */
/* jshint node: true */
'use strict';
const ipc = require('electron').ipcRenderer;

class BulbScannerService {
    constructor($rootScope) {
      console.log("BulbScannerService() constructor");
      this.devices = [];
      this.scanning = false;
      
      this.$rootScope = $rootScope;
      

      ipc.on('discover', function(event, device) {
        console.log("BulbScannerService: Discovered Device", device);
        
        this.devices.forEach(function(dev, key) {
          console.log("each device", dev);
          // if 
          device.powered = true; 
        });
        this.devices.push(device);
        
        
      }.bind(this));
      
      ipc.send('request-stored-devices', function(event) {
        console.log("BulbScannerService: request stored devices", event, arguments);
      });
      
      ipc.on('send-stored-devices', function(event, device) {
        console.log("BulbScannerService: send stored devices", device);
        this.devices.push(device);
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
