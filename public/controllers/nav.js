angular.module('Prompts')
    .controller('NavCtrl', ['$scope', '$auth', 'Account', '$rootScope', '$location',
        function($scope, $auth, Account, $rootScope, $location) {
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
            $scope.isActive = function(viewLocation) {
                return viewLocation === $location.path();
            };
            if ($auth.isAuthenticated()) {
                $scope.getProfile();
            };
        }
    ]);