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



            var obj = {"username": $scope.email,"password": $scope.password};


            $http({
                method: 'POST',
                url: $scope.url + "/login",
                processData: false,
                data: obj,
                headers: {  "content-type": "application/json" }

            }).then(function successCallback(response) {
                console.log(response.token);
                $scope.error = false;

            }, function errorCallback(response) {
                console.log(response);
                $scope.error = response.message;

            });


        }



    }]);