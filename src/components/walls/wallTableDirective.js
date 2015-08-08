'use strict';

var WallTableDirective = BaseDirective.extend({
    userModel: null,
    notifications: null,

    initialize: function($scope, $state, WallModel, GymModel, UserModel, RouteModel, Notifications){
        this.$state = $state;
        this.wallModel = WallModel;
        this.gymModel = GymModel;
        this.userModel = UserModel;
        this.routeModel = RouteModel;
        this.notifications = Notifications;
    },

    defineListeners: function(){
        this.boundHandleUserChange = this.handleUserChange.bind(this);
        this.boundHandleWallsChange = this.handleWallsChange.bind(this);

        this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.boundHandleUserChange);
        this.notifications.addEventListener(models.events.USER_SIGNED_OUT, this.boundHandleUserChange);
        this.notifications.addEventListener(models.events.WALLS_LOADED, this.boundHandleWallsChange);
    },

    defineScope: function(){
        this.$scope.walls = this.wallModel.walls;
        this.$scope.routes = this.routeModel.routes;
        this.$scope.goToWall = this.goToWall.bind(this);
        this.$scope.walls.forEach(function(wall){
            wall.routes = [];
            this.$scope.routes.forEach(function(route){
                if(route.get('wall').id == wall.id){
                    wall.routes.push(route);
                }
            }.bind(this));
            wall.averageGrade = this.routeModel.getAverageGrade(wall.routes);
            wall.averageNumber = wall.averageGrade.replace(/[^0-9]/, '');
            wall.total = wall.routes.length;
        }.bind(this));
        this.$scope.gym = this.gymModel.gym;
        console.log(this.$scope.gym);
    },

    destroy:function(){
        this.notifications.removeEventListener(models.events.USER_SIGNED_IN, this.boundHandleUserChange);
        this.notifications.removeEventListener(models.events.USER_SIGNED_OUT, this.boundHandleUserChange);
        this.notifications.removeEventListener(models.events.WALLS_LOADED, this.boundHandleWallsChange);
    },

    getWalls: function(){
        this.wallModel.getWallsByGym(this.gymModel.gym);
    },

    goToWall: function(wall){
        this.$state.go("wall", {wallId: wall.id, gymId: this.$scope.gym.id});
    },

    handleUserChange: function(){
        this.$scope.currentUser = this.userModel.currentUser;
    },

    handleWallsChange: function(){
        this.$scope.walls = this.wallModel.wallsByGym[this.gymModel.gym.id];
    }

});

angular.module('wallTable',[])
.directive('wallTable', function($state, WallModel, GymModel, UserModel, RouteModel, Notifications){
    var obj;
    return {
        restrict:'E',
        isolate:true,
        link: function($scope){
            obj = new WallTableDirective($scope, $state, WallModel, GymModel, UserModel, RouteModel, Notifications);
        },
        scope:true,
        templateUrl: "partials/walls/wallTable.html"
    };
});
