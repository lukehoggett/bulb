'use strict';

export function bulbHeaderComponent() {
  let component = {
    scope: {},
    restrict: 'EA',
    templateUrl: 'app/bulb-header/bulb-header.views/bulb-header.view.html',
    controller: BulbHeaderController,
    controllerAs: '$ctrl',
    bindToController: true
  };
  return component;
}

const ipc = require('electron').ipcRenderer;

class BulbHeaderController {
  constructor($rootScope, $mdSidenav, $log, bulbDeviceService, C) {
    this.C = C;
    this.$log = $log;
    this.$mdSidenav = $mdSidenav;
    this.bulbDeviceService = bulbDeviceService;
  }

  toggleMenu() {
    this.$log.log('Toggle Menu', this.$mdSidenav);
    this.$mdSidenav('menu').toggle();
  }

  toggleScan() {
    // this.$log.log('header.controller isScanning', this.bulbDeviceService.isScanning());
    if (this.bulbDeviceService.isScanning()) {
      this.bulbDeviceService.stopScan();
    } else {
      this.bulbDeviceService.startScan();
    }
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
