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
app.controller('loginController', function($http, $rootScope, $scope, $location) {
	if (Parse.User.current()) {
		$location.path('/timeline');
	}
});
app.controller('newController', function($http, $rootScope, $scope, $location) {
	$scope.currentUser = Parse.User.current();
	$scope.filename = null;
	$rootScope.currentSection = 'new';
	$scope.date = new Date();

	var parseFile;

	$scope.upload = function (files) {
		if (files && files.length) {
			$scope.$apply(function () {
				$scope.filename = files[0].name;
			});
			parseFile = new Parse.File(files[0].name, files[0]);

			parseFile.save().then(function() {
			}, function(error) {
				console.log("error:", error);
			});
		};
	};

	$scope.save = function ($event) {
		var file = new Parse.Object("Post");

		file.set('subject', this.subject);
		file.set('description', this.description);
		file.set('file', parseFile);
		file.save();

		$location.path('/timeline');
		$event.preventDefault();
	};
});
app.controller('registerController', function($http, $rootScope, $scope, $location) {
	if (Parse.User.current()) {
		$location.path('/timeline');
	}
});
app.controller('timelineController', function($http, $rootScope, $scope, $location) {
	if (!$rootScope.currentUser) $location.path('/login');
	$scope.posts = new Array();
	$rootScope.currentSection = 'dashboard';

	var query = new Parse.Query(Parse.Object.extend("Post"));

	query.find({
		success: function(results) {
			for (item in results) {
				$scope.$apply(function () {
					$scope.posts.push(results[item]);
				})
			}
		},
		error:function(error) {
			alert("Error when getting objects!");
		}
	});
});
app.controller('userController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentUser = Parse.User.current();
	$rootScope.error = false;
	$rootScope.loading = false;

	$scope.login = function () {
		$rootScope.error = false;
		$rootScope.loading = true;

		Parse.User.logIn(this.username, this.password, {
			success: function(user) {
				$rootScope.currentUser = Parse.User.current();
				$rootScope.loading = false;
				$location.path('/timeline');
			},
			error: function(user, error) {
				$scope.$apply(function () {
					$rootScope.error = true;
					$rootScope.loading = false;
				})
			}
		});
	};

	$scope.logout = function () {
		Parse.User.logOut();
		$rootScope.currentUser = false;
		$location.path('/login');
	}

	$scope.create = function ($event) {
		var user = new Parse.User();

		$rootScope.error = false;
		$rootScope.loading = true;

		user.set('username', this.username);
		user.set('password', this.password);
		user.set('email', this.email);
		user.set('registration', this.registration);
		user.set('type', 'student');

		user.signUp(null, {
			success: function(user) {
				$location.path('/timeline');
			},
			error: function(user, error) {
				$scope.$apply(function () {
					$rootScope.error = true;
					$rootScope.loading = false;
				})
			}
		});
	};
});
app.directive('keypress', function ($document, $rootScope) {
	return {
		restrict: 'A',
		link: function () {
			$document.bind('keypress', function (e) {
				$rootScope.$broadcast('keypress', e, String.fromCharCode(e.which));
			});
		}
	}
});
