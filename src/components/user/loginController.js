//Users Controller
var LoginCtrl = BaseController.extend({

    /**** OVERRIDE Methods ****/
    initialize:function($scope, $location, $timeout, Notifications, ParseService, UserModel, $state, GymModel){
        this.$location = $location;
        this.ParseService = ParseService;
        this.userModel = UserModel;
        this.gymModel = GymModel;
        this.$state = $state;
        this.$timeout = $timeout;
        this.notifications = Notifications;

    },

    defineListeners:function(){

    },

    defineScope:function(){
        this.$scope.username = "";
        this.$scope.password = "";
        this.$scope.login = this.login.bind(this);
        this.notifications.notify(models.events.BRAND_CHANGE, "Route Management System");

        this.$timeout(function(){
            this.notifications.notify(models.events.HIDE_LOADING);
        }.bind(this), 5);
    },

    destroy: function(){

    },

    login: function(){
        console.log("hi");
        this.notifications.notify(models.events.SHOW_LOADING);
        this.ParseService.login(this.$scope.username, this.$scope.password).then(function(results){
            this.notifications.notify(models.events.HIDE_LOADING, true);
            this.userModel.currentUser = results;
            this.notifications.notify(models.events.USER_SIGNED_IN);
            this.$state.go("walls");
        }.bind(this), function(error){
            this.notifications.notify(models.events.HIDE_LOADING, true);
            this.$scope.errorMessage = error.message;
            this.$scope.error = true;
        }.bind(this));
    }

});

LoginCtrl.$inject = ['$scope', '$location', '$timeout', 'Notifications', 'ParseService', 'UserModel', '$state','GymModel'];
