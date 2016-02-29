/* jshint esnext: true */
/* jshint node: true */
'use strict';
const ipc = require('electron').ipcRenderer;

class BulbScannerService {
    constructor() {
      this.devices = [];
      this.scanning = false;
      
      ipc.on('discover', function(event, message) {
        console.log("bulb scanner ipcRenderer", message);
        this.devices.push(message);
      }.bind(this));
    }
    
    isScanning() {
      return this.scanninig;
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
