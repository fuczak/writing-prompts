angular.module('Prompts')
    .controller('PromptCtrl', ['$scope', 'Prompt', 'resObject', 
        function($scope, Prompt, resObject) {
        	$scope.prompt = resObject.data;        	
        }
    ]);