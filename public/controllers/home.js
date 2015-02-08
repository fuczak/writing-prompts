angular.module('Prompts')
    .controller('HomeCtrl', ['$scope', '$auth', 'Prompt', '$alert', '$rootScope', '$location',
        function($scope, $auth, Prompt, $alert, $rootScope, $location) {
            $scope.isAuthenticated = function() {
                return $auth.isAuthenticated();
            };
            $scope.submitPrompt = function() {
                Prompt.submitPrompt({
                    prompt: $scope.model.prompt,
                    user: {
                        _id: $rootScope.user._id,
                        displayName: $rootScope.user.displayName
                    }
                }).then(function(res) {                    
                    $alert({
                        content: 'Prompt has been added',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
                    $location.path('/prompts/' + res.data._id);
                }).catch(function(response) {
                    if (typeof response.data.message === 'object') {
                        angular.forEach(response.data.message, function(message) {
                            $alert({
                                content: message[0],
                                animation: 'fadeZoomFadeDown',
                                type: 'danger',
                                duration: 3
                            });
                        });
                    } else {
                        $alert({
                            content: response.data.message,
                            animation: 'fadeZoomFadeDown',
                            type: 'danger',
                            duration: 3
                        });
                    }
                });
            };
            $scope.upvotePrompt = function(id, index) {
                Prompt.upvotePrompt(id, $rootScope.user).then(function(res) {
                    $scope.model.prompts[index].fans.length = res.data.fans;
                });
            };
            $scope.downvotePrompt = function(id, index) {
                Prompt.downvotePrompt(id, $rootScope.user).then(function(res) {
                    $scope.model.prompts[index].enemies.length = res.data.enemies;
                });
            };            
            $scope.model = {
                voted: []
            };
            Prompt.getAllPrompts().then(function(res) {
                $scope.model.prompts = (res.data);
            });
        }
    ]);