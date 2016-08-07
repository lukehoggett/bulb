'use strict';
import { bulbHeaderComponent } from './bulb-header.component';

export function bulbHeader() {
  return angular
    .module('bulb.header', [])
    .directive('bulbHeader', bulbHeaderComponent);
}
