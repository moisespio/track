app.controller('timelineController', function($http, $rootScope, $scope, $location, $timeout) {
	if (!$rootScope.currentUser) $location.path('/login');

	$scope.posts = new Array();
	$scope.users = new Array();
	$scope.selectedUser = new Array();
	$scope.showSuccessMessage = false;
	$rootScope.currentSection = 'dashboard';

	var all = { id : null, username : '', attributes : { name : 'Alunos' } };
	var allGroups = { id : null, username : '', attributes : { title : 'Grupos' } };
	
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

	function getGroups() {
		$scope.groups = new Array();
		var Group = Parse.Object.extend("Group");
		var groups = new Parse.Query(Group);
		groups.equalTo('userId', $rootScope.currentUser);

		groups.find({
			success: function(results) {
				for (item in results) {
					$scope.$apply(function () {
						if (item == 0) {
							$scope.groups.push(allGroups);
							$scope.selectedGroup = allGroups;
						}
						$scope.groups.push(results[item]);
					})
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	}

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

				loadOrientations()
			},
			error : function (error) {
				alert('Error when getting objects!');
			}
		});
	}

	var loadOrientations = function () {
		var query = new Parse.Query(Parse.Object.extend("Orientation"));
		query.equalTo("teacherId", $rootScope.currentUser);
		query.include('teacherId');
		query.include('studentId');

		query.find({
			success: function(results) {
				console.log("jjjjj:", results);
				for (item in results) {
					$scope.posts.push(results[item]);
				}

				$scope.$apply(function () {
					$scope.orientations = results;
				})
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
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
		});

		getGroups();
	} else {
		var userPosts = new Parse.Query("Post")
		userPosts.equalTo('userId', $rootScope.currentUser)

		var teacherPosts = new Parse.Query("Post")
		teacherPosts.equalTo('userId', $rootScope.currentUser.attributes.teacherId);

		posts = Parse.Query.or(userPosts, teacherPosts)
		posts.include('userId');

		getPosts();
	}
});