angular.module('Prompts')
    .controller('PromptCtrl', ['$scope', 'Prompt', 'resObject', '$routeParams', '$rootScope', '$alert', '$auth', 
        function($scope, Prompt, resObject, $routeParams, $rootScope, $alert, $auth) {
            $scope.isAuthenticated = function() {
                return $auth.isAuthenticated();
            };
            $scope.prompt = resObject.data;  
            $scope.isFan = function() {
                return $scope.prompt.fans.indexOf($rootScope.user._id) == -1 ? false : true  
            };
            $scope.isEnemy = function() {               
                return $scope.prompt.enemies.indexOf($rootScope.user._id) == -1 ? false : true
            };
            $scope.upvotePrompt = function() {
                Prompt.upvotePrompt($scope.prompt._id, $rootScope.user).then(function(res) {
                    $scope.prompt.fans = res.data.fans;
                    $scope.prompt.enemies = res.data.enemies;                    
                });
            };
            $scope.downvotePrompt = function() {
                Prompt.downvotePrompt($scope.prompt._id, $rootScope.user).then(function(res) {
                    $scope.prompt.fans = res.data.fans;
                    $scope.prompt.enemies = res.data.enemies;
                });
            };                 
            $scope.submitStory = function() {
                Prompt.submitStory({
                    story: $scope.model.story,
                    user: {
                        _id: $rootScope.user._id,
                        displayName: $rootScope.user.displayName
                    },
                    id: $routeParams.id
                }).then(function(res) {
                    $alert({
                        content: 'Story has been added',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
                    $scope.prompt.stories.push(res.data)
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
                $scope.model.story = '';
            };
        }
    ]);