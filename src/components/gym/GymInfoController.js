'use strict'


var GymInfoController = BaseController.extend({

  /*
    OVERRIDE METHODS
  */

  initialize:function($scope, GymModel, Notifications){
    this.gymModel = GymModel;
    this.notifications = Notifications;
  },

  defineListeners:function(){
    this.notifications.addEventListener(models.events.GYM_CHANGE, this.onGymChange.bind(this));
  },

  defineScope:function(){
    this.$scope.gym = this.gymModel.gym;
    this.$scope.calculateTotals = this.calculateTotals.bind(this);

    $(document).ready(function(){
        $('ul#gym-info.tabs').tabs();
    });
  },

  destroy:function(){

  },

  /*
    INSTANCE METHODS
  */

  calculateTotals:function(){
    var $scope = this.$scope;
    //Grade Totals
    $scope.gym.attributes.totalV0 = $scope.gym.attributes.grayV0 + $scope.gym.attributes.yellowV0;
    $scope.gym.attributes.totalV1 = $scope.gym.attributes.yellowV1;
    $scope.gym.attributes.totalV2 = $scope.gym.attributes.yellowV2 + $scope.gym.attributes.greenV2;
    $scope.gym.attributes.totalV3 = $scope.gym.attributes.greenV3 + $scope.gym.attributes.redV3;
    $scope.gym.attributes.totalV4 = $scope.gym.attributes.greenV4 + $scope.gym.attributes.redV4 + $scope.gym.attributes.blueV4;
    $scope.gym.attributes.totalV5 = $scope.gym.attributes.redV5 + $scope.gym.attributes.blueV5 + $scope.gym.attributes.orangeV5;
    $scope.gym.attributes.totalV6 = $scope.gym.attributes.blueV6 + $scope.gym.attributes.orangeV6 + $scope.gym.attributes.purpleV6;
    $scope.gym.attributes.totalV7 = $scope.gym.attributes.orangeV7 + $scope.gym.attributes.purpleV7;

    $scope.gym.attributes.totalV8 = $scope.gym.attributes.purpleV8 + $scope.gym.attributes.blackV8;
    $scope.gym.attributes.totalV9 = $scope.gym.attributes.blackV9;
    $scope.gym.attributes.totalV10 = $scope.gym.attributes.blackV10;
    $scope.gym.attributes.totalV11 = $scope.gym.attributes.blackV11;
    $scope.gym.attributes.totalV12 = $scope.gym.attributes.blackV12;

    //Color Totals
    $scope.gym.attributes.totalGray = $scope.gym.attributes.grayV0;
    $scope.gym.attributes.totalYellow = $scope.gym.attributes.yellowV0 + $scope.gym.attributes.yellowV1 + $scope.gym.attributes.yellowV2;
    $scope.gym.attributes.totalGreen = $scope.gym.attributes.greenV2 + $scope.gym.attributes.greenV3 + $scope.gym.attributes.greenV4;
    $scope.gym.attributes.totalRed = $scope.gym.attributes.redV3 + $scope.gym.attributes.redV4 + $scope.gym.attributes.redV5;
    $scope.gym.attributes.totalBlue = $scope.gym.attributes.blueV4 + $scope.gym.attributes.blueV5 + $scope.gym.attributes.blueV6;
    $scope.gym.attributes.totalOrange = $scope.gym.attributes.orangeV5 + $scope.gym.attributes.orangeV6 + $scope.gym.attributes.orangeV7;
    $scope.gym.attributes.totalPurple = $scope.gym.attributes.purpleV6 + $scope.gym.attributes.purpleV7 + $scope.gym.attributes.purpleV8;
    $scope.gym.attributes.totalBlack = $scope.gym.attributes.blackV8 + $scope.gym.attributes.blackV9 + $scope.gym.attributes.blackV10 + $scope.gym.attributes.blackV11 + $scope.gym.attributes.blackV12;

    //Total Ideal Routes
    $scope.gym.attributes.totalIdealRoutes = $scope.gym.attributes.totalGray + $scope.gym.attributes.totalYellow + $scope.gym.attributes.totalGreen + $scope.gym.attributes.totalRed + $scope.gym.attributes.totalBlue + $scope.gym.attributes.totalOrange + $scope.gym.attributes.totalPurple + $scope.gym.attributes.totalBlack;

  },

  /*
    EVENT METHODS
  */

  onGymChange:function(event, gym){
    this.$scope.$apply(function(scope){
      scope.gym = gym;
      this.calculateTotals();
    }.bind(this));
  }


});

GymInfoController.$inject = ['$scope', 'GymModel', 'Notifications'];
