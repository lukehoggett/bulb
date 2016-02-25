/* jshint esnext: true */
/* jshint node: true */
'use strict';

const ipc = require('electron').ipcRenderer;


class ListCtrl {

  constructor() {
    console.log("ListCtrl", window.location, process);
    
    this.scan = false;
    this.scanStateMessage = "Start Scan"
    this.electronVersion = process.versions.electron;
    this.chromeVersion = process.versions.chrome;
    this.nodeVersion = process.versions.node;
    this.peripherals = [];
    ipc.on('discover', function(event, message) {
      console.log("ipcRenderer", message);
      
      this.peripherals.push(message);
    }.bind(this));
  }
  
  toggleScan() {
    if (this.scan) {
      this.stopScan();
      this.scan = false;
      this.scanStateMessage = "Start Scan";
    } else {
      this.startScan();
      this.scan = true;
      this.scanStateMessage = "Stop Scan";
    }
  }
  
  startScan() {
    ipc.send('startScan')
  }
  
  stopScan() {
    ipc.send('stopScan');
  }
  
  doCrash() {
    console.log("Crash Reporting");
    ipc.send('crash', 'Something bad happened...');
  }

  openDevTools() {
    console.log("DevTools");
    ipc.send('devTools', null);
  }
  
  


}
export {
  ListCtrl
};
