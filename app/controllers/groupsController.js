app.controller('groupsController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentSection = 'groups';
	$scope.showSuccessMessage = false;

	$('input').focus();

	$scope.save = function ($event) {
		var group = new Parse.Object("Group");

		group.set('title', this.title);
		group.set('userId', $rootScope.currentUser);
		group.save();

		$scope.showSuccessMessage = true;

		getGroups();
		$event.preventDefault();
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
						$scope.groups.push(results[item]);
					})
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	}

	$scope.remove = function (id) {
		var Group = Parse.Object.extend("Group");
		var query = new Parse.Query(Group);

		query.get(id, {
			success: function(group) {
				group.destroy();
				getGroups();
			},
			error: function(object, error) {

			}
		});
	};

	getGroups();
});