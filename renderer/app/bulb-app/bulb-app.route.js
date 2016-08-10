'use strict';

export function bulbAppRoute($stateProvider) {
  'ngInject';
  $stateProvider
    .state('app', {
      url: '',
      abstract: true,
      templateUrl: 'app/bulb-app/bulb-app.views/bulb-app.view.html'
      // resolve: {
      //   Models: Sb2ModelsResolve
      // }
    });
  // function Sb2ModelsResolve(Sb2Models) {
  //   'ngInject';
  //   return Sb2Models.getAllResources();
  // }
}
