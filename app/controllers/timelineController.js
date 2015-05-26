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