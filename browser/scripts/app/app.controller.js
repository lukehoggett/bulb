/* jshint esnext: true */
/* jshint node: true */

'use strict';

const ipc = require('electron').ipcRenderer;

class AppCtrl {

  constructor($mdSidenav, $mdToast, bulbService) {
    
    this.mdSidenav = $mdSidenav;
    this.bulbService = bulbService;
    this.toast = $mdToast;
    // this.errorMessage = ""
    
    ipc.on('error', (event, message) => {
      console.info("Error:", message);
      // this.errorMessage = message;
      this.showErrorToast(message);
      // this.$timeout(() => {
      //   this.errorMessage = "";
      // }, 2000);
    });
    
    this.scanStateMessage = "Stop Scan";
    
    ipc.on('scanning.start', () => {
      this.scanStateMessage = "Stop Scan";
    });
    
    ipc.on('scanning.stop', () => {
      this.scanStateMessage = "Start Scan";
    });

  }
  
  showErrorToast(message) {
    this.toast.show(
      this.toast.simple()
        .textContent(message)
        .position("bottom left")
        .hideDelay(5000)
    );
  }
  
  toggleScan() {
    if (this.bulbService.isScanning()) {
      console.log("app.controller isScanning", this.bulbService.isScanning());
      this.bulbService.stopScan();
      this.scanStateMessage = "Start Scan";
    } else {
      console.log("app.controller isScanning", this.bulbService.isScanning());
      this.bulbService.startScan();
      this.scanStateMessage = "Stop Scan";
    }
    this.scan = this.bulbService.isScanning(); 
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

AppCtrl.$inject = ['$mdSidenav', '$mdToast', 'bulbService'];
export {
  AppCtrl
};
