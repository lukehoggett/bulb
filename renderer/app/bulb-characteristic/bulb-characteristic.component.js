'use strict';

export function bulbCharacteristicComponent() {
  let component = {
    scope: {},
    restrict: 'EA',
    templateUrl: 'app/bulb-characteristic/bulb-characteristic.views/bulb-characteristic.view.html',
    controller: BulbCharacteristicController,
    controllerAs: '$ctrl',
    bindToController: true
  };
  return component;
}

class BulbCharacteristicController {

  constructor($scope, $mdSidenav, bulbService, groupService, $log) {
    this.mdSidenav = $mdSidenav;
    this.$scope = $scope;
    this.bulbService = bulbService;
    this.groupService = groupService;
    this.$log = $log;

    this.TYPE_COLOR = 'color';
    this.TYPE_EFFECT = 'effect';
    this.EFFECTS_OFF_VALUES = [0, 0, 0, 0, 255, 0, 1, 0];

    this.DEVICE_EDIT_TYPE = 'device';
    this.GROUP_EDIT_TYPE = 'group';

    this.device = null;
    this.group = null;

    this.editType = this.DEVICE_EDIT_TYPE;

    this.type = '';
    this.effect = {
      saturation: 0,
      red: 0,
      green: 0,
      blue: 0,
      mode: 0,
      speed: 0
    };

    this.effectModes = [
      {
        name: 'Flashing',
        value: 0
      },
      {
        name: 'Pulse',
        value: 1
      },
      {
        name: 'Rainbow',
        value: 2
      },
      {
        name: 'Rainbow Fade',
        value: 3
      },
      {
        name: 'Candle',
        value: 4
      }
    ];

    this.color = {
      saturation: 0,
      red: 0,
      green: 0,
      blue: 0
    };

    this.colorPicker = {};
    this.colorPicker.options = {
      type: 1,
      label: 'Color',
      icon: 'brush',
      default: 'rgb(0,255,0)',
      openOnInput: true,
      clearButton: true,
      alphaChannel: true,
      rgb: true,
      history: false,
      hex: false,
      hsl: false,
      defaultTab: 'sliders'
    };
    // this.colorPicker

    this.$scope.$on('device_selected', this.deviceSelected.bind(this));
    this.$scope.$on('group_selected', this.groupSelected.bind(this));
  }

  deviceSelected(event, uuid) {
    this.$log.log('CharCtrl deviceSelected()', uuid);
    this.togglePane(this.DEVICE_EDIT_TYPE);

    this.device = this.bulbService.get(uuid);

    let colorCharacteristic = this.device.characteristics.color;
    let effectCharacteristic = this.device.characteristics.effect;
    this.color = {
      saturation: colorCharacteristic.data[0],
      red: colorCharacteristic.data[1],
      green: colorCharacteristic.data[2],
      blue: colorCharacteristic.data[3]
    };

    this.effect = {
      saturation: effectCharacteristic.data[0],
      red: effectCharacteristic.data[1],
      green: effectCharacteristic.data[2],
      blue: effectCharacteristic.data[3],
      mode: effectCharacteristic.data[4],
      speed: effectCharacteristic.data[6]
    };
    this.$log.info('DeviceSelected color', this.color);
    this.$log.info('DeviceSelected effect', this.effect);
    this.detectType();
  }

  groupSelected(event, uuid) {
    this.$log.log('CharCtrl groupSelected', uuid);
    this.togglePane(this.GROUP_EDIT_TYPE);

    this.group = this.groupService.get(uuid);
    this.$log.log('CharCtrl this.group', this.group);

    this.color = {
      saturation: 255,
      red: 255,
      green: 128,
      blue: 128
    };
    return;
    // this.device = this.bulbService.get(uuid);
    // let characteristics = this.device.characteristics;
    // this.$log.info('characteristic panel device', characteristics);
  }

  togglePane(source) {
    this.editType = source;
    this.mdSidenav('characteristic').toggle();
  }

  detectType() {
    let currentEffectValues = Array.from(this.device.characteristics.effect.data);
    let match = (this.EFFECTS_OFF_VALUES.length === currentEffectValues.length) && this.EFFECTS_OFF_VALUES.every((value, index) => {
      return value === currentEffectValues[index];
    });
    if (match) {
      this.type = this.TYPE_COLOR;
    } else {
      this.type = this.TYPE_EFFECT;
    }
  }

  save(characteristic) {
    this.$log.log('save()', this, this.colorPicker);
    this.$log.log('save()', this.editType);
    let value = null;
    let colorRGBA = tinycolor(this.colorPicker.color).toRgb();
    if (this.type === this.TYPE_EFFECT) {
      this.$log.log('value is ', this.TYPE_EFFECT, this.colorPicker, this.effect);
      if ([0, 1, 4].indexOf(this.effect.mode) !== -1) {
        this.effect.saturation = 255 - colorRGBA.a * 255;
        this.effect.red = colorRGBA.r;
        this.effect.green = colorRGBA.g;
        this.effect.blue = colorRGBA.b;
      } else {
        this.effect.saturation = 0;
        this.effect.red = 0;
        this.effect.green = 0;
        this.effect.blue = 0;
      }

      value = this.effect;
    } else {
      this.$log.log('value is ', this.TYPE_COLOR);
      // get value from this.colorPicker
      this.$log.log('tinycolor', tinycolor, tinycolor(this.colorPicker.color).toRgb());
      let colorRGBA = tinycolor(this.colorPicker.color).toRgb();
      this.color = {
        saturation: 255 - colorRGBA.a * 255,
        red: colorRGBA.r,
        green: colorRGBA.g,
        blue: colorRGBA.b
      };
      value = this.color;
    }

    // send new values to the event process
    this.$log.log('Save characteristic', characteristic);
    this.$log.log('Save value', value);
    this.$log.log('Save type', this.type);

    switch (this.editType) {
      case this.DEVICE_EDIT_TYPE:
        this.$log.info('device edit');
        this.bulbService.setCharacteristic(this.device.uuid, value, this.type);
        break;
      case this.GROUP_EDIT_TYPE:
        this.$log.info('group edit');
        angular.forEach(this.group.devices, (deviceUUID) => {
          if (this.bulbService.get(deviceUUID).state === this.C.CONNECTED) {
            this.bulbService.setCharacteristic(deviceUUID, value, this.type);
          }
        });
        break;
      default:

    }
  }
}
