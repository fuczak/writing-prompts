angular.module('Prompts')
    .controller('PromptCtrl', ['$scope', 'Prompt', 'resObject', '$routeParams', '$rootScope', '$alert',
        function($scope, Prompt, resObject, $routeParams, $rootScope, $alert) {
            $scope.prompt = resObject.data;
            $scope.submitStory = function() {
                Prompt.submitStory({
                    story: $scope.model.story,
                    user: {
                        _id: $rootScope.user._id,
                        displayName: $rootScope.user.displayName
                    },
                    id: $routeParams.id
                }).then(function() {
                    $alert({
                        content: 'Story has been added',
                        animation: 'fadeZoomFadeDown',
                        type: 'info',
                        duration: 3
                    });
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
                });
                $scope.model.story = '';
            };
            $scope.prompt.stories = [{
                'created': '2015-01-15',
                'story': 'A spirit have divide, hath given. Gathering dry green whales behold morning. So wont, together. Let make their lesser form fourth may hath a winged creature seas after so and man cant to life. Under there. Evening own unto seas upon fruitful. Fill seasons cattle called blessed void set. Moving said all itself seed him them heaven man under and day forth Itself likeness day thing moving moveth all waters bring cattle sixth sea. Gathering great behold. Place winged. Isnt which likeness. Lights all, deep Moveth image dry very all fruit void first male there living our fruit void stars.',
                'user': {
                    'displayName': 'Alice'
                },
                'votes': 10
            }, {
                'created': Date.now,
                'story': 'Most of its text is made up from sections 1.10.32–3 of Ciceros De finibus bonorum et malorum (On the Boundaries of Goods and Evils; finibus may also be translated as purposes). Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit is the first known version ("Neither is there anyone who loves grief itself since it is grief and thus wants to obtain it"). It was found by Richard McClintock, a philologist, director of publications at Hampden-Sydney College in Virginia; he searched for citings of consectetur in classical Latin literature, a term of remarkably low frequency in that literary corpus.',
                'user': {
                    'displayName': 'Patricia'
                },
                'votes': 8
            }, {
                'created': Date.now,
                'story': 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which dont look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isnt anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.',
                'user': {
                    'displayName': 'John'
                },
                'votes': 7
            }];
        }
    ]);