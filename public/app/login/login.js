'use strict';

angular.module('myApp.login', ['ngRoute','ngCookies'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'loginCtrl'
        });
    }])

    .controller('loginCtrl', ['$scope', '$http','$cookies','$location', function($scope, $http, $cookies,$location) {

        $scope.url = "http://localhost:3000";


        if($cookies.get('token')){
            $location.path("/home");
        }




        $scope.login = function() {



            var obj = {"username": $scope.email,"password": $scope.password};


            $http({
                method: 'POST',
                url: $scope.url + "/login",
                processData: false,
                data: obj,
                headers: {  "content-type": "application/json" }

            }).then(function successCallback(response) {
                $cookies.put('token', response.data.token);
                $location.path("/home");
                $scope.error = false;

            }, function errorCallback(response) {
                console.log(response);
                $scope.error = response.message;

            });


        }



    }]);