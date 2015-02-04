angular.module('Prompts')
    .factory('Prompt', ['$http',
        function($http) {
            return {
                submitPrompt: function(promptData) {
                	return $http.post('/api/prompt', promptData);
                }
            }
        }
    ]);