var app = angular.module('app', ['ngRoute', 'ngFileUpload']);

app.config(function($routeProvider, $locationProvider) {
	Parse.initialize("SpAKGJzQmYBe1swWZnXzxX5JBJJD0Q8ajk54MQi2", "pLpkxGc3me4mUBRKz56hz3BizENVuTgoCyB8oLLc");

	$locationProvider.html5Mode(true);
	$routeProvider

	.when('/', {
		templateUrl : 'app/views/login.html',
		controller : 'loginController'
	})

	.when('/register', {
		templateUrl : 'app/views/register.html',
		controller : 'registerController'
	})

	.when('/timeline', {
		templateUrl : 'app/views/timeline.html',
		controller : 'timelineController'
	})

	.when('/new', {
		templateUrl : 'app/views/new.html',
		controller : 'newController'
	})

	.when('/orientations', {
		templateUrl : 'app/views/orientations.html',
		controller : 'orientationsController'
	})

	.when('/students', {
		templateUrl : 'app/views/students.html',
		controller : 'studentsController'
	})

	.when('/groups', {
		templateUrl : 'app/views/groups.html',
		controller : 'groupsController'
	})

	.when('/notifications', {
		templateUrl : 'app/views/notifications.html',
		controller : 'notificationsController'
	})

	.when('/messages', {
		templateUrl : 'app/views/messages.html',
		controller : 'messagesController'
	})

	.when('/message/:id', {
		templateUrl : 'app/views/message.html',
		controller : 'messageController'
	})

	.when('/student/:id', {
		templateUrl : 'app/views/student.html',
		controller : 'studentController'
	})

	.when('/group/:id', {
		templateUrl : 'app/views/group.html',
		controller : 'groupController'
	})

	.when('/settings', {
		templateUrl : 'app/views/settings.html',
		controller : 'settingsController'
	})

	.otherwise ( { redirectTo: '/' } );
});
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
app.controller('loginController', function($http, $rootScope, $scope, $location) {
	if (Parse.User.current()) {
		$location.path('/timeline');
	}
});
app.controller('messageController', function($http, $rootScope, $scope, $location, $routeParams) {
	$rootScope.currentSection = 'messages';
	$scope.message;

	var Message = Parse.Object.extend('Message');

	var query = new Parse.Query(Message);

	query.equalTo('objectId', $routeParams.id);
	query.include('receiverId');
	query.include('senderId');

	query.find({
		success: function(results) {
			$scope.$apply(function () {
				$scope.message = results[0];

				$scope.message.set('unread', false);
				$scope.message.save();

				console.log('$scope.message:', $scope.message)
			})
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});
});
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
app.controller('orientationsController', function($http, $rootScope, $scope, $location, $timeout) {
	$rootScope.currentSection = 'orientations';
	$scope.users = new Array();
	$scope.showSuccessMessage = false;
	$scope.orientations = new Array();

	if($rootScope.currentUser.attributes.type == 'teacher') {
		$timeout(function () {
			$('.datepicker').datepicker({
				format: "dd/mm/yyyy",
				language: "pt-BR",
				autoclose: true,
				todayHighlight: true
			});
		})

		var all = { id : '', username : '', attributes : { name : 'Selecione' } };

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
							$scope.student = all;
						}
						$scope.users.push(results[item]);
					})
				}
			},
			error : function (error) {
				alert('Error when getting objects!');
			}
		});

		var query = new Parse.Query(Parse.Object.extend("Orientation"));
		query.equalTo("teacherId", $rootScope.currentUser);
		query.include('teacherId');
		query.include('studentId');

		var loadOrientations = function () {
			query.find({
				success: function(results) {
					console.log("results:", results);
					$scope.$apply(function () {
						$scope.orientations = results;
					})
				},
				error: function(error) {
					alert("Error: " + error.code + " " + error.message);
				}
			});
		}

		loadOrientations();

		$scope.save = function ($event) {
			var studentObj = this.student;
			var dateObj = $('.datepicker').datepicker('getDate');

			var orientation = new Parse.Object("Orientation");

			orientation.set('teacherId', $rootScope.currentUser);
			orientation.set('studentId', this.student);
			orientation.set('location', this.location);
			orientation.set('date', dateObj);
			orientation.set('confirmed', false);
			orientation.save();

			Parse.Cloud.run('sendMail', {
				to: studentObj.attributes.email,
				from: $rootScope.currentUser.attributes.email,
				subject: 'Agendamento de Orientação',
				message: 'Olá ' + studentObj.attributes.name + '. Gostaria de agendar uma orientação no dia ' + dateObj.getDate() + '/' + dateObj.getMonth() + '/' + dateObj.getFullYear() + '.'
			}, {
				success: function(status) {
					$scope.$apply(function () {
						$scope.showSuccessMessage = true;
						loadOrientations();
					});
				},
				error: function(error) {
					console.log("error:", error)
				}
			});

			$location.path('/orientations');
			$event.preventDefault();
		};
	} else {
		var query = new Parse.Query(Parse.Object.extend("Orientation"));
		query.equalTo("studentId", $rootScope.currentUser);
		query.include('teacherId');
		query.include('studentId');

		var loadStudentOrientations = function () {
			query.find({
				success: function(results) {
					console.log("results:", results);
					$scope.$apply(function () {
						$scope.orientations = results;
					})
				},
				error: function(error) {
					alert("Error: " + error.code + " " + error.message);
				}
			});
		}

		loadStudentOrientations();

		$scope.confirm = function (id, date) {
			var query = new Parse.Query(Parse.Object.extend('Orientation'));
			query.equalTo('objectId', id);

			query.first({
				success: function(result) {
					result.set('confirmed', true);
					result.save(null, {
						success: function(user) {
							loadStudentOrientations();
							var query = new Parse.Query(Parse.User);
							query.equalTo("objectId", $rootScope.currentUser.attributes.teacherId.id);
							query.first({
								success: function(user) {
									Parse.Cloud.run('sendMail', {
										to: user.attributes.email,
										from: $rootScope.currentUser.attributes.email,
										subject: 'Confirmação de Orientação',
										message: 'Olá professor(a). A orientação do dia ' + date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() + ' está confirmada.'
									}, {
										success: function(status) {

										},
										error: function(error) {
											console.log("error:", error)
										}
									});
								}
							});
						},
						error: function(a, error) {
							// response.error('Could not save changes to user.');
						}
					});
					$scope.$apply(function () {
						// $scope.group = results[0];
						// getUsers()
					})
				},
				error: function(error) {
					alert('Error when getting objects!');
				}
			});
		}
	}
});
app.controller('registerController', function($http, $rootScope, $scope, $location) {
	$scope.type = "student"

	if (Parse.User.current()) {
		$location.path('/timeline');
	}
});
app.controller('settingsController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentSection = 'settings';
	$scope.showSuccessMessage = false;

	$scope.name = $rootScope.currentUser.attributes.name;
	$scope.email = $rootScope.currentUser.attributes.email;
	$scope.username = $rootScope.currentUser.attributes.username;
	$scope.password = $rootScope.currentUser.attributes.password;
	$scope.isTeacher = $rootScope.currentUser.attributes.type == 'teacher';

	console.log("$rootScope.currentUser:", $rootScope.currentUser);

	$scope.update = function ($event) {
		var currentUser = Parse.User.current();

		currentUser.set('name', $scope.name);
		currentUser.save();

		$scope.showSuccessMessage = true;

		$event.preventDefault();
	};
});
app.controller('studentController', function($http, $rootScope, $scope, $location, $routeParams) {
	$rootScope.currentSection = 'students';

	var query = new Parse.Query(Parse.User);
	query.equalTo('objectId', $routeParams.id);
	query.include('teacherId')

	query.find({
		success: function(user) {
			$scope.$apply(function () {
				$scope.user = user[0];
			})
		}
	});
});
app.controller('studentsController', function($http, $rootScope, $scope, $location, $timeout, notificationService) {
	if (!$rootScope.currentUser) $location.path('/login');
	$rootScope.currentSection = 'students';
	$scope.successMessage;
	$scope.showSuccessMessage = false;
	$scope.filter = 'my';

	$scope.$watch('filter', function (currentFilter) {
		searchForStudents(currentFilter);
	});

	$scope.ae = function () {
		var query = new Parse.Query(Parse.User);
		query.equalTo('username', '631210046');

		query.find({
			success: function(user) {
				notificationService.send($rootScope.currentUser, user[0], $rootScope.currentUser.attributes.email, $rootScope.currentUser.attributes.email, 'assunto doido', 'mensagem loca');
			}
		});
	}

	$scope.setStudentTeacherId = function (student, unassign) {
		Parse.Cloud.run('modifyUser', {
			username: student.attributes.username,
			unassign: unassign,
		}, {
			success: function(status) {
				searchForStudents($scope.filter);

				if (unassign) $scope.successMessage = 'Você deixou de orientar ' + student.attributes.name + ' e ele(a) estará disponível para outros professores'
				else $scope.successMessage = 'Agora você é o(a) professor(a) orientador(a) do(a) aluno(a) ' + student.attributes.name

				$scope.showSuccessMessage = true;
			},
			error: function(error) {
				console.log("error:", error)
			}
		});
	}

	var searchForStudents = function (currentFilter) {
		$scope.students = new Array();

		var query = new Parse.Query(Parse.User);

		if (currentFilter == 'my') {
			query.equalTo('teacherId', $rootScope.currentUser);
		} else if (currentFilter == 'without-teacher') {
			query.equalTo('teacherId', null);
		}

		query.include('groupId');

		query.find({
			success: function(results) {
				console.log("results:", results)
				for (item in results) {
					$scope.$apply(function () {
						$scope.students.push(results[item]);
					})
				}
			},
			error:function(error) {
				alert('Error when getting objects!');
			}
		});
	};
});
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
app.controller('userController', function($http, $rootScope, $scope, $location) {
	$rootScope.currentUser = Parse.User.current();
	$rootScope.error = false;
	$rootScope.loading = false;

	var notifications = new Parse.Query(Parse.Object.extend('Message'));
	notifications.equalTo('receiverId', $rootScope.currentUser);
	notifications.equalTo('unread', true);

	notifications.find({
		success: function(results) {
			$rootScope.messagesCounter = results.length;
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});

	$scope.login = function () {
		$rootScope.error = false;
		$rootScope.loading = true;

		Parse.User.logIn(this.username, this.password, {
			success: function(user) {
				$rootScope.currentUser = Parse.User.current();
				$rootScope.loading = false;
				location.reload();
			},
			error: function(user, error) {
				$scope.$apply(function () {
					$rootScope.error = true;
					$rootScope.loading = false;
				})
			}
		});
	};

	$scope.logout = function () {
		Parse.User.logOut();
		$rootScope.currentUser = false;
		$location.path('/login');
	}

	$scope.create = function ($event) {
		var user = new Parse.User();

		$rootScope.error = false;
		$rootScope.loading = true;

		user.set('username', this.username);
		user.set('password', this.password);
		user.set('email', this.email);
		user.set('name', this.name);
		user.set('type', this.type);

		user.signUp(null, {
			success: function(user) {
				location.reload();
			},
			error: function(user, error) {
				$rootScope.error = true;
				$rootScope.loading = false;
			}
		});
	};
});
app.directive('keypress', function ($document, $rootScope) {
	return {
		restrict: 'A',
		link: function () {
			$document.bind('keypress', function (e) {
				$rootScope.$broadcast('keypress', e, String.fromCharCode(e.which));
			});
		}
	}
});

app.factory('notificationService', function ($http, $q) {
	return {
		send: function (senderId, receiverId, from, to, subject, message) {
			Parse.Cloud.run('sendMail', {
				from: from,
				to: to,
				subject: subject,
				message: message,
			}, {
				success: function(status) {
					console.log("status:", status);
				},
				error: function(error) {
					console.log("error:", error);
				}
			});

			var Message = Parse.Object.extend("Message");
			var messageObject = new Message();

			messageObject.set('subject', subject);
			messageObject.set('message', message);
			messageObject.set('senderId', senderId);
			messageObject.set('receiverId', receiverId);
			messageObject.set('unread', true);

			messageObject.save();

			return true;
		}
	};
});