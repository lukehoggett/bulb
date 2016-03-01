/* jshint esnext: true */
import angular from 'angular';
import ngRoute from 'angular-route';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngMdIcons from 'angular-material-icons';
import LocalForageModule from 'angular-localforage';


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

console.log("Imported Controllers", AppCtrl);

import {
  BulbScannerService
} from './services/bulb-scanner.service'


console.log("Imported Services");
console.log(LocalForageModule);
const _templateBase = './scripts/';

angular.module('bulb', [
    'ngRoute',
    'ngMdIcons',
    'ngMaterial',
    'ngAnimate',
    'LocalForageModule'
  ])
  .service('bulbScannerService', BulbScannerService)
  .controller('appCtrl', AppCtrl)
  .controller('menuCtrl', MenuCtrl)
  .controller('listCtrl', ListCtrl)
  .controller('characteristicCtrl', CharacteristicCtrl)
  .config(['$routeProvider', routes])
  .config(config)
  .config(['$localForageProvider', function($localForageProvider) {
    console.log("Configuring LocalForageModule", $localForageProvider);
    $localForageProvider.config({
        driver      : 'localStorageWrapper', // if you want to force a driver
        name        : 'myApp', // name of the database and prefix for your data, it is "lf" by default
        version     : 1.0, // version of the database, you shouldn't have to use this
        storeName   : 'keyvaluepairs', // name of the table
        description : 'some description'
    });
}]);


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
