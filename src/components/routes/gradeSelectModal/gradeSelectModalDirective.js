'use strict';

namespace('models.events').OPEN_GRADE_MODAL = "ActivityModel.OPEN_GRADE_MODAL";
namespace('models.events').CLOSE_GRADE_MODAL = "ActivityModel.CLOSE_GRADE_MODAL";
namespace('models.events').GRADE_MODAL_CLOSED = "ActivityModel.CLOSE_GRADE_MODAL";

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
        this.$scope.selectGrade = this.selectGrade.bind(this);
        this.notifications.addEventListener(models.events.OPEN_GRADE_MODAL, this.handleOpenGradeModal.bind(this));
    },

    defineScope: function(){
        this.$scope.grades = [
            [
                ['gray0'],
                ['yellow0', 'yellow1', 'yellow2'],
                ['green2', 'green3', 'green4'],
                ['red3', 'red4', 'red5']
            ],
            [
                ['blue4', 'blue5', 'blue6'],
                ['orange5', 'orange6', 'orange7'],
                ['purple7', 'purple8'],
                ['black8', 'black9', 'black10'],
                ['black11', 'black12', 'black13']
            ]
        ];
    },

    destroy: function(){
        this.notifications.removeEventListener(models.events.OPEN_GRADE_MODAL, this.handleOpenGradeModal);
    },

    selectGrade: function(gradeString){
        var color = gradeString.replace(/[0-9]/g, '');
        var grade = gradeString.replace(/\D/g,'');
        console.log(gradeString);
        console.log(color);
        console.log(grade);

        this.$scope.currentGrade = gradeString;
        this.$scope.route.set('color', color);
        this.$scope.route.set('grade', grade);
        $(this.$elm[0].querySelector("#gradeSelectModal")).closeModal();
        this.notifications.notify(models.events.GRADE_MODAL_CLOSED);
    },

    /** EVENT HANDLERS **/
    handleOpenGradeModal: function(event, route){
        this.$scope.route = route;
        this.$scope.currentGrade = route.get('color') + route.get('grade');
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
