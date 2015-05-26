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
		var file = new Parse.Object("Post");

		file.set('subject', this.subject);
		file.set('description', this.description);
		file.set('file', parseFile);
		file.save();

		$location.path('/timeline');
		$event.preventDefault();
	};
});