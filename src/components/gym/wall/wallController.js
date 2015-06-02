'use strict';

var WallController = BaseController.extend({
  notifications:null,
  rootCanvas:null,
  rootImage:null,
  $state: null,
  // $stateParams: null,

  initialize:function($scope, Notifications,$state,$stateParams){
    this.notifications = Notifications;
    this.$state = $state;
    this.$stateParams = $stateParams;
  },

  defineListeners:function(){
  },

  defineScope:function(){
    this.$scope.wallId = this.$stateParams.id;
  },

  destroy:function(){

  },

});

WallController.$inject = ['$scope','Notifications','$state','$stateParams'];
