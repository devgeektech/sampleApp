'use strict';

angular.module('myApp.login', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'loginCtrl'
        });
    }])

    .controller('loginCtrl', ['$scope', '$http', function($scope, $http) {

        $scope.url = "http://localhost:3000";


        $scope.login = function() {



            $http({
                method: 'POST',
                url: $scope.url + "/login",
                data: {
                    email: $scope.email,
                    password: $scope.password
                },
                headers: { 'Content-Type': 'application/json' }
            }).then(function successCallback(response) {
                console.log(response);
                $scope.error = false;

            }, function errorCallback(response) {
                console.log(response);
                $scope.error = response.message;

            });


        }



    }]);