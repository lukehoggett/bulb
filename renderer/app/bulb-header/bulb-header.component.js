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

class BulbHeaderController {
  constructor($rootScope, $mdSidenav, $log, bulbService) {
    this.$log = $log;
    this.$mdSidenav = $mdSidenav;
    this.bulbService = bulbService;
  }
  
  toggleMenu() {
    this.$log.log('Toggle Menu', this.$mdSidenav);
    this.$mdSidenav('menu').toggle();
  }

  toggleScan() {
    // this.$log.log('header.controller isScanning', this.bulbService.isScanning());
    if (this.bulbService.isScanning()) {
      this.bulbService.stopScan();
    } else {
      this.bulbService.startScan();
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
