angular.module('Prompts')
    .controller('NavCtrl', ['$scope', '$auth', 'Account', '$rootScope',
        function($scope, $auth, Account, $rootScope) {
            $scope.isAuthenticated = function() {
                return $auth.isAuthenticated();
            };
            $scope.logout = function() {
                $auth.logout();
            };
            $scope.getProfile = function() {
                Account.getProfile()
                    .success(function(data) {
                        $rootScope.user = data;
                    })
                    .error(function(error) {
                        console.log(error.message);
                    });
            };
            if ($auth.isAuthenticated()) {
                $scope.getProfile();
            };
        }
    ]);