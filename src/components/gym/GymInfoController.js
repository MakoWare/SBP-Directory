'use strict'


var GymInfoController = BaseController.extend({

    /*
    OVERRIDE METHODS
    */

    initialize:function($scope, GymModel, Notifications, RouteModel){
        this.gymModel = GymModel;
        this.notifications = Notifications;
        this.routeModel = RouteModel;

        this.$scope.totalRoutes = this.routeModel.routes.length;
    },

    defineListeners:function(){
        this.notifications.addEventListener(models.events.GYM_CHANGE, this.onGymChange.bind(this));
    },

    defineScope:function(){
        this.$scope.gym = this.gymModel.gym;
        this.$scope.calculateTotals = this.calculateTotals.bind(this);
        this.$scope.saveGym = this.saveGym.bind(this);

        $(document).ready(function(){
            $('ul#gym-info.tabs').tabs();
        });
    },

    destroy:function(){

    },

    /*
    INSTANCE METHODS
    */

    calculateTotals:function(){

        var colors = ['gray', 'yellow', 'red', 'green', 'purple', 'orange', 'black', 'blue', 'pink', 'white'];
        var grades = ['V0','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12'];

        var $scope = this.$scope;
        var colorTotals = {};

        $.each(grades, function(index, grade){
            var total = 0;
            $.each(colors, function(ix, color){
                var num = $scope.gym.attributes[color+grade];
                num = num===undefined ? 0 : num;
                total += num;

                if(colorTotals[color]===undefined){
                    colorTotals[color] = 0;
                }
                colorTotals[color] += num;
                $scope.gym.set(color+grade, num);
            });
            // $scope.gym.attributes['total'+grade] = total;
            $scope.gym.set('total'+grade, total);
        });

        var totalTotals = 0;
        $.each(colorTotals, function(key, total){
            // $scope.gym.attributes['total'+key.capitalizeFirstLetter()] = total;
            $scope.gym.set('total'+key.capitalizeFirstLetter(), total);
            totalTotals += total;
        });
        // $scope.gym.attributes.totalIdealRoutes = totalTotals;
        $scope.gym.set('totalIdealRoutes', totalTotals);

    },

    saveGym:function(){
        this.notifications.notify(models.events.SHOW_LOADING, false);
        this.$scope.gym.save().then(function(){
            this.notifications.notify(models.events.HIDE_LOADING, false);
            this.$scope.gymForm.$setPristine(true);
            Materialize.toast('Saved Gym!', 1500, 'success');
        }.bind(this), function(e){
            this.notifications.notify(models.events.HIDE_LOADING, false);
            Materialize.toast('An error has occurred. ('+e.code+')\n'+e.message, 2500, 'error');
        }.bind(this));
    },

    /*
    EVENT METHODS
    */

    onGymChange:function(event, gym){
        this.$scope.$apply(function(scope){
            scope.gym = gym;
            this.routeModel.getRoutesByGym(gym);
            this.calculateTotals();
        }.bind(this));

        // this.$scope.$broadcast("__redrawGraph");
    }


});

GymInfoController.$inject = ['$scope', 'GymModel', 'Notifications', 'RouteModel'];
