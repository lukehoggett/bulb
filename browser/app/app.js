/* jshint esnext: true */
import angular from 'angular';
import ngRoute from 'angular-route';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngMdIcons from 'angular-material-icons';
import ngOrderObjectBy from 'angular-order-object-by';

console.log("Imported vendor libraries");

import {
  AppCtrl
} from './app.controller';
import {
  MenuCtrl
} from './menu/menu.controller';
import {
  DeviceListCtrl
} from './device-list/device-list.controller';
import {
  GroupListCtrl
} from './group-list/group-list.controller';
import {
  CharacteristicCtrl
} from './characteristic/characteristic.controller';
console.log("Imported Controllers");

import { 
  GroupedDevice 
} from './filter/grouped-device.filter';

import {
  MenuService
} from './services/menu.service';
import {
  BulbService
} from './services/bulb.service';
import {
  GroupService
} from './services/group.service';

const _templateBase = './app/';

angular.module('bulb', [
    'ngRoute',
    'ngMdIcons',
    'ngMaterial',
    'ngAnimate',
    'ngOrderObjectBy'
  ])
  .service('bulbService', BulbService)
  .service('groupService', GroupService)
  .service('menuService', MenuService)
  .filter('groupedDevice', GroupedDevice)
  .controller('appCtrl', AppCtrl)
  .controller('menuCtrl', MenuCtrl)
  .controller('device-listCtrl', DeviceListCtrl)
  .controller('group-listCtrl', GroupListCtrl)
  .controller('characteristicCtrl', CharacteristicCtrl)
  .config(['$routeProvider', routes])
  .config(config);


function routes($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: _templateBase + '/app.html',
    controller: 'appCtrl',
    controllerAs: 'app'
  });
}

function config($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('brown')
    .accentPalette('blue');
}
