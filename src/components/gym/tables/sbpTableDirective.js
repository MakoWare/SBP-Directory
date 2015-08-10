'use strict'

var SBPTableDirective = BaseDirective.extend({

    initialize: function($scope, $el, GymModel, Notifications){
        this.$el = $el;
        this.gymModel = GymModel;
        this.notifications = Notifications;

    },

    defineListeners: function(){
        // this.$scope.calculateTotals = this.calculateTotals.bind(this);
        // this.$scope.$on('calculateTotals', this.$scope.calculateTotals);
        this.$scope.calculateTotals = this.$scope.$parent.calculateTotals;
    },

    defineScope: function(){

    },

    destroy:function(){

    },

});

(function(){
    angular.module('SBPTableDirective',[])
    .directive('sbpTable', ['GymModel', 'Notifications', function(GymModel, Notifications){
        return {
            restrict:'E',
            link: function($scope, el, attrs){
                // if(attrs.ideal && attrs.ideal==="true"){
                //     console.log('route is ideal');
                // }
                new SBPTableDirective($scope, el, GymModel, Notifications);
            },
            scope:{
                gym:'='
            },
            templateUrl: "partials/gym/sbpTable.html"
        };
    }]);
})();
