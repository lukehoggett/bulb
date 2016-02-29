/* jshint esnext: true */
import angular from 'angular';
import ngRoute from 'angular-route';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngMdIcons from 'angular-material-icons';

console.log("Imported vendor libraries");

import {
  AppCtrl
} from './app.controller';
import {
  MenuCtrl
} from './menu/menu.controller';
import {
  ListCtrl
} from './list/list.controller';
import {
  CharacteristicCtrl
} from './characteristic/characteristic.controller';

console.log("Imported Controllers");

import {
  BulbScannerService
} from './services/bulb-scanner.service'

console.log("Imported Services");



const _templateBase = './scripts/';

angular.module('bulb', [
    'ngRoute',
    'ngMdIcons',
    'ngMaterial',
    'ngAnimate'
  ])
  .service('bulbScannerService', BulbScannerService)
  .controller('appCtrl', AppCtrl)
  .controller('menuCtrl', MenuCtrl)
  .controller('listCtrl', ListCtrl)
  .controller('characteristicCtrl', CharacteristicCtrl)
  .config(['$routeProvider', routes])
  .config(config);


function routes($routeProvider) {
  console.log("Routes");
  $routeProvider.when('/', {
    templateUrl: _templateBase + 'app/app.html',
    controller: 'appCtrl',
    controllerAs: 'app'
  });
  console.log("End Routes");
}

function config($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('light-blue');
}
