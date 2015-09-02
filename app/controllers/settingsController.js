app.controller('settingsController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentSection = 'settings';
	$scope.showSuccessMessage = false;

	$scope.name = $rootScope.currentUser.attributes.name;
	$scope.email = $rootScope.currentUser.attributes.email;
	$scope.username = $rootScope.currentUser.attributes.username;
	$scope.password = $rootScope.currentUser.attributes.password;
	$scope.isTeacher = $rootScope.currentUser.attributes.type == 'teacher';

	console.log("$rootScope.currentUser:", $rootScope.currentUser);

	$scope.update = function ($event) {
		var currentUser = Parse.User.current();

		currentUser.set('name', $scope.name);
		currentUser.save();

		$scope.showSuccessMessage = true;

		$event.preventDefault();
	};
});