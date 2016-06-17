/* jshint esnext: true */
/* jshint node: true */
"use strict";



class CharacteristicCtrl {

  constructor($scope, $mdSidenav, bulbService) {
    this.mdSidenav = $mdSidenav;
    this.$scope = $scope;
    this.bulbService = bulbService;
      
    this.TYPE_COLOR = "color";
    this.TYPE_EFFECT = "effect";
    this.EFFECTS_OFF_VALUES = [0,0,0,0,255,0,1,0];
    
    
    this.device = null;
    
    this.type = "";
    this.effect = {
      saturation: 0,
      red: 0,
      green: 0,
      blue: 0,
      mode: 0,
      speed: 0
    };
    
    this.color = {
      saturation: 0,
      red: 0,
      green: 0,
      blue: 0
    };
    
    this.$scope.$on("device_selected", this.deviceSelected.bind(this));
    
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
      saturation: characteristics.effect.value[0],
      red: characteristics.effect.value[1],
      green: characteristics.effect.value[2],
      blue: characteristics.effect.value[3],
      mode: characteristics.effect.value[4],
      speed: characteristics.effect.value[6]
    };
    console.info("DeviceSelected color", this.color);
    console.info("DeviceSelected effect", this.effect);
    this.detectType();
  }
  
  togglePane() {
    console.log("Toggling Pane", this.mdSidenav);
    this.mdSidenav("characteristic").toggle();
  }
  
  detectType() {
    let currentEffectValues = Array.from(this.device.characteristics.effect.value);
    let match = (this.EFFECTS_OFF_VALUES.length === currentEffectValues.length) && this.EFFECTS_OFF_VALUES.every((value, index) => {
      return value == currentEffectValues[index];
    });
    if (match) {
      this.type = this.TYPE_COLOR;
    } else {
      this.type = this.TYPE_EFFECT;
    }
  }
  
  save(characteristic) {
    console.log(this);
    let value = null;
    if (this.type === this.TYPE_EFFECT) {
      console.log("value is ", this.TYPE_EFFECT);
      value = this.effect;
    } else {
      console.log("value is ", this.TYPE_COLOR);
      value = this.color;
    }
    // send new values to the event process
    console.log("Save characteristic", characteristic);
    console.log("Save value", value);
    console.log("Save type", this.type);
    this.bulbService.setCharacteristic(this.device.uuid, value, this.type);
  }
  
}
export {
  CharacteristicCtrl
};
