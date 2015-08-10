angular.module('sbp').config(function($stateProvider, $urlRouterProvider) {

    var auth = ['$location', '$q', function($location, $q){
        if(!Parse.User.current()){
            $location.path("/login");
        }
        return $q.when();
    }];

    var initGym = ['GymModel', 'Notifications', '$stateParams', function(gymModel, notifications, $stateParams){
        console.log($stateParams);
        return gymModel.initGym($stateParams.gymId).then(function(gym){
            return Parse.Promise.as(gym);
        });
    }];

    var getAllGyms = ['GymModel', function(gymModel){
        return gymModel.getGyms();
    }];

    var getWallById = ['$stateParams', 'WallModel', function(stateParams,wallModel){
        return wallModel.getWallById(stateParams.wallId).then(function(wall){
            return Parse.Promise.as(wall);
        });
    }];

    var getWalls = ['WallModel', 'initGym', function(wallModel, gym){
        return wallModel.getWallsByGym(gym);
    }];

    var getRoutesByWallId = ['$stateParams', 'RouteModel', function(stateParams,routeModel){
        return routeModel.getRoutesByWallId(stateParams.id);
    }];

    var getRoutesByGym = ['initGym', 'RouteModel', function(gym, routeModel){
        return routeModel.getRoutesByGym(gym);
    }];

    var getCurrentRoutes = ['initGym', 'RouteModel', function(gym, routeModel){
        return routeModel.getCurrentRoutes(gym);
    }];

    var getRouteById = ['$stateParams', 'RouteModel', function(params, routeModel){
        return routeModel.getRouteById(params.id);
    }];

    var getUsers = ['UserModel', function(userModel, gym){
        return userModel.getUsersForGym(gym);
    }];

    var getUser = ['$stateParams', 'UserModel', function($stateParams, userModel){
        var userId = $stateParams.userId;
        return userModel.getUserById(userId);
    }];


    var getSetters = ['UserModel', function(userModel){
        return userModel.getSetters();
    }];


    $urlRouterProvider.otherwise("/login");

    $stateProvider
    /*
     .state('gymMap', {
     url: "/gym/map",
     templateUrl: "partials/gym/map/map.html",
     controller: GymMapController,
     resolve: {
     initGym: initGym
     }
     })
     */

        .state('login', {
            url: "/login",
            templateUrl: "partials/user/loginPage.html",
            controller: LoginCtrl
        })
        .state('gymInfo', {
            url: "/gym/info?gymId",
            templateUrl: "partials/gym/gymInfo.html",
            controller: GymInfoController,
            resolve: {
                auth: auth,
                initGym: initGym,
                gymRoutes: getRoutesByGym,
                show: ['initGym', 'gymRoutes', 'Notifications', function(gym, routes, notifications){
                    notifications.notify(models.events.HIDE_LOADING);
                }]
            }
        })
        .state('users', {
            url: "/users?gymId",
            templateUrl: "partials/user/users.html",
            controller: UsersCtrl,
            resolve: {
                auth: auth,
                initGym: initGym,
                getUsers: ['initGym', 'UserModel',  function(gym, userModel){
                    return userModel.getUsersForGym(gym);
                }],
                show: ['initGym', 'getUsers', 'Notifications', function(gym, users, notifications){
                    notifications.notify(models.events.HIDE_LOADING);
                }]
            }
        })
        .state('walls', {
            url: "/walls?gymId",
            templateUrl: "partials/walls/wallsPage.html",
            controller: WallsController,
            resolve: {
                auth: auth,
                initGym: initGym,
                getRoutesByGym: ['initGym', 'RouteModel', function(gym, routeModel){
                    return routeModel.getRoutesByGym(gym);
                }],
                getWallsByGym: ['initGym', 'WallModel', 'Notifications', function(gym, wallModel, notifications){
                    return wallModel.getWallsByGym(gym);
                }],

                show: ['initGym', 'getWallsByGym', 'getRoutesByGym', 'Notifications', function(gym, walls, routes, notifications){
                    notifications.notify(models.events.HIDE_LOADING);
                }]

            }
        })
        .state('wall', {
            url: "/walls/:wallId?tab?gymId",
            templateUrl: "partials/walls/wallPage.html",
            controller: WallController,
            resolve: {
                auth: auth,
                initGym: initGym,
                getWallById: getWallById,
                getRoutesByWallId: ['getWallById', 'RouteModel', function(wall, routeModel){
                    return routeModel.getRoutesByWallId(wall.id);
                }],
                getSetters: ['initGym', 'UserModel', function(gym, userModel){
                    return userModel.getSetters();
                }],
                show: ['initGym', 'getWallById', 'getRoutesByWallId', 'getSetters', 'Notifications', function(gym, wall, routes, setters, notifications){
                    notifications.notify(models.events.HIDE_LOADING);
                }]
            }
        })
        .state('routes', {
            url: "/routes?gymId",
            templateUrl: "partials/routes/routes.html",
            resolve: {
                auth: auth,
                initGym: initGym
            }
        })
        .state('route', {
            url: "/routes/:id?gymId",
            templateUrl: "partials/routes/route.html",
            controller: RouteCtrl,
            resolve: {
                auth: auth,
                initGym: initGym,
                route: getRouteById,
                setters: getSetters,
                walls: getWalls
            }
        })
        .state('userSettings', {
            url: "/users/:userId/edit?tab",
            templateUrl: "partials/user/user.html",
            controller:UserCtrl,
            resolve: {
                auth: auth,
                initGym: initGym,
                allGyms: getAllGyms,
                getUser: getUser,
                show: ['initGym', 'getUser', 'Notifications', function(gym, user, notifications){
                    notifications.notify(models.events.HIDE_LOADING);
                }]
            }
        });
});
