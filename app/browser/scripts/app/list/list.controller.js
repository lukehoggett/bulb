/* jshint esnext: true */
/* jshint node: true */
'use strict';

const ipc = require('electron').ipcRenderer;

class ListCtrl {

  constructor($rootScope, $mdSidenav, bulbScannerService) {
    console.log("List Controller constructor");

    this.$mdSidenav = $mdSidenav;
    this.$rootScope = $rootScope;
    this.devices = bulbScannerService.getDevices();
    
  }

  selectDevice(device) {
    console.log("ListCtrl: selectDevice", device);
    this.$rootScope.$broadcast('device_selected', device.uuid);
    this.showCharacteristicsPanel();
  }
  
  connect(device) {
    console.log("connecting to ", device.uuid);
    ipc.send('connect', device.uuid);
  }
  
  getCharacterisics(device) {
    console.log("list get characteristics", device);
    ipc.send('get-characteristics', device.uuid);
  }

  showCharacteristicsPanel() {
    console.log("show characteristic");
    this.$mdSidenav('characteristic').toggle();
  }

}

ListCtrl.$inject = ['$rootScope', '$mdSidenav', 'bulbScannerService'];

export {
  ListCtrl
};
