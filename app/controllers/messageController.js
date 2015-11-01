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