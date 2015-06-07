'use strict';

namespace('models.events').ROUTE_LOADED = "ActivityModel.ROUTE_LOADED";
namespace('models.events').ROUTES_LOADED = "ActivityModel.ROUTES_LOADED";

var RouteModel = EventDispatcher.extend({
    route: {},
    routes: [],

    notifications: null,
    gameService: null,

    getRouteById: function(id){
        var promise = this.GameService.getGameById(id);
    },

    getRoutesByWallId: function(id){
        return this.parseService.getRoutesByWallId(id, function(results){
            this.routes = results;
            this.notifications.notify(models.events.ROUTES_LOADED);
        }.bind(this));
    },

    createRoute: function(wall){

    },

    saveRoute: function(route){

    },

    saveRoutes: function(routes){

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
