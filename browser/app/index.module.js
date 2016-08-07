// external libraries
import angular from 'angular';
// import ngRoute from 'angular-route';
import uiRouter from 'angular-ui-router';

import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngMdIcons from 'angular-material-icons';
import ngOrderObjectBy from 'angular-order-object-by';
import mdColorPicker from 'md-color-picker';

// constants
import * as C from '../../main/dist/constants';

// routes 
import {
  routerConfig
} from './index.route';

// controllers
import {
  bulbApp
} from './bulb-app/bulb-app.module';
import {
  bulbHeader
} from './bulb-header/bulb-header.module';
import {
  bulbMenu
} from './bulb-menu/bulb-menu.module';
import {
  bulbCharacteristic
} from './bulb-characteristic/bulb-characteristic.module';
import {
  bulbDeviceList
} from './bulb-device-list/bulb-device-list.module';
import {
  bulbGroupList
} from './bulb-group-list/bulb-group-list.module';

// services
import {
  BulbService
} from './services/bulb.service';
import {
  GroupService
} from './services/group.service';

const _templateBase = './app/';

bulbApp();
bulbHeader();
bulbMenu();
bulbCharacteristic();
bulbDeviceList();
bulbGroupList();

angular.module('bulb', [
    'ui.router',
    'ngMdIcons',
    'ngMaterial',
    'ngAnimate',
    'ngOrderObjectBy',
    'mdColorPicker',
    'bulb.app',
    'bulb.header',
    'bulb.menu',
    'bulb.characteristic',
    'bulb.device-list',
    'bulb.group-list'
  ])
  .constant('C', C)
  .service('bulbService', BulbService)
  .service('groupService', GroupService)
  .config(config)
  .config(routerConfig);

function config($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('deep-orange');
}
