angular.module('Prompts', ['ngRoute', 'satellizer', 'ngResource', 'ngMessages', 'mgcrea.ngStrap', 'ngAnimate', 'angular-loading-bar', 'btford.markdown'])
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'views/home.html',
                    controller: 'HomeCtrl'
                })
                .when('/login', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl'
                })
                .when('/signup', {
                    templateUrl: 'views/signup.html',
                    controller: 'SignupCtrl'
                })
                .when('/profile', {
                    templateUrl: 'views/profile.html',
                    controller: 'ProfileCtrl'
                })
                .when('/prompts/:id', {
                    templateUrl: 'views/prompt.html',
                    controller: 'PromptCtrl',
                    resolve: {
                        resObject: ['$route', 'Prompt', function($route, Prompt) {
                            return Prompt.getPrompt($route.current.params.id)
                        }]
                    }
                })
                .otherwise({
                    redirectTo: '/'
                });
        }
    ]);