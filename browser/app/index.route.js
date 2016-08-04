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
  console.info("routerConfig");
  // If the user enters an URL that doesn't match the above routes then redirect to '/devices' route.
  $urlRouterProvider.otherwise('/devices');
}
