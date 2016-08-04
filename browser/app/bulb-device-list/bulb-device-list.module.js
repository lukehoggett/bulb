'use strict';
import { bulbDeviceListComponent } from './bulb-device-list.component';

export function bulbDeviceList() {
  return angular
    .module('bulb.device-list', [])
    .directive('bulbDeviceList', bulbDeviceListComponent);
}
