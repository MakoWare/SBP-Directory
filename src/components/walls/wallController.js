'use strict';

var WallController = BaseController.extend({
    notifications:null,

    initialize: function($scope, $state, Notifications, WallModel){
        this.$state = $state;
        this.wallModel = WallModel;
        this.notifications = Notifications;

        // console.log(arguments);
    },

    defineListeners:function(){
        // this.notifications.addEventListener(models.events.WALL_LOADED, this.handleWallLoaded.bind(this));
    },

    defineScope:function(){
        this.$scope.wall = this.wallModel.wall;


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


WallController.$inject = ['$scope', '$state', 'Notifications', 'WallModel'];
