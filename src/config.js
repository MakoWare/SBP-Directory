angular.module('sbp').config(function($stateProvider, $urlRouterProvider) {

    var initGym = function(GymModel){
        return GymModel.getDefaultGym();
    };


    $urlRouterProvider.otherwise("/gym/map");

    $stateProvider
        .state('gymMap', {
            url: "/gym/map",
            templateUrl: "partials/gym/map/map.html",
            controller: GymMapController,
            resolve: {
                initGym: initGym
            }
        })
        .state('walls', {
            url: "/walls",
            templateUrl: "partials/walls/wallsPage.html",
            resolve: {
                initGym: initGym
            }
        })
        .state('wall', {
            url: "/walls/:id",
            templateUrl: "partials/walls/wallPage.html",
            controller: WallController,
            resolve: {
                initGym: initGym
            }
        })
        .state('routes', {
            url: "/routes",
            templateUrl: "partials/routes/routes.html",
            resolve: {
                initGym: initGym
            }
        })
        .state('userSettings', {
            url: "/users/:id/settings",
            templateUrl: "partials/settingsPage.html",
            resolve: {
                initGym: initGym
            }
        });
});
