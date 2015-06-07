'use strict';

angular.module('sbp', [
    'notifications',

    'navbar',

    //Gyms
    'GymModel',

    //Walls
    'WallModel',
    'wallList',
    'wallListItem',

    //Routes
    'RouteModel',
    'routeList',
    'routeListItem',
    'routeTable',


    //User
    'UserModel',

    //Parse
    'ParseService',

    'ui.router',
    'ngCookies',
    'ngAnimate'

]);
