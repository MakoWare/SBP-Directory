'use strict';

namespace('models.events').GYM_LOADED = "ActivityModel.GYM_LOADED";
namespace('models.events').GYM_LOAD_FAILED = "ActivityModel.GYM_LOAD_FAILED";
namespace('models.events').GYMS_LOADED = "ActivityModel.GYMS_LOADED";

namespace('models.events').GYM_CHANGE = "ActivityModel.GYM_CHANGE";

var GymModel = EventDispatcher.extend({
    gym: null,
    gyms: null,

    notifications: null,
    parseService: null,


    getDefaultGym: function(gymId){
        if(gymId){
            return this.getGymById(gymId);
        } else {
            return this.parseService.getDefaultGym().then(function(gym){
                this.gym = gym;
                this.notifications.notify(models.events.GYM_LOADED);
                return Parse.Promise.as(gym);
            }.bind(this), function(err){
                this.notifications.notify(models.events.GYM_LOAD_FAILED);
                return Parse.Promise.as(null);
            }.bind(this));
        }
    },

    initGym:function(gymId){
        this.getGyms();
        return this.getDefaultGym(gymId);
    },

    getGymById: function(id){
        return this.parseService.getGymById(id).then(function(gym){
            this.gym = gym;
            this.notifications.notify(models.events.GYM_LOADED);
            return Parse.Promise.as(gym);
        }.bind(this));
    },

    getGyms: function(gym){
        return this.parseService.getGyms().then(function(gyms){
            this.gyms = gyms;
            this.notifications.notify(models.events.GYMS_LOADED, gyms);
        }.bind(this));
    },

    setCurrentGym:function(gym){
        this.gym = gym;
        this.notifications.notify(models.events.GYM_CHANGE, gym);
    }

});


(function (){
    var GymModelProvider = Class.extend({
        instance: new GymModel(),

        $get: function(Notifications, ParseService, $stateParams){
            this.instance.notifications = Notifications;
            this.instance.parseService = ParseService;
            this.instance.$stateParams = $stateParams;
            return this.instance;
        }
    });

    angular.module('GymModel',[])
        .provider('GymModel', GymModelProvider);
}());
