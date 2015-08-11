//User Controller
var UserCtrl = BaseController.extend({

    /**** OVERRIDE Methods ****/
    initialize: function($scope, $location, ParseService, $stateParams, Notifications, RouteModel, UserModel, GymModel){
        this.ParseService = ParseService;
        this.$location = $location;
        this.$stateParams = $stateParams;
        this.notifications = Notifications;
        this.routeModel = RouteModel;
        this.userModel = UserModel;
        this.gymModel = GymModel;
    },

    defineListeners: function(){

    },

    defineScope: function(){
        this.$scope.user = this.userModel.profile;
        this.$scope.gyms = this.gymModel.gyms;

        this.getUserRoutes();
        this.$scope.tab = "routes";
        this.notifications.notify(models.events.BRAND_CHANGE, this.$scope.user.get('username'));
        $(document).ready(function(){
            $('ul.tabs').tabs();
            if(this.$stateParams.tab){
                $('ul.tabs').tabs('select_tab', this.$stateParams.tab);
            }
        }.bind(this));

        this.$scope.resetPassword = this.resetPassword.bind(this);
        this.$scope.saveUser = this.saveUser.bind(this);
        this.$scope.setUserGym = this.setUserGym.bind(this);
        console.log(this.$scope.gyms);
    },

    destroy: function(){

    },

    setUserGym: function(user){
        var gym = user.attributes.currentGym;
        console.log(gym);
        this.$scope.user.set('currentGym', gym);
    },

    //Get User's Routes
    getUserRoutes : function(){
        this.routeModel.getRoutesByUser(this.$scope.user).then(function(results){
            // GlobalService.dismissSpinner();
            this.$scope.user.attributes.routes = results;
            this.$scope.$apply();
        }.bind(this),
        function(err){
            console.log('failed to get user routes');
        }.bind(this));
    },

    //Save User
    saveUser : function(){
        console.log(this.$scope.user);
        this.notifications.notify(models.events.SHOW_LOADING);
        this.userModel.updateUser(this.$scope.user).then(function(results){
            this.$scope.user = results;
            this.notifications.notify(models.events.HIDE_LOADING, true);
            this.$scope.userInfoForm.$setPristine(true);
            Materialize.toast('Saved User!', 1500, 'success');
        }.bind(this), function(e){
            this.notifications.notify(models.events.HIDE_LOADING, true);
            Materialize.toast('An error has occurred. ('+e.code+')\n'+e.message, 2500, 'error');
        }.bind(this));
    },

    resetPassword:function(){
        this.$scope.user.save().then(function(user){
            return Parse.User.requestPasswordReset(user.get('email'));
        }).then(null,function(e){
            Materialize.toast('An error has occurred. ('+e.code+')\n'+e.message, 2500, 'error');
        });
    }

});

UserCtrl.$inject = ['$scope', '$location', 'ParseService', '$stateParams', 'Notifications', 'RouteModel', 'UserModel', 'GymModel'];
