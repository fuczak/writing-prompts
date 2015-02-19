angular.module('Prompts')
    .controller('ResetCtrl', ['$scope', 'Account', '$alert', '$route', '$location', 
        function($scope, Account, $alert, $route, $location) {
            $scope.reset = function() {
                Account.updatePassword({
                    password: $scope.password
                }, $route.current.params.token).then(function(res) {
                    $alert({
                        content: res.data.message,
                        animation: 'fadeZoomFadeDown',
                        type: 'success',
                        duration: 3
                    });
                    $location.path('/login');
                }).catch(function(res) {
                    $alert({
                        content: res.data.message,
                        animation: 'fadeZoomFadeDown',
                        type: 'danger',
                        duration: 3
                    });
                });
                $scope.password = '';
            };
        }
    ]);