'use strict';

var ParseService = Class.extend({

    Gym: Parse.Object.extend("Gym"),
    Wall: Parse.Object.extend("Wall"),
    Route: Parse.Object.extend("Route"),
    Hold: Parse.Object.extend("Hold"),
    RouteACL: new Parse.ACL(),

    /**** Users ****/
    signIn: function(email, password){

    },

    signOut: function(){

    },

    updateUser: function(user){

    },

    getUsers: function(){
        var query = new Parse.Query(Parse.User);
        return query.find();
    },

    getUsersForGym:function(gym){
        var query = new Parse.Query(Parse.User);
        query.equalTo('currentGym', gym);
        return query.find();
    },

    getSetters: function(){
        var query = new Parse.Query(Parse.User);
        query.equalTo('setter', true);
        return query.find();
    },

    getCurrentUser: function(){
        return Parse.User.current();
    },

    //Get User by Id
    getUserById: function(id){
        var query = new Parse.Query("User");
        return query.get(id);
    },

    toggleUserSetterStatus:function(userId,setter){
        return Parse.Cloud.run('toggleUserSetterStatus',{userId:userId,setter:setter});
    },


    /**** Gyms ****/
    baseGymQuery:function(){
        var query = new Parse.Query(this.Gym);
        return query;
    },

    getDefaultGym: function(){
        return this.getGymById("4WChpaHxDE");
    },

    getGymById:function(id){
        var query = this.baseGymQuery();
        return query.get(id);
    },

    getGyms:function(){
        var query = this.baseGymQuery();
        return query.find();
    },

    /**** Walls ****/
    getWallsByGym: function(gym){
        var query = new Parse.Query(this.Wall);
        query.equalTo("gym", gym);
        return query.find();
    },

    getWallById: function(id){
        var query = new Parse.Query(this.Wall);
        return query.get(id);
    },

    saveWall: function(wall){
        return wall.save(null, {
            success: function(wall){
                return wall;
            },
            error: function(wall, error){
                return error;
            }
        });
    },

    /** Routes **/
    getRoutesByWallId: function(id){
        var query = new Parse.Query(this.Route);

        query.include('setter');
        query.equalTo('wall', new this.Wall({id:id}));
        query.equalTo("takenDown", null);

        return query.find();
    },

    getRoutesByGym: function(gym){
        var query = new Parse.Query(this.Route);

        query.limit(1000);
        query.include('setter');
        query.equalTo('gym', gym);
        query.equalTo("takenDown", null);

        return query.find();
    },

    //Get Route By User
    getRoutesByUser: function(user){
        var query = new Parse.Query(this.Route);
        query.include('wall');
        query.equalTo("setter", user);
        query.limit(1000);
        return query.find();
    },

    // get route by Id
    getRouteById: function(id){
        var query = new Parse.Query(this.Route);
        query.include('wall');
        query.include('setter');
        return query.get(id);
    }


});

(function(){
    var ParseServiceProvider = Class.extend({
        instance:new ParseService(),
        $get: function(){
            // dev
            //Parse.initialize("XGoT7LbqQtXgUpwKAi2UYwRdKFsn8LYXmEX4cZZw","PiwZNcAIZTMVroBGHifVc9ps1y97zBhtKH8pHNQn");
            // prod
            // Parse.initialize("NKnM9iqa0hnqZhA1M2TdyDYMMMVpW24QNcqaSZ2Y","k7cekvXmYutKXkuSuOp2scFgbkRnAUdQMh4SewsG");

            this.instance.RouteACL.setRoleWriteAccess("Setter", true);
            this.instance.RouteACL.setPublicReadAccess(true);
            this.instance.RouteACL.setPublicWriteAccess(false);
            return this.instance;
        }
    });

    angular.module('ParseService',[])
        .provider('ParseService', ParseServiceProvider);
})();


var monthNames = ["Jan", "Feb", "March", "April", "May", "June",
  "July", "Aug", "Sep", "Oct", "Nov", "Dec"];


Date.prototype.monthName = function(){
    var date = new Date(this.valueOf());
    return monthNames[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear();
};
