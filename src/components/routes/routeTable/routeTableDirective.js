'use strict';

var RouteTableDirective = BaseDirective.extend({
    routeModel: null,
    userModel: null,
    notifications: null,

    initialize: function($scope, $state, $timeout, UserModel, RouteModel, WallModel, Notifications){
        this.$state = $state;
        this.$timeout = $timeout;
        this.userModel = UserModel;
        this.routeModel = RouteModel;
        this.wallModel = WallModel;
        this.notifications = Notifications;
    },

    defineListeners: function(){
        this.$scope.openGradeSelectModal = this.openGradeSelectModal.bind(this);
        this.notifications.addEventListener(models.events.ROUTES_LOADED, this.handleRoutesChanged.bind(this));
        this.notifications.addEventListener(models.events.ROUTES_UPDATED, this.handleRoutesChanged.bind(this));
        this.notifications.addEventListener(models.events.GRADE_MODAL_CLOSED, this.handleGradeModalClosed.bind(this));
    },

    defineScope: function(){
        this.$scope.addRoute = this.addRoute.bind(this);
        this.$scope.autoSave = this.autoSave.bind(this);
        this.$scope.routes = this.routeModel.routes;
        this.$scope.wall = this.wallModel.wall;
        this.$scope.setters = this.userModel.setters;
        this.$scope.predicate = "attributes.order";
        this.$scope.secondary = "attributes.grade";

        this.$timeout(function(){
            $(document).ready(function() {
                $('.routeSetterSelect').material_select();
                $('.routeStatusSelect').material_select();
            });
        });
    },

    destroy: function(){
        this.notifications.removeEventListener(models.events.ROUTES_LOADED, this.handleRoutesChanged);
        this.notifications.removeEventListener(models.events.ROUTES_UPDATED, this.handleRoutesChanged);
        this.notifications.removeEventListener(models.events.GRADE_MODAL_CLOSED, this.handleGradeModalClosed);
    },


    addRoute: function(){
        this.routeModel.createRoute(this.wallModel.wall.id);
    },

    openGradeSelectModal: function(route){
        this.notifications.notify(models.events.OPEN_GRADE_MODAL, route);
    },

    autoSave: function(){
        console.log("autoSave");
        this.routeModel.autoSaveRoutes();
    },

    /** EVENT HANDLERS **/
    handleRoutesChanged: function(){
        this.$scope.routes = this.routeModel.routes;
        this.$timeout(function(){
            $(document).ready(function() {
                $('.routeSetterSelect').material_select('destroy');
                $('.routeSetterSelect').material_select();

                $('.routeStatusSelect').material_select('destroy');
                $('.routeStatusSelect').material_select();
            });
        });
    },

    handleGradeModalClosed: function(){
        this.autoSave();
    }
});

angular.module('routeTable',[])
    .directive('routeTable', ['$state', '$timeout', 'UserModel', 'RouteModel', 'WallModel', 'Notifications', function($state, $timeout, UserModel, RouteModel, WallModel, Notifications){
        return {
            restrict:'E',
            isolate:true,
            link: function($scope){
                new RouteTableDirective($scope, $state, $timeout, UserModel, RouteModel, WallModel, Notifications);
            },
            scope: true,
            templateUrl: "partials/routes/routeTable.html"
        };
    }]);
