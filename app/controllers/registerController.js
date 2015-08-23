app.controller('registerController', function($http, $rootScope, $scope, $location) {
	if (Parse.User.current()) {
		$location.path('/timeline');
	}
});