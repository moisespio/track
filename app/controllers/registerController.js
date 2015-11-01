app.controller('registerController', function($http, $rootScope, $scope, $location) {
	$scope.type = "student"

	if (Parse.User.current()) {
		$location.path('/timeline');
	}
});