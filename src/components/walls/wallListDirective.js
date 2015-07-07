'use strict';

var WallListDirective = BaseDirective.extend({
    userModel: null,
    notifications: null,


    initialize: function($scope, WallModel, GymModel, UserModel, Notifications){
        this.wallModel = WallModel;
        this.gymModel = GymModel;
        this.userModel = UserModel;
        this.notifications = Notifications;

        this.getWalls();
    },

    defineListeners: function(){
        this.boundHandleUserChange = this.handleUserChange.bind(this);
        this.boundHandleWallsChange = this.handleWallsChange.bind(this);

        this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.boundHandleUserChange);
        this.notifications.addEventListener(models.events.USER_SIGNED_OUT, this.boundHandleUserChange);
        this.notifications.addEventListener(models.events.WALLS_LOADED, this.boundHandleWallsChange);
    },

    defineScope: function(){
        this.$scope.walls = [];
    },

    destroy:function(){
        console.log('destroy wall list directive');
        this.notifications.removeEventListener(models.events.USER_SIGNED_IN, this.boundHandleUserChange);
        this.notifications.removeEventListener(models.events.USER_SIGNED_OUT, this.boundHandleUserChange);
        this.notifications.removeEventListener(models.events.WALLS_LOADED, this.boundHandleWallsChange);
    },

    getWalls: function(){
        this.wallModel.getWallsByGym(this.gymModel.gym);
    },

    /** EVENT HANDLERS **/
    handleUserChange: function(){
        this.$scope.currentUser = this.userModel.currentUser;
    },

    handleWallsChange: function(){
        this.$scope.walls = this.wallModel.wallsByGym[this.gymModel.gym.id];
        console.log(this.$scope.walls);

    }

});

angular.module('wallList',[])
.directive('wallList', function(WallModel, GymModel, UserModel, Notifications){

    var obj;

    return {
        restrict:'E',
        isolate:true,
        link: function($scope){
            obj = new WallListDirective($scope, WallModel, GymModel, UserModel, Notifications);
        },
        scope:true,
        templateUrl: "partials/walls/wallList.html"
    };
});
