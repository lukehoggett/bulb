'use strict';

export function bulbGroupListRoute($stateProvider) {
  'ngInject';
  $stateProvider
    .state('group-list', {
      url: '/group-list',
      parent: 'app',
      template: `<bulb-group-list></bulb-group-list>`
    });
}
