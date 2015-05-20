'use strict';

angular.module('playfab', [
    'notifications',

    'navbar',

    //User
    'users.UserModel',
    'users.UserService',

    //Config
    'duxter.ConfigModel',

    /*
     //Articles
     'articles.ArticleModel',
     'articles.ArticleService',
     'articles.articleList',
     'articles.articleListItem',

     //Comments
     'comments.CommentModel',
     'comments.CommentService',
     'comments.commentList',
     'comments.commentListItem',
     */

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
        .state('userSettings', {
            url: "/users/:id/settings",
            templateUrl: "partials/settingsPage.html"
        });
});
