'use strict';
import { bulbDeviceListComponent } from './bulb-device-list.component';
import { bulbDeviceListRoute } from './bulb-device-list.route';

export function bulbDeviceList() {
  return angular
    .module('bulb.device-list', [])
    .directive('bulbDeviceList', bulbDeviceListComponent)
    .config(bulbDeviceListRoute);
}
