/* jshint esnext: true */
/* jshint node: true */
'use strict';


class CharacteristicCtrl {

  constructor($scope, $mdSidenav, bulbService) {
    this.mdSidenav = $mdSidenav;
    this.$scope = $scope;
    this.bulbService = bulbService;
    
    this.type = "";
    this.effect = ""
    
    this.colour = {
      red: 0,
      green: 0,
      blue: 0
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
    
    // this.bulbService
  }
  
}
export {
  CharacteristicCtrl
};
