'use strict';

namespace('models.events').OPEN_STATE_MODAL = "ActivityModel.OPEN_STATE_MODAL";
namespace('models.events').CLOSE_STATE_MODAL = "ActivityModel.CLOSE_STATE_MODAL";
namespace('models.events').STATE_MODAL_CLOSED = "ActivityModel.STATE_MODAL_CLOSED";

var StateSelectModalDirective = BaseDirective.extend({
    routeModel: null,
    userModel: null,
    notifications: null,

    initialize: function($scope, $elm, $state, UserModel, RouteModel,Notifications){
        this.$elm = $elm;
        this.$state = $state;
        this.userModel = UserModel;
        this.routeModel = RouteModel;
        this.notifications = Notifications;
    },

    defineListeners: function(){
        this.$scope.selectState = this.selectState.bind(this);
        this.notifications.addEventListener(models.events.OPEN_STATE_MODAL, this.openModal.bind(this));
    },

    defineScope: function(){

    },

    destroy: function(){
        this.notifications.removeEventListener(models.events.OPEN_GRADE_MODAL, this.handleOpenGradeModal);
    },

    selectState: function(status){
        this.$scope.route.set('status', status);
        $(this.$elm[0].querySelector("#stateSelectModal")).closeModal();
        this.notifications.notify(models.events.STATE_MODAL_CLOSED);
    },

    openModal: function(event, route){
        this.$scope.route = route;
        this.$scope.currentState = route.get('status');
        $(this.$elm[0].querySelector("#stateSelectModal")).openModal();
    }

});

angular.module('stateSelectModal',[])
    .directive('stateSelectModal', ['$state', 'UserModel', 'RouteModel', 'Notifications', function($state, UserModel, RouteModel, Notifications){
        return {
            restrict:'E',
            isolate:true,
            link: function($scope, $elm){
                new StateSelectModalDirective($scope, $elm, $state, UserModel, RouteModel, Notifications);
            },
            scope: true,
            templateUrl: "partials/routes/stateSelectModal.html"
        };
    }]);
