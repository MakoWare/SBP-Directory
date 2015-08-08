'use strict';

namespace('models.events').BRAND_CHANGE = "ActivityModel.BRAND_CHANGE";

var NavBarDirective = BaseDirective.extend({
    userModel: null,
    notifications: null,

    initialize: function($scope, $rootScope, $state, $timeout, UserModel, Notifications,GymModel){
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$timeout = $timeout;
        this.userModel = UserModel;
        this.notifications = Notifications;
        this.gymModel = GymModel;
    },

    defineListeners: function(){
        this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.handleUserSignedIn.bind(this));
        this.notifications.addEventListener(models.events.BRAND_CHANGE, this.handleBrandChange.bind(this));
        this.notifications.addEventListener(models.events.GYM_CHANGE, this.onGymChange.bind(this));
        this.notifications.addEventListener(models.events.GYM_LOADED, this.onGymChange.bind(this));
        this.notifications.addEventListener(models.events.GYMS_LOADED, this.onGymsLoaded.bind(this));

        this.$scope.logout = this.logout.bind(this);

        this.$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            this.$scope.state = toState.name;
        }.bind(this));
    },

    defineScope: function(){
        this.navShowing = false;
        this.$scope.currentUser = this.userModel.currentUser;
        $(".button-collapse").sideNav();

        this.$scope.gym = this.gymModel.gym;
        this.$scope.gyms = this.gymModel.gyms;
        this.$scope.onGymSelect = this.onGymSelect.bind(this);
    },

    onGymFetch:function(gym){
        this.$scope.gym = this.gymModel.gym;

    },

    onGymsFetch:function(gyms){
        this.$scope.gyms = this.gymModel.gyms;
    },

    onGymSelect:function(gym){
        this.$state.go(this.$state.current, {gymId: gym.id});
        /*
        this.gymModel.setCurrentGym(gym);
        if(gym.get('name') === "Seattle Bouldering Project"){
            this.$scope.brand = "SBP";
        } else {
            this.$scope.brand = "ABP";
        }
            this.$scope.$apply();
         */
    },

    logout: function(){
        this.userModel.logout();
        this.$location.url("/");
    },

    /** EVENT HANDLERS **/
    handleUserSignedIn: function(){
        this.$scope.currentUser = this.userModel.currentUser;
    },

    handleBrandChange: function(event, brand){
        this.$scope.brand = brand;
    },

    onGymChange:function(event, gym){
        this.$scope.gym = this.gymModel.gym;
        if(this.$scope.gym.get('name') == "Seattle Bouldering Project"){
            this.$scope.brand = "SBP";
            this.$scope.$apply();
        } else {
            this.$scope.brand = "ABP";
            this.$scope.$apply();
        }
    },

    onGymsLoaded: function(event, gyms){
        this.$scope.gyms = this.gymModel.gyms;
    }


});

angular.module('navbar',[])
    .directive('navbar',['$rootScope', '$state', '$timeout', 'UserModel', 'Notifications', 'GymModel', function($rootScope, $state, $timeout, UserModel, Notifications, GymModel){
        return {
            restrict:'E',
            isolate:true,
            link: function($scope){
                new NavBarDirective($scope, $rootScope, $state, $timeout, UserModel, Notifications, GymModel);
            },
            scope:true,
            templateUrl: "partials/navbar/navbar.html"
        };
    }]);
