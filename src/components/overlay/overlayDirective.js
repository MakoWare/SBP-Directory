'use strict';
namespace('models.events').SHOW_LOADING = "ActivityModel.SHOW_LOADING";
namespace('models.events').HIDE_LOADING = "ActivityModel.HIDE_LOADING";

var OverlayDirective = BaseDirective.extend({
    notifications: null,

    init: function($scope, $rootScope, Notifications){
        this.$rootScope = $rootScope;
        this.notifications = Notifications;
        this._super($scope);
    },

    defineListeners: function(){
        this.notifications.addEventListener(models.events.SHOW_LOADING, this.handleShowLoading.bind(this));
        this.notifications.addEventListener(models.events.HIDE_LOADING, this.handleHideLoading.bind(this));

        this.$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            this.$scope.loading = true;
        }.bind(this));

    },

    defineScope: function(){
        this.$scope.loading = true;
    },

    /** EVENT HANDLERS **/
    handleShowLoading: function(event, apply){
        if(apply){
            this.$scope.loading = true;
            this.$scope.$apply();
        } else {
            this.$scope.loading = true;
        }
    },

    handleHideLoading: function(event, apply){
        if(apply){
            this.$scope.loading = false;
            this.$scope.$apply();
        } else {
            this.$scope.loading = false;
        }
    }
});

angular.module('overlay',[])
    .directive('overlay', function($rootScope, Notifications){
	return {
	    restrict:'E',
	    isolate:true,
	    link: function($scope){
		new OverlayDirective($scope, $rootScope, Notifications);
	    },
	    scope:true,
            templateUrl: "partials/overlay/overlay.html"
	};
    });
