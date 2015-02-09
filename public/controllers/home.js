angular.module('Prompts')
    .controller('HomeCtrl', ['$scope', '$auth', 'Prompt', '$alert', '$rootScope', '$location', 'resPrompts',
        function($scope, $auth, Prompt, $alert, $rootScope, $location, resPrompts) {
            $scope.model = {
                user: $rootScope.user,
                activePanel: -1,
                button: {
                    radio: 0
                },
                selectedRange: 'last day',
                range: ['last day', 'last week', 'last month', 'last year', 'all time'],
                prompts: resPrompts.data
            };
            $scope.isAuthenticated = function() {
                return $auth.isAuthenticated();
            };
            $scope.submitPrompt = function() {
                Prompt.submitPrompt({
                    prompt: $scope.model.prompt,
                    user: {
                        _id: $rootScope.user._id,
                        displayName: $rootScope.user.displayName
                    },
                    fans: $rootScope.user._id
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
                    $scope.model.prompts[index].fans = res.data.fans;
                    $scope.model.prompts[index].enemies = res.data.enemies;
                });
            };
            $scope.downvotePrompt = function(id, index) {
                Prompt.downvotePrompt(id, $rootScope.user).then(function(res) {
                    $scope.model.prompts[index].fans = res.data.fans;
                    $scope.model.prompts[index].enemies = res.data.enemies;
                });
            };
            $scope.isFan = function(prompt) {
                return prompt.fans.indexOf($rootScope.user._id) == -1 ? false : true
            };
            $scope.isEnemy = function(prompt) {
                return prompt.enemies.indexOf($rootScope.user._id) == -1 ? false : true
            };
            // Prompt.getAllPrompts().then(function(res) {
            //     $scope.model.prompts = (res.data);
            // });
        }
    ]);