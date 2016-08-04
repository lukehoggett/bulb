'use strict';
import { bulbMenuComponent } from './bulb-menu.component';

export function bulbMenu() {
  return angular
    .module('bulb.menu', [])
    .directive('bulbMenu', bulbMenuComponent);
}
