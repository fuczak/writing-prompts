angular.module('Prompts', ['ngRoute', 'satellizer', 'ngResource', 'ngMessages', 'mgcrea.ngStrap', 'ngAnimate', 'angular-loading-bar', 'ngSanitize', 'btford.markdown'])
    .config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'views/home.html',
                    controller: 'HomeCtrl',
                    resolve: {
                        resPrompts: ['Prompt',
                            function(Prompt) {
                                return Prompt.getAllPrompts();
                            }
                        ]
                    }
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
                .when('/prompts/:slug', {
                    templateUrl: 'views/prompt.html',
                    controller: 'PromptCtrl',
                    resolve: {
                        resObject: ['$route', 'Prompt',
                            function($route, Prompt) {
                                return Prompt.getPrompt($route.current.params.slug);
                            }
                        ]
                    }
                })
                .when('/profile/:displayName', {
                    templateUrl: 'views/user.html',
                    controller: 'UserCtrl',
                    resolve: {
                        userObject: ['Account', '$route',
                            function(Account, $route) {
                                return Account.getUser($route.current.params.displayName);
                            }
                        ]
                    }
                })
                .when('/forgot', {
                    templateUrl: 'views/forgot.html',
                    controller: 'ForgotCtrl'
                })
                .when('/reset/:token', {
                    templateUrl: 'views/reset.html',
                    controller: 'ResetCtrl'
                })
                .when('/leaderboards', {
                    templateUrl: 'views/leaderboards.html',
                    controller: 'LeaderboardCtrl'
                })
                .when('/test', {
                    templateUrl: 'views/test.html',
                    controller: 'TestCtrl'
                })
                .otherwise({
                    redirectTo: '/'
                });
            $locationProvider.html5Mode(true);
        }
    ])
    .run(['$rootScope', '$location', '$anchorScroll', '$routeParams',
        function($rootScope, $location, $anchorScroll, $routeParams) {
            $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
                $location.hash($routeParams.scrollTo);
                $anchorScroll();
            });
        }
    ]);

// Bootstrap Navbar fix
$(document).on('click', '.navbar-collapse.in', function(e) {
    if ($(e.target).is('a')) {
        $(this).collapse('hide');
    }
});