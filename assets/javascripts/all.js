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

	.when('/students', {
		templateUrl : 'app/views/students.html',
		controller : 'studentsController'
	})

	.when('/notifications', {
		templateUrl : 'app/views/notifications.html',
		controller : 'notificationsController'
	})

	.when('/message', {
		templateUrl : 'app/views/message.html',
		controller : 'messageController'
	})

	.otherwise ( { redirectTo: '/' } );
});
app.controller('loginController', function($http, $rootScope, $scope, $location) {
	if (Parse.User.current()) {
		$location.path('/timeline');
	}
});
app.controller('messageController', function($http, $rootScope, $scope, $location) {

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
		var post = new Parse.Object("Post");

		post.set('subject', this.subject);
		post.set('description', this.description);
		post.set('file', parseFile);
		post.set('userId', $scope.currentUser);
		post.save();

		$location.path('/timeline');
		$event.preventDefault();
	};
});
app.controller('notificationsController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentSection = 'notifications';
	$scope.filter = 'received';
	$scope.selected = {};

	$scope.send = function() {
		var selectedUsers = $.grep($scope.students, function(student) {
			return $scope.selected[student.attributes.name];
		});

		var Message = Parse.Object.extend('Message');
		var messages = new Array();

		for (user in selectedUsers) {
			var message = new Message();

			message.set('senderId', $rootScope.currentUser);
			message.set('receiverId', selectedUsers[user]);
			message.set('subject', $scope.subject);
			message.set('message', $scope.message);
			message.set('unread', true);

			messages.push(message);
		}

		Parse.Object.saveAll(messages, {
			success: function(message) {

			},
			error: function(message, error) {
				alert('Failed to create new object, with error code: ' + error.message);
			}
		});
	}

	$scope.students = new Array();
	var query = new Parse.Query(Parse.User);
	// query.equalTo('teacherId', $rootScope.currentUser);

	query.find({
		success: function(results) {
			for (item in results) {
				$scope.$apply(function () {
					$scope.students.push(results[item]);
				})
			}
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});

	$scope.messages = new Array();
	var Message = Parse.Object.extend('Message');
	var query = new Parse.Query(Message);

	query.find({
		success: function(results) {
			console.log("results:", results)
			for (item in results) {
				$scope.$apply(function () {
					$scope.messages.push(results[item]);
				})
			}
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});
});
app.controller('registerController', function($http, $rootScope, $scope, $location) {
	if (Parse.User.current()) {
		$location.path('/timeline');
	}
});
app.controller('studentsController', function($http, $rootScope, $scope, $location) {
	if (!$rootScope.currentUser) $location.path('/login');
	$rootScope.currentSection = 'students';
	$scope.filter = 'my';

	$scope.$watch('filter', function (currentFilter) {
		searchForStudents(currentFilter);
	});

	var searchForStudents = function (currentFilter) {
		$scope.students = new Array();

		var query = new Parse.Query(Parse.User);

		if (currentFilter == 'my') {
			query.equalTo('teacherId', $rootScope.currentUser);
		} else if (currentFilter == 'without-teacher') {
			query.equalTo('teacherId', null);
		}

		query.find({
			success: function(results) {
				console.log("results:", results)
				for (item in results) {
					$scope.$apply(function () {
						$scope.students.push(results[item]);
					})
				}
			},
			error:function(error) {
				alert('Error when getting objects!');
			}
		});
	};
});
app.controller('timelineController', function($http, $rootScope, $scope, $location) {
	if (!$rootScope.currentUser) $location.path('/login');

	$scope.posts = new Array();
	$rootScope.currentSection = 'dashboard';

	var posts = new Parse.Query(Parse.Object.extend('Post'));
	var users = new Parse.Query(Parse.User);

	var getPosts = function () {
		posts.find({
			success : function (results) {
				console.log("results:", results);
				for (item in results) {
					$scope.$apply(function () {
						$scope.posts.push(results[item]);
					})
				}
			},
			error : function (error) {
				alert('Error when getting objects!');
			}
		});
	}

	if($rootScope.currentUser.attributes.type == 'teacher') {
		var students = new Array();

		users.equalTo('teacherId', $rootScope.currentUser);

		users.find({
			success : function (results) {
				posts.containedIn('userId', results);
				getPosts();
			},
			error : function (error) {
				alert('Error when getting objects!');
			}
		})
	} else {
		posts.equalTo('userId', $rootScope.currentUser);
		getPosts();
	}
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
