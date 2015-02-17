angular.module('Prompts')
    .controller('UserCtrl', ['$scope', 'userObject',
        function($scope, userObject) {
            $scope.user = userObject.data;
        }
    ]);