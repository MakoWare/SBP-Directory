'use strict';

var ParseService = Class.extend({

    Gym: Parse.Object.extend("Gym"),
    Wall: Parse.Object.extend("Wall"),
    Route: Parse.Object.extend("Route"),
    Hold: Parse.Object.extend("Hold"),

    /** Users **/
    signIn: function(email, password){

    },

    signOut: function(){

    },

    updateUser: function(user){

    },


    /** Gyms **/
    getDefaultGym: function(callback){
        var query = new Parse.Query(this.Gym);
        return query.get("4WChpaHxDE", {
            success: function(gym){
                callback(gym);
            },
            error: function(error){
                callback(error);
            }
        });
    },


    /** Walls **/
    getWallsByGym: function(gym, callback){
        var query = new Parse.Query(this.Wall);
        query.equalTo("gym", gym);
        query.find({
            success: function(walls){
                callback(walls);
            },
            error: function(error){
                callback(error);
            }
        });
    },

    getWallById: function(id, callback){
        var query = new Parse.Query(this.Wall);
        return query.get(id, {
            success: function(wall){
                callback(wall);
            },
            error: function(error){
                callback(error);
            }
        });
    },


    /** Routes **/
    getRoutesByWallId: function(id, callback){
        var query = new Parse.Query(this.Route);
        query.equalTo("wall", {
            __type: "Pointer",
            className: "Wall",
            objectId: id
        });

        query.equalTo("takenDown", null);
        return query.find({
            success: function(wall){
                callback(wall);
            },
            error: function(error){
                callback(error);
            }
        });
    },




});



(function (){
    var ParseServiceProvider = Class.extend({
	instance: new ParseService(),
	$get: function(){
	    Parse.initialize("NKnM9iqa0hnqZhA1M2TdyDYMMMVpW24QNcqaSZ2Y", "k7cekvXmYutKXkuSuOp2scFgbkRnAUdQMh4SewsG");
	    return this.instance;
	}
    });

    angular.module('ParseService',[])
	.provider('ParseService', ParseServiceProvider);
}());
