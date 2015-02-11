angular.module('Prompts')
    .controller('PromptCtrl', ['$scope', 'Prompt', 'resObject', '$rootScope', '$alert', '$auth', '$location', '$anchorScroll', 
        function($scope, Prompt, resObject, $rootScope, $alert, $auth, $location, $anchorScroll) {
            $scope.orderby = "-score";
            $scope.isAuthenticated = function() {
                return $auth.isAuthenticated();
            };
            $scope.prompt = resObject.data;
            $scope.model = [{
                story: ''
            }];
            $scope.isFan = function() {
                if ($scope.isAuthenticated()) {
                    return $scope.prompt.fans.indexOf($rootScope.user._id) == -1 ? false : true
                }
            };
            $scope.isEnemy = function() {
                if ($scope.isAuthenticated()) {
                    return $scope.prompt.enemies.indexOf($rootScope.user._id) == -1 ? false : true
                }
            };
            $scope.upvotePrompt = function() {
                Prompt.upvotePrompt($scope.prompt._id, $rootScope.user).then(function(res) {
                    $scope.prompt.fans = res.data.fans;
                    $scope.prompt.enemies = res.data.enemies;
                }).catch(function() {
                    $alert({
                        content: 'Please log in to vote on prompts',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
                });
            };
            $scope.downvotePrompt = function() {
                Prompt.downvotePrompt($scope.prompt._id, $rootScope.user).then(function(res) {
                    $scope.prompt.fans = res.data.fans;
                    $scope.prompt.enemies = res.data.enemies;
                }).catch(function() {
                    $alert({
                        content: 'Please log in to vote on prompts',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
                });
            };
            $scope.isStoryFan = function(story) {
                if ($scope.isAuthenticated()) {
                    return story.fans.indexOf($rootScope.user._id) == -1 ? false : true;
                }
            };
            $scope.isStoryEnemy = function(story) {
                if ($scope.isAuthenticated()) {
                    return story.enemies.indexOf($rootScope.user._id) == -1 ? false : true;
                }
            };
            $scope.upvoteStory = function(story) {
                Prompt.upvoteStory(story._id, $rootScope.user).then(function(res) {
                    story.fans = res.data.fans;
                    story.enemies = res.data.enemies;
                    story.score = res.data.score;
                }).catch(function() {
                    $alert({
                        content: 'Please log in to vote on stories',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
                });
            };
            $scope.downvoteStory = function(story) {
                Prompt.downvoteStory(story._id, $rootScope.user).then(function(res) {
                    story.fans = res.data.fans;
                    story.enemies = res.data.enemies;
                    story.score = res.data.score;
                }).catch(function() {
                    $alert({
                        content: 'Please log in to vote on stories',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
                });
            };
            $scope.submitStory = function() {
                Prompt.submitStory({
                    story: $scope.model.story,
                    user: {
                        _id: $rootScope.user._id,
                        displayName: $rootScope.user.displayName
                    },
                    prompt: {
                        id: $scope.prompt._id,
                        slug: $scope.prompt.slug
                    }
                }).then(function(res) {
                    $alert({
                        content: 'Story has been added',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
                    $location.hash(res.data._id);
                    $anchorScroll();
                    $scope.prompt.stories.push(res.data);
                    $scope.model.story = '';
                    $scope.model.activePanel = -1;
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
        }
    ]);