'use strict';

namespace('models.events').WALL_LOADED = "ActivityModel.WALL_LOADED";
namespace('models.events').WALL_UPDATED = "ActivityModel.WALL_UPDATED";
namespace('models.events').WALL_DELETED = "ActivityModel.WALL_DELETED";
namespace('models.events').WALLS_LOADED = "ActivityModel.WALLS_LOADED";

var WallModel = EventDispatcher.extend({
    wall: {},
    walls: [],
    wallsByGym:{},

    notifications: null,
    parseService: null,

    getWallById: function(id){
        return this.parseService.getWallById(id).then(function(results){
            this.wall = results;
            this.notifications.notify(models.events.WALL_LOADED);
            return Parse.Promise.as(results);
        }.bind(this));
    },

    getWallsByGym: function(gym){
        return this.parseService.getWallsByGym(gym).then(function(results){
            this.wallsByGym[gym.id] = results;
            this.walls = results;
            this.notifications.notify(models.events.WALLS_LOADED);
            return Parse.Promise.as(results);
        }.bind(this));
    },

    createWall: function(gym){
        var wall = new this.parseService.Wall();
        //wall.setACL(this.parseService.RouteACL);
        wall.set("gym", gym);
        wall.set("name", "New Wall");
        return wall.save();
    },

    saveWall: function(wall){
        console.log(wall);
        return this.parseService.saveWall(wall).then(function(results){
            this.wall = results;
            this.notifications.notify(models.events.WALL_UPDATED);
            return Parse.Promise.as(results);
        }.bind(this));
    },

    deleteWall: function(wall){
        return wall.destroy();
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
