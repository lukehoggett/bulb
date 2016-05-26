/* jshint esnext: true */
import angular from 'angular';
import ngRoute from 'angular-route';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngMdIcons from 'angular-material-icons';
import ngOrderObjectBy from 'angular-order-object-by';
// import ngOrderObjectBy from 'ngOrderObjectBy';
console.log(ngOrderObjectBy);

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
  BulbService
} from './services/bulb.service';

const _templateBase = './scripts/';

angular.module('bulb', [
    'ngRoute',
    'ngMdIcons',
    'ngMaterial',
    'ngAnimate',
    'ngOrderObjectBy'
  ])
  .service('bulbService', BulbService)
  .controller('appCtrl', AppCtrl)
  .controller('menuCtrl', MenuCtrl)
  .controller('listCtrl', ListCtrl)
  .controller('characteristicCtrl', CharacteristicCtrl)
  .config(['$routeProvider', routes])
  .config(config);


function routes($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: _templateBase + 'app/app.html',
    controller: 'appCtrl',
    controllerAs: 'app'
  });
}

function config($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('teal')
    .accentPalette('cyan');
}
