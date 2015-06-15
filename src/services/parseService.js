'use strict';

var ParseService = Class.extend({

  Gym: Parse.Object.extend("Gym"),
  Wall: Parse.Object.extend("Wall"),
  Route: Parse.Object.extend("Route"),
  Hold: Parse.Object.extend("Hold"),

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
  getDefaultGym: function(callback){
    return this.getGymById("4WChpaHxDE");
  },

  getGymById:function(id){
    var query = new Parse.Query(this.Gym);
    return query.get(id);
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


  /** Routes **/
  getRoutesByWallId: function(id){
    var query = new Parse.Query(this.Route);
    query.equalTo("wall", {
      __type: "Pointer",
      className: "Wall",
      objectId: id
    });

    query.equalTo("takenDown", null);
    return query.find();
  },

  //Get Route By User
  getRoutesByUser: function(user){
    var query = new Parse.Query(this.Route);
    query.equalTo("setter", user);
    query.limit(1000);
    return query.find();
  }


});

(function(){
  var ParseServiceProvider = Class.extend({
    instance:new ParseService(),
    $get: function(){
      // dev
      Parse.initialize("XGoT7LbqQtXgUpwKAi2UYwRdKFsn8LYXmEX4cZZw","PiwZNcAIZTMVroBGHifVc9ps1y97zBhtKH8pHNQn");
      // prod
      // Parse.initialize("NKnM9iqa0hnqZhA1M2TdyDYMMMVpW24QNcqaSZ2Y","k7cekvXmYutKXkuSuOp2scFgbkRnAUdQMh4SewsG");

      return this.instance;
    }
  });

  angular.module('ParseService',[])
  .provider('ParseService', ParseServiceProvider);
})();