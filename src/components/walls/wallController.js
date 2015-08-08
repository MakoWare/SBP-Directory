'use strict';

var WallController = BaseController.extend({
    notifications:null,

    initialize: function($scope, $state, $stateParams, Notifications, WallModel){
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.wallModel = WallModel;
        this.notifications = Notifications;
    },

    defineListeners:function(){
        this.onWallUpdated = this.onWallUpdated.bind(this);
        this.notifications.addEventListener(models.events.WALL_UPDATED, this.onWallUpdated);

        this.onWallDeleted = this.onWallDeleted.bind(this);
        this.notifications.addEventListener(models.events.WALL_DELETED, this.onWallDeleted);
    },

    defineScope:function(){
        this.$scope.wall = this.wallModel.wall;
        this.$scope.deleteWall = this.deleteWall.bind(this);
        this.$scope.saveWall = this.saveWall.bind(this);
        $(document).ready(function(){
            $('ul.tabs').tabs();
            if(this.$stateParams.tab){
                $('ul.tabs').tabs('select_tab', this.$stateParams.tab);
            }
        }.bind(this));
        this.notifications.notify(models.events.BRAND_CHANGE, this.$scope.wall.get("name"));
    },

    destroy:function(){
        this.notifications.removeEventListener(models.events.WALL_UPDATED, this.onWallUpdated);
        this.notifications.removeEventListener(models.events.WALL_DELETED, this.onWallDeleted);
    },

    saveWall: function(){
        this.notifications.notify(models.events.SHOW_LOADING);
        this.$scope.wall.set("name", this.$scope.wall.attributes.name);
        this.wallModel.saveWall(this.$scope.wall);
    },

    deleteWall: function(){
        if(confirm("Are you sure you want to Delete this Wall?")){
            this.notifications.notify(models.events.SHOW_LOADING);
            this.wallModel.deleteWall(this.$scope.wall);
        }
    },

    onWallUpdated: function(){
        this.$scope.wall = this.wallModel.wall;
        this.notifications.notify(models.events.HIDE_LOADING, true);
    },

    onWallDeleted: function(){
        this.notifications.notify(models.events.HIDE_LOADING, true);
        this.$state.go('walls');
    }

});


WallController.$inject = ['$scope', '$state', '$stateParams', 'Notifications', 'WallModel'];
