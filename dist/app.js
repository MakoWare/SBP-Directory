(function(global) {
  "use strict";
  var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  function BaseClass(){}

  // Create a new Class that inherits from this class
  BaseClass.extend = function(props) {
    var _super = this.prototype;

    // Set up the prototype to inherit from the base class
    // (but without running the init constructor)
    var proto = Object.create(_super);

    // Copy the properties over onto the new prototype
    for (var name in props) {
      // Check if we're overwriting an existing function
      proto[name] = typeof props[name] === "function" &&
        typeof _super[name] == "function" && fnTest.test(props[name])
        ? (function(name, fn){
            return function() {
              var tmp = this._super;

              // Add a new ._super() method that is the same method
              // but on the super-class
              this._super = _super[name];

              // The method only need to be bound temporarily, so we
              // remove it when we're done executing
              var ret = fn.apply(this, arguments);
              this._super = tmp;

              return ret;
            };
          })(name, props[name])
        : props[name];
    }

    // The new constructor
    var newClass = typeof proto.init === "function"
      ? proto.hasOwnProperty("init")
        ? proto.init // All construction is actually done in the init method
        : function SubClass(){ _super.init.apply(this, arguments); }
      : function EmptyClass(){};

    // Populate our constructed prototype object
    newClass.prototype = proto;

    // Enforce the constructor to be what we expect
    proto.constructor = newClass;

    // And make this class extendable
    newClass.extend = BaseClass.extend;

    return newClass;
  };

  // export
  global.Class = BaseClass;
})(this);

var BaseController = Class.extend({
    scope: null,

    init:function(scope){
	this.$scope = scope;
	this.defineListeners();
	this.defineScope();
    },

    defineListeners: function(){
	this.$scope.$on('$destroy',this.destroy.bind(this));
    },


    defineScope: function(){
	//OVERRIDE
    },


    destroy:function(event){
	//OVERRIDE
    }
});

BaseController.$inject = ['$scope'];

var BaseDirective = Class.extend({
    scope: null,

    init:function(scope){
	this.$scope = scope;
	this.defineListeners();
	this.defineScope();
    },

    defineListeners: function(){
	this.$scope.$on('$destroy',this.destroy.bind(this));
    },


    defineScope: function(){
	//OVERRIDE
    },


    destroy:function(event){
	//OVERRIDE
    }
});

BaseDirective.$inject = ['$scope'];

/**
* Event dispatcher class,
* add ability to dispatch event
* on native classes.
*
* Use of Class.js
*
* @author universalmind.com
*/
var EventDispatcher = Class.extend({
    _listeners:{},

    /**
    * Add a listener on the object
    * @param type : Event type
    * @param listener : Listener callback
    */  
    addEventListener:function(type,listener){
        if(!this._listeners[type]){
            this._listeners[type] = [];
        }
        this._listeners[type].push(listener)
    },


    /**
       * Remove a listener on the object
       * @param type : Event type
       * @param listener : Listener callback
       */  
    removeEventListener:function(type,listener){
      if(this._listeners[type]){
        var index = this._listeners[type].indexOf(listener);

        if(index!==-1){
            this._listeners[type].splice(index,1);
        }
      }
    },


    /**
    * Dispatch an event to all registered listener
    * @param Mutiple params available, first must be string
    */ 
    dispatchEvent:function(){
        var listeners;

        if(typeof arguments[0] !== 'string'){
            console.warn('EventDispatcher','First params must be an event type (String)')
        }else{
            listeners = this._listeners[arguments[0]];

            for(var key in listeners){
                //This could use .apply(arguments) instead, but there is currently a bug with it.
                listeners[key](arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);
            }
        }
    }
})



/**
* Simple namespace util to extand Class.js functionality
* and wrap classes in namespace.
* @author tommy.rochette[followed by the usual sign]universalmind.com
* @type {*}
* @return Object
*/
window.namespace = function(namespaces){
   'use strict';
   var names = namespaces.split('.');
   var last  = window;
   var name  = null;
   var i     = null;

   for(i in names){
       name = names[i];

       if(last[name]===undefined){
           last[name] = {};
       }

       last = last[name];
   }
   return last;
};

(function () {
   'use strict';
   /**
	 * Create a global event dispatcher
	 * that can be injected accross multiple components
	 * inside the application
	 *
	 * Use of Class.js
	 * @type {class}
	 * @author universalmind.com
	 */
   var NotificationsProvider = Class.extend({

       instance: new EventDispatcher(),

       /**
        * Configures and returns instance of GlobalEventBus.
        *
        * @return {GlobalEventBus}
        */
       $get: [function () {
       	   this.instance.notify = this.instance.dispatchEvent;
           return this.instance;
       }]
   });

   angular.module('notifications', [])
       .provider('Notifications', NotificationsProvider);
}());
'use strict';

angular.module('sbp', [
    'notifications',

    'navbar',

    //Gyms

    //Walls

    //Routes
    'routeList',
    'routeListItem',


    //User
    'users.UserModel',
    'users.UserService',

    //Config
    'duxter.ConfigModel',

    'ui.router',
    'ngCookies',
    'ngAnimate'

]).config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/gym/map");
    //
    // Now set up the states
    $stateProvider
        .state('gymMap', {
            url: "/gym/map",
            templateUrl: "partials/gym/map/map.html",
            controller: GymMapController

        })
        .state('routes', {
            url: "/routes",
            templateUrl: "partials/routes/routes.html"
        })
        .state('walls', {
            url: "/walls",
            templateUrl: "partials/walls/wallList.html"
        })
        .state('wall', {
            url: "/walls/:id",
            templateUrl: "partials/walls/wall.html"
        })
        .state('userSettings', {
            url: "/users/:id/settings",
            templateUrl: "partials/settingsPage.html"
        });
});

'use strict';
namespace('models.events').CONFIG_LOADED = "ActivityModel.CONFIG_LOADED";

var ConfigModel = EventDispatcher.extend({
    notifications: null,
    config: null

});


(function (){
    var ConfigModelProvider = Class.extend({
	instance: new ConfigModel(),

	$get: function( Notifications, $cookies, $http){
            this.instance.notifications = Notifications;
            this.instance.$cookies = $cookies;
            this.instance.config = {
                baseURL: "http://playfab-staging.duxapi.com"
            };

            //this.instance.currentUser = JSON.parse($cookies.currentUser);
	    return this.instance;
	}
    });

    angular.module('duxter.ConfigModel',[])
	.provider('ConfigModel', ConfigModelProvider);
}());

'use strict';
namespace('models.events').GAME_LOADED = "ActivityModel.GAME_LOADED";

var GameModel = EventDispatcher.extend({
    game: {
        image: "images/unicorn.png",
        title: "UNICORN BATTLE"
    },

    notifications: null,
    gameService: null,

    getGameById: function(id){
        var promise = this.GameService.getGameById(id);
    }

});


(function (){
    var GameModelProvider = Class.extend({
	instance: new GameModel(),

	$get: function( Notifications, GameService){
            this.instance.notifications = Notifications;
            this.instance.gameService = GameService;
	    return this.instance;
	}
    });

    angular.module('games.GameModel',[])
	.provider('GameModel', GameModelProvider);
}());

'use strict';

namespace('models.events').USER_SIGNED_IN = "ActivityModel.USER_SIGNED_IN";
namespace('models.events').USER_SIGNED_OUT = "ActivityModel.USER_SIGNED_OUT";
namespace('models.events').USER_UPDATED = "ActivityModel.USER_UPDATED";
namespace('models.events').PROFILE_LOADED = "ActivityModel.PROFILE_LOADED";
namespace('models.events').AUTH_ERROR = "ActivityModel.AUTH_ERROR";
namespace('models.events').NETWORK_ERROR = "ActivityModel.NETWORK_ERROR";

var UserModel = EventDispatcher.extend({
    currentUser: null,

    UserService:null,
    notifications: null,

    signIn: function(email, password){
        var promise = this.UserService.signIn(email, password);
        promise.then(function(results){
            console.log("success");
            console.log(results);
            this.currentUser = results.data.user;
            this.notifications.notify(models.events.USER_SIGNED_IN);
        }.bind(this), function(error){
            console.log("error");
            console.log(error);
            if(error.data){
                this.notifications.notify(models.events.AUTH_ERROR, error);
            } else {
                this.notifications.notify(models.events.NETWORK_ERROR);
            }
        }.bind(this));




        /*
        var user = {
            name: "taco",
            age: 35
        };

        this.$cookies.currentUser = JSON.stringify(user);
         */
    },

    signOut: function(){
        //this.UserService.signOut();
    },

    updateUser: function(user){
        var promise = this.UserService.updateUser(user);
        //promise.then
    }

});


