'use strict'


var RoutesPageController = BaseController.extend({

  /*
    OVERRIDE METHODS
  */

  initialize:function(scope,GymModel,RouteModel){
    this.gymModel = GymModel;
    this.routeModel = RouteModel;

    this.routeModel.getAllRoutesForGym(this.gymModel.gym).then(this.onGetAllRoutesForGym.bind(this));
  },

  defineListeners:function(){

  },

  defineScope:function(){
    $('#routesTabs').tabs();
    // console.log($('#routesTabs'));
  },

  destroy:function(){

  },

  /** CALLBACK METHODS **/
  onGetAllRoutesForGym:function(routes){
    this.$scope.routes = routes;
    console.log(routes);
  }

  /*
    INSTANCE METHODS
  */



});


RoutesPageController.$inject = ['$scope','GymModel', 'RouteModel'];
