'use strict';
import { bulbGroupListComponent } from './bulb-group-list.component';
import { bulbGroupListRoute } from './bulb-group-list.route';

export function bulbGroupList() {
  return angular
    .module('bulb.group-list', [])
    .directive('bulbGroupList', bulbGroupListComponent)
    .config(bulbGroupListRoute);
}