(function (){
    var UserModelProvider = Class.extend({
	instance: new UserModel(),

	$get: function(UserService, Notifications, $cookies){
	    this.instance.UserService = UserService;
            this.instance.notifications = Notifications;
            this.instance.$cookies = $cookies;
            //this.instance.currentUser = JSON.parse($cookies.currentUser);
	    return this.instance;
	}
    });

    angular.module('users.UserModel',[])
	.provider('UserModel', UserModelProvider);
}());

'use strict';

var GameService = Class.extend({
    $http: null,

    getGameById: function(id){

    }

});



(function (){
    var GameServiceProvider = Class.extend({
	instance: new GameService(),
	$get: function($http){
	    this.instance.$http = $http;
	    return this.instance;
	}
    });

    angular.module('games.GameService',[])
	.provider('GameService', GameServiceProvider);
}());

/*
* rwdImageMaps jQuery plugin v1.5
*
* Allows image maps to be used in a responsive design by recalculating the area coordinates to match the actual image size on load and window.resize
*
* Copyright (c) 2013 Matt Stow
* https://github.com/stowball/jQuery-rwdImageMaps
* http://mattstow.com
* Licensed under the MIT license
*/
;(function(a){a.fn.rwdImageMaps=function(){var c=this;var b=function(){c.each(function(){if(typeof(a(this).attr("usemap"))=="undefined"){return}var e=this,d=a(e);a("<img />").load(function(){var g="width",m="height",n=d.attr(g),j=d.attr(m);if(!n||!j){var o=new Image();o.src=d.attr("src");if(!n){n=o.width}if(!j){j=o.height}}var f=d.width()/100,k=d.height()/100,i=d.attr("usemap").replace("#",""),l="coords";a('map[name="'+i+'"]').find("area").each(function(){var r=a(this);if(!r.data(l)){r.data(l,r.attr(l))}var q=r.data(l).split(","),p=new Array(q.length);for(var h=0;h<p.length;++h){if(h%2===0){p[h]=parseInt(((q[h]/n)*100)*f)}else{p[h]=parseInt(((q[h]/j)*100)*k)}}r.attr(l,p.toString())})}).attr("src",d.attr("src"))})};a(window).resize(b).trigger("resize");return this}})(jQuery);
'use strict';

var UserService = Class.extend({
    $http: null,
    configModel: null,

    signIn: function(email, password){
        var url = this.configModel.config.baseURL + "/login/playfab";
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data:  {
                email: email,
                password: password
            }
        };
        console.log(req);
        return this.$http(req);
    },

    signOut: function(){

    },

    updateUser: function(user){

    }

});



(function (){
    var UserServiceProvider = Class.extend({
	instance: new UserService(),
	$get: function($http, $cookies, ConfigModel){
            this.instance.configModel = ConfigModel;
	    this.instance.$http = $http;
	    return this.instance;
	}
    });

    angular.module('users.UserService',[])
	.provider('UserService', UserServiceProvider);
}());

'use strict';

var NavBarDirective = BaseDirective.extend({
    userModel: null,
    notifications: null,

    init: function($scope, UserModel, Notifications){
        this.userModel = UserModel;
        this.notifications = Notifications;
        this._super($scope);
    },

    defineListeners: function(){
        this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.handleUserSignedIn.bind(this));
        this.$scope.logout = this.logout.bind(this);
    },

    defineScope: function(){
        this.navShowing = false;
        this.$scope.currentUser = this.userModel.currentUser;
        $(".button-collapse").sideNav();
    },

    logout: function(){
        this.userModel.logout();
        this.$location.url("/");
    },

    /** EVENT HANDLERS **/
    handleUserSignedIn: function(){
        this.$scope.currentUser = this.userModel.currentUser;
    }
});

angular.module('navbar',[])
    .directive('navbar', function(UserModel, Notifications){
	return {
	    restrict:'E',
	    isolate:true,
	    link: function($scope){
		new NavBarDirective($scope, UserModel, Notifications);
	    },
	    scope:true,
            templateUrl: "partials/navbar/navbar.html"
	};
    });

'use strict';

var RouteListDirective = BaseDirective.extend({
    userModel: null,
    notifications: null,

    init: function($scope, UserModel, Notifications){
        this.userModel = UserModel;
        this.notifications = Notifications;
        this._super($scope);
    },

    defineListeners: function(){
        this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.handleUserSignedIn.bind(this));
        this.$scope.logout = this.logout.bind(this);
    },

    defineScope: function(){
        console.log("routeListDirective");
        this.$scope.routes = [];

        var route = {
            grade: 5,
            color: "blue"
        };

        this.$scope.routes.push(route);

        route = {
            grade: 6,
            color: "orange"
        };
        this.$scope.routes.push(route);

        route = {
            grade: 7,
            color: "purple"
        };
        this.$scope.routes.push(route);
        console.log(this.$scope.routes);

    },

    logout: function(){
        this.userModel.logout();
        this.$location.url("/");
    },

    /** EVENT HANDLERS **/
    handleUserSignedIn: function(){
        this.$scope.currentUser = this.userModel.currentUser;
    }

});

angular.module('routeList',[])
    .directive('routeList', function(UserModel, Notifications){
	return {
	    restrict:'E',
	    isolate:true,
	    link: function($scope){
		new RouteListDirective($scope, UserModel, Notifications);
	    },
	    scope:true,
            templateUrl: "partials/routes/routeList.html"
	};
    });

'use strict';

var RouteListItemDirective = BaseDirective.extend({
    userModel: null,
    notifications: null,

    init: function($scope, UserModel, Notifications){
        this.userModel = UserModel;
        this.notifications = Notifications;
        this._super($scope);
    },

    defineListeners: function(){
        this.notifications.addEventListener(models.events.USER_SIGNED_IN, this.handleUserSignedIn.bind(this));
        this.$scope.logout = this.logout.bind(this);
    },

    defineScope: function(){
        this.navShowing = false;
        this.$scope.currentUser = this.userModel.currentUser;
    },

    logout: function(){
        this.userModel.logout();
        this.$location.url("/");
    },

    /** EVENT HANDLERS **/
    handleUserSignedIn: function(){
        this.$scope.currentUser = this.userModel.currentUser;
    }

});

angular.module('routeListItem',[])
    .directive('routeListItem', function(UserModel, Notifications){
	return {
	    restrict:'E',
	    isolate:true,
	    link: function($scope){
		new RouteListItemDirective($scope, UserModel, Notifications);
	    },
	    scope:true,
            templateUrl: "partials/routes/routeListItem.html"
	};
    });

'use strict';

