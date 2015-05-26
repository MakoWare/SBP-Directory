'use strict';

var NavBarDirective = BaseDirective.extend({
  userModel: null,
  notifications: null,

  init: function($scope, UserModel, Notifications){
    this.userModel = UserModel;
    this.notifications = Notifications;
    this._super($scope);
  },

  defineListeners: function(){
    this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.handleUserSignedIn.bind(this));
    this.$scope.logout = this.logout.bind(this);
  },

  defineScope: function(){
    this.navShowing = false;
    this.$scope.currentUser = this.userModel.currentUser;
    this.initNav();
  },

  initNav: function(){
    var mobileMenu = document.getElementById("js-mobile-menu");
    var navMenu = document.getElementById("js-navigation-menu");
    navMenu.className = navMenu.className.replace(/\bshow\b/,'');
    mobileMenu.addEventListener('click', function(e) {
      e.preventDefault();
      if(this.navShowing){
        navMenu.className = navMenu.className.replace(/\bshow\b/,'');
      } else {
        navMenu.className = navMenu.className + " show";
      }
      this.navShowing = !this.navShowing;
    }.bind(this));
  },

  logout: function(){
    this.userModel.logout();
    this.$location.url("/");
  },

  /** EVENT HANDLERS **/
  handleUserSignedIn: function(){
    this.$scope.currentUser = this.userModel.currentUser;
  }

});

angular.module('navbar',[])
.directive('navbar', function(UserModel, Notifications){
  return {
    restrict:'E',
    isolate:true,
    link: function($scope){
      new NavBarDirective($scope, UserModel, Notifications);
    },
    scope:true,
    templateUrl: "partials/navbar/navbar.html"
  };
});
