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