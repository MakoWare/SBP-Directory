'use strict';

namespace('models.events').ROUTE_LOADED = "ActivityModel.ROUTE_LOADED";
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

    createRoute: function(wall, color, grade, order, status, setter){
        console.log("createRoute");
        var route = new this.parseService.Route();
        //route.setACL(this.parseService.RouteACL);
        route.set("wall", wall);

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
        this.notifications.notify(models.events.ROUTES_LOADED);
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
            console.log("saving: " + routesToSave.length);
            this.notifications.notify(models.events.SHOW_LOADING);
            return Parse.Object.saveAll(routesToSave, {
                success: function(routes) {
                    console.log("hide");
                    self.notifications.notify(models.events.HIDE_LOADING);
                },
                error: function(error) {
                    self.notifications.notify(models.events.HIDE_LOADING);
                    console.log(error);
                }
            });
        }
    },

    autoSaveRoutes: function(){
        var dirty = false;
        this.routes.forEach(function(route){
            if(route.dirty() || !route.id){
                dirty = true;
            }
        });

        if(dirty){
            console.log("dirty");
            if(this.timeout){
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(function(){
                this.saveRoutes(this.routes);
            }.bind(this), 2000);
        }
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
                    self.notifications.notify(models.events.ROUTES_UPDATED);
                    console.log("soft delete complete");
                },
                error: function(error){
                    self.notifications.notify(models.events.ROUTES_UPDATED);
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
            this.createRoute(attributes.wall, attributes.color, attributes.grade, attributes.order);
            this.removeRoute(route);
        }.bind(this));
        this.autoSaveRoutes();
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
