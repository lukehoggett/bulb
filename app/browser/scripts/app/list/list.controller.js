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
    $localForage.getItem('devices').then(function(devices) {
        console.log("ListCtrl startup device check", devices);
    });
    $scope.devices = [];
    $localForage.bind($scope, {
      key: 'devices',
      defaultValue: {}, // a default value (needed if it is not already in the database)
      scopeKey: 'devices', // the name of the scope key (if you want it to be different from key)
      name: 'myApp' // instance name
    })
  
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
