// external libraries
import angular from 'angular';
import ngRoute from 'angular-route';
// import uiRouter from 'angular-ui-router';

import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngMdIcons from 'angular-material-icons';
import ngOrderObjectBy from 'angular-order-object-by';
import mdColorPicker from 'md-color-picker';

// constants
import * as C from '../../main/dist/constants';

// routes
import {routerConfig} from './index.route';

// controllers
import {
  AppCtrl
} from './app.controller';

import {
  bulbMenu
} from './bulb-menu/bulb-menu.module';

import {
  bulbCharacteristic
} from './bulb-characteristic/bulb-characteristic.module';


import {
  DeviceListCtrl
} from './device-list/device-list.controller';
import {
  GroupListCtrl
} from './group-list/group-list.controller';

// services
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


bulbMenu();
bulbCharacteristic();

angular.module('bulb', [
    'ngRoute',
    // 'ui.router',
    'ngMdIcons',
    'ngMaterial',
    'ngAnimate',
    'ngOrderObjectBy',
    'mdColorPicker',
    'bulb.menu',
    'bulb.characteristic'
  ])
  // .component('uiRoute', uiRoute)
  .constant('C', C)
  .service('bulbService', BulbService)
  .service('groupService', GroupService)
  .service('menuService', MenuService)
  .controller('appCtrl', AppCtrl)
  .controller('device-listCtrl', DeviceListCtrl)
  .controller('group-listCtrl', GroupListCtrl)
  .config(['$routeProvider', routes])
  // .config(routerConfig)
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
    .primaryPalette('blue-grey')
    .accentPalette('deep-orange');
}
