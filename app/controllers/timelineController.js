app.controller('timelineController', function($http, $rootScope, $scope, $location) {
	if (!$rootScope.currentUser) $location.path('/login');

	$scope.posts = new Array();
	$scope.users = new Array();
	$scope.selectedUser = new Array();
	$scope.showSuccessMessage = false;
	$rootScope.currentSection = 'dashboard';

	var all = { id : '', username : '', attributes : { name : 'Todos' } };

	$scope.$watch('selectedUser', function (selectedUser) {
		console.log("selectedUser:", selectedUser);
	});
	
	$scope.filename = null;
	$scope.date = new Date();

	var parseFile;

	$scope.upload = function (files) {
		if (files && files.length) {
			$scope.$apply(function () {
				$scope.filename = files[0].name;
			});
			parseFile = new Parse.File(files[0].name, files[0]);

			parseFile.save().then(function() {
			}, function(error) {
				console.log("error:", error);
			});
		};
	};

	$scope.save = function ($event) {
		var post = new Parse.Object("Post");

		post.set('subject', this.subject);
		post.set('description', this.description);
		post.set('file', parseFile);
		post.set('userId', $scope.currentUser);
		post.save();
		
		this.subject = this.description = $scope.filename = '';

		$scope.showSuccessMessage = true;
		getPosts();
		$event.preventDefault();
	};
	
	$scope.remove = function (id) {
		var Post = Parse.Object.extend("Post");
		var query = new Parse.Query(Post);
		
		console.log(id);

		query.get(id, {
			success: function(post) {
				post.destroy();
				getPosts();
			},
			error: function(object, error) {

			}
		});
	};

	var posts = new Parse.Query(Parse.Object.extend('Post'));
	var users = new Parse.Query(Parse.User);
	posts.include('userId');

	var getPosts = function () {
		
		posts.find({
			success : function (results) {				
				$scope.posts = [];
				
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
		var students = new Parse.Query(Parse.User);
		students.equalTo('teacherId', $rootScope.currentUser);

		var teacher = new Parse.Query(Parse.User);
		teacher.equalTo('objectId', $rootScope.currentUser.id);

		var query = Parse.Query.or(students, teacher);

		query.find({
			success : function (results) {
				console.log(results);
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