app.controller('groupController', function($http, $rootScope, $scope, $location, $routeParams) {
	$rootScope.currentSection = 'groups';
	$scope.showSuccessMessage = false;
	$scope.selectedUser = new Array();
	
	var all = { id : '', attributes : { name : 'Selecione um aluno' } };

	$scope.group;

	var Group = Parse.Object.extend('Group');

	var query = new Parse.Query(Group);

	query.equalTo('objectId', $routeParams.id);
	query.include('userId');

	query.find({
		success: function(results) {
			$scope.$apply(function () {
				$scope.group = results[0];
				getUsers()
			})
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});

	function getUsers() {
		$scope.users = new Array();

		var query = new Parse.Query(Parse.User);
		query.equalTo('groupId', $scope.group);

		query.find({
			success: function(results) {
				for (item in results) {
					$scope.$apply(function () {
						$scope.users.push(results[item]);
					})
				}
			},
			error:function(error) {
				alert('Error when getting objects!');
			}
		});
	};

	$scope.remove = function (id, name) {
		Parse.Cloud.run('removeUserFromGroup', {
			objectId: id,
		}, {
			success: function(status) {
				$scope.$apply(function () {
					$scope.successMessage = 'O(a) aluno(a) ' + name + ' não faz mais parte deste grupo';
					$scope.showSuccessMessage = true;
				});

				getUsers();
			},
			error: function(error) {
				console.log("error:", error)
			}
		});
	};
	
	$scope.add = function(id, name) {
		Parse.Cloud.run('addUserToGroup', {
			objectId: id,
			groupId: $scope.group.id
		}, {
			success: function(status) {
				$scope.$apply(function () {
					$scope.successMessage = 'O(a) aluno(a) ' + name + ' foi adicionado ao grupo';
					$scope.showSuccessMessage = true;
				});

				getUsers();
			},
			error: function(error) {
				console.log("error:", error)
			}
		});
	}
	
	var searchForStudents = function (currentFilter) {
		$scope.students = new Array();

		var query = new Parse.Query(Parse.User);
		query.equalTo('teacherId', $rootScope.currentUser);

		query.include('groupId');

		query.find({
			success: function(results) {
				for (item in results) {	
					$scope.$apply(function () {
						if (item == 0) {
							$scope.students.push(all);
							$scope.selectedUser = all;
						}
						$scope.students.push(results[item]);
					})
				}
			},
			error:function(error) {
				alert('Error when getting objects!');
			}
		});
	};
	
	searchForStudents();
});