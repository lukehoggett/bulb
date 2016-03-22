/* jshint esnext: true */
/* jshint node: true */
'use strict';

const ipc = require('electron').ipcRenderer;

class ListCtrl {

  constructor($rootScope, $mdSidenav, bulbService) {

    this.$rootScope = $rootScope;
    this.$mdSidenav = $mdSidenav;
    this.bulb = bulbService;
  }

  selectDevice(device) {
    console.log("ListCtrl: selectDevice", device);
    this.$rootScope.$broadcast('device_selected', device.uuid);
    this.showCharacteristicsPanel();
  }
  
  getCharacterisics(device) {
    console.log("list get characteristics", device);
    ipc.send('get-characteristics', device.uuid);
  }

  showCharacteristicsPanel() {
    console.log("show characteristic");
    this.$mdSidenav('characteristic').toggle();
  }
  
  updateDeviceName(uuid) {
    console.log("updateDeviceName", uuid, this.bulb.devices[uuid]);
    // send update command to main process
  }
}

ListCtrl.$inject = ['$rootScope', '$mdSidenav', 'bulbService'];

export {
  ListCtrl
};
