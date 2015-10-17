app.controller('messagesController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentSection = 'messages';
	$scope.filter = 'received';
	$scope.showSuccessMessage = false;
	$scope.selected = {};

	$scope.send = function() {
		var selectedUsers = $.grep($scope.users, function(user) {
			return $scope.selected[user.attributes.name];
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

			Parse.Cloud.run('sendMail', {
				to: selectedUsers[user].attributes.email,
				from: $rootScope.currentUser.attributes.email,
				subject: $scope.subject,
				message: $scope.message
			}, {
				success: function(status) {

				},
				error: function(error) {
					console.log("error:", error)
				}
			});
		}

		Parse.Object.saveAll(messages, {
			success: function(message) {
				$('#new-notification').modal('hide');
				$scope.$apply(function () {
					$scope.showSuccessMessage = true;
				});
				loadMessages();
			},
			error: function(message, error) {
				alert('Failed to create new object, with error code: ' + error.message);
			}
		});
	}

	$scope.users = new Array();

	var query = new Parse.Query(Parse.User);

	if ($rootScope.currentUser.attributes.type == 'teacher') {
		query.equalTo('teacherId', $rootScope.currentUser);
	} else {
		if ($rootScope.currentUser.attributes.teacherId) {
			query.equalTo('objectId', $rootScope.currentUser.attributes.teacherId.id);
		}
	}

	query.find({
		success: function(results) {
			for (item in results) {
				$scope.$apply(function () {
					$scope.users.push(results[item]);
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

	function loadMessages() {
		$scope.received = new Array();
		$scope.sent = new Array();

		var Message = Parse.Object.extend('Message');
		var query = new Parse.Query(Message);
		query.equalTo('receiverId', $rootScope.currentUser);

		query.include('receiverId');
		query.include('senderId');

		query.find({
			success: function(results) {
				for (item in results) {
					$scope.$apply(function () {
						$scope.received.push(results[item]);
					})
				}
			},
			error: function(error) {
				alert('Error when getting objects!');
			}
		});

		var query = new Parse.Query(Message);
		query.equalTo('senderId', $rootScope.currentUser);

		query.include('receiverId');
		query.include('senderId');

		query.find({
			success: function(results) {
				for (item in results) {
					$scope.$apply(function () {
						$scope.sent.push(results[item]);
					})
				}
			},
			error: function(error) {
				alert('Error when getting objects!');
			}
		});
	}

	loadMessages();
});