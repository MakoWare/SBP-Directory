'use strict';

var WallController = BaseController.extend({
  notifications:null,

  initialize: function($scope, $state, Notifications, GymModel, WallModel, UserModel, wall, routes){
    this.$state = $state;
    this.gymModel = GymModel;
    this.wallModel = WallModel;
    this.userModel = UserModel;
    this.notifications = Notifications;

    this.$scope.wall = wall;
    // console.log(arguments);
  },

  defineListeners:function(){
    // this.notifications.addEventListener(models.events.WALL_LOADED, this.handleWallLoaded.bind(this));
  },

  defineScope:function(){
    $(document).ready(function(){
      $('ul.tabs').tabs();
    });
  },

  destroy:function(){

  },

  /** Event Handlers **/
  handleWallLoaded: function(){
    // this.$scope.wall = this.wallModel.wall;
    // this.notifications.notify(models.events.BRAND_CHANGE, this.$scope.wall.get('name'));
  }

});


WallController.$inject = ['$scope', '$state', 'Notifications', 'GymModel', 'WallModel', 'UserModel', 'wall'];
