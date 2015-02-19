angular.module('Prompts')
    .controller('ForgotCtrl', ['$scope', 'Account', '$alert',
        function($scope, Account, $alert) {
            $scope.resetPassword = function() {
                Account.resetPassword({
                    email: $scope.email
                }).then(function(res) {
                    $alert({
                        content: res.data.message,
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
                    $scope.email = '';
                }).catch(function(res) {
                    $alert({
                        content: res.data.message,
                        animation: 'fadeZoomFadeDown',
                        type: 'danger',
                        duration: 3
                    })
                });
            };
        }
    ]);