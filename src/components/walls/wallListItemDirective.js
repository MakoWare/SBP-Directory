'use strict';

var WallListItemDirective = BaseDirective.extend({
  userModel: null,
  notifications: null,


  initialize: function($scope, WallModel, GymModel, UserModel, Notifications){
    this.wallModel = WallModel;
    this.gymModel = GymModel;
    this.userModel = UserModel;
    this.notifications = Notifications;

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
    // this.$scope.walls = this.wallModel.walls;
    // console.log(this.$scope.walls);

  }

});

angular.module('wallListItem',[])
.directive('wallListItem', [ 'WallModel', 'GymModel', 'UserModel', 'Notifications', function(WallModel, GymModel, UserModel, Notifications){
  return {
    restrict:'E',
    isolate:true,
    link: function($scope){
      new WallListItemDirective($scope, WallModel, GymModel, UserModel, Notifications);
    },
    scope:false,
    templateUrl: "partials/walls/wallListItem.html"
  };
}]);
