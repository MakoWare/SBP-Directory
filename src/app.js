'use strict';

angular.module('sbp', [
    'notifications',
    'overlay',
    'navbar',

    //Gyms
    'GymModel',

    //Walls
    'WallModel',
    'wallList',
    'wallTable',
    'wallListItem',

    //Routes
    'RouteModel',
    'routeList',
    'routeListItem',
    'routeTable',
    'gradeSelectModal',
    'stateSelectModal',
    'routeDistribution',


    //User
    'UserModel',

    //Parse
    'ParseService',

    'ui.router',
    'ngCookies',
    'ngAnimate',

    // custom stuff
    'CustomModule',
    'matSelect',

    // google-charts
    'GoogleCharts'

]);
