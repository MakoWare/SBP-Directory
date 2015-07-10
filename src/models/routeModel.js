'use strict';

namespace('models.events').ROUTE_LOADED = "ActivityModel.ROUTE_LOADED";
namespace('models.events').ROUTES_LOADED = "ActivityModel.ROUTES_LOADED";

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

    createRoute: function(wall){

    },

    saveRoute: function(route){
        console.log("saving");

    },

    saveRoutes: function(routes){
        routes.forEach(function(route){
            if(route.dirty){
                this.saveRoute(route);
            }
        }.bind(this));
    },

    autoSaveRoutes: function(routes){
        //If any route is dirty set the timeout to save in 20 seconds

        var dirty = false;
        routes.forEach(function(route){
            if(route.dirty){
                dirty = true;
            }
        });

        if(dirty){
            if(this.timeout){
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(function(){
                this.saveRoutes(routes);
            }.bind(this), 20000);
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
