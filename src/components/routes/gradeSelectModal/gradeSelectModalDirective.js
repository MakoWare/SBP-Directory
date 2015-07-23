'use strict';

namespace('models.events').OPEN_GRADE_MODAL = "ActivityModel.OPEN_GRADE_MODAL";
namespace('models.events').CLOSE_GRADE_MODAL = "ActivityModel.CLOSE_GRADE_MODAL";
namespace('models.events').GRADE_MODAL_CLOSED = "ActivityModel.CLOSE_GRADE_MODAL";

var GradeSelectModalDirective = BaseDirective.extend({
    routeModel: null,
    userModel: null,
    notifications: null,

    initialize: function($scope, $elm, $state, UserModel, RouteModel, GymModel, Notifications){
        this.$elm = $elm;
        this.$state = $state;
        this.userModel = UserModel;
        this.routeModel = RouteModel;
        this.gymModel = GymModel;
        this.notifications = Notifications;
    },

    defineListeners: function(){
        this.$scope.selectGrade = this.selectGrade.bind(this);
        this.notifications.addEventListener(models.events.OPEN_GRADE_MODAL, this.handleOpenGradeModal.bind(this));
    },

    defineScope: function(){
        if(this.gymModel.gym.get("name") == "Seattle Bouldering Project"){
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
                    ['purple6', 'purple7', 'purple8'],
                    ['black8', 'black9', 'black10'],
                    ['black11', 'black12', 'black13']
                ]
            ];
            this.order = ['gray', 'yellow', 'green', 'red', 'blue', 'orange', 'purple', 'black'];
        } else {
            this.$scope.grades = [
                [
                    ['yellow0'],
                    ['red0', 'red1', 'red2'],
                    ['green1', 'green2', 'green3'],
                    ['purple2', 'purple3', 'purple4'],
                    ['orange3', 'orange4', 'orange5']
                ],
                [
                    ['black4', 'black5', 'black6'],
                    ['blue5', 'blue6', 'blue7'],
                    ['pink6', 'pink7', 'pink8'],
                    ['white7', 'white8', 'white9'],
                    ['white10', 'white11', 'white12']
                ]
            ];
            this.order = ['yellow', 'red', 'green', 'purple', 'orange', 'black', 'blue', 'pink', 'white'];
        }
    },

    destroy: function(){
        this.notifications.removeEventListener(models.events.OPEN_GRADE_MODAL, this.handleOpenGradeModal);
    },

    selectGrade: function(gradeString){
        var color = gradeString.replace(/[0-9]/g, '');
        var grade = gradeString.replace(/\D/g,'');
        this.$scope.currentGrade = gradeString;
        this.$scope.route.set('color', color);
        this.$scope.route.set('grade', grade);
        this.$scope.route.set('order', this.order.indexOf(color));
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
    .directive('gradeSelectModal', ['$state', 'UserModel', 'RouteModel', 'GymModel', 'Notifications', function($state, UserModel, RouteModel, GymModel, Notifications){
        return {
            restrict:'E',
            isolate:true,
            link: function($scope, $elm){
                new GradeSelectModalDirective($scope, $elm, $state, UserModel, RouteModel, GymModel, Notifications);
            },
            scope: true,
            templateUrl: "partials/routes/gradeSelectModal.html"
        };
    }]);
