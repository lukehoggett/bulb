'use strict';

export function bulbDeviceListRoute($stateProvider) {
  'ngInject';
  $stateProvider
    .state('device-list', {
      url: '/device-list',
      parent: 'app',
      template: `<bulb-device-list class="layout-fill"></bulb-device-list>`
    });
}
