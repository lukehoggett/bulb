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
// import {
//   MenuCtrl
// } from './menu/menu.controller';
import {
  bulbMenu
} from './menu/bulb-menu.module';

console.warn(bulbMenu);
import {
  DeviceListCtrl
} from './device-list/device-list.controller';
import {
  GroupListCtrl
} from './group-list/group-list.controller';
import {
  CharacteristicCtrl
} from './characteristic/characteristic.controller';

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

angular.module('bulb', [
    'ngRoute',
    // 'ui.router',
    'ngMdIcons',
    'ngMaterial',
    'ngAnimate',
    'ngOrderObjectBy',
    'mdColorPicker',
    'bulb.menu'
  ])
  // .component('uiRoute', uiRoute)
  .constant('C', C)
  .service('bulbService', BulbService)
  .service('groupService', GroupService)
  .service('menuService', MenuService)
  .controller('appCtrl', AppCtrl)
  // .controller('menuCtrl', MenuCtrl)
  .controller('device-listCtrl', DeviceListCtrl)
  .controller('group-listCtrl', GroupListCtrl)
  .controller('characteristicCtrl', CharacteristicCtrl)
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
