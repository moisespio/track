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
