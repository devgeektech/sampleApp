'use strict';

angular.module('myApp.redirect', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/redirect', {
            templateUrl: 'redirect/redirect.html',
            controller: 'redirectCtrl'
        });
    }])

    .controller('redirectCtrl', ['$scope', '$http','$cookies','$location', function($scope, $http,$cookies,$location) {

    var token = $location.$$search.token;
        if(token){
            $cookies.put('token',token);
            $location.path('/home');
        }else{
            $location.path('/login');
        }



    }]);