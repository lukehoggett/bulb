/* jshint esnext: true */
/* jshint node: true */
'use strict';


class CharacteristicCtrl {

  constructor($scope, $mdSidenav, bulbService) {
    this.mdSidenav = $mdSidenav;
    this.$scope = $scope;
    this.bulbService = bulbService;
    
    this.device = null;
    
    this.type = "";
    this.effect = {
      saturation: 0,
      red: 0,
      green: 0,
      blue: 0,
      mode: 0,
      speed: 0
    }
    
    this.color = {
      saturation: 0,
      red: 0,
      green: 0,
      blue: 0
    };
    
    this.$scope.$on('device_selected', this.deviceSelected.bind(this));
    
  }
  
  deviceSelected(event, uuid) {
    console.log("CharCtrl device_selcted", uuid);
    this.device = this.bulbService.getDevice(uuid);
    let characteristics = this.device.characteristics;
    console.info("characteristic panel device", characteristics);
    
    this.color = {
      saturation: characteristics.color.value[0],
      red: characteristics.color.value[1],
      green: characteristics.color.value[2],
      blue: characteristics.color.value[3]
    };
    
    this.effect = {
      saturation: characteristics.effects.value[0],
      red: characteristics.effects.value[1],
      green: characteristics.effects.value[2],
      blue: characteristics.effects.value[3],
      mode: characteristics.effects.value[4],
      speed: characteristics.effects.value[6]
    }
    console.info("DeviceSelected color", this.color);
    console.info("DeviceSelected effect", this.effect);
  }
  
  togglePane() {
    console.log("Toggling Pane", this.mdSidenav);
    this.mdSidenav('characteristic').toggle();
    
    // this.bulbService
  }
  
  save(characteristic) {
    // send new values to the event process
    console.log("Save characteristic", characteristic);
    console.log("Save color", this.color);
    console.log("Save effect", this.effect);
    console.log("Save type", this.type);
  }
  
}
export {
  CharacteristicCtrl
};