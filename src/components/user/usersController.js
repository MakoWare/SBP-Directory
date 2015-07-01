'use strict'

//Users Controller
var UsersCtrl = BaseController.extend({

  /**** OVERRIDE Methods ****/
  initialize:function($scope, $location, ParseService, UserModel, $state, GymModel,Users){
    this.$location = $location;
    this.ParseService = ParseService;
    this.userModel = UserModel;
    this.gymModel = GymModel;
    this.$state = $state;

    this.$scope.users = Users;
    this.setUpUsers();
  },

  defineListeners:function(){
    this.setUpUserObjectListeners();
  },

  defineScope:function(){
    this.$scope.gym = this.gymModel.gym;
    this.$scope.gyms = this.gymModel.gyms;

    // this.getUsers();
    this.$scope.setUpUserObjectListeners = this.setUpUserObjectListeners.bind(this);
    this.$scope.viewUser = this.viewUser.bind(this);
    this.$scope.onMenuSelect = this.onMenuSelect.bind(this);
  },

  destroy:function(){
    $(':checkbox').off('.switchListen');
  },

  /**** Instance Methods ****/
  getUsers:function(){
    // this.userModel.getUsers().then(function(results){
    //     this.$scope.users = results;
    //     this.$scope.$apply();
    //     this.setUpUsers();
    //     this.setUpUserObjectListeners();
    // }.bind(this),
    // function(err){
    //   console.log('failed to get users');
    //   console.log(err);
    // }.bind(this));
  },

  setUpUsers:function(){
    this.$scope.users.forEach(function(user){
        this.getUserRoutes(user);

    }.bind(this));
  },

  getUserRoutes:function(user){
    this.ParseService.getRoutesByUser(user).then(function(results){
        user.attributes.routes = results;
        this.$scope.$apply();
        this.generateStats(user);
    }.bind(this));
  },

  setUpUserObjectListeners:function(){
    var self = this;
    $(':checkbox').on('change.switchListen',function(){
      self.onUserSetterSwitchToggle($(this));
    });
  },

  onUserSetterSwitchToggle:function(element){
    this.ParseService.toggleUserSetterStatus(element.data('user-id'),element.is(':checked')).then(function(user){
      console.log(user);
    },function(err){
      console.log(err);
      element.prop('checked',!element.is(':checked'));
      Materialize.toast('Failed to Update', 2000);
    });
    // console.log(element.data('user-id') + ", " + element.is(':checked'));
  },

  onMenuSelect:function(gym){
    // console.log(gym.attributes.name);
    var tableBody = $('#users-table-body').detach();

    this.$scope.$apply(function(scope){
      scope.users.length = 0;
      scope.gym = gym;
    });


    this.ParseService.getUsersForGym(gym).then(function(users){
      this.$scope.users = users;
      this.setUpUsers();
      $('#users-table').append(tableBody);
    }.bind(this));

  },



  /**** Statistics Methods ****/

  generateStats:function(user){
    var colors = [];
    var grades = [];
    var themes = [];
    user.attributes.routes.forEach(function(route){
        switch(route.attributes.color){
        case "gray":
            colors.push("gray");
            break;
        case "yellow":
            colors.push("yellow");
            break;
        case "green":
            colors.push("green");
            break;
        case "red":
            colors.push("red");
            break;
        case "blue":
            colors.push("blue");
            break;
        case "orange":
            colors.push("orange");
            break;
        case "purple":
            colors.push("purple");
            break;
        case "black":
            colors.push("black");
            break;
        };

        grades.push(route.attributes.grade);
        themes.push(route.attributes.theme);
    });

    user.attributes.mostColor = this.modeString(colors);
    user.attributes.mostTheme = this.modeString(themes);
    user.attributes.mostGrade = this.modeString(grades);
  },

  modeString:function(array){
    if (array.length == 0)
        return null;

    var modeMap = {},
        maxEl = array[0],
        maxCount = 1;

    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];

        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;

        if (modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
  },

  /**** CRUD Methods ****/
  addUser:function(){
    // this.$location.path("/users/create");
  },

  viewUser:function(user){
    // this.$location.path("/users/" + user.id);
    console.log("view user");
    this.$state.go('userSettings', {id:user.id});
  },

  deleteUser:function(user){
    /*
    ParseService.deleteUser(user, function(results){

    });
     */
  }

});

UsersCtrl.$inject = ['$scope', '$location', 'ParseService', 'UserModel', '$state','GymModel','Users'];
