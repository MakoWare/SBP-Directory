'use strict';

namespace('models.events').BRAND_CHANGE = "ActivityModel.BRAND_CHANGE";

var NavBarDirective = BaseDirective.extend({
  userModel: null,
  notifications: null,

  initialize: function($scope, UserModel, Notifications,GymModel){
    this.userModel = UserModel;
    this.notifications = Notifications;
    this.gymModel = GymModel;

    this.gymModel.getDefaultGym().then(this.onGymFetch.bind(this));
    this.gymModel.getGyms().then(this.onGymsFetch.bind(this));

  },

  defineListeners: function(){
    this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.handleUserSignedIn.bind(this));
    this.notifications.addEventListener(models.events.BRAND_CHANGE, this.handleBrandChange.bind(this));
    this.notifications.addEventListener(models.events.GYM_CHANGE, this.onGymChange.bind(this));

    this.$scope.logout = this.logout.bind(this);
  },

  defineScope: function(){
    this.navShowing = false;
    this.$scope.brand = "SBP";
    this.$scope.currentUser = this.userModel.currentUser;
    $(".button-collapse").sideNav();

    this.$scope.gym = this.gymModel.gym;
    this.$scope.gyms = this.gymModel.gyms;
    this.$scope.onGymSelect = this.onGymSelect.bind(this);
  },

  onGymFetch:function(gym){
    this.$scope.gym = this.gymModel.gym;

  },

  onGymsFetch:function(gyms){
    this.$scope.gyms = this.gymModel.gyms;
  },

  onGymSelect:function(gym){
    this.gymModel.setCurrentGym(gym);
  },

  logout: function(){
    this.userModel.logout();
    this.$location.url("/");
  },

  /** EVENT HANDLERS **/
  handleUserSignedIn: function(){
    this.$scope.currentUser = this.userModel.currentUser;
  },

  handleBrandChange: function(event, brand){
    this.$scope.brand = brand;
  },

  onGymChange:function(event, gym){
    this.$scope.$apply(function(scope){
      scope.gym = gym;
    });
  }
  
});

angular.module('navbar',[])
.directive('navbar',['UserModel', 'Notifications', 'GymModel', function(UserModel, Notifications, GymModel){
  return {
    restrict:'E',
    isolate:true,
    link: function($scope){
      new NavBarDirective($scope, UserModel, Notifications, GymModel);
    },
    scope:true,
    templateUrl: "partials/navbar/navbar.html"
  };
}]);
