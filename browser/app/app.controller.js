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
    console.info('AppCtrl menuService state', this.menuService.getState());
    
    ipc.on('error', (event, message) => {
      console.info('Error:', message);
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
    console.log('app.controller isScanning', this.bulbService.isScanning());
    if (this.bulbService.isScanning()) {
      this.bulbService.stopScan();
    } else {
      this.bulbService.startScan();
    }
    this.scan = this.bulbService.isScanning();
  }

  showDevices() {
    console.log('show devices');
  }

  navSelect(item) {
    if (item.id == 1) {
      this.showDevices();
    } else if (item.id == 2) {

    }
  }

  toggleMenu() {
    console.log('Toggle Menu', this.mdSidenav);
    this.mdSidenav('menu').toggle();
  }

  doCrash() {
    console.log('Crash Reporting');
    ipc.send('crash', 'Something bad happened...');
  }

  openDevTools() {
    console.log('DevTools');
    ipc.send('dev.tools.open', null);
  }




}

AppCtrl.$inject = ['$mdSidenav', '$mdToast', 'bulbService', 'menuService'];
export {
  AppCtrl
};
