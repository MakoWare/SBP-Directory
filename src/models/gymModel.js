'use strict';

namespace('models.events').GYM_LOADED = "ActivityModel.GYM_LOADED";
namespace('models.events').GYM_LOAD_FAILED = "ActivityModel.GYM_LOAD_FAILED";
namespace('models.events').GYMS_LOADED = "ActivityModel.GYMS_LOADED";

var GymModel = EventDispatcher.extend({
  gym: null,
  gyms: null,

  notifications: null,
  parseService: null,


  getDefaultGym: function(){
    if(this.gym){
      return Parse.Promise.as(this.gym);
    } else {
      return this.parseService.getDefaultGym().then(function(gym){
        this.gym = gym;
        this.notifications.notify(models.events.GYM_LOADED);
        return Parse.Promise.as(gym);
      }.bind(this),
      function(err){
        this.notifications.notify(models.events.GYM_LOAD_FAILED);
        return Parse.Promise.as(null);
      }.bind(this));
    }


  },

  getGymById: function(id){

  },

  getGyms: function(gym){

  }

});


(function (){
  var GymModelProvider = Class.extend({
    instance: new GymModel(),

    $get: function(Notifications, ParseService){
      this.instance.notifications = Notifications;
      this.instance.parseService = ParseService;
      return this.instance;
    }
  });

  angular.module('GymModel',[])
  .provider('GymModel', GymModelProvider);
}());
