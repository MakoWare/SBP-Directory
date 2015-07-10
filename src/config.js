angular.module('sbp').config(function($stateProvider, $urlRouterProvider) {

    var initGym = ['GymModel', 'Notifications', function(gymModel, notifications){
        // return gymModel.getDefaultGym();
        return gymModel.initGym().then(function(gym){
            notifications.notify(models.events.HIDE_LOADING);
            return Parse.Promise.as(gym);
        });
    }];

    var getWallById = ['$stateParams', 'WallModel', function(stateParams,wallModel){
      return wallModel.getWallById(stateParams.id);
    }];

    var getWalls = ['WallModel', 'initGym', function(wallModel, gym){
      return wallModel.getWallsByGym(gym);
    }];

    var getRoutesByWallId = ['$stateParams', 'RouteModel', function(stateParams,routeModel){
      return routeModel.getRoutesByWallId(stateParams.id);
    }];

    var getRouteById = ['$stateParams', 'RouteModel', function(params, routeModel){
      return routeModel.getRouteById(params.id);
    }];

    var getUsers = ['UserModel','initGym', function(userModel, gym){
      return userModel.getUsersForGym(gym);
    }];

    var getSetters = ['UserModel', function(userModel){
        return userModel.getSetters();
    }];


    var initWalls = ['GymModel', '$q', '$stateParams', 'Notifications', function(gymModel, $q, params, notifications){
        return gymModel.initGym().then(function(){
            notifications.notify(models.events.HIDE_LOADING);
        });
    }];


    var initWall = ['GymModel', 'WallModel', 'UserModel', 'RouteModel', '$q', '$stateParams', 'Notifications', function(gymModel, wallModel, userModel, routeModel, $q, params, notifications){
        notifications.notify(models.events.SHOW_LOADING);
        var promises = [];
        promises.push(wallModel.getWallById(params.id));
        promises.push(routeModel.getRoutesByWallId(params.id));
        promises.push(userModel.getSetters());
        promises.push(gymModel.initGym());



        return Parse.Promise.when(promises).then(function(){
            notifications.notify(models.events.HIDE_LOADING);
            return Parse.Promise.as(arguments);
        });
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
        .state('gymInfo', {
            url: "/gym/info",
            templateUrl: "partials/gym/gymInfo.html",
            controller: GymInfoController,
            resolve: {
                initGym: initGym
            }
        })
        .state('users', {
            url: "/users",
            templateUrl: "partials/user/users.html",
            controller: UsersCtrl,
            resolve: {
                initGym: initGym,
                Users: getUsers
            }
        })
        .state('walls', {
            url: "/walls",
            templateUrl: "partials/walls/wallsPage.html",
            resolve: {
                initWalls: initWalls
            }
        })
        .state('wall', {
            url: "/walls/:id",
            templateUrl: "partials/walls/wallPage.html",
            controller: WallController,
            resolve: {
                initWall: initWall
            }
        })
        .state('routes', {
            url: "/routes",
            templateUrl: "partials/routes/routes.html",
            resolve: {
                initGym: initGym
            }
        })
        .state('route', {
            url: "/routes/:id",
            templateUrl: "partials/routes/route.html",
            controller: RouteCtrl,
            resolve: {
                initGym: initGym,
                route: getRouteById,
                setters: getSetters,
                walls: getWalls
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
