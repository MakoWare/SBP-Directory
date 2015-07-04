'use strict';

namespace('models.events').OPEN_GRADE_MODAL = "ActivityModel.OPEN_GRADE_MODAL";
namespace('models.events').CLOSEO_GRADE_MODAL = "ActivityModel.CLOSE_GRADE_MODAL";

var GradeSelectModalDirective = BaseDirective.extend({
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
        this.notifications.addEventListener(models.events.OPEN_GRADE_MODAL, this.handleOpenGradeModal.bind(this));
    },

    defineScope: function(){

    },

    destroy: function(){
        this.notifications.removeEventListener(models.events.OPEN_GRADE_MODAL, this.handleOpenGradeModal);
    },

    /** EVENT HANDLERS **/
    handleOpenGradeModal: function(event, route){
        console.log(route);
        $(this.$elm[0].querySelector("#gradeSelectModal")).openModal();
    }

});

angular.module('gradeSelectModal',[])
    .directive('gradeSelectModal', ['$state', 'UserModel', 'RouteModel', 'Notifications', function($state, UserModel, RouteModel, Notifications){
        return {
            restrict:'E',
            isolate:true,
            link: function($scope, $elm){
                new GradeSelectModalDirective($scope, $elm, $state, UserModel, RouteModel, Notifications);
            },
            scope: true,
            templateUrl: "partials/routes/gradeSelectModal.html"
        };
    }]);
