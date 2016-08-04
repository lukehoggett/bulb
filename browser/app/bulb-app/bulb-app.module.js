'use strict';
import { bulbAppComponent } from './bulb-app.component';

export function bulbApp() {
  return angular
    .module('bulb.app', [])
    .directive('bulbApp', bulbAppComponent);
}
