angular.module('Prompts')
    .controller('SignupCtrl', ['$scope', '$auth', '$rootScope', 'Account', '$alert',
        function($scope, $auth, $rootScope, Account, $alert) {
            $scope.signup = function() {
                $auth.signup({
                    displayName: $scope.displayName,
                    email: $scope.email,
                    password: $scope.password
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
                }).then(function() {
                    $alert({
                        content: 'Thanks for signing up!',
                        animation: 'fadeZoomFadeDown',
                        type: 'success',
                        duration: 3
                    })
                    Account.getProfile()
                        .success(function(data) {
                            $rootScope.user = data;
                        })
                        .error(function(error) {
                            console.log(error.message);
                        });
                });
            };
        }
    ]);