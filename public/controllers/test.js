angular.module('Prompts')
    .factory('Reddit', function($http) {
        var Reddit = function() {
            this.items = [];
            this.busy = false;
            this.after = '';
        };

        Reddit.prototype.nextPage = function() {
            if (this.busy) return;
            this.busy = true;

            var url = "http://api.reddit.com/hot?after=" + this.after + "&jsonp=JSON_CALLBACK";
            $http.jsonp(url).success(function(data) {
                var items = data.data.children;
                for (var i = 0; i < items.length; i++) {
                    this.items.push(items[i].data);
                }
                this.after = "t3_" + this.items[this.items.length - 1].id;
                this.busy = false;
            }.bind(this));
        };

        return Reddit;
    })
    .controller('TestCtrl', ['$scope', 'Reddit',
        function($scope, Reddit) {
            $scope.reddit = new Reddit();
            $scope.popover = {
                "title": "Title",
                "content": "Hello Popover<br />This is a multiline message!"
            };
        }
    ]);