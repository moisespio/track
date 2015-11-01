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