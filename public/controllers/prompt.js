angular.module('Prompts')
    .controller('PromptCtrl', ['$scope', 'Prompt', 'resObject', '$routeParams', '$rootScope', '$alert',
        function($scope, Prompt, resObject, $routeParams, $rootScope, $alert) {
            $scope.prompt = resObject.data;
            $scope.submitStory = function() {
                Prompt.submitStory({
                    story: $scope.model.story,
                    user: {
                        _id: $rootScope.user._id,
                        displayName: $rootScope.user.displayName
                    },
                    id: $routeParams.id
                }).then(function() {
                    $alert({
                        content: 'Story has been added',
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
                $scope.model.story = '';
            };
        }
    ]);