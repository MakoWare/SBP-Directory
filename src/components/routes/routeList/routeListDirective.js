'use strict';

var RouteListDirective = BaseDirective.extend({
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
        console.log("routeListDirective");
        this.$scope.routes = [];

        var route = {
            grade: 5,
            color: "blue"
        };

        this.$scope.routes.push(route);

        route = {
            grade: 6,
            color: "orange"
        };
        this.$scope.routes.push(route);

        route = {
            grade: 7,
            color: "purple"
        };
        this.$scope.routes.push(route);
        console.log(this.$scope.routes);

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

angular.module('routeList',[])
    .directive('routeList', function(UserModel, Notifications){
	return {
	    restrict:'E',
	    isolate:true,
	    link: function($scope){
		new RouteListDirective($scope, UserModel, Notifications);
	    },
	    scope:true,
            templateUrl: "partials/routes/routeList.html"
	};
    });
