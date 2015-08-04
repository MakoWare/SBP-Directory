angular.module('sbp').config(function($stateProvider, $urlRouterProvider) {

    var initGym = ['GymModel', 'Notifications', '$stateParams', function(gymModel, notifications, $stateParams){
        console.log($stateParams);
        if($stateParams.gymId){
            return gymModel.getGymById($stateParams.gymId).then(function(gym){
                return Parse.Promise.as(gym);
            });
        } else {
            return gymModel.initGym().then(function(gym){
                return Parse.Promise.as(gym);
            });
        }
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
        console.log("hi");
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

    $urlRouterProvider.otherwise("/walls");

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
        .state('gymInfo', {
            url: "/gym/info?gymId",
            templateUrl: "partials/gym/gymInfo.html",
            controller: GymInfoController,
            resolve: {
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
                initGym: initGym,
                getRoutesByGym: ['initGym', 'RouteModel',  function(gym, routeModel){
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
                initGym: initGym
            }
        })
        .state('route', {
            url: "/routes/:id?gymId",
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
            url: "/users/:userId/edit?tab",
            templateUrl: "partials/user/edit.html",
            controller:UserCtrl,
            resolve: {
                initGym: initGym,
                allGyms: getAllGyms,
                getUser: getUser,
                show: ['initGym', 'getUser', 'Notifications', function(gym, user, notifications){
                    notifications.notify(models.events.HIDE_LOADING);
                }]

            }
        });
});
