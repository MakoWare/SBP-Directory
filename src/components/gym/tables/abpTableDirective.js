'use strict'

var ABPTableDirective = BaseDirective.extend({

    initialize: function($scope, $el, GymModel, Notifications){
        this.$el = $el;
        this.gymModel = GymModel;
        this.notifications = Notifications;
    },

    defineListeners: function(){

    },

    defineScope: function(){
        this.$scope.calculateTotals = this.$scope.$parent.calculateTotals;
    },

    destroy:function(){

    },

});

(function(){
    angular.module('ABPTableDirective',[])
    .directive('abpTable', ['GymModel', 'Notifications', function(GymModel, Notifications){
        return {
            restrict:'E',
            link: function($scope, el, attrs){
                // if(attrs.ideal && attrs.ideal==="true"){
                //     console.log('route is ideal');
                // }
                new ABPTableDirective($scope, el, GymModel, Notifications);
            },
            scope:{
                gym:'='
            },
            templateUrl: "partials/gym/abpTable.html"
        };
    }]);
})();
