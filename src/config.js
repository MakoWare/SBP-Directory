angular.module('sbp').config(function($stateProvider, $urlRouterProvider) {

    var initGym = ['GymModel', function(gymModel){
        return gymModel.getDefaultGym();
    }];

    var getWallById = ['$stateParams', 'WallModel', function(stateParams,wallModel){
      return wallModel.getWallById(stateParams.id);
    }];

    var getRoutesByWallId = ['$stateParams', 'RouteModel', function(stateParams,routeModel){
      return routeModel.getRoutesByWallId(stateParams.id);
    }];

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
        .state('users', {
            url: "/users",
            templateUrl: "partials/user/users.html",
            controller: UsersCtrl,
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
                initGym: initGym,
                wall: getWallById,
                routes: getRoutesByWallId,
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
            templateUrl: "partials/user/edit.html",
            controller:UserCtrl,
            resolve: {
                initGym: initGym
            }
        });
});
