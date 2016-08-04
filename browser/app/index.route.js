'use strict';

/**
 * @description
 *
 * Defines the router states used in the application.
 *
 * @param $stateProvider
 * @param $urlRouterProvider
 */
export function routerConfig($stateProvider, $urlRouterProvider) {
  'ngInject';
  // If the user enters an URL that doesn't match the above routes then redirect to '/content' route.
  $urlRouterProvider.otherwise('/devices');
}
