'use strict';

angular.module('myApp.signup', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/signup', {
    templateUrl: 'signup/signup.html',
    controller: 'signupCtrl'
  });
}])

.controller('signupCtrl', ['$scope','$http',function($scope,$http) {

$scope.url = "http://localhost:3000"

	$scope.signup = function(){

	

    $http({
    method: 'POST',
    url: $scope.url + "/signup",
    data: {
    	email: $scope.email,
    	password: $scope.password
    },
    headers: {'Content-Type': 'pplication/json'}
});


	}

	


}]);