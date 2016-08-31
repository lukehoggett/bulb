// external libraries
import angular from 'angular';
import 'angular-ui-router';
import 'angular-material';
import 'angular-animate';
import 'angular-material-icons';
import 'angular-order-object-by';
import 'md-color-picker';

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
  BulbDeviceService
} from './core/services/bulb-device/bulb-device.service';
import {
  BulbGroupService
} from './core/services/bulb-group/bulb-group.service';

import {
  BulbPreview
} from './core/directives/bulb-preview/bulb-preview.directive';

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
  .service('bulbDeviceService', BulbDeviceService)
  .service('bulbGroupService', BulbGroupService)
  .directive('bulbPreview', () => { return new BulbPreview(); })
  .config(config)
  .config(routerConfig);

// function config($mdThemingProvider) {
//   $mdThemingProvider.theme('default')
//     .primaryPalette('blue-grey')
//     .accentPalette('deep-orange');
// }
function config($mdThemingProvider) {
  $mdThemingProvider.definePalette('primary', {
    '50': '#e0dad1',
    '100': '#c2b4a3',
    '200': '#ab9981',
    '300': '#8a755b',
    '400': '#77664f',
    '500': '#655643',
    '600': '#534637',
    '700': '#40372b',
    '800': '#2e271e',
    '900': '#1b1712',
    'A100': '#e0dad1',
    'A200': '#c2b4a3',
    'A400': '#77664f',
    'A700': '#40372b',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100 A200'
  });

  $mdThemingProvider.definePalette('accent', {
    '50': '#fbfdfc',
    '100': '#c8e2d8',
    '200': '#a4cfbd',
    '300': '#75b69c',
    '400': '#61ac8d',
    '500': '#529c7e',
    '600': '#47886e',
    '700': '#3d745e',
    '800': '#32604d',
    '900': '#284c3d',
    'A100': '#fbfdfc',
    'A200': '#c8e2d8',
    'A400': '#61ac8d',
    'A700': '#3d745e',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 500 A100 A200 A400'
  });

  $mdThemingProvider.definePalette('mcgpalette2', {
    '50': '#fdfdf1',
    '100': '#f4f5ad',
    '200': '#edee7b',
    '300': '#e5e63c',
    '400': '#e1e321',
    '500': '#cacb1a',
    '600': '#afb017',
    '700': '#949513',
    '800': '#797a10',
    '900': '#5e5e0c',
    'A100': '#fdfdf1',
    'A200': '#f4f5ad',
    'A400': '#e1e321',
    'A700': '#949513',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 500 600 700 A100 A200 A400 A700'
  });

  $mdThemingProvider.definePalette('background', {
    '50': '#fffefd',
    '100': '#f7e4b9',
    '200': '#f1d186',
    '300': '#eab946',
    '400': '#e7ae2b',
    '500': '#daa019',
    '600': '#bf8c16',
    '700': '#a37813',
    '800': '#886410',
    '900': '#6c4f0c',
    'A100': '#fffefd',
    'A200': '#f7e4b9',
    'A400': '#e7ae2b',
    'A700': '#a37813',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 500 600 A100 A200 A400'
  });

  $mdThemingProvider.theme('bulb')
  .primaryPalette('primary')
  .accentPalette('accent');

  $mdThemingProvider.setDefaultTheme('bulb');
}
