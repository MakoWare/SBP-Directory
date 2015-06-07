'use strict';

var WallController = BaseController.extend({
    notifications:null,

    init:function($scope, $state, Notifications, GymModel, WallModel, UserModel){
        this.$state = $state;
        this.gymModel = GymModel;
        this.wallModel = WallModel;
        this.userModel = UserModel;
	this.notifications = Notifications;
	this._super($scope);

        $(document).ready(function(){
            $('ul.tabs').tabs();
        });

        this.wallModel.getWallById(this.$state.params.id);
    },

    defineListeners:function(){
        this._super();
    },

    defineScope:function(){
        this.notifications.addEventListener(models.events.WALL_LOADED, this.handleWallLoaded.bind(this));
    },

    destroy:function(){

    },

    /** Event Handlers **/
    handleWallLoaded: function(){
        this.$scope.wall = this.wallModel.wall;
        this.notifications.notify(models.events.BRAND_CHANGE, this.$scope.wall.get('name'));
    }

});


WallController.$inject = ['$scope', '$state', 'Notifications', 'GymModel', 'WallModel', 'UserModel'];
