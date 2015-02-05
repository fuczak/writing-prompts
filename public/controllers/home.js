angular.module('Prompts')
    .controller('HomeCtrl', ['$scope', '$auth', 'Prompt', '$alert', '$rootScope',
        function($scope, $auth, Prompt, $alert, $rootScope) {
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
                }).then(function() {
                    console.log($rootScope.user.displayName);
                    $alert({
                        content: 'Prompt has been added',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
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
                $scope.model.prompt = '';
            };
            $scope.model = {};
            Prompt.getAllPrompts().then(function(data) {
                $scope.model.prompts = (data.data);
            });
        }
    ]);