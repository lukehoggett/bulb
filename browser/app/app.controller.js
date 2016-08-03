/* jshint esnext: true */
/* jshint node: true */

'use strict';

const ipc = require('electron').ipcRenderer;

class AppCtrl {

  constructor($mdSidenav, $mdToast, bulbService, menuService, $log, C) {
    this.C = C;
    this.mdSidenav = $mdSidenav;
    this.bulbService = bulbService;
    this.menuService = menuService;
    this.toast = $mdToast;
    this.$log = $log; 
    
    this.$log.info('AppCtrl menuService state', this.menuService.getState());
    
    ipc.on(this.C.IPC_ERROR, (event, message) => {
      this.$log.info('Error:', message);
      this.showErrorToast(message);
    });
  }

  showErrorToast(message) {
    this.toast.show(
      this.toast.simple()
      .textContent(message)
      .position('bottom left')
      .hideDelay(5000)
    );
  }

  toggleScan() {
    this.$log.log('app.controller isScanning', this.bulbService.isScanning());
    if (this.bulbService.isScanning()) {
      this.bulbService.stopScan();
    } else {
      this.bulbService.startScan();
    }
    this.scan = this.bulbService.isScanning();
  }

  showDevices() {
    this.$log.log('show devices');
  }

  navSelect(item) {
    if (item.id == 1) {
      this.showDevices();
    } else if (item.id == 2) {

    }
  }

  toggleMenu() {
    this.$log.log('Toggle Menu', this.mdSidenav);
    this.mdSidenav('menu').toggle();
  }

  doCrash() {
    this.$log.log('Crash Reporting');
    ipc.send(this.C.IPC_CRASH, 'Something bad happened...');
  }

  openDevTools() {
    this.$log.log('DevTools');
    ipc.send(this.C.IPC_DEV_TOOLS_OPEN, null);
  }




}

AppCtrl.$inject = ['$mdSidenav', '$mdToast', 'bulbService', 'menuService', '$log', 'C'];
export {
  AppCtrl
};
