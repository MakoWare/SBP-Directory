'use strict';

var WallsController = BaseController.extend({
    notifications:null,

    initialize: function($scope, $state, Notifications, GymModel, WallModel){
        this.$state = $state;
        this.wallModel = WallModel;
        this.gymModel = GymModel;
        this.notifications = Notifications;
    },

    defineListeners:function(){

    },

    defineScope:function(){
        this.$scope.gym = this.gymModel.gym;
        this.$scope.createWall = this.createWall.bind(this);
        if(this.$scope.gym.get('name') == "Seattle Bouldering Project"){
            this.notifications.notify(models.events.BRAND_CHANGE, "SBP");
        } else {
            this.notifications.notify(models.events.BRAND_CHANGE, "ABP");
        }
    },

    destroy:function(){

    },

    createWall: function(){
        console.log("create wall");
        this.wallModel.createWall(this.$scope.gym).then(function(wall){
            console.log(wall);
            this.$state.go('wall', {wallId: wall.id });
        }.bind(this));
    }

});


WallsController.$inject = ['$scope', '$state', 'Notifications', 'GymModel', 'WallModel'];
