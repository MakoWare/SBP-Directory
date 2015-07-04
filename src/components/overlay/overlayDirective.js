'use strict';
namespace('models.events').SHOW_LOADING = "ActivityModel.SHOW_LOADING";
namespace('models.events').HIDE_LOADING = "ActivityModel.HIDE_LOADING";

var OverlayDirective = BaseDirective.extend({
    notifications: null,

    init: function($scope, Notifications){
        this.notifications = Notifications;
        this._super($scope);
    },

    defineListeners: function(){
        this.notifications.addEventListener(models.events.SHOW_LOADING, this.handleShowLoading.bind(this));
        this.notifications.addEventListener(models.events.HIDE_LOADING, this.handleHideLoading.bind(this));

    },

    defineScope: function(){
        this.$scope.loading = true;
    },

    /** EVENT HANDLERS **/
    handleShowLoading: function(){
        this.$scope.loading = true;
    },

    handleHideLoading: function(){
        this.$scope.loading = false;
    }
});

angular.module('overlay',[])
    .directive('overlay', function(Notifications){
	return {
	    restrict:'E',
	    isolate:true,
	    link: function($scope){
		new OverlayDirective($scope, Notifications);
	    },
	    scope:true,
            templateUrl: "partials/overlay/overlay.html"
	};
    });
