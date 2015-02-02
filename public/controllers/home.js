angular.module('Prompts')
	.controller('HomeCtrl', ['$scope', '$auth', function ($scope, $auth) {
		$scope.isAuthenticated = function() {
		  return $auth.isAuthenticated();
		};
		$scope.stories = [
			{prompt: 'Prompt 1', author: 'blank', upvotes: 0},
			{prompt: 'Prompt 2', author: 'klanb', upvotes: 1},
			{prompt: 'Prompt 3', author: 'balbunk', upvotes: 2},
		];
	}]);