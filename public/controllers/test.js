angular.module('Prompts')
    .controller('TestCtrl', ['$scope',
        function($scope) {
        	$scope.friends = [
        		{name: 'Bob - 6', fans: 10, enemies: 4},
        		{name: 'Alex - 5', fans: 15, enemies: 10},
        		{name: 'Ziegfired - 7', fans: 8, enemies: 1}
        	];
        }
    ]);