app.controller('newController', function($http, $rootScope, $scope, $location) {
	$scope.currentUser = Parse.User.current();
	$scope.filename = null;
	$rootScope.currentSection = 'new';
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

		$location.path('/timeline');
		$event.preventDefault();
	};
});