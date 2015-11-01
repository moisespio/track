app.controller('userController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentUser = Parse.User.current();
	$rootScope.error = false;
	$rootScope.loading = false;

	var notifications = new Parse.Query(Parse.Object.extend('Message'));
	notifications.equalTo('receiverId', $rootScope.currentUser);
	notifications.equalTo('unread', true);

	notifications.find({
		success: function(results) {
			$rootScope.messagesCounter = results.length;
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});

	$scope.login = function () {
		$rootScope.error = false;
		$rootScope.loading = true;

		Parse.User.logIn(this.username, this.password, {
			success: function(user) {
				$rootScope.currentUser = Parse.User.current();
				$rootScope.loading = false;
				location.reload();
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
		user.set('name', this.name);
		user.set('type', this.type);

		user.signUp(null, {
			success: function(user) {
				location.reload();
			},
			error: function(user, error) {
				$rootScope.error = true;
				$rootScope.loading = false;
			}
		});
	};
});