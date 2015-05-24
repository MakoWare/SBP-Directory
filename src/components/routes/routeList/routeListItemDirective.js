'use strict';

var RouteListItemDirective = BaseDirective.extend({
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

angular.module('routeListItem',[])
    .directive('routeListItem', function(UserModel, Notifications){
	return {
	    restrict:'E',
	    isolate:true,
	    link: function($scope){
		new RouteListItemDirective($scope, UserModel, Notifications);
	    },
	    scope:true,
            templateUrl: "partials/routes/routeList/routeListItem.html"
	};
    });
