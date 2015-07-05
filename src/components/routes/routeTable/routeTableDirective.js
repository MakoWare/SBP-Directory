'use strict';

var RouteTableDirective = BaseDirective.extend({
    routeModel: null,
    userModel: null,
    notifications: null,

    initialize: function($scope, $state, $timeout, UserModel, RouteModel,Notifications){
        this.$state = $state;
        this.$timeout = $timeout;
        this.userModel = UserModel;
        this.routeModel = RouteModel;
        this.notifications = Notifications;

        this.initBackups();
    },

    defineListeners: function(){
        this.$scope.openGradeSelectModal = this.openGradeSelectModal.bind(this);
        this.notifications.addEventListener(models.events.ROUTES_LOADED, this.handleRoutesChanged.bind(this));
        this.notifications.addEventListener(models.events.GRADE_MODAL_CLOSED, this.handleGradeModalClosed.bind(this));
    },

    defineScope: function(){
        this.$scope.routes = this.routeModel.routes;
        this.$scope.viewRoute = this.viewRoute.bind(this);
        console.log(this.routeModel.routes);

        this.$timeout(function(){
            $(document).ready(function() {
                $('.routeSetterSelect').material_select();
            });
        });
    },

    openGradeSelectModal: function(route){
        this.notifications.notify(models.events.OPEN_GRADE_MODAL, route);
    },

    initBackups: function(){

    },

    /** EVENT HANDLERS **/
    handleRoutesChanged: function(){
        this.$scope.routes = this.routeModel.routes;
    },

    handleGradeModalClosed: function(){
        this.routeModel.autoSaveRoutes(this.$scope.routes);
    },


    /**** scope methods ****/
    viewRoute: function(route){
        this.$state.go('route', {id:route.id});
    }

});

angular.module('routeTable',[])
    .directive('routeTable', ['$state', '$timeout', 'UserModel', 'RouteModel', 'Notifications', function($state, $timeout, UserModel, RouteModel, Notifications){
        return {
            restrict:'E',
            isolate:true,
            link: function($scope){
                new RouteTableDirective($scope, $state, $timeout, UserModel, RouteModel, Notifications);
            },
            scope: true,
            templateUrl: "partials/routes/routeTable.html"
        };
    }]);
