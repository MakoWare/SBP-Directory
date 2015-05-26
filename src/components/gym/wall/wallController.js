'use strict';

var WallController = BaseController.extend({
  notifications:null,
  rootCanvas:null,
  rootImage:null,
  $state: null,

  init:function($scope, Notifications,$state){
    this.notifications = Notifications;
    this.$state = $state;
    this._super($scope);
  },

  defineListeners:function(){
    console.log('wall controller: define listeners');
    this._super();
  },

  defineScope:function(){
    var that = this;

  },

  destroy:function(){

  },

});

WallController.$inject = ['$scope','Notifications','$state'];
