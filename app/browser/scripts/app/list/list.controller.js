/* jshint esnext: true */
/* jshint node: true */
'use strict';

const ipc = require('electron').ipcRenderer;

class ListCtrl {

  constructor($rootScope, $mdSidenav, $localForage, bulbScannerService) {
    console.log("List Controller constructor");

    this.$mdSidenav = $mdSidenav;
    this.$localForage = $localForage;
    this.$rootScope = $rootScope;
    
    this.devices = [];
    this.$localForage.getItem('devices').then(function(devices) {
        console.log("ListCtrl startup device check", devices);
        devices.forEach(function(device, index) {
          device.stored = true;
        });
        this.devices = devices;
        
    }.bind(this));
    
    console.log(bulbScannerService);

    // this.devices = bulbScannerService.getDevices();

    this.$rootScope.$on('devices_changed', function(event) {
      this.$localForage.getItem('devices').then(function(devices) {
        console.log("ListCtrl: devices changed - localforage data", devices, this.devices);
        this.devices = devices;
      }.bind(this));
    }.bind(this));
    
    ipc.on('services', function(event, services) {
      console.log("services", services);
    });
    ipc.on('characteristics', function(event, characteristics) {
      console.log("characteristics", characteristics);
    });

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

ListCtrl.$inject = ['$rootScope', '$mdSidenav', '$localForage', 'bulbScannerService'];

export {
  ListCtrl
};
