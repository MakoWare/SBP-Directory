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
    this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.handleUserChange.bind(this));
    this.notifications.addEventListener(models.events.USER_SIGNED_OUT, this.handleUserChange.bind(this));
    this.notifications.addEventListener(models.events.WALLS_LOADED, this.handleWallsChange.bind(this));
  },

  defineScope: function(){
    this.$scope.walls = [];
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
    // console.log(this.$scope.walls);

  }

});

angular.module('wallList',[])
.directive('wallList', function(WallModel, GymModel, UserModel, Notifications){
  return {
    restrict:'E',
    isolate:true,
    link: function($scope){
      new WallListDirective($scope, WallModel, GymModel, UserModel, Notifications);
    },
    scope:true,
    templateUrl: "partials/walls/wallList.html"
  };
});
