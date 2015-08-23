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