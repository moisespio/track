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