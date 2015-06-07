'use strict';
namespace('models.events').WALL_LOADED = "ActivityModel.WALL_LOADED";
namespace('models.events').WALLS_LOADED = "ActivityModel.WALLS_LOADED";

var WallModel = EventDispatcher.extend({
    wall: {},
    walls: [],

    notifications: null,
    parseService: null,

    getWallById: function(id){
        return this.parseService.getWallById(id, function(results){
            this.wall = results;
            this.notifications.notify(models.events.WALL_LOADED);
        }.bind(this));
    },

    getWallsByGym: function(gym){
        return this.parseService.getWallsByGym(gym, function(results){
            this.walls = results;
            this.notifications.notify(models.events.WALLS_LOADED);
        }.bind(this));
    },

    createWall: function(gym){

    },

    saveWall: function(wall){

    },

    deleteWall: function(wall){

    }

});


(function (){
    var WallModelProvider = Class.extend({
	instance: new WallModel(),

	$get: function( Notifications, ParseService){
            this.instance.notifications = Notifications;
            this.instance.parseService = ParseService;
	    return this.instance;
	}
    });

    angular.module('WallModel',[])
	.provider('WallModel', WallModelProvider);
}());
