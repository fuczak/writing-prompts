angular.module('Prompts')
    .controller('ProfileCtrl', ['$scope', '$auth', '$alert', 'Account', '$rootScope',
        function($scope, $auth, $alert, Account, $rootScope) {
            /**
             * Get user's profile information.
             */
            $scope.getProfile = function() {
                Account.getProfile()
                    .success(function(data) {
                        $rootScope.user = data;
                    })
                    .error(function(error) {
                        $alert({
                            content: error.message,
                            animation: 'fadeZoomFadeDown',
                            type: 'material',
                            duration: 3
                        });
                    });
            };


            /**
             * Update user's profile information.
             */
            $scope.updateProfile = function() {
                Account.updateProfile({
                    displayName: $scope.profile.displayName,
                    email: $scope.profile.email
                }).then(function() {
                    $scope.getProfile();
                    $alert({
                        content: 'Profile has been updated',
                        animation: 'fadeZoomFadeDown',
                        type: 'material',
                        duration: 3
                    });
                }).catch(function(response) {
                    $alert({
                        content: response.data.message,
                        animation: 'fadeZoomFadeDown',
                        type: 'material',
                        duration: 3
                    });
                });
            };

            $scope.getProfile();
        }
    ]);