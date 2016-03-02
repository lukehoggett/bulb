/* jshint esnext: true */
/* jshint node: true */
'use strict';


class ListCtrl {

  constructor($scope, $mdSidenav, $localForage) {
    console.log("List Controller constructor");
    
    this.$mdSidenav = $mdSidenav;
    // this.$localForage = $localForage;
    
    // this.$localForage.getItem('devices').then(function(devices) {
    //     console.log("ListCtrl startup device check", devices);
    // });
    this.devices = [];
    $localForage.getItem('devices').then(function(devices) {
        console.log("ListCtrl startup device check", devices, this);
        this.devices = devices;
    }.bind(this));
    // this.devices = "devices this";
    // $scope.devices = "devices scope";
    $scope.devices = [];
    $localForage.bind($scope, {
      key: 'devices',
      defaultValue: {}, // a default value (needed if it is not already in the database)
      scopeKey: 'devices', // the name of the scope key (if you want it to be different from key)
      name: 'bulb' // instance name
    });
    // this.devices = $scope.devices;
    
    $scope.$watch('devices', function(val) {
      console.log("watching scope devices", $scope.devices, val);
      this.devices = $scope.devices;
    }.bind(this), true);
  
  }
  
  showCharacteristics() {
    console.log("show characteristic");
    this.$mdSidenav('characteristic').toggle();
  }
  
}

ListCtrl.$inject = ['$scope', '$mdSidenav', '$localForage'];

export {
  ListCtrl
};
