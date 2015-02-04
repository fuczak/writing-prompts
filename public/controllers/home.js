angular.module('Prompts')
    .controller('HomeCtrl', ['$scope', '$auth', 'Prompt', '$alert', '$rootScope',
        function($scope, $auth, Prompt, $alert, $rootScope) {
            $scope.isAuthenticated = function() {
                return $auth.isAuthenticated();
            };
            $scope.printText = function() {
                console.log($scope.justTest)
            };
            $scope.submitPrompt = function(data) {
                $scope.prompt = data;
                Prompt.submitPrompt({
                    idea: $scope.prompt,
                    user: $rootScope.user
                }).then(function() {
                    $alert({
                        content: 'Prompt has been added',
                        animation: 'fadeZoomFadeDown',
                        type: 'material',
                        duration: 3
                    });
                });
            };
            $scope.stories = [{
                prompt: 'Prompt 1',
                author: 'blank',
                upvotes: 0
            }, {
                prompt: 'Prompt 2',
                author: 'klanb',
                upvotes: 1
            }, {
                prompt: 'Prompt 3',
                author: 'balbunk',
                upvotes: 2
            }, ];
        }
    ]);