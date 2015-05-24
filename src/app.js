'use strict';

angular.module('sbp', [
    'notifications',

    'navbar',

    //Gyms

    //Walls

    //Routes
    'routeList',
    'routeListItem',


    //User
    'users.UserModel',
    'users.UserService',

    //Config
    'duxter.ConfigModel',

    'ui.router',
    'ngCookies',
    'ngAnimate'

]).config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/gym/map");
    //
    // Now set up the states
    $stateProvider
        .state('gymMap', {
            url: "/gym/map",
            templateUrl: "partials/gym/map/map.html",
            controller: GymMapController

        })
        .state('routes', {
            url: "/routes",
            templateUrl: "partials/routes/routes.html"
        })
        .state('walls', {
            url: "/walls",
            templateUrl: "partials/walls/wallList.html"
        })
        .state('wall', {
            url: "/walls/:id",
            templateUrl: "partials/walls/wall.html"
        })
        .state('userSettings', {
            url: "/users/:id/settings",
            templateUrl: "partials/settingsPage.html"
        });
});
