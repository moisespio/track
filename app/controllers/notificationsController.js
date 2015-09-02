app.controller('notificationsController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentSection = 'notifications';
	$scope.filter = 'received';
	$scope.selected = {};

	function objectsAreSame(x, y) {
		var objectsAreSame = true;
		for(var propertyName in x) {
			if(x[propertyName] !== y[propertyName]) {
				objectsAreSame = false;
				break;
			}
		}
		return objectsAreSame;
	}

	$scope.send = function() {
		var selectedUsers = $.grep($scope.students, function(student) {
			return $scope.selected[student.attributes.name];
		});

		// var selectedGroups = $.grep($scope.groups, function(group) {
		// 	return $scope.selected[group.attributes.title];
		// });

		// var query = new Parse.Query(Parse.User);
		// query.containedIn('groupId', selectedGroups);

		// query.find({
		// 	success: function(results) {
		// 		selectedUsers = selectedUsers.concat(results)
		// 		// var uniqueUsers = new Array();

		// 		// for (user in selectedUsers) {
		// 		// 	if (uniqueUsers.indexOf(selectedUsers[user].id) < 0) {
		// 		// 		uniqueUsers.push(selectedUsers[user].id)
		// 		// 	}
		// 		// 	console.log("selectedUsers[user].id:", selectedUsers[user].id)
		// 		// }
		// 	},
		// 	error: function(error) {
		// 		alert('Error when getting objects!');
		// 	}
		// });

		// return;

		var Message = Parse.Object.extend('Message');
		var messages = new Array();

		for (user in selectedUsers) {
			var message = new Message();

			message.set('senderId', $rootScope.currentUser);
			message.set('receiverId', selectedUsers[user]);
			message.set('subject', $scope.subject);
			message.set('message', $scope.message);
			message.set('unread', true);

			messages.push(message);
		}

		Parse.Object.saveAll(messages, {
			success: function(message) {

			},
			error: function(message, error) {
				alert('Failed to create new object, with error code: ' + error.message);
			}
		});
	}

	$scope.students = new Array();

	var query = new Parse.Query(Parse.User);
	query.equalTo('teacherId', $rootScope.currentUser);

	query.find({
		success: function(results) {
			for (item in results) {
				$scope.$apply(function () {
					$scope.students.push(results[item]);
				})
			}
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});

	$scope.groups = new Array();
	var Group = Parse.Object.extend('Group');
	var query = new Parse.Query(Group);

	query.equalTo('userId', $rootScope.currentUser);

	query.find({
		success: function(results) {
			for (item in results) {
				$scope.$apply(function () {
					$scope.groups.push(results[item]);
				})
			}
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});

	$scope.messages = new Array();
	var Message = Parse.Object.extend('Message');
	var query = new Parse.Query(Message);
	query.equalTo('receiverId', $rootScope.currentUser);
	var query = new Parse.Query(Message);
	query.equalTo('senderId', $rootScope.currentUser);
	query.include('receiverId');
	query.include('senderId');

	query.find({
		success: function(results) {
			console.log("results:", results)
			for (item in results) {
				$scope.$apply(function () {
					$scope.messages.push(results[item]);
				})
			}
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});
});