app.controller('timelineController', function($http, $rootScope, $scope, $location) {
	if (!$rootScope.currentUser) $location.path('/login');

	$scope.posts = new Array();
	$scope.users = new Array();
	$scope.selectedUser = new Array();
	$rootScope.currentSection = 'dashboard';

	var all = { id : 0, attributes : { name : 'Todos' } };

	$scope.$watch('selectedUser', function (selectedUser) {
		console.log("selectedUser:", selectedUser);
	});

	var posts = new Parse.Query(Parse.Object.extend('Post'));
	var users = new Parse.Query(Parse.User);
	posts.include('userId');

	var getPosts = function () {
		posts.find({
			success : function (results) {
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
				for (item in results) {
					$scope.$apply(function () {
						if (item == 0) {
							$scope.users.push(all);
							$scope.selectedUser = all;
						}
						$scope.users.push(results[item]);
					})
				}

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