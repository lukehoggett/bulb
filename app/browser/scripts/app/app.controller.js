/* jshint esnext: true */
/* jshint node: true */
'use strict';

const ipc = require('electron').ipcRenderer;

class AppCtrl {

  constructor($mdSidenav, bulbScannerService, bulbStoreService) {
    
    console.log("App Controller constructor");
    this.mdSidenav = $mdSidenav;
    this.scanner = bulbScannerService;
    this.store = bulbStoreService;
    
    this.scanStateMessage = "Start Scan"

  }
  
  toggleScan() {
    if (this.scanner.isScanning()) {
      this.scanner.stopScan();
      this.scanStateMessage = "Start Scan";
    } else {
      this.scanner.startScan();
      this.scanStateMessage = "Stop Scan";
    }
    this.scan = this.scanner.isScanning(); 
  }
  
  showDevices() {
    console.log("show devices");
  }
  
  navSelect(item) {
    if (item.id == 1) {
      this.showDevices();
    } else if (item.id == 2) {
      
    }
  }
  
  toggleMenu() {
    console.log("Toggle Menu", this.mdSidenav);
    this.mdSidenav('menu').toggle();
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

AppCtrl.$inject = ['$mdSidenav', 'bulbScannerService', 'bulbStoreService'];
export {
  AppCtrl
};
