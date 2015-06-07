'use strict';

var RouteTableDirective = BaseDirective.extend({
    routeModel: null,
    userModel: null,
    notifications: null,

    init: function($scope, $state, UserModel, RouteModel,Notifications){
        this.$state = $state;
        this.userModel = UserModel;
        this.routeModel = RouteModel;
        this.notifications = Notifications;
        this._super($scope);

        this.getRoutes();
    },

    defineListeners: function(){
        this.notifications.addEventListener(models.events.ROUTES_LOADED, this.handleRoutesChanged.bind(this));
    },

    defineScope: function(){
        this.$scope.routes = [];
    },

    getRoutes: function(){
        this.routeModel.getRoutesByWallId(this.$state.params.id);
    },

    /** EVENT HANDLERS **/
    handleRoutesChanged: function(){
        this.$scope.routes = this.routeModel.routes;
    }

});

angular.module('routeTable',[])
    .directive('routeTable', function($state, UserModel, RouteModel, Notifications){
	return {
	    restrict:'E',
	    isolate:true,
	    link: function($scope){
		new RouteTableDirective($scope, $state, UserModel, RouteModel, Notifications);
	    },
	    scope:false,
            templateUrl: "partials/routes/routeTable.html"
	};
    });
