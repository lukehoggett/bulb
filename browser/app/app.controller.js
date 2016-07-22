/* jshint esnext: true */
/* jshint node: true */

'use strict';

const ipc = require('electron').ipcRenderer;

class AppCtrl {

  constructor($mdSidenav, $mdToast, bulbService, menuService) {

    this.mdSidenav = $mdSidenav;
    this.bulbService = bulbService;
    this.menuService = menuService;
    this.toast = $mdToast;
    console.info("AppCtrl menuService state", this.menuService.getState());

    ipc.on('error', (event, message) => {
      console.info("Error:", message);
      this.showErrorToast(message);
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
    ipc.send('dev.tools.open', null);
  }




}

AppCtrl.$inject = ['$mdSidenav', '$mdToast', 'bulbService', 'menuService'];
export {
  AppCtrl
};
