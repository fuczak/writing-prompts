angular.module('Prompts')
    .controller('LoginCtrl', ['$scope', '$auth', '$rootScope', 'Account', '$alert',
        function($scope, $auth, $rootScope, Account, $alert) {
            $scope.login = function() {
                $auth.login({
                    email: $scope.email,
                    password: $scope.password
                }).then(function() {
                    Account.getProfile()
                        .success(function(data) {
                            $rootScope.user = data;
                        })
                        .error(function(error) {
                            console.log(error.message);
                        });
                    $alert({
                        content: 'You have successfully logged in',
                        animation: 'fadeZoomFadeDown',
                        type: 'success',
                        duration: 3
                    });
                }).catch(function(response) {
                    $alert({
                        content: response.data.message,
                        animation: 'fadeZoomFadeDown',
                        type: 'danger',
                        duration: 3
                    });
                });
            };
        }
    ]);