'use strict';

namespace('models.events').USER_SIGNED_IN = "ActivityModel.USER_SIGNED_IN";
namespace('models.events').USER_SIGNED_OUT = "ActivityModel.USER_SIGNED_OUT";
namespace('models.events').USER_UPDATED = "ActivityModel.USER_UPDATED";

namespace('models.events').USERS_FETCHED = "ActivityModel.USERS_FETCHED";

namespace('models.events').PROFILE_LOADED = "ActivityModel.PROFILE_LOADED";
namespace('models.events').AUTH_ERROR = "ActivityModel.AUTH_ERROR";
namespace('models.events').NETWORK_ERROR = "ActivityModel.NETWORK_ERROR";

var UserModel = EventDispatcher.extend({
    currentUser: null,
    users: null,
    ParseService:null,
    notifications: null,

    signIn: function(email, password){

    },

    signOut: function(){

    },

    updateUser: function(user){

    },

    getUsers: function(){
        return this.ParseService.getUsers().then(function(results){
            this.users = results;
            this.notifications.notify(models.events.USERS_FETCHED);
            return Parse.Promise.as(results);
        }.bind(this));
    },

    getUserById: function(id){
        return this.ParseService.getUserById(id).then(function(results){
            this.profile = results;
            this.notifications.notify(models.events.PROFILE_LOADED);
            return Parse.Promise.as(results);
        }.bind(this));
    },

    getUsersForGym:function(gym){
        return this.ParseService.getUsersForGym(gym).then(function(results){
            this.users = results;
            this.notifications.notify(models.events.USERS_FETCHED);
            return Parse.Promise.as(results);
        }.bind(this));
    },

    getUsersAndStatsForGym:function(gym){
        return this.ParseService.getUsersAndStatsForGym(gym).then(function(results){
            this.users = results;
            this.notifications.notify(models.events.USERS_FETCHED);
            return Parse.Promise.as(results);
        }.bind(this));
    },

    getNewUser: function(){
        var user = new Parse.User();

        return user;
    },

    createUser: function(user){

        return this.ParseService.createUser(user);

    },

    updateUser: function(user){
        return Parse.Cloud.run('updateUser',{
            userId: user.id,
            gymId: user.attributes.currentGym.id,
            email: user.attributes.email,
            setter: user.attributes.setter,
            username: user.attributes.username
        });
    },

    getSetters: function(){
        return this.ParseService.getSetters().then(function(results){
            this.setters = results;
            return Parse.Promise.as(results);
        }.bind(this));
    }

});


(function (){
    var UserModelProvider = Class.extend({
        instance: new UserModel(),

        $get: function(ParseService, Notifications){
            this.instance.ParseService = ParseService;
            this.instance.notifications = Notifications;
            this.instance.currentUser = Parse.User.current();
            return this.instance;
        }
    });

    angular.module('UserModel',[])
        .provider('UserModel', UserModelProvider);
}());
