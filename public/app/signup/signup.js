'use strict';

angular.module('myApp.signup', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/signup', {
            templateUrl: 'signup/signup.html',
            controller: 'signupCtrl'
        });
    }])

    .controller('signupCtrl', ['$scope', '$http', function($scope, $http) {

        $scope.url = "http://localhost:3000";
        $scope.error = false;

        $scope.user ={};
        $scope.signup = function() {



            $http({
                method: 'POST',
                url: $scope.url + "/signup",
                data: {
                    email: $scope.email,
                    username: $scope.username,
                    name: $scope.name,
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