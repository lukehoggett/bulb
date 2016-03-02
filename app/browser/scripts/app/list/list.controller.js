/* jshint esnext: true */
/* jshint node: true */
'use strict';


class ListCtrl {

  constructor($rootScope, $mdSidenav, $localForage, bulbScannerService) {
    console.log("List Controller constructor");

    this.$mdSidenav = $mdSidenav;
    this.$localForage = $localForage;
    this.$rootScope = $rootScope;
    // this.$localForage.getItem('devices').then(function(devices) {
    //     console.log("ListCtrl startup device check", devices);
    // });
    this.devices = [];
    console.log(bulbScannerService);

    // this.devices = bulbScannerService.getDevices();

    this.$rootScope.$on('devices_changed', function(event) {
      this.$localForage.getItem('devices').then(function(devices) {
        console.log("ListCtrl: devices changed: local fotage data", devices, arguments);
        this.devices = devices;
      }.bind(this));
    }.bind(this));

  }

  selectDevice(device) {
    console.log("ListCtrl: selectDevice", device);
    this.$rootScope.$broadcast('device_selected', device.uuid);
    this.showCharacteristicsPanel();
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
