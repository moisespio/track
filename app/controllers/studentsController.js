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