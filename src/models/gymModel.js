'use strict';

namespace('models.events').GYM_LOADED = "ActivityModel.GYM_LOADED";
namespace('models.events').GYMS_LOADED = "ActivityModel.GYMS_LOADED";

var GymModel = EventDispatcher.extend({
    gym: {},
    gyms: [],

    notifications: null,
    parseService: null,

    getDefaultGym: function(){
        return this.parseService.getDefaultGym(function(gym){
            this.gym = gym;
        }.bind(this));
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
