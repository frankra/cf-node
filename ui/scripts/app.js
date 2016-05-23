angular.module('CFApp', ['ngRoute', 'ui.bootstrap']).config([
    '$routeProvider'
    function($routeProvider) {
        'use strict';

        $routeProvider.when('/', {
            templateUrl: 'views/home/home.html',
            controller: 'HomeCtrl'
        }).when('/sys', {
            templateUrl: 'views/sys/sys.html',
            controller: 'SysCtrl',
        }).otherwise({
            redirectTo: '/'
        });
    }
]);
