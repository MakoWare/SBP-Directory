'use strict';

namespace('models.events').BRAND_CHANGE = "ActivityModel.BRAND_CHANGE";

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
        this.notifications.addEventListener(models.events.BRAND_CHANGE, this.handleBrandChange.bind(this));
        this.$scope.logout = this.logout.bind(this);
    },

    defineScope: function(){
        this.navShowing = false;
        this.$scope.brand = "SBP";
        this.$scope.currentUser = this.userModel.currentUser;
        $(".button-collapse").sideNav();
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
