/* jshint esnext: true */
/* jshint node: true */
'use strict';


class CharacteristicCtrl {

  constructor($scope, $mdSidenav) {
    console.log("Characteristic Controller constructor");
    this.mdSidenav = $mdSidenav;
    this.$scope = $scope;
    
    this.type = "";
    this.effect = ""
    
    this.colour = {
      red: 1,
      green: 1,
      blue: 1
    };
    
    this.saturation = 1;
    this.speed = 1;
    
    this.$scope.$on('device_selected', this.deviceSelected);
    
  }
  
  deviceSelected(event, uuid) {
    console.log("CharCtrl device_selcted", uuid);
  }
  
  togglePane() {
    console.log("Toggling Pane", this.mdSidenav);
    this.mdSidenav('characteristic').toggle();
  }
  
}
export {
  CharacteristicCtrl
};
