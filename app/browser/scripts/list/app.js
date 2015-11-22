/* jshint esnext: true */
import angular from 'angular';
import ngRoute from 'angular-route';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import {
    ListCtrl
}
from './controller';

const _templateBase = './scripts/';

angular.module('bulb', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate'
    ])
    .controller('listCtrl', ListCtrl)
    .config(['$routeProvider', function($routeProvider) {
        console.log($routeProvider);
        $routeProvider.when('/', {
            templateUrl: _templateBase + 'list/list.html',
            controller: 'listCtrl',
            controllerAs: '_ctrl'
        });
        // $routeProvider.otherwise({
        //     redirectTo: '/'
        // });
    }])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('pink')
            .accentPalette('orange');
    });
