'use strict';

angular.module('myApp.home', ['ngRoute','ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.html',
    controller: 'homeCtrl'
  });
}])

.controller('homeCtrl', ['$scope','$http','$cookies','$location',function($scope,$http,$cookies,$location) {

	$scope.url = "http://localhost:3000";

	

	$scope.getUserData = function(){
		 $http({
            method: 'GET',
            url: $scope.url+'/userDetails',
            headers: {'Authorization': 'bearer '+$cookies.get('token')}
        }).success(function(data){
            console.log(data);
            $scope.userDetails = data;
        }).error(function(error){
				console.log(error);        
});
	}


	$scope.logout = function(){
	$cookies.remove('token');
	$location.path('/login');
	}


	if($cookies.get('token')){
		$scope.getUserData();
	}else{
		$location.path('/login');
	}

}]);