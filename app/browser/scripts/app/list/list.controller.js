/* jshint esnext: true */
/* jshint node: true */
'use strict';

const ipc = require('electron').ipcRenderer;

class ListCtrl {

  constructor($rootScope, $mdSidenav, bulbScannerService) {

    this.$mdSidenav = $mdSidenav;
    this.$rootScope = $rootScope;
    this.devices = {};
    console.log(this);
    this.setDevices(bulbScannerService.getDevices());
    
    $rootScope.$on('device-update', function() {
      console.log("Received Broadcast: device-update", this);
      this.setDevices(bulbScannerService.getDevices());
      console.log(this.getDevices());
    }.bind(this));
    
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
  
  getDevices() {
    return this.devices;
  }
  
  setDevices(devices) {
    this.devices = devices;
    console.log("listctrl SETTING DEVICES", devices, this.devices);
  }

}

ListCtrl.$inject = ['$rootScope', '$mdSidenav', 'bulbScannerService'];

export {
  ListCtrl
};