var GymMapController = BaseController.extend({
    notifications:null,
    rootCanvas:null,
    rootImage:null,

    init:function($scope, Notifications){
	   this.notifications = Notifications;
	   this._super($scope);
    },

    defineListeners:function(){
        this._super();
        this.$scope.areaClicked = this.areaClicked.bind(this);
        window.onresize = this.onResize.bind(this);
    },

    defineScope:function(){
        var that = this;
        $(document).ready(function(e) {
            
            that.rootImage = $('.imageLayer img').on('load.omgmaps', function(event){
                $(this).rwdImageMaps();
                that.highlightMap();
                
                
            }).css('opacity','0');
            
            console.log("done");
            
        });

        
    },

    destroy:function(){
        $('area').off('.omgmaps');
        $('img').off('.omgmaps');
    },


    areaClicked: function(){
        console.log("RCH");
    },
    
    createRootCanvas:function(){
        var image = this.rootImage,
            imgWidth = image.width(),
            imgHeight = image.height();
        
        this.rootCanvas = $('<canvas>').attr('width',imgWidth).attr('height',imgHeight);
        this.rootCanvas.css({
            position:'absolute',
            top:'0px',
            left:'0px',
            height:'auto'
        });
        image.before(this.rootCanvas);
        var ctx = this.rootCanvas.get(0).getContext('2d');
        ctx.drawImage(image.get(0),0,0,imgWidth, imgHeight);
    },
    
    redrawRootCanvas: function(){
        var image = this.rootImage,
            imgWidth = image.width(),
            imgHeight = image.height();
        
        var ctx = this.rootCanvas.get(0).getContext('2d');
        ctx.clearRect(0, 0, this.rootCanvas.get(0).width, this.rootCanvas.get(0).width);

        this.rootCanvas.attr('width',imgWidth).attr('height',imgHeight);

        ctx.drawImage(image.get(0),0,0,image.width(), image.height());
    },

    highlightMap: function(){
        
        var body = $('body'),
            contentArea = $('.mapContent'),
            map = $("#gymMap"),
            mapEl = $("#gymMap").get(0),
            mapAreas = map.find('area'),
            image = this.rootImage,
            
            // get the width and height from the image tag
            imgWidth = image.width(),
            imgHeight = image.height(),
            imgAttrWidth = image.attr('width'),
            imgAttrHeight = image.attr('height'),
            xFactor = parseFloat(imgWidth/imgAttrWidth),
            yFactor = parseFloat(imgHeight/imgAttrHeight);

//        console.log('imgAttrWidth: '+imgAttrWidth);
//        console.log('imgAttrHeight: '+imgAttrHeight);
//        console.log('xFactor: '+xFactor);
//        console.log('yFactor: '+yFactor);
        
        
        var rootCanvas = this.createRootCanvas();
        
        $.each(mapAreas, function(index, area){
            var area = $(area);
            var areaEl = area.get(0);
            var coords = areaEl.coords.split(", ");
            
            // map the coords because they are scaled for the image size and not the other size
            coords = coords.map(function(value, index){
                if(index%2 === 0){
                    // x coord
                    return value * xFactor;
                } else {
                    // y coord
                    return value * yFactor;
                }
            });
            
            // create a canvas
            var canvas = $('<canvas>').attr('width',imgWidth).attr('height',imgHeight).addClass('map-overlay');
            canvas.css({
                position:'absolute',
                top:'0px',
                left:'0px',
                opacity:'0.0',
                display:'none'
            });
            
            // attach said canvas to DOM
            contentArea.find('img').before(canvas);
            
            // grab the canvas context
            var ctx = canvas.get(0).getContext('2d');
            ctx.fillStyle = '#f00';
            
            var x = coords[0],
                y = coords[1];
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            for(var j = 2,len = coords.length; j < len-1 ; j += 2 ){
                x = coords[j];
                y = coords[j + 1];
                
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // create an area mouseenter event listener
            area.on('mouseenter.omgmaps', (function(canvas){
                return function(event){
                    event.preventDefault();
//                    console.log('mouse enter');
                    canvas.css('display', 'block');
                    canvas.animate({opacity:'1.0'},200,'linear');
//                    canvas.animate({display:'block'},200,'linear');
                }
            })(canvas));

            area.on('mouseleave.omgmaps', (function(canvas){
                return function(event){
                    event.preventDefault();
//                    console.log('mouse leave');
                    canvas.animate({opacity:'0.0'},200,'linear',function(){
                        canvas.css('display', 'none');
                    });
//                    canvas.animate({display:'none'},200,'linear');
                }
            })(canvas));
            
            area.on('click.omgmaps', (function(canvas){
                return function(event){
                    event.preventDefault();
                    console.log('click');
                }
            })(canvas));

        });
        
    },

    onResize: function(){
        var that = this;

        if(this.resizeTimeout){
            clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(function(){
            that.resize();
        }, 200);
    },
    
    resize: function(){
        var that = this;
        console.log('resize');
        
        if(this.rootCanvas){
            this.redrawRootCanvas();
        }
        
        $('canvas.map-overlay').each(function(index, canvas){
            canvas = $(canvas);
            
            canvas.css({
                height: that.rootImage.height(),
                width: that.rootImage.width()
            })
        });
    }

});


GymMapController.$inject = ['$scope','Notifications'];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYXNzLmpzIiwiQmFzZUNvbnRyb2xsZXIuanMiLCJCYXNlRGlyZWN0aXZlLmpzIiwiRXZlbnREaXNwYXRjaGVyLmpzIiwiTmFtZXNwYWNlLmpzIiwiTm90aWZpY2F0aW9ucy5qcyIsImFwcC5qcyIsIm1vZGVscy9jb25maWdNb2RlbC5qcyIsIm1vZGVscy9nYW1lTW9kZWwuanMiLCJtb2RlbHMvdXNlck1vZGVsLmpzIiwic2VydmljZXMvZ2FtZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9pbWFnZU1hcC5taW4uanMiLCJzZXJ2aWNlcy91c2VyU2VydmljZS5qcyIsImNvbXBvbmVudHMvbmF2YmFyL25hdmJhckRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvcm91dGVzL3JvdXRlTGlzdC9yb3V0ZUxpc3REaXJlY3RpdmUuanMiLCJjb21wb25lbnRzL3JvdXRlcy9yb3V0ZUxpc3Qvcm91dGVMaXN0SXRlbURpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvZ3ltL21hcC9neW1NYXBDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgZm5UZXN0ID0gL3h5ei8udGVzdChmdW5jdGlvbigpe3h5ejt9KSA/IC9cXGJfc3VwZXJcXGIvIDogLy4qLztcblxuICAvLyBUaGUgYmFzZSBDbGFzcyBpbXBsZW1lbnRhdGlvbiAoZG9lcyBub3RoaW5nKVxuICBmdW5jdGlvbiBCYXNlQ2xhc3MoKXt9XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IENsYXNzIHRoYXQgaW5oZXJpdHMgZnJvbSB0aGlzIGNsYXNzXG4gIEJhc2VDbGFzcy5leHRlbmQgPSBmdW5jdGlvbihwcm9wcykge1xuICAgIHZhciBfc3VwZXIgPSB0aGlzLnByb3RvdHlwZTtcblxuICAgIC8vIFNldCB1cCB0aGUgcHJvdG90eXBlIHRvIGluaGVyaXQgZnJvbSB0aGUgYmFzZSBjbGFzc1xuICAgIC8vIChidXQgd2l0aG91dCBydW5uaW5nIHRoZSBpbml0IGNvbnN0cnVjdG9yKVxuICAgIHZhciBwcm90byA9IE9iamVjdC5jcmVhdGUoX3N1cGVyKTtcblxuICAgIC8vIENvcHkgdGhlIHByb3BlcnRpZXMgb3ZlciBvbnRvIHRoZSBuZXcgcHJvdG90eXBlXG4gICAgZm9yICh2YXIgbmFtZSBpbiBwcm9wcykge1xuICAgICAgLy8gQ2hlY2sgaWYgd2UncmUgb3ZlcndyaXRpbmcgYW4gZXhpc3RpbmcgZnVuY3Rpb25cbiAgICAgIHByb3RvW25hbWVdID0gdHlwZW9mIHByb3BzW25hbWVdID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgdHlwZW9mIF9zdXBlcltuYW1lXSA9PSBcImZ1bmN0aW9uXCIgJiYgZm5UZXN0LnRlc3QocHJvcHNbbmFtZV0pXG4gICAgICAgID8gKGZ1bmN0aW9uKG5hbWUsIGZuKXtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIHRtcCA9IHRoaXMuX3N1cGVyO1xuXG4gICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyAuX3N1cGVyKCkgbWV0aG9kIHRoYXQgaXMgdGhlIHNhbWUgbWV0aG9kXG4gICAgICAgICAgICAgIC8vIGJ1dCBvbiB0aGUgc3VwZXItY2xhc3NcbiAgICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSBfc3VwZXJbbmFtZV07XG5cbiAgICAgICAgICAgICAgLy8gVGhlIG1ldGhvZCBvbmx5IG5lZWQgdG8gYmUgYm91bmQgdGVtcG9yYXJpbHksIHNvIHdlXG4gICAgICAgICAgICAgIC8vIHJlbW92ZSBpdCB3aGVuIHdlJ3JlIGRvbmUgZXhlY3V0aW5nXG4gICAgICAgICAgICAgIHZhciByZXQgPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB0aGlzLl9zdXBlciA9IHRtcDtcblxuICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KShuYW1lLCBwcm9wc1tuYW1lXSlcbiAgICAgICAgOiBwcm9wc1tuYW1lXTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbmV3IGNvbnN0cnVjdG9yXG4gICAgdmFyIG5ld0NsYXNzID0gdHlwZW9mIHByb3RvLmluaXQgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBwcm90by5oYXNPd25Qcm9wZXJ0eShcImluaXRcIilcbiAgICAgICAgPyBwcm90by5pbml0IC8vIEFsbCBjb25zdHJ1Y3Rpb24gaXMgYWN0dWFsbHkgZG9uZSBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgOiBmdW5jdGlvbiBTdWJDbGFzcygpeyBfc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9XG4gICAgICA6IGZ1bmN0aW9uIEVtcHR5Q2xhc3MoKXt9O1xuXG4gICAgLy8gUG9wdWxhdGUgb3VyIGNvbnN0cnVjdGVkIHByb3RvdHlwZSBvYmplY3RcbiAgICBuZXdDbGFzcy5wcm90b3R5cGUgPSBwcm90bztcblxuICAgIC8vIEVuZm9yY2UgdGhlIGNvbnN0cnVjdG9yIHRvIGJlIHdoYXQgd2UgZXhwZWN0XG4gICAgcHJvdG8uY29uc3RydWN0b3IgPSBuZXdDbGFzcztcblxuICAgIC8vIEFuZCBtYWtlIHRoaXMgY2xhc3MgZXh0ZW5kYWJsZVxuICAgIG5ld0NsYXNzLmV4dGVuZCA9IEJhc2VDbGFzcy5leHRlbmQ7XG5cbiAgICByZXR1cm4gbmV3Q2xhc3M7XG4gIH07XG5cbiAgLy8gZXhwb3J0XG4gIGdsb2JhbC5DbGFzcyA9IEJhc2VDbGFzcztcbn0pKHRoaXMpO1xuIiwidmFyIEJhc2VDb250cm9sbGVyID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICBzY29wZTogbnVsbCxcblxuICAgIGluaXQ6ZnVuY3Rpb24oc2NvcGUpe1xuXHR0aGlzLiRzY29wZSA9IHNjb3BlO1xuXHR0aGlzLmRlZmluZUxpc3RlbmVycygpO1xuXHR0aGlzLmRlZmluZVNjb3BlKCk7XG4gICAgfSxcblxuICAgIGRlZmluZUxpc3RlbmVyczogZnVuY3Rpb24oKXtcblx0dGhpcy4kc2NvcGUuJG9uKCckZGVzdHJveScsdGhpcy5kZXN0cm95LmJpbmQodGhpcykpO1xuICAgIH0sXG5cblxuICAgIGRlZmluZVNjb3BlOiBmdW5jdGlvbigpe1xuXHQvL09WRVJSSURFXG4gICAgfSxcblxuXG4gICAgZGVzdHJveTpmdW5jdGlvbihldmVudCl7XG5cdC8vT1ZFUlJJREVcbiAgICB9XG59KTtcblxuQmFzZUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XG4iLCJ2YXIgQmFzZURpcmVjdGl2ZSA9IENsYXNzLmV4dGVuZCh7XG4gICAgc2NvcGU6IG51bGwsXG5cbiAgICBpbml0OmZ1bmN0aW9uKHNjb3BlKXtcblx0dGhpcy4kc2NvcGUgPSBzY29wZTtcblx0dGhpcy5kZWZpbmVMaXN0ZW5lcnMoKTtcblx0dGhpcy5kZWZpbmVTY29wZSgpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVMaXN0ZW5lcnM6IGZ1bmN0aW9uKCl7XG5cdHRoaXMuJHNjb3BlLiRvbignJGRlc3Ryb3knLHRoaXMuZGVzdHJveS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG5cbiAgICBkZWZpbmVTY29wZTogZnVuY3Rpb24oKXtcblx0Ly9PVkVSUklERVxuICAgIH0sXG5cblxuICAgIGRlc3Ryb3k6ZnVuY3Rpb24oZXZlbnQpe1xuXHQvL09WRVJSSURFXG4gICAgfVxufSk7XG5cbkJhc2VEaXJlY3RpdmUuJGluamVjdCA9IFsnJHNjb3BlJ107XG4iLCIvKipcbiogRXZlbnQgZGlzcGF0Y2hlciBjbGFzcyxcbiogYWRkIGFiaWxpdHkgdG8gZGlzcGF0Y2ggZXZlbnRcbiogb24gbmF0aXZlIGNsYXNzZXMuXG4qXG4qIFVzZSBvZiBDbGFzcy5qc1xuKlxuKiBAYXV0aG9yIHVuaXZlcnNhbG1pbmQuY29tXG4qL1xudmFyIEV2ZW50RGlzcGF0Y2hlciA9IENsYXNzLmV4dGVuZCh7XG4gICAgX2xpc3RlbmVyczp7fSxcblxuICAgIC8qKlxuICAgICogQWRkIGEgbGlzdGVuZXIgb24gdGhlIG9iamVjdFxuICAgICogQHBhcmFtIHR5cGUgOiBFdmVudCB0eXBlXG4gICAgKiBAcGFyYW0gbGlzdGVuZXIgOiBMaXN0ZW5lciBjYWxsYmFja1xuICAgICovICBcbiAgICBhZGRFdmVudExpc3RlbmVyOmZ1bmN0aW9uKHR5cGUsbGlzdGVuZXIpe1xuICAgICAgICBpZighdGhpcy5fbGlzdGVuZXJzW3R5cGVdKXtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5wdXNoKGxpc3RlbmVyKVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAgICogUmVtb3ZlIGEgbGlzdGVuZXIgb24gdGhlIG9iamVjdFxuICAgICAgICogQHBhcmFtIHR5cGUgOiBFdmVudCB0eXBlXG4gICAgICAgKiBAcGFyYW0gbGlzdGVuZXIgOiBMaXN0ZW5lciBjYWxsYmFja1xuICAgICAgICovICBcbiAgICByZW1vdmVFdmVudExpc3RlbmVyOmZ1bmN0aW9uKHR5cGUsbGlzdGVuZXIpe1xuICAgICAgaWYodGhpcy5fbGlzdGVuZXJzW3R5cGVdKXtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fbGlzdGVuZXJzW3R5cGVdLmluZGV4T2YobGlzdGVuZXIpO1xuXG4gICAgICAgIGlmKGluZGV4IT09LTEpe1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnNwbGljZShpbmRleCwxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICogRGlzcGF0Y2ggYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgbGlzdGVuZXJcbiAgICAqIEBwYXJhbSBNdXRpcGxlIHBhcmFtcyBhdmFpbGFibGUsIGZpcnN0IG11c3QgYmUgc3RyaW5nXG4gICAgKi8gXG4gICAgZGlzcGF0Y2hFdmVudDpmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbGlzdGVuZXJzO1xuXG4gICAgICAgIGlmKHR5cGVvZiBhcmd1bWVudHNbMF0gIT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignRXZlbnREaXNwYXRjaGVyJywnRmlyc3QgcGFyYW1zIG11c3QgYmUgYW4gZXZlbnQgdHlwZSAoU3RyaW5nKScpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW2FyZ3VtZW50c1swXV07XG5cbiAgICAgICAgICAgIGZvcih2YXIga2V5IGluIGxpc3RlbmVycyl7XG4gICAgICAgICAgICAgICAgLy9UaGlzIGNvdWxkIHVzZSAuYXBwbHkoYXJndW1lbnRzKSBpbnN0ZWFkLCBidXQgdGhlcmUgaXMgY3VycmVudGx5IGEgYnVnIHdpdGggaXQuXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzW2tleV0oYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSxhcmd1bWVudHNbMl0sYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pXG5cblxuIiwiLyoqXG4qIFNpbXBsZSBuYW1lc3BhY2UgdXRpbCB0byBleHRhbmQgQ2xhc3MuanMgZnVuY3Rpb25hbGl0eVxuKiBhbmQgd3JhcCBjbGFzc2VzIGluIG5hbWVzcGFjZS5cbiogQGF1dGhvciB0b21teS5yb2NoZXR0ZVtmb2xsb3dlZCBieSB0aGUgdXN1YWwgc2lnbl11bml2ZXJzYWxtaW5kLmNvbVxuKiBAdHlwZSB7Kn1cbiogQHJldHVybiBPYmplY3RcbiovXG53aW5kb3cubmFtZXNwYWNlID0gZnVuY3Rpb24obmFtZXNwYWNlcyl7XG4gICAndXNlIHN0cmljdCc7XG4gICB2YXIgbmFtZXMgPSBuYW1lc3BhY2VzLnNwbGl0KCcuJyk7XG4gICB2YXIgbGFzdCAgPSB3aW5kb3c7XG4gICB2YXIgbmFtZSAgPSBudWxsO1xuICAgdmFyIGkgICAgID0gbnVsbDtcblxuICAgZm9yKGkgaW4gbmFtZXMpe1xuICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcblxuICAgICAgIGlmKGxhc3RbbmFtZV09PT11bmRlZmluZWQpe1xuICAgICAgICAgICBsYXN0W25hbWVdID0ge307XG4gICAgICAgfVxuXG4gICAgICAgbGFzdCA9IGxhc3RbbmFtZV07XG4gICB9XG4gICByZXR1cm4gbGFzdDtcbn07XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgJ3VzZSBzdHJpY3QnO1xuICAgLyoqXG5cdCAqIENyZWF0ZSBhIGdsb2JhbCBldmVudCBkaXNwYXRjaGVyXG5cdCAqIHRoYXQgY2FuIGJlIGluamVjdGVkIGFjY3Jvc3MgbXVsdGlwbGUgY29tcG9uZW50c1xuXHQgKiBpbnNpZGUgdGhlIGFwcGxpY2F0aW9uXG5cdCAqXG5cdCAqIFVzZSBvZiBDbGFzcy5qc1xuXHQgKiBAdHlwZSB7Y2xhc3N9XG5cdCAqIEBhdXRob3IgdW5pdmVyc2FsbWluZC5jb21cblx0ICovXG4gICB2YXIgTm90aWZpY2F0aW9uc1Byb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgIGluc3RhbmNlOiBuZXcgRXZlbnREaXNwYXRjaGVyKCksXG5cbiAgICAgICAvKipcbiAgICAgICAgKiBDb25maWd1cmVzIGFuZCByZXR1cm5zIGluc3RhbmNlIG9mIEdsb2JhbEV2ZW50QnVzLlxuICAgICAgICAqXG4gICAgICAgICogQHJldHVybiB7R2xvYmFsRXZlbnRCdXN9XG4gICAgICAgICovXG4gICAgICAgJGdldDogW2Z1bmN0aW9uICgpIHtcbiAgICAgICBcdCAgIHRoaXMuaW5zdGFuY2Uubm90aWZ5ID0gdGhpcy5pbnN0YW5jZS5kaXNwYXRjaEV2ZW50O1xuICAgICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcbiAgICAgICB9XVxuICAgfSk7XG5cbiAgIGFuZ3VsYXIubW9kdWxlKCdub3RpZmljYXRpb25zJywgW10pXG4gICAgICAgLnByb3ZpZGVyKCdOb3RpZmljYXRpb25zJywgTm90aWZpY2F0aW9uc1Byb3ZpZGVyKTtcbn0oKSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnc2JwJywgW1xuICAgICdub3RpZmljYXRpb25zJyxcblxuICAgICduYXZiYXInLFxuXG4gICAgLy9HeW1zXG5cbiAgICAvL1dhbGxzXG5cbiAgICAvL1JvdXRlc1xuICAgICdyb3V0ZUxpc3QnLFxuICAgICdyb3V0ZUxpc3RJdGVtJyxcblxuXG4gICAgLy9Vc2VyXG4gICAgJ3VzZXJzLlVzZXJNb2RlbCcsXG4gICAgJ3VzZXJzLlVzZXJTZXJ2aWNlJyxcblxuICAgIC8vQ29uZmlnXG4gICAgJ2R1eHRlci5Db25maWdNb2RlbCcsXG5cbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdDb29raWVzJyxcbiAgICAnbmdBbmltYXRlJ1xuXG5dKS5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgIC8vXG4gICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvc3RhdGUxXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9neW0vbWFwXCIpO1xuICAgIC8vXG4gICAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdneW1NYXAnLCB7XG4gICAgICAgICAgICB1cmw6IFwiL2d5bS9tYXBcIixcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2d5bS9tYXAvbWFwLmh0bWxcIixcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEd5bU1hcENvbnRyb2xsZXJcblxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3JvdXRlcycsIHtcbiAgICAgICAgICAgIHVybDogXCIvcm91dGVzXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9yb3V0ZXMvcm91dGVzLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3dhbGxzJywge1xuICAgICAgICAgICAgdXJsOiBcIi93YWxsc1wiLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvd2FsbHMvd2FsbExpc3QuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnd2FsbCcsIHtcbiAgICAgICAgICAgIHVybDogXCIvd2FsbHMvOmlkXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy93YWxscy93YWxsLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3VzZXJTZXR0aW5ncycsIHtcbiAgICAgICAgICAgIHVybDogXCIvdXNlcnMvOmlkL3NldHRpbmdzXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9zZXR0aW5nc1BhZ2UuaHRtbFwiXG4gICAgICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5DT05GSUdfTE9BREVEID0gXCJBY3Rpdml0eU1vZGVsLkNPTkZJR19MT0FERURcIjtcblxudmFyIENvbmZpZ01vZGVsID0gRXZlbnREaXNwYXRjaGVyLmV4dGVuZCh7XG4gICAgbm90aWZpY2F0aW9uczogbnVsbCxcbiAgICBjb25maWc6IG51bGxcblxufSk7XG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBDb25maWdNb2RlbFByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBDb25maWdNb2RlbCgpLFxuXG5cdCRnZXQ6IGZ1bmN0aW9uKCBOb3RpZmljYXRpb25zLCAkY29va2llcywgJGh0dHApe1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuJGNvb2tpZXMgPSAkY29va2llcztcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGJhc2VVUkw6IFwiaHR0cDovL3BsYXlmYWItc3RhZ2luZy5kdXhhcGkuY29tXCJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vdGhpcy5pbnN0YW5jZS5jdXJyZW50VXNlciA9IEpTT04ucGFyc2UoJGNvb2tpZXMuY3VycmVudFVzZXIpO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdkdXh0ZXIuQ29uZmlnTW9kZWwnLFtdKVxuXHQucHJvdmlkZXIoJ0NvbmZpZ01vZGVsJywgQ29uZmlnTW9kZWxQcm92aWRlcik7XG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuR0FNRV9MT0FERUQgPSBcIkFjdGl2aXR5TW9kZWwuR0FNRV9MT0FERURcIjtcblxudmFyIEdhbWVNb2RlbCA9IEV2ZW50RGlzcGF0Y2hlci5leHRlbmQoe1xuICAgIGdhbWU6IHtcbiAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL3VuaWNvcm4ucG5nXCIsXG4gICAgICAgIHRpdGxlOiBcIlVOSUNPUk4gQkFUVExFXCJcbiAgICB9LFxuXG4gICAgbm90aWZpY2F0aW9uczogbnVsbCxcbiAgICBnYW1lU2VydmljZTogbnVsbCxcblxuICAgIGdldEdhbWVCeUlkOiBmdW5jdGlvbihpZCl7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcy5HYW1lU2VydmljZS5nZXRHYW1lQnlJZChpZCk7XG4gICAgfVxuXG59KTtcblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIEdhbWVNb2RlbFByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBHYW1lTW9kZWwoKSxcblxuXHQkZ2V0OiBmdW5jdGlvbiggTm90aWZpY2F0aW9ucywgR2FtZVNlcnZpY2Upe1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuZ2FtZVNlcnZpY2UgPSBHYW1lU2VydmljZTtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnZ2FtZXMuR2FtZU1vZGVsJyxbXSlcblx0LnByb3ZpZGVyKCdHYW1lTW9kZWwnLCBHYW1lTW9kZWxQcm92aWRlcik7XG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5VU0VSX1NJR05FRF9JTiA9IFwiQWN0aXZpdHlNb2RlbC5VU0VSX1NJR05FRF9JTlwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuVVNFUl9TSUdORURfT1VUID0gXCJBY3Rpdml0eU1vZGVsLlVTRVJfU0lHTkVEX09VVFwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuVVNFUl9VUERBVEVEID0gXCJBY3Rpdml0eU1vZGVsLlVTRVJfVVBEQVRFRFwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuUFJPRklMRV9MT0FERUQgPSBcIkFjdGl2aXR5TW9kZWwuUFJPRklMRV9MT0FERURcIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLkFVVEhfRVJST1IgPSBcIkFjdGl2aXR5TW9kZWwuQVVUSF9FUlJPUlwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuTkVUV09SS19FUlJPUiA9IFwiQWN0aXZpdHlNb2RlbC5ORVRXT1JLX0VSUk9SXCI7XG5cbnZhciBVc2VyTW9kZWwgPSBFdmVudERpc3BhdGNoZXIuZXh0ZW5kKHtcbiAgICBjdXJyZW50VXNlcjogbnVsbCxcblxuICAgIFVzZXJTZXJ2aWNlOm51bGwsXG4gICAgbm90aWZpY2F0aW9uczogbnVsbCxcblxuICAgIHNpZ25JbjogZnVuY3Rpb24oZW1haWwsIHBhc3N3b3JkKXtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzLlVzZXJTZXJ2aWNlLnNpZ25JbihlbWFpbCwgcGFzc3dvcmQpO1xuICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFVzZXIgPSByZXN1bHRzLmRhdGEudXNlcjtcbiAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5ub3RpZnkobW9kZWxzLmV2ZW50cy5VU0VSX1NJR05FRF9JTik7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvclwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIGlmKGVycm9yLmRhdGEpe1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5ub3RpZnkobW9kZWxzLmV2ZW50cy5BVVRIX0VSUk9SLCBlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5ub3RpZnkobW9kZWxzLmV2ZW50cy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuXG5cblxuICAgICAgICAvKlxuICAgICAgICB2YXIgdXNlciA9IHtcbiAgICAgICAgICAgIG5hbWU6IFwidGFjb1wiLFxuICAgICAgICAgICAgYWdlOiAzNVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuJGNvb2tpZXMuY3VycmVudFVzZXIgPSBKU09OLnN0cmluZ2lmeSh1c2VyKTtcbiAgICAgICAgICovXG4gICAgfSxcblxuICAgIHNpZ25PdXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vdGhpcy5Vc2VyU2VydmljZS5zaWduT3V0KCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZVVzZXI6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuVXNlclNlcnZpY2UudXBkYXRlVXNlcih1c2VyKTtcbiAgICAgICAgLy9wcm9taXNlLnRoZW5cbiAgICB9XG5cbn0pO1xuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgVXNlck1vZGVsUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IFVzZXJNb2RlbCgpLFxuXG5cdCRnZXQ6IGZ1bmN0aW9uKFVzZXJTZXJ2aWNlLCBOb3RpZmljYXRpb25zLCAkY29va2llcyl7XG5cdCAgICB0aGlzLmluc3RhbmNlLlVzZXJTZXJ2aWNlID0gVXNlclNlcnZpY2U7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS4kY29va2llcyA9ICRjb29raWVzO1xuICAgICAgICAgICAgLy90aGlzLmluc3RhbmNlLmN1cnJlbnRVc2VyID0gSlNPTi5wYXJzZSgkY29va2llcy5jdXJyZW50VXNlcik7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ3VzZXJzLlVzZXJNb2RlbCcsW10pXG5cdC5wcm92aWRlcignVXNlck1vZGVsJywgVXNlck1vZGVsUHJvdmlkZXIpO1xufSgpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEdhbWVTZXJ2aWNlID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICAkaHR0cDogbnVsbCxcblxuICAgIGdldEdhbWVCeUlkOiBmdW5jdGlvbihpZCl7XG5cbiAgICB9XG5cbn0pO1xuXG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBHYW1lU2VydmljZVByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBHYW1lU2VydmljZSgpLFxuXHQkZ2V0OiBmdW5jdGlvbigkaHR0cCl7XG5cdCAgICB0aGlzLmluc3RhbmNlLiRodHRwID0gJGh0dHA7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2dhbWVzLkdhbWVTZXJ2aWNlJyxbXSlcblx0LnByb3ZpZGVyKCdHYW1lU2VydmljZScsIEdhbWVTZXJ2aWNlUHJvdmlkZXIpO1xufSgpKTtcbiIsIi8qXHJcbiogcndkSW1hZ2VNYXBzIGpRdWVyeSBwbHVnaW4gdjEuNVxyXG4qXHJcbiogQWxsb3dzIGltYWdlIG1hcHMgdG8gYmUgdXNlZCBpbiBhIHJlc3BvbnNpdmUgZGVzaWduIGJ5IHJlY2FsY3VsYXRpbmcgdGhlIGFyZWEgY29vcmRpbmF0ZXMgdG8gbWF0Y2ggdGhlIGFjdHVhbCBpbWFnZSBzaXplIG9uIGxvYWQgYW5kIHdpbmRvdy5yZXNpemVcclxuKlxyXG4qIENvcHlyaWdodCAoYykgMjAxMyBNYXR0IFN0b3dcclxuKiBodHRwczovL2dpdGh1Yi5jb20vc3Rvd2JhbGwvalF1ZXJ5LXJ3ZEltYWdlTWFwc1xyXG4qIGh0dHA6Ly9tYXR0c3Rvdy5jb21cclxuKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuKi9cclxuOyhmdW5jdGlvbihhKXthLmZuLnJ3ZEltYWdlTWFwcz1mdW5jdGlvbigpe3ZhciBjPXRoaXM7dmFyIGI9ZnVuY3Rpb24oKXtjLmVhY2goZnVuY3Rpb24oKXtpZih0eXBlb2YoYSh0aGlzKS5hdHRyKFwidXNlbWFwXCIpKT09XCJ1bmRlZmluZWRcIil7cmV0dXJufXZhciBlPXRoaXMsZD1hKGUpO2EoXCI8aW1nIC8+XCIpLmxvYWQoZnVuY3Rpb24oKXt2YXIgZz1cIndpZHRoXCIsbT1cImhlaWdodFwiLG49ZC5hdHRyKGcpLGo9ZC5hdHRyKG0pO2lmKCFufHwhail7dmFyIG89bmV3IEltYWdlKCk7by5zcmM9ZC5hdHRyKFwic3JjXCIpO2lmKCFuKXtuPW8ud2lkdGh9aWYoIWope2o9by5oZWlnaHR9fXZhciBmPWQud2lkdGgoKS8xMDAsaz1kLmhlaWdodCgpLzEwMCxpPWQuYXR0cihcInVzZW1hcFwiKS5yZXBsYWNlKFwiI1wiLFwiXCIpLGw9XCJjb29yZHNcIjthKCdtYXBbbmFtZT1cIicraSsnXCJdJykuZmluZChcImFyZWFcIikuZWFjaChmdW5jdGlvbigpe3ZhciByPWEodGhpcyk7aWYoIXIuZGF0YShsKSl7ci5kYXRhKGwsci5hdHRyKGwpKX12YXIgcT1yLmRhdGEobCkuc3BsaXQoXCIsXCIpLHA9bmV3IEFycmF5KHEubGVuZ3RoKTtmb3IodmFyIGg9MDtoPHAubGVuZ3RoOysraCl7aWYoaCUyPT09MCl7cFtoXT1wYXJzZUludCgoKHFbaF0vbikqMTAwKSpmKX1lbHNle3BbaF09cGFyc2VJbnQoKChxW2hdL2opKjEwMCkqayl9fXIuYXR0cihsLHAudG9TdHJpbmcoKSl9KX0pLmF0dHIoXCJzcmNcIixkLmF0dHIoXCJzcmNcIikpfSl9O2Eod2luZG93KS5yZXNpemUoYikudHJpZ2dlcihcInJlc2l6ZVwiKTtyZXR1cm4gdGhpc319KShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFVzZXJTZXJ2aWNlID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICAkaHR0cDogbnVsbCxcbiAgICBjb25maWdNb2RlbDogbnVsbCxcblxuICAgIHNpZ25JbjogZnVuY3Rpb24oZW1haWwsIHBhc3N3b3JkKXtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMuY29uZmlnTW9kZWwuY29uZmlnLmJhc2VVUkwgKyBcIi9sb2dpbi9wbGF5ZmFiXCI7XG4gICAgICAgIHZhciByZXEgPSB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiAge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc29sZS5sb2cocmVxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAocmVxKTtcbiAgICB9LFxuXG4gICAgc2lnbk91dDogZnVuY3Rpb24oKXtcblxuICAgIH0sXG5cbiAgICB1cGRhdGVVc2VyOiBmdW5jdGlvbih1c2VyKXtcblxuICAgIH1cblxufSk7XG5cblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIFVzZXJTZXJ2aWNlUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IFVzZXJTZXJ2aWNlKCksXG5cdCRnZXQ6IGZ1bmN0aW9uKCRodHRwLCAkY29va2llcywgQ29uZmlnTW9kZWwpe1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5jb25maWdNb2RlbCA9IENvbmZpZ01vZGVsO1xuXHQgICAgdGhpcy5pbnN0YW5jZS4kaHR0cCA9ICRodHRwO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd1c2Vycy5Vc2VyU2VydmljZScsW10pXG5cdC5wcm92aWRlcignVXNlclNlcnZpY2UnLCBVc2VyU2VydmljZVByb3ZpZGVyKTtcbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBOYXZCYXJEaXJlY3RpdmUgPSBCYXNlRGlyZWN0aXZlLmV4dGVuZCh7XG4gICAgdXNlck1vZGVsOiBudWxsLFxuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG5cbiAgICBpbml0OiBmdW5jdGlvbigkc2NvcGUsIFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyl7XG4gICAgICAgIHRoaXMudXNlck1vZGVsID0gVXNlck1vZGVsO1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICB0aGlzLl9zdXBlcigkc2NvcGUpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVMaXN0ZW5lcnM6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5hZGRFdmVudExpc3RlbmVyKG1vZGVscy5ldmVudHMuVVNFUl9TSUdORURfSU4sIHRoaXMuaGFuZGxlVXNlclNpZ25lZEluLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLiRzY29wZS5sb2dvdXQgPSB0aGlzLmxvZ291dC5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVTY29wZTogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5uYXZTaG93aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRVc2VyID0gdGhpcy51c2VyTW9kZWwuY3VycmVudFVzZXI7XG4gICAgICAgICQoXCIuYnV0dG9uLWNvbGxhcHNlXCIpLnNpZGVOYXYoKTtcbiAgICB9LFxuXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLnVzZXJNb2RlbC5sb2dvdXQoKTtcbiAgICAgICAgdGhpcy4kbG9jYXRpb24udXJsKFwiL1wiKTtcbiAgICB9LFxuXG4gICAgLyoqIEVWRU5UIEhBTkRMRVJTICoqL1xuICAgIGhhbmRsZVVzZXJTaWduZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFVzZXIgPSB0aGlzLnVzZXJNb2RlbC5jdXJyZW50VXNlcjtcbiAgICB9XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25hdmJhcicsW10pXG4gICAgLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24oVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKXtcblx0cmV0dXJuIHtcblx0ICAgIHJlc3RyaWN0OidFJyxcblx0ICAgIGlzb2xhdGU6dHJ1ZSxcblx0ICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSl7XG5cdFx0bmV3IE5hdkJhckRpcmVjdGl2ZSgkc2NvcGUsIFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyk7XG5cdCAgICB9LFxuXHQgICAgc2NvcGU6dHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL25hdmJhci9uYXZiYXIuaHRtbFwiXG5cdH07XG4gICAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSb3V0ZUxpc3REaXJlY3RpdmUgPSBCYXNlRGlyZWN0aXZlLmV4dGVuZCh7XG4gICAgdXNlck1vZGVsOiBudWxsLFxuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG5cbiAgICBpbml0OiBmdW5jdGlvbigkc2NvcGUsIFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyl7XG4gICAgICAgIHRoaXMudXNlck1vZGVsID0gVXNlck1vZGVsO1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICB0aGlzLl9zdXBlcigkc2NvcGUpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVMaXN0ZW5lcnM6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5hZGRFdmVudExpc3RlbmVyKG1vZGVscy5ldmVudHMuVVNFUl9TSUdORURfSU4sIHRoaXMuaGFuZGxlVXNlclNpZ25lZEluLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLiRzY29wZS5sb2dvdXQgPSB0aGlzLmxvZ291dC5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVTY29wZTogZnVuY3Rpb24oKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJyb3V0ZUxpc3REaXJlY3RpdmVcIik7XG4gICAgICAgIHRoaXMuJHNjb3BlLnJvdXRlcyA9IFtdO1xuXG4gICAgICAgIHZhciByb3V0ZSA9IHtcbiAgICAgICAgICAgIGdyYWRlOiA1LFxuICAgICAgICAgICAgY29sb3I6IFwiYmx1ZVwiXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy4kc2NvcGUucm91dGVzLnB1c2gocm91dGUpO1xuXG4gICAgICAgIHJvdXRlID0ge1xuICAgICAgICAgICAgZ3JhZGU6IDYsXG4gICAgICAgICAgICBjb2xvcjogXCJvcmFuZ2VcIlxuICAgICAgICB9O1xuICAgICAgICB0aGlzLiRzY29wZS5yb3V0ZXMucHVzaChyb3V0ZSk7XG5cbiAgICAgICAgcm91dGUgPSB7XG4gICAgICAgICAgICBncmFkZTogNyxcbiAgICAgICAgICAgIGNvbG9yOiBcInB1cnBsZVwiXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuJHNjb3BlLnJvdXRlcy5wdXNoKHJvdXRlKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy4kc2NvcGUucm91dGVzKTtcblxuICAgIH0sXG5cbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMudXNlck1vZGVsLmxvZ291dCgpO1xuICAgICAgICB0aGlzLiRsb2NhdGlvbi51cmwoXCIvXCIpO1xuICAgIH0sXG5cbiAgICAvKiogRVZFTlQgSEFORExFUlMgKiovXG4gICAgaGFuZGxlVXNlclNpZ25lZEluOiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLiRzY29wZS5jdXJyZW50VXNlciA9IHRoaXMudXNlck1vZGVsLmN1cnJlbnRVc2VyO1xuICAgIH1cblxufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdyb3V0ZUxpc3QnLFtdKVxuICAgIC5kaXJlY3RpdmUoJ3JvdXRlTGlzdCcsIGZ1bmN0aW9uKFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyl7XG5cdHJldHVybiB7XG5cdCAgICByZXN0cmljdDonRScsXG5cdCAgICBpc29sYXRlOnRydWUsXG5cdCAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUpe1xuXHRcdG5ldyBSb3V0ZUxpc3REaXJlY3RpdmUoJHNjb3BlLCBVc2VyTW9kZWwsIE5vdGlmaWNhdGlvbnMpO1xuXHQgICAgfSxcblx0ICAgIHNjb3BlOnRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9yb3V0ZXMvcm91dGVMaXN0Lmh0bWxcIlxuXHR9O1xuICAgIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUm91dGVMaXN0SXRlbURpcmVjdGl2ZSA9IEJhc2VEaXJlY3RpdmUuZXh0ZW5kKHtcbiAgICB1c2VyTW9kZWw6IG51bGwsXG4gICAgbm90aWZpY2F0aW9uczogbnVsbCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCRzY29wZSwgVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKXtcbiAgICAgICAgdGhpcy51c2VyTW9kZWwgPSBVc2VyTW9kZWw7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgICAgIHRoaXMuX3N1cGVyKCRzY29wZSk7XG4gICAgfSxcblxuICAgIGRlZmluZUxpc3RlbmVyczogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLmFkZEV2ZW50TGlzdGVuZXIobW9kZWxzLmV2ZW50cy5VU0VSX1NJR05FRF9JTiwgdGhpcy5oYW5kbGVVc2VyU2lnbmVkSW4uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuJHNjb3BlLmxvZ291dCA9IHRoaXMubG9nb3V0LmJpbmQodGhpcyk7XG4gICAgfSxcblxuICAgIGRlZmluZVNjb3BlOiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLm5hdlNob3dpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFVzZXIgPSB0aGlzLnVzZXJNb2RlbC5jdXJyZW50VXNlcjtcbiAgICB9LFxuXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLnVzZXJNb2RlbC5sb2dvdXQoKTtcbiAgICAgICAgdGhpcy4kbG9jYXRpb24udXJsKFwiL1wiKTtcbiAgICB9LFxuXG4gICAgLyoqIEVWRU5UIEhBTkRMRVJTICoqL1xuICAgIGhhbmRsZVVzZXJTaWduZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFVzZXIgPSB0aGlzLnVzZXJNb2RlbC5jdXJyZW50VXNlcjtcbiAgICB9XG5cbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgncm91dGVMaXN0SXRlbScsW10pXG4gICAgLmRpcmVjdGl2ZSgncm91dGVMaXN0SXRlbScsIGZ1bmN0aW9uKFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyl7XG5cdHJldHVybiB7XG5cdCAgICByZXN0cmljdDonRScsXG5cdCAgICBpc29sYXRlOnRydWUsXG5cdCAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUpe1xuXHRcdG5ldyBSb3V0ZUxpc3RJdGVtRGlyZWN0aXZlKCRzY29wZSwgVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKTtcblx0ICAgIH0sXG5cdCAgICBzY29wZTp0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvcm91dGVzL3JvdXRlTGlzdEl0ZW0uaHRtbFwiXG5cdH07XG4gICAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBHeW1NYXBDb250cm9sbGVyID0gQmFzZUNvbnRyb2xsZXIuZXh0ZW5kKHtcbiAgICBub3RpZmljYXRpb25zOm51bGwsXG4gICAgcm9vdENhbnZhczpudWxsLFxuICAgIHJvb3RJbWFnZTpudWxsLFxuXG4gICAgaW5pdDpmdW5jdGlvbigkc2NvcGUsIE5vdGlmaWNhdGlvbnMpe1xuXHQgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuXHQgICB0aGlzLl9zdXBlcigkc2NvcGUpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVMaXN0ZW5lcnM6ZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgdGhpcy4kc2NvcGUuYXJlYUNsaWNrZWQgPSB0aGlzLmFyZWFDbGlja2VkLmJpbmQodGhpcyk7XG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IHRoaXMub25SZXNpemUuYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgZGVmaW5lU2NvcGU6ZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoYXQucm9vdEltYWdlID0gJCgnLmltYWdlTGF5ZXIgaW1nJykub24oJ2xvYWQub21nbWFwcycsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJ3ZEltYWdlTWFwcygpO1xuICAgICAgICAgICAgICAgIHRoYXQuaGlnaGxpZ2h0TWFwKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KS5jc3MoJ29wYWNpdHknLCcwJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZG9uZVwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcblxuICAgICAgICBcbiAgICB9LFxuXG4gICAgZGVzdHJveTpmdW5jdGlvbigpe1xuICAgICAgICAkKCdhcmVhJykub2ZmKCcub21nbWFwcycpO1xuICAgICAgICAkKCdpbWcnKS5vZmYoJy5vbWdtYXBzJyk7XG4gICAgfSxcblxuXG4gICAgYXJlYUNsaWNrZWQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUkNIXCIpO1xuICAgIH0sXG4gICAgXG4gICAgY3JlYXRlUm9vdENhbnZhczpmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaW1hZ2UgPSB0aGlzLnJvb3RJbWFnZSxcbiAgICAgICAgICAgIGltZ1dpZHRoID0gaW1hZ2Uud2lkdGgoKSxcbiAgICAgICAgICAgIGltZ0hlaWdodCA9IGltYWdlLmhlaWdodCgpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5yb290Q2FudmFzID0gJCgnPGNhbnZhcz4nKS5hdHRyKCd3aWR0aCcsaW1nV2lkdGgpLmF0dHIoJ2hlaWdodCcsaW1nSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5yb290Q2FudmFzLmNzcyh7XG4gICAgICAgICAgICBwb3NpdGlvbjonYWJzb2x1dGUnLFxuICAgICAgICAgICAgdG9wOicwcHgnLFxuICAgICAgICAgICAgbGVmdDonMHB4JyxcbiAgICAgICAgICAgIGhlaWdodDonYXV0bydcbiAgICAgICAgfSk7XG4gICAgICAgIGltYWdlLmJlZm9yZSh0aGlzLnJvb3RDYW52YXMpO1xuICAgICAgICB2YXIgY3R4ID0gdGhpcy5yb290Q2FudmFzLmdldCgwKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLmdldCgwKSwwLDAsaW1nV2lkdGgsIGltZ0hlaWdodCk7XG4gICAgfSxcbiAgICBcbiAgICByZWRyYXdSb290Q2FudmFzOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaW1hZ2UgPSB0aGlzLnJvb3RJbWFnZSxcbiAgICAgICAgICAgIGltZ1dpZHRoID0gaW1hZ2Uud2lkdGgoKSxcbiAgICAgICAgICAgIGltZ0hlaWdodCA9IGltYWdlLmhlaWdodCgpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGN0eCA9IHRoaXMucm9vdENhbnZhcy5nZXQoMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnJvb3RDYW52YXMuZ2V0KDApLndpZHRoLCB0aGlzLnJvb3RDYW52YXMuZ2V0KDApLndpZHRoKTtcblxuICAgICAgICB0aGlzLnJvb3RDYW52YXMuYXR0cignd2lkdGgnLGltZ1dpZHRoKS5hdHRyKCdoZWlnaHQnLGltZ0hlaWdodCk7XG5cbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZS5nZXQoMCksMCwwLGltYWdlLndpZHRoKCksIGltYWdlLmhlaWdodCgpKTtcbiAgICB9LFxuXG4gICAgaGlnaGxpZ2h0TWFwOiBmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAgICAgdmFyIGJvZHkgPSAkKCdib2R5JyksXG4gICAgICAgICAgICBjb250ZW50QXJlYSA9ICQoJy5tYXBDb250ZW50JyksXG4gICAgICAgICAgICBtYXAgPSAkKFwiI2d5bU1hcFwiKSxcbiAgICAgICAgICAgIG1hcEVsID0gJChcIiNneW1NYXBcIikuZ2V0KDApLFxuICAgICAgICAgICAgbWFwQXJlYXMgPSBtYXAuZmluZCgnYXJlYScpLFxuICAgICAgICAgICAgaW1hZ2UgPSB0aGlzLnJvb3RJbWFnZSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZ2V0IHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGZyb20gdGhlIGltYWdlIHRhZ1xuICAgICAgICAgICAgaW1nV2lkdGggPSBpbWFnZS53aWR0aCgpLFxuICAgICAgICAgICAgaW1nSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0KCksXG4gICAgICAgICAgICBpbWdBdHRyV2lkdGggPSBpbWFnZS5hdHRyKCd3aWR0aCcpLFxuICAgICAgICAgICAgaW1nQXR0ckhlaWdodCA9IGltYWdlLmF0dHIoJ2hlaWdodCcpLFxuICAgICAgICAgICAgeEZhY3RvciA9IHBhcnNlRmxvYXQoaW1nV2lkdGgvaW1nQXR0cldpZHRoKSxcbiAgICAgICAgICAgIHlGYWN0b3IgPSBwYXJzZUZsb2F0KGltZ0hlaWdodC9pbWdBdHRySGVpZ2h0KTtcblxuLy8gICAgICAgIGNvbnNvbGUubG9nKCdpbWdBdHRyV2lkdGg6ICcraW1nQXR0cldpZHRoKTtcbi8vICAgICAgICBjb25zb2xlLmxvZygnaW1nQXR0ckhlaWdodDogJytpbWdBdHRySGVpZ2h0KTtcbi8vICAgICAgICBjb25zb2xlLmxvZygneEZhY3RvcjogJyt4RmFjdG9yKTtcbi8vICAgICAgICBjb25zb2xlLmxvZygneUZhY3RvcjogJyt5RmFjdG9yKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgcm9vdENhbnZhcyA9IHRoaXMuY3JlYXRlUm9vdENhbnZhcygpO1xuICAgICAgICBcbiAgICAgICAgJC5lYWNoKG1hcEFyZWFzLCBmdW5jdGlvbihpbmRleCwgYXJlYSl7XG4gICAgICAgICAgICB2YXIgYXJlYSA9ICQoYXJlYSk7XG4gICAgICAgICAgICB2YXIgYXJlYUVsID0gYXJlYS5nZXQoMCk7XG4gICAgICAgICAgICB2YXIgY29vcmRzID0gYXJlYUVsLmNvb3Jkcy5zcGxpdChcIiwgXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBtYXAgdGhlIGNvb3JkcyBiZWNhdXNlIHRoZXkgYXJlIHNjYWxlZCBmb3IgdGhlIGltYWdlIHNpemUgYW5kIG5vdCB0aGUgb3RoZXIgc2l6ZVxuICAgICAgICAgICAgY29vcmRzID0gY29vcmRzLm1hcChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpe1xuICAgICAgICAgICAgICAgIGlmKGluZGV4JTIgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICAvLyB4IGNvb3JkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIHhGYWN0b3I7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8geSBjb29yZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKiB5RmFjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBjYW52YXNcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSAkKCc8Y2FudmFzPicpLmF0dHIoJ3dpZHRoJyxpbWdXaWR0aCkuYXR0cignaGVpZ2h0JyxpbWdIZWlnaHQpLmFkZENsYXNzKCdtYXAtb3ZlcmxheScpO1xuICAgICAgICAgICAgY2FudmFzLmNzcyh7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246J2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICB0b3A6JzBweCcsXG4gICAgICAgICAgICAgICAgbGVmdDonMHB4JyxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OicwLjAnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6J25vbmUnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gYXR0YWNoIHNhaWQgY2FudmFzIHRvIERPTVxuICAgICAgICAgICAgY29udGVudEFyZWEuZmluZCgnaW1nJykuYmVmb3JlKGNhbnZhcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGdyYWIgdGhlIGNhbnZhcyBjb250ZXh0XG4gICAgICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldCgwKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjZjAwJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHggPSBjb29yZHNbMF0sXG4gICAgICAgICAgICAgICAgeSA9IGNvb3Jkc1sxXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyh4LCB5KTtcbiAgICAgICAgICAgIGZvcih2YXIgaiA9IDIsbGVuID0gY29vcmRzLmxlbmd0aDsgaiA8IGxlbi0xIDsgaiArPSAyICl7XG4gICAgICAgICAgICAgICAgeCA9IGNvb3Jkc1tqXTtcbiAgICAgICAgICAgICAgICB5ID0gY29vcmRzW2ogKyAxXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKHgsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmZpbGwoKTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIGFuIGFyZWEgbW91c2VlbnRlciBldmVudCBsaXN0ZW5lclxuICAgICAgICAgICAgYXJlYS5vbignbW91c2VlbnRlci5vbWdtYXBzJywgKGZ1bmN0aW9uKGNhbnZhcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbi8vICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbW91c2UgZW50ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuYW5pbWF0ZSh7b3BhY2l0eTonMS4wJ30sMjAwLCdsaW5lYXInKTtcbi8vICAgICAgICAgICAgICAgICAgICBjYW52YXMuYW5pbWF0ZSh7ZGlzcGxheTonYmxvY2snfSwyMDAsJ2xpbmVhcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKGNhbnZhcykpO1xuXG4gICAgICAgICAgICBhcmVhLm9uKCdtb3VzZWxlYXZlLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtb3VzZSBsZWF2ZScpO1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuYW5pbWF0ZSh7b3BhY2l0eTonMC4wJ30sMjAwLCdsaW5lYXInLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgICAgICAgICAgY2FudmFzLmFuaW1hdGUoe2Rpc3BsYXk6J25vbmUnfSwyMDAsJ2xpbmVhcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKGNhbnZhcykpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhcmVhLm9uKCdjbGljay5vbWdtYXBzJywgKGZ1bmN0aW9uKGNhbnZhcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoY2FudmFzKSk7XG5cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBvblJlc2l6ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIGlmKHRoaXMucmVzaXplVGltZW91dCl7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5yZXNpemVUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc2l6ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGF0LnJlc2l6ZSgpO1xuICAgICAgICB9LCAyMDApO1xuICAgIH0sXG4gICAgXG4gICAgcmVzaXplOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGNvbnNvbGUubG9nKCdyZXNpemUnKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMucm9vdENhbnZhcyl7XG4gICAgICAgICAgICB0aGlzLnJlZHJhd1Jvb3RDYW52YXMoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnY2FudmFzLm1hcC1vdmVybGF5JykuZWFjaChmdW5jdGlvbihpbmRleCwgY2FudmFzKXtcbiAgICAgICAgICAgIGNhbnZhcyA9ICQoY2FudmFzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FudmFzLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGF0LnJvb3RJbWFnZS5oZWlnaHQoKSxcbiAgICAgICAgICAgICAgICB3aWR0aDogdGhhdC5yb290SW1hZ2Uud2lkdGgoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG59KTtcblxuXG5HeW1NYXBDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZScsJ05vdGlmaWNhdGlvbnMnXTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==