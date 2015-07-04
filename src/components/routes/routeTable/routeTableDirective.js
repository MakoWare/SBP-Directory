'use strict';

var RouteTableDirective = BaseDirective.extend({
    routeModel: null,
    userModel: null,
    notifications: null,

    initialize: function($scope, $state, UserModel, RouteModel,Notifications){
        this.$state = $state;
        this.userModel = UserModel;
        this.routeModel = RouteModel;
        this.notifications = Notifications;
    },

    defineListeners: function(){
        this.$scope.openGradeSelectModal = this.openGradeSelectModal.bind(this);
        this.notifications.addEventListener(models.events.ROUTES_LOADED, this.handleRoutesChanged.bind(this));
    },

    defineScope: function(){
        this.$scope.routes = this.routeModel.routes;
        this.$scope.viewRoute = this.viewRoute.bind(this);
        console.log(this.routeModel.routes);
    },

    openGradeSelectModal: function(route){
        console.log(route);
        this.notifications.notify(models.events.OPEN_GRADE_MODAL, route);
    },

    /** EVENT HANDLERS **/
    handleRoutesChanged: function(){
        this.$scope.routes = this.routeModel.routes;
    },

    /**** scope methods ****/
    viewRoute: function(route){
        this.$state.go('route', {id:route.id});
    }

});

angular.module('routeTable',[])
    .directive('routeTable', ['$state', 'UserModel', 'RouteModel', 'Notifications', function($state, UserModel, RouteModel, Notifications){
        return {
            restrict:'E',
            isolate:true,
            link: function($scope){
                new RouteTableDirective($scope, $state, UserModel, RouteModel, Notifications);
            },
            scope: true,
            templateUrl: "partials/routes/routeTable.html"
        };
    }]);
