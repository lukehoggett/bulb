/* jshint esnext: true */
/* jshint node: true */
'use strict';
const ipc = require('electron').ipcRenderer;

class BulbScannerService {
    constructor($localForage) {
      this.devices = [];
      this.$localForage = $localForage;
      this.scanning = false;
      console.log("BulbScannerService() constructor");
      
      // this.$localForage.setItem("device 01", {uuid: "2342342342efsdw434", services: {notify: "blah"}}).then(function() {
      //   $localForage.getItem('device 01').then(function(data) {
      //       console.log("local forage get", data);
      //   });
      // });
      
      
      ipc.on('discover', function(event, device) {
        console.log("bulb scanner ipcRenderer", device);
        this.devices.push(device);
        console.log("this.devices", this.devices, this.devices.length);
        this.$localForage.setItem('devices', this.devices).then(function(data) {
          console.log(data);
        });
        
         
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
      return this.devices;
    }
}
export {
  BulbScannerService
};
