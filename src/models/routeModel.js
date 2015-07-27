'use strict';

namespace('models.events').ROUTE_LOADED = "ActivityModel.ROUTE_LOADED";
namespace('models.events').ROUTE_REMOVED = "ActivityModel.ROUTE_REMOVED";
namespace('models.events').ROUTES_LOADED = "ActivityModel.ROUTES_LOADED";
namespace('models.events').ROUTES_UPDATED = "ActivityModel.ROUTES_UPDATED";

var RouteModel = EventDispatcher.extend({
    route: {},
    routes: [],

    notifications: null,
    gameService: null,

    getRouteById: function(id){
      return this.parseService.getRouteById(id).then(function(route){
        this.route = route;
        this.notifications.notify(models.events.ROUTE_LOADED);
        return Parse.Promise.as(route);
      }.bind(this));
    },

    getRoutesByWallId: function(id){
        return this.parseService.getRoutesByWallId(id).then(function(results){
            this.routes = results;
            this.notifications.notify(models.events.ROUTES_LOADED);
            return Parse.Promise.as(results);
        }.bind(this));
    },

    getRoutesByGym: function(gym){
        return this.parseService.getRoutesByGym(gym).then(function(routes){
            return this.setRoutesAndReturn(routes);
        }.bind(this));
    },

    getRoutesByUser: function(user){
        return this.parseService.getRoutesByUser(user).then(function(routes){
            this.routes = routes;
            this.notifications.notify(models.events.ROUTES_LOADED);
            return Parse.Promise.as(routes);
        }.bind(this));
    },

    setRoutesAndReturn: function(routes){
        this.routes = routes;
        this.notifications.notify(models.events.ROUTES_LOADED);
        return Parse.Promise.as(routes);
    },

    createRoute: function(gym, wall, color, grade, order, status, setter){
        var route = new this.parseService.Route();
        //route.setACL(this.parseService.RouteACL);
        route.set("wall", wall);
        route.set("gym", gym);
        route.set("gymCreatedAt", gym);

        if(color){
            route.set("color", color);
        } else {
            route.set("color", "gray");
        }

        if(grade){
            route.set("grade", grade);
        } else {
            route.set("grade", "0");
        }

        if(order){
            route.set("order", order);
        } else {
            route.set("order", 0);
        }

        if(status){
            route.set("status", status);
        } else {
            route.set("status", "0");
        }

        if(setter){
            route.set("setter", setter);
        } else {
            route.set("setter", null);
        }

        this.routes.push(route);
        this.notifications.notify(models.events.ROUTES_UPDATED);
    },

    saveRoute: function(route){
        return route.save(null, {
            success: function(route){

            },
            error: function(route, error){
                console.log("error");
                console.log(error);
            }
        });
    },

    saveRoutes: function(routes){
        var routesToSave = [];
        var self = this;
        routes.forEach(function(route){
            if(route.dirty() || !route.id){
                routesToSave.push(route);
            }
        }.bind(this));

        if(routesToSave.length > 0){
            this.notifications.notify(models.events.SHOW_LOADING);
            return Parse.Object.saveAll(routesToSave, {
                success: function(routes) {
                    self.notifications.notify(models.events.HIDE_LOADING);
                },
                error: function(error) {
                    self.notifications.notify(models.events.HIDE_LOADING);
                }
            });
        }
    },

    autoSaveRoutes: function(){

        (function(routes){
            var dirty = false;
            routes.forEach(function(route){
                if(route.dirty() || !route.id){
                    dirty = true;
                }
            });

            if(dirty){
                if(this.timeout){
                    clearTimeout(this.timeout);
                }
                var timeoutFunction = function(saveRoutesFunc){

                    return function(){
                        saveRoutesFunc(routes);
                    };
                }(this.saveRoutes.bind(this));

                this.timeout = setTimeout(timeoutFunction, 20000);
            }
        }.bind(this))(this.routes);

    },

    removeRoute: function(route){
        for(var i = 0; i < this.routes.length; i++){
            if(this.routes[i] == route){
                this.routes.splice(i, 1);
            }
        }
        if(route.id){
            this.notifications.notify(models.events.SHOW_LOADING);
            var self = this;
            route.set("takenDown", new Date());
            return route.save(null, {
                success: function(results){
                    self.notifications.notify(models.events.ROUTE_REMOVED);
                },
                error: function(error){
                    self.notifications.notify(models.events.ROUTE_REMOVED);
                    console.log("error");
                    console.log(error);
                }
            });
        } else {
            return null;
            this.notifications.notify(models.events.ROUTES_UPDATED);
        }
    },

    replaceRoutes: function(){
        console.log('replaceRoutes');
        var oldRoutes = this.routes;
        this.routes = [];
        oldRoutes.forEach(function(route){
            var attributes = route.attributes;
            this.createRoute(attributes.gym, attributes.wall, attributes.color, attributes.grade, attributes.order);
            this.removeRoute(route);
        }.bind(this));
        this.saveRoutes(this.routes);
    },

    getAverageGrade: function(routes){
        var averageColorArray = [];
        var gradeSum = 0;

        routes.forEach(function(route){
            gradeSum += parseInt(route.get('grade'));
            averageColorArray.push(route.get('color'));
        });

        var gradeAverage;
        if(gradeSum != 0){
            gradeAverage = Math.round((gradeSum / routes.length));
        } else {
            gradeAverage = 0;
        }

        switch(gradeAverage){
        case 0:
            return "gray0";
            break;
        case 1:
            return "yellow1";
            break;
        case 2:
            return "green2";
            break;
        case 3:
            return "green3";
            break;
        case 4:
            return "red4";
            break;
        case 5:
            return "blue5";
            break;
        case 6:
            return "orange6";
            break;
        case 7:
            return "purple7";
            break;
        case 8:
            return "black8";
            break;
        case 9:
            return "black9";
            break;
        case 10:
            return "black10";
            break;
        case 11:
            return "black11";
            break;
        case 12:
            return "black12";
            break;
        default:
            return "gray0";
            break;
        }
    }

});


(function (){
    var RouteModelProvider = Class.extend({
	instance: new RouteModel(),

	$get: function( Notifications, ParseService){
            this.instance.notifications = Notifications;
            this.instance.parseService = ParseService;
	    return this.instance;
	}
    });

    angular.module('RouteModel',[])
	.provider('RouteModel', RouteModelProvider);
}());
