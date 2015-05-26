var app = angular.module('app', ['ngRoute', 'ngFileUpload']);

app.config(function($routeProvider, $locationProvider) {
	Parse.initialize("SpAKGJzQmYBe1swWZnXzxX5JBJJD0Q8ajk54MQi2", "pLpkxGc3me4mUBRKz56hz3BizENVuTgoCyB8oLLc");

	$locationProvider.html5Mode(true);
	$routeProvider

	.when('/', {
		templateUrl : 'app/views/login.html',
		controller : 'loginController'
	})

	.when('/register', {
		templateUrl : 'app/views/register.html',
		controller : 'registerController'
	})

	.when('/timeline', {
		templateUrl : 'app/views/timeline.html',
		controller : 'timelineController'
	})

	.when('/new', {
		templateUrl : 'app/views/new.html',
		controller : 'newController'
	})

	.otherwise ( { redirectTo: '/' } );
});