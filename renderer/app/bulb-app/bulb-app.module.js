'use strict';

import { bulbAppComponent } from './bulb-app.component';
import { bulbAppRoute } from './bulb-app.route';

export function bulbApp() {
  return angular
    .module('bulb.app', [])
    .directive('bulbApp', bulbAppComponent)
    .config(bulbAppRoute);
}
