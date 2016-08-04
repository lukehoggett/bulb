'use strict';
import { bulbCharacteristicComponent } from './bulb-characteristic.component';

export function bulbCharacteristic() {
  return angular
    .module('bulb.characteristic', [])
    .directive('bulbCharacteristic', bulbCharacteristicComponent);
}
