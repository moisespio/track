app.controller('studentController', function($http, $rootScope, $scope, $location, $routeParams) {
	$rootScope.currentSection = 'students';

	var query = new Parse.Query(Parse.User);
	query.equalTo('objectId', $routeParams.id);
	query.include('teacherId')

	query.find({
		success: function(user) {
			$scope.$apply(function () {
				$scope.user = user[0];
			})
		}
	});
});