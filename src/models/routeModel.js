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

    createRoute: function(wallId){
        console.log("createRoute");
        var route = new this.parseService.Route();
        //route.setACL(this.parseService.RouteACL);
        route.set("wall", wallId);
        route.set("color", "gray");
        route.set("grade", 0);
        route.set("order", 0);
        route.set("status", 0);
        route.set("setter", null);

        this.routes.push(route);
        this.notifications.notify(models.events.ROUTES_LOADED);
    },

    saveRoute: function(route){
        console.log("saving");
    },

    saveRoutes: function(routes){
        routes.forEach(function(route){
            if(route.dirty || !route.id){
                this.saveRoute(route);
            }
        }.bind(this));
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
            }.bind(this), 20000);
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
                    console.log("error");
                    console.log(error);
                }
            });
        } else {
            return null;
            this.notifications.notify(models.events.ROUTES_UPDATED);
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
