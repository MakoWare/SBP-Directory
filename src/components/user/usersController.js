//Users Controller
var UsersCtrl = BaseController.extend({

    usersStats: [],

    /**** OVERRIDE Methods ****/
    initialize:function($scope, $location, Notifications, ParseService, UserModel, $state, GymModel){
        this.$location = $location;
        this.ParseService = ParseService;
        this.userModel = UserModel;
        this.gymModel = GymModel;
        this.$state = $state;
        this.notifications = Notifications;


    },

    defineListeners:function(){
        this.notifications.addEventListener(models.events.GYM_CHANGE, this.onGymChange.bind(this));
        this.setUpUserObjectListeners();
    },

    defineScope:function(){
        this.$scope.gym = this.gymModel.gym;
        this.$scope.gyms = this.gymModel.gyms;
        this.$scope.users = this.userModel.users;

        this.setUpUsers();
        // this.getUsers();
        this.$scope.setUpUserObjectListeners = this.setUpUserObjectListeners.bind(this);
        this.$scope.viewUser = this.viewUser.bind(this);
        this.$scope.onMenuSelect = this.onMenuSelect.bind(this);
        this.$scope.createUser = this.createUser.bind(this);

        if(this.$scope.gym.get('name') == "Seattle Bouldering Project"){
            this.notifications.notify(models.events.BRAND_CHANGE, "SBP");
        } else {
            this.notifications.notify(models.events.BRAND_CHANGE, "ABP");
        }

        this.setUpModal();
    },

    destroy:function(){
        $(':checkbox').off('.switchListen');
    },

    /**** setup methods ****/
    setUpModal: function(){
        this.$scope.openUserModal = this.openUserModal.bind(this);
        // $(document).ready(function(){
        //     $('#newUserModalTrigger').leanModal({
        //         dismissible: false, // Modal can be dismissed by clicking outside of the modal
        //         opacity: .3, // Opacity of modal background
        //         in_duration: 300, // Transition in duration
        //         out_duration: 200 // Transition out duration
        //         // ready: this.newUserModalReady.bind(this), // Callback for Modal open
        //         // complete: this.createUser.bind(this) // Callback for Modal close
        //     });
        // }.bind(this));

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
            this.getUserRoutes(user)
        }.bind(this));
    },

    getUserRoutes:function(user){
        // this.ParseService.getRoutesByUser(user).then(function(results){
        //
        //     this.$scope.$applyAsync(function(){
        //         user.attributes.routes = results;
        //         this.generateStats(user);
        //     }.bind(this));
        // }.bind(this));

        return this.ParseService.getStatsForUser(user).then(function(statsObject){
            if(statsObject !== undefined){
                this.$scope.$evalAsync(function(){
                    $('td#'+user.id+'-routes-length').html(statsObject.routes.length);
                    $('td#'+user.id+'-most-color').css('background-color', statsObject.mostColor);
                    $('td#'+user.id+'-most-grade').html(statsObject.mostGrade);
                    $('td#'+user.id+'-most-theme').html(statsObject.mostTheme);
                });
            }

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
        this.changeGym(gym);
    },

    onGymChange:function(event, gym){
        this.changeGym(gym);
    },

    changeGym:function(gym){
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

    newUserModalReady:function(){
        this.$scope.user = {};
    },

    openUserModal:function(){
        this.$scope.user = {};

        $('#newUserModal').openModal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
            opacity: 0.3, // Opacity of modal background
            in_duration: 300, // Transition in duration
            out_duration: 200 // Transition out duration
            // ready: this.newUserModalReady.bind(this), // Callback for Modal open
            // complete: this.createUser.bind(this) // Callback for Modal close
        });
    },

    createUser: function(){
        // console.log("create user");
        // this.userModel.createUser().then(function(user){
        //     this.$state.go('userSettings', {userId: user.id, tab: "tabRoutes"});
        // }.bind(this));

        // console.log(this.$scope.user);
        this.userModel.createUser(this.$scope.user).then(function(user){
            console.log('new user yay');
            if(user.get('currentGym').id === this.gymModel.gym.id){
                this.$scope.$apply(function(scope){
                    this.userModel.users.splice(0,0,user);
                }.bind(this));
            }
            $('#newUserModal').closeModal();
        }.bind(this), function(e){
            console.error(e);
            switch (e.code) {
                case 202:
                    Materialize.toast('That username is already taken.', 2500, 'error');
                    break;
                case 203:
                    Materialize.toast('That email is already taken.', 2500, 'error');
                    break;
                default:
                    Materialize.toast('An error has occurred. ('+e.code+')\n'+e.message, 2500, 'error');
            }
        });
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
        this.$state.go('userSettings', {userId: user.id});
    },

    deleteUser:function(user){
        /*
         ParseService.deleteUser(user, function(results){

         });
         */
    }

});

UsersCtrl.$inject = ['$scope', '$location', 'Notifications', 'ParseService', 'UserModel', '$state','GymModel'];
