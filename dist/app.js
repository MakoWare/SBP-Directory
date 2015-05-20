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
        this.initNav();
    },

    initNav: function(){
        var mobileMenu = document.getElementById("js-mobile-menu");
        var navMenu = document.getElementById("js-navigation-menu");
        navMenu.className = navMenu.className.replace(/\bshow\b/,'');
        mobileMenu.addEventListener('click', function(e) {
            e.preventDefault();
            if(this.navShowing){
                navMenu.className = navMenu.className.replace(/\bshow\b/,'');
            } else {
                navMenu.className = navMenu.className + " show";
            }
            this.navShowing = !this.navShowing;
        }.bind(this));
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

var GymMapController = BaseController.extend({
    notifications:null,

    init:function($scope, Notifications){
	this.notifications = Notifications;
	this._super($scope);
    },

    defineListeners:function(){
	this._super();
        this.$scope.areaClicked = this.areaClicked.bind(this);
        window.onresize = this.resize.bind(this);
    },

    defineScope:function(){
        $(document).ready(function(e) {
            $('img[usemap]').rwdImageMaps();
            
            
            
            console.log("done");
        });

        this.highlightMap();
    },

    destroy:function(){
        $('canvas').off('.omgmaps');
    },


    areaClicked: function(){
        console.log("RCH");
    },

    highlightMap: function(){
        
        var body = $('body'),
            map = $("#gymMap"),
            mapEl = $("#gymMap").get(0),
            mapAreas = map.find('area');
        
        
        $.each(mapAreas, function(index, object){
            var object = $(object);
            var area = object.get(0);
            var coords = area.coords.split(", ");

            //            console.log('coords');
            //            console.log(coords);
            
            // create a canvas
            var canvas = $('<canvas>').css('display', 'none');
            // append said canvas
            body.append(canvas);
            
            // grab the canvas context
            var ctx = canvas.get(0).getContext('2d');
//            console.log('ctx');
//            console.log(ctx);

            ctx.fillStyle = '#f00';
            ctx.beginPath();

            var x = coords[0];
            var y = coords[1];

            //            console.log("x: " + x);
            //            console.log("y: " + y);
            ctx.moveTo(coords[0], coords[1]);
            //            console.log(coords.length);
            for(var j = 2; j < coords.length-1 ; j += 2 ){
                x = coords[j];
                y = coords[j + 1];

                //                console.log("x: " + x);
                //                console.log("y: " + y);
                //                console.log("j: " + j);

                ctx.lineTo(x, y);
            }




            ctx.lineTo(100, 50);
            ctx.lineTo(50, 100);
            ctx.lineTo(0, 90);
            ctx.closePath();
            ctx.fill();

            //            ctx.closePath();
            //            ctx.fill();

            //            console.log(canvas);
            
            // create an area mouseenter event listener
            object.on('mouseenter.omgmaps', (function(canvas){
                return function(event){
                    canvas.css('display', 'inline-block');
                }
            })(canvas));

            object.on('mouseleave.omgmaps', (function(canvas){
                return function(event){
                    canvas.css('display', 'none');
                }
            })(canvas));

        });
        
    },

    resize: function(){

    }

});


GymMapController.$inject = ['$scope','Notifications'];

'use strict';

angular.module('playfab', [
    'notifications',

    'navbar',

    //User
    'users.UserModel',
    'users.UserService',

    //Config
    'duxter.ConfigModel',

    /*
     //Articles
     'articles.ArticleModel',
     'articles.ArticleService',
     'articles.articleList',
     'articles.articleListItem',

     //Comments
     'comments.CommentModel',
     'comments.CommentService',
     'comments.commentList',
     'comments.commentListItem',
     */

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
        .state('userSettings', {
            url: "/users/:id/settings",
            templateUrl: "partials/settingsPage.html"
        });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYXNzLmpzIiwiQmFzZUNvbnRyb2xsZXIuanMiLCJCYXNlRGlyZWN0aXZlLmpzIiwiRXZlbnREaXNwYXRjaGVyLmpzIiwiTmFtZXNwYWNlLmpzIiwiTm90aWZpY2F0aW9ucy5qcyIsIm1vZGVscy9jb25maWdNb2RlbC5qcyIsIm1vZGVscy9nYW1lTW9kZWwuanMiLCJtb2RlbHMvdXNlck1vZGVsLmpzIiwiY29tcG9uZW50cy9uYXZiYXIvbmF2YmFyRGlyZWN0aXZlLmpzIiwic2VydmljZXMvZ2FtZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9pbWFnZU1hcC5taW4uanMiLCJzZXJ2aWNlcy91c2VyU2VydmljZS5qcyIsImNvbXBvbmVudHMvZ3ltL21hcC9neW1NYXBDb250cm9sbGVyLmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgZm5UZXN0ID0gL3h5ei8udGVzdChmdW5jdGlvbigpe3h5ejt9KSA/IC9cXGJfc3VwZXJcXGIvIDogLy4qLztcblxuICAvLyBUaGUgYmFzZSBDbGFzcyBpbXBsZW1lbnRhdGlvbiAoZG9lcyBub3RoaW5nKVxuICBmdW5jdGlvbiBCYXNlQ2xhc3MoKXt9XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IENsYXNzIHRoYXQgaW5oZXJpdHMgZnJvbSB0aGlzIGNsYXNzXG4gIEJhc2VDbGFzcy5leHRlbmQgPSBmdW5jdGlvbihwcm9wcykge1xuICAgIHZhciBfc3VwZXIgPSB0aGlzLnByb3RvdHlwZTtcblxuICAgIC8vIFNldCB1cCB0aGUgcHJvdG90eXBlIHRvIGluaGVyaXQgZnJvbSB0aGUgYmFzZSBjbGFzc1xuICAgIC8vIChidXQgd2l0aG91dCBydW5uaW5nIHRoZSBpbml0IGNvbnN0cnVjdG9yKVxuICAgIHZhciBwcm90byA9IE9iamVjdC5jcmVhdGUoX3N1cGVyKTtcblxuICAgIC8vIENvcHkgdGhlIHByb3BlcnRpZXMgb3ZlciBvbnRvIHRoZSBuZXcgcHJvdG90eXBlXG4gICAgZm9yICh2YXIgbmFtZSBpbiBwcm9wcykge1xuICAgICAgLy8gQ2hlY2sgaWYgd2UncmUgb3ZlcndyaXRpbmcgYW4gZXhpc3RpbmcgZnVuY3Rpb25cbiAgICAgIHByb3RvW25hbWVdID0gdHlwZW9mIHByb3BzW25hbWVdID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgdHlwZW9mIF9zdXBlcltuYW1lXSA9PSBcImZ1bmN0aW9uXCIgJiYgZm5UZXN0LnRlc3QocHJvcHNbbmFtZV0pXG4gICAgICAgID8gKGZ1bmN0aW9uKG5hbWUsIGZuKXtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIHRtcCA9IHRoaXMuX3N1cGVyO1xuXG4gICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyAuX3N1cGVyKCkgbWV0aG9kIHRoYXQgaXMgdGhlIHNhbWUgbWV0aG9kXG4gICAgICAgICAgICAgIC8vIGJ1dCBvbiB0aGUgc3VwZXItY2xhc3NcbiAgICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSBfc3VwZXJbbmFtZV07XG5cbiAgICAgICAgICAgICAgLy8gVGhlIG1ldGhvZCBvbmx5IG5lZWQgdG8gYmUgYm91bmQgdGVtcG9yYXJpbHksIHNvIHdlXG4gICAgICAgICAgICAgIC8vIHJlbW92ZSBpdCB3aGVuIHdlJ3JlIGRvbmUgZXhlY3V0aW5nXG4gICAgICAgICAgICAgIHZhciByZXQgPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB0aGlzLl9zdXBlciA9IHRtcDtcblxuICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KShuYW1lLCBwcm9wc1tuYW1lXSlcbiAgICAgICAgOiBwcm9wc1tuYW1lXTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbmV3IGNvbnN0cnVjdG9yXG4gICAgdmFyIG5ld0NsYXNzID0gdHlwZW9mIHByb3RvLmluaXQgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBwcm90by5oYXNPd25Qcm9wZXJ0eShcImluaXRcIilcbiAgICAgICAgPyBwcm90by5pbml0IC8vIEFsbCBjb25zdHJ1Y3Rpb24gaXMgYWN0dWFsbHkgZG9uZSBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgOiBmdW5jdGlvbiBTdWJDbGFzcygpeyBfc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9XG4gICAgICA6IGZ1bmN0aW9uIEVtcHR5Q2xhc3MoKXt9O1xuXG4gICAgLy8gUG9wdWxhdGUgb3VyIGNvbnN0cnVjdGVkIHByb3RvdHlwZSBvYmplY3RcbiAgICBuZXdDbGFzcy5wcm90b3R5cGUgPSBwcm90bztcblxuICAgIC8vIEVuZm9yY2UgdGhlIGNvbnN0cnVjdG9yIHRvIGJlIHdoYXQgd2UgZXhwZWN0XG4gICAgcHJvdG8uY29uc3RydWN0b3IgPSBuZXdDbGFzcztcblxuICAgIC8vIEFuZCBtYWtlIHRoaXMgY2xhc3MgZXh0ZW5kYWJsZVxuICAgIG5ld0NsYXNzLmV4dGVuZCA9IEJhc2VDbGFzcy5leHRlbmQ7XG5cbiAgICByZXR1cm4gbmV3Q2xhc3M7XG4gIH07XG5cbiAgLy8gZXhwb3J0XG4gIGdsb2JhbC5DbGFzcyA9IEJhc2VDbGFzcztcbn0pKHRoaXMpO1xuIiwidmFyIEJhc2VDb250cm9sbGVyID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICBzY29wZTogbnVsbCxcblxuICAgIGluaXQ6ZnVuY3Rpb24oc2NvcGUpe1xuXHR0aGlzLiRzY29wZSA9IHNjb3BlO1xuXHR0aGlzLmRlZmluZUxpc3RlbmVycygpO1xuXHR0aGlzLmRlZmluZVNjb3BlKCk7XG4gICAgfSxcblxuICAgIGRlZmluZUxpc3RlbmVyczogZnVuY3Rpb24oKXtcblx0dGhpcy4kc2NvcGUuJG9uKCckZGVzdHJveScsdGhpcy5kZXN0cm95LmJpbmQodGhpcykpO1xuICAgIH0sXG5cblxuICAgIGRlZmluZVNjb3BlOiBmdW5jdGlvbigpe1xuXHQvL09WRVJSSURFXG4gICAgfSxcblxuXG4gICAgZGVzdHJveTpmdW5jdGlvbihldmVudCl7XG5cdC8vT1ZFUlJJREVcbiAgICB9XG59KTtcblxuQmFzZUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XG4iLCJ2YXIgQmFzZURpcmVjdGl2ZSA9IENsYXNzLmV4dGVuZCh7XG4gICAgc2NvcGU6IG51bGwsXG5cbiAgICBpbml0OmZ1bmN0aW9uKHNjb3BlKXtcblx0dGhpcy4kc2NvcGUgPSBzY29wZTtcblx0dGhpcy5kZWZpbmVMaXN0ZW5lcnMoKTtcblx0dGhpcy5kZWZpbmVTY29wZSgpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVMaXN0ZW5lcnM6IGZ1bmN0aW9uKCl7XG5cdHRoaXMuJHNjb3BlLiRvbignJGRlc3Ryb3knLHRoaXMuZGVzdHJveS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG5cbiAgICBkZWZpbmVTY29wZTogZnVuY3Rpb24oKXtcblx0Ly9PVkVSUklERVxuICAgIH0sXG5cblxuICAgIGRlc3Ryb3k6ZnVuY3Rpb24oZXZlbnQpe1xuXHQvL09WRVJSSURFXG4gICAgfVxufSk7XG5cbkJhc2VEaXJlY3RpdmUuJGluamVjdCA9IFsnJHNjb3BlJ107XG4iLCIvKipcbiogRXZlbnQgZGlzcGF0Y2hlciBjbGFzcyxcbiogYWRkIGFiaWxpdHkgdG8gZGlzcGF0Y2ggZXZlbnRcbiogb24gbmF0aXZlIGNsYXNzZXMuXG4qXG4qIFVzZSBvZiBDbGFzcy5qc1xuKlxuKiBAYXV0aG9yIHVuaXZlcnNhbG1pbmQuY29tXG4qL1xudmFyIEV2ZW50RGlzcGF0Y2hlciA9IENsYXNzLmV4dGVuZCh7XG4gICAgX2xpc3RlbmVyczp7fSxcblxuICAgIC8qKlxuICAgICogQWRkIGEgbGlzdGVuZXIgb24gdGhlIG9iamVjdFxuICAgICogQHBhcmFtIHR5cGUgOiBFdmVudCB0eXBlXG4gICAgKiBAcGFyYW0gbGlzdGVuZXIgOiBMaXN0ZW5lciBjYWxsYmFja1xuICAgICovICBcbiAgICBhZGRFdmVudExpc3RlbmVyOmZ1bmN0aW9uKHR5cGUsbGlzdGVuZXIpe1xuICAgICAgICBpZighdGhpcy5fbGlzdGVuZXJzW3R5cGVdKXtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5wdXNoKGxpc3RlbmVyKVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAgICogUmVtb3ZlIGEgbGlzdGVuZXIgb24gdGhlIG9iamVjdFxuICAgICAgICogQHBhcmFtIHR5cGUgOiBFdmVudCB0eXBlXG4gICAgICAgKiBAcGFyYW0gbGlzdGVuZXIgOiBMaXN0ZW5lciBjYWxsYmFja1xuICAgICAgICovICBcbiAgICByZW1vdmVFdmVudExpc3RlbmVyOmZ1bmN0aW9uKHR5cGUsbGlzdGVuZXIpe1xuICAgICAgaWYodGhpcy5fbGlzdGVuZXJzW3R5cGVdKXtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fbGlzdGVuZXJzW3R5cGVdLmluZGV4T2YobGlzdGVuZXIpO1xuXG4gICAgICAgIGlmKGluZGV4IT09LTEpe1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnNwbGljZShpbmRleCwxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICogRGlzcGF0Y2ggYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgbGlzdGVuZXJcbiAgICAqIEBwYXJhbSBNdXRpcGxlIHBhcmFtcyBhdmFpbGFibGUsIGZpcnN0IG11c3QgYmUgc3RyaW5nXG4gICAgKi8gXG4gICAgZGlzcGF0Y2hFdmVudDpmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbGlzdGVuZXJzO1xuXG4gICAgICAgIGlmKHR5cGVvZiBhcmd1bWVudHNbMF0gIT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignRXZlbnREaXNwYXRjaGVyJywnRmlyc3QgcGFyYW1zIG11c3QgYmUgYW4gZXZlbnQgdHlwZSAoU3RyaW5nKScpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW2FyZ3VtZW50c1swXV07XG5cbiAgICAgICAgICAgIGZvcih2YXIga2V5IGluIGxpc3RlbmVycyl7XG4gICAgICAgICAgICAgICAgLy9UaGlzIGNvdWxkIHVzZSAuYXBwbHkoYXJndW1lbnRzKSBpbnN0ZWFkLCBidXQgdGhlcmUgaXMgY3VycmVudGx5IGEgYnVnIHdpdGggaXQuXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzW2tleV0oYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSxhcmd1bWVudHNbMl0sYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pXG5cblxuIiwiLyoqXG4qIFNpbXBsZSBuYW1lc3BhY2UgdXRpbCB0byBleHRhbmQgQ2xhc3MuanMgZnVuY3Rpb25hbGl0eVxuKiBhbmQgd3JhcCBjbGFzc2VzIGluIG5hbWVzcGFjZS5cbiogQGF1dGhvciB0b21teS5yb2NoZXR0ZVtmb2xsb3dlZCBieSB0aGUgdXN1YWwgc2lnbl11bml2ZXJzYWxtaW5kLmNvbVxuKiBAdHlwZSB7Kn1cbiogQHJldHVybiBPYmplY3RcbiovXG53aW5kb3cubmFtZXNwYWNlID0gZnVuY3Rpb24obmFtZXNwYWNlcyl7XG4gICAndXNlIHN0cmljdCc7XG4gICB2YXIgbmFtZXMgPSBuYW1lc3BhY2VzLnNwbGl0KCcuJyk7XG4gICB2YXIgbGFzdCAgPSB3aW5kb3c7XG4gICB2YXIgbmFtZSAgPSBudWxsO1xuICAgdmFyIGkgICAgID0gbnVsbDtcblxuICAgZm9yKGkgaW4gbmFtZXMpe1xuICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcblxuICAgICAgIGlmKGxhc3RbbmFtZV09PT11bmRlZmluZWQpe1xuICAgICAgICAgICBsYXN0W25hbWVdID0ge307XG4gICAgICAgfVxuXG4gICAgICAgbGFzdCA9IGxhc3RbbmFtZV07XG4gICB9XG4gICByZXR1cm4gbGFzdDtcbn07XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgJ3VzZSBzdHJpY3QnO1xuICAgLyoqXG5cdCAqIENyZWF0ZSBhIGdsb2JhbCBldmVudCBkaXNwYXRjaGVyXG5cdCAqIHRoYXQgY2FuIGJlIGluamVjdGVkIGFjY3Jvc3MgbXVsdGlwbGUgY29tcG9uZW50c1xuXHQgKiBpbnNpZGUgdGhlIGFwcGxpY2F0aW9uXG5cdCAqXG5cdCAqIFVzZSBvZiBDbGFzcy5qc1xuXHQgKiBAdHlwZSB7Y2xhc3N9XG5cdCAqIEBhdXRob3IgdW5pdmVyc2FsbWluZC5jb21cblx0ICovXG4gICB2YXIgTm90aWZpY2F0aW9uc1Byb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgIGluc3RhbmNlOiBuZXcgRXZlbnREaXNwYXRjaGVyKCksXG5cbiAgICAgICAvKipcbiAgICAgICAgKiBDb25maWd1cmVzIGFuZCByZXR1cm5zIGluc3RhbmNlIG9mIEdsb2JhbEV2ZW50QnVzLlxuICAgICAgICAqXG4gICAgICAgICogQHJldHVybiB7R2xvYmFsRXZlbnRCdXN9XG4gICAgICAgICovXG4gICAgICAgJGdldDogW2Z1bmN0aW9uICgpIHtcbiAgICAgICBcdCAgIHRoaXMuaW5zdGFuY2Uubm90aWZ5ID0gdGhpcy5pbnN0YW5jZS5kaXNwYXRjaEV2ZW50O1xuICAgICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcbiAgICAgICB9XVxuICAgfSk7XG5cbiAgIGFuZ3VsYXIubW9kdWxlKCdub3RpZmljYXRpb25zJywgW10pXG4gICAgICAgLnByb3ZpZGVyKCdOb3RpZmljYXRpb25zJywgTm90aWZpY2F0aW9uc1Byb3ZpZGVyKTtcbn0oKSk7IiwiJ3VzZSBzdHJpY3QnO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuQ09ORklHX0xPQURFRCA9IFwiQWN0aXZpdHlNb2RlbC5DT05GSUdfTE9BREVEXCI7XG5cbnZhciBDb25maWdNb2RlbCA9IEV2ZW50RGlzcGF0Y2hlci5leHRlbmQoe1xuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG4gICAgY29uZmlnOiBudWxsXG5cbn0pO1xuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgQ29uZmlnTW9kZWxQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgQ29uZmlnTW9kZWwoKSxcblxuXHQkZ2V0OiBmdW5jdGlvbiggTm90aWZpY2F0aW9ucywgJGNvb2tpZXMsICRodHRwKXtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLiRjb29raWVzID0gJGNvb2tpZXM7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICBiYXNlVVJMOiBcImh0dHA6Ly9wbGF5ZmFiLXN0YWdpbmcuZHV4YXBpLmNvbVwiXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvL3RoaXMuaW5zdGFuY2UuY3VycmVudFVzZXIgPSBKU09OLnBhcnNlKCRjb29raWVzLmN1cnJlbnRVc2VyKTtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnZHV4dGVyLkNvbmZpZ01vZGVsJyxbXSlcblx0LnByb3ZpZGVyKCdDb25maWdNb2RlbCcsIENvbmZpZ01vZGVsUHJvdmlkZXIpO1xufSgpKTtcbiIsIid1c2Ugc3RyaWN0Jztcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLkdBTUVfTE9BREVEID0gXCJBY3Rpdml0eU1vZGVsLkdBTUVfTE9BREVEXCI7XG5cbnZhciBHYW1lTW9kZWwgPSBFdmVudERpc3BhdGNoZXIuZXh0ZW5kKHtcbiAgICBnYW1lOiB7XG4gICAgICAgIGltYWdlOiBcImltYWdlcy91bmljb3JuLnBuZ1wiLFxuICAgICAgICB0aXRsZTogXCJVTklDT1JOIEJBVFRMRVwiXG4gICAgfSxcblxuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG4gICAgZ2FtZVNlcnZpY2U6IG51bGwsXG5cbiAgICBnZXRHYW1lQnlJZDogZnVuY3Rpb24oaWQpe1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuR2FtZVNlcnZpY2UuZ2V0R2FtZUJ5SWQoaWQpO1xuICAgIH1cblxufSk7XG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBHYW1lTW9kZWxQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgR2FtZU1vZGVsKCksXG5cblx0JGdldDogZnVuY3Rpb24oIE5vdGlmaWNhdGlvbnMsIEdhbWVTZXJ2aWNlKXtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmdhbWVTZXJ2aWNlID0gR2FtZVNlcnZpY2U7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2dhbWVzLkdhbWVNb2RlbCcsW10pXG5cdC5wcm92aWRlcignR2FtZU1vZGVsJywgR2FtZU1vZGVsUHJvdmlkZXIpO1xufSgpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuVVNFUl9TSUdORURfSU4gPSBcIkFjdGl2aXR5TW9kZWwuVVNFUl9TSUdORURfSU5cIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLlVTRVJfU0lHTkVEX09VVCA9IFwiQWN0aXZpdHlNb2RlbC5VU0VSX1NJR05FRF9PVVRcIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLlVTRVJfVVBEQVRFRCA9IFwiQWN0aXZpdHlNb2RlbC5VU0VSX1VQREFURURcIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLlBST0ZJTEVfTE9BREVEID0gXCJBY3Rpdml0eU1vZGVsLlBST0ZJTEVfTE9BREVEXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5BVVRIX0VSUk9SID0gXCJBY3Rpdml0eU1vZGVsLkFVVEhfRVJST1JcIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLk5FVFdPUktfRVJST1IgPSBcIkFjdGl2aXR5TW9kZWwuTkVUV09SS19FUlJPUlwiO1xuXG52YXIgVXNlck1vZGVsID0gRXZlbnREaXNwYXRjaGVyLmV4dGVuZCh7XG4gICAgY3VycmVudFVzZXI6IG51bGwsXG5cbiAgICBVc2VyU2VydmljZTpudWxsLFxuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG5cbiAgICBzaWduSW46IGZ1bmN0aW9uKGVtYWlsLCBwYXNzd29yZCl7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcy5Vc2VyU2VydmljZS5zaWduSW4oZW1haWwsIHBhc3N3b3JkKTtcbiAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRVc2VyID0gcmVzdWx0cy5kYXRhLnVzZXI7XG4gICAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMubm90aWZ5KG1vZGVscy5ldmVudHMuVVNFUl9TSUdORURfSU4pO1xuICAgICAgICB9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3JcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICBpZihlcnJvci5kYXRhKXtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMubm90aWZ5KG1vZGVscy5ldmVudHMuQVVUSF9FUlJPUiwgZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMubm90aWZ5KG1vZGVscy5ldmVudHMuTkVUV09SS19FUlJPUik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cblxuXG5cbiAgICAgICAgLypcbiAgICAgICAgdmFyIHVzZXIgPSB7XG4gICAgICAgICAgICBuYW1lOiBcInRhY29cIixcbiAgICAgICAgICAgIGFnZTogMzVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLiRjb29raWVzLmN1cnJlbnRVc2VyID0gSlNPTi5zdHJpbmdpZnkodXNlcik7XG4gICAgICAgICAqL1xuICAgIH0sXG5cbiAgICBzaWduT3V0OiBmdW5jdGlvbigpe1xuICAgICAgICAvL3RoaXMuVXNlclNlcnZpY2Uuc2lnbk91dCgpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVVc2VyOiBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzLlVzZXJTZXJ2aWNlLnVwZGF0ZVVzZXIodXNlcik7XG4gICAgICAgIC8vcHJvbWlzZS50aGVuXG4gICAgfVxuXG59KTtcblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIFVzZXJNb2RlbFByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBVc2VyTW9kZWwoKSxcblxuXHQkZ2V0OiBmdW5jdGlvbihVc2VyU2VydmljZSwgTm90aWZpY2F0aW9ucywgJGNvb2tpZXMpe1xuXHQgICAgdGhpcy5pbnN0YW5jZS5Vc2VyU2VydmljZSA9IFVzZXJTZXJ2aWNlO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuJGNvb2tpZXMgPSAkY29va2llcztcbiAgICAgICAgICAgIC8vdGhpcy5pbnN0YW5jZS5jdXJyZW50VXNlciA9IEpTT04ucGFyc2UoJGNvb2tpZXMuY3VycmVudFVzZXIpO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd1c2Vycy5Vc2VyTW9kZWwnLFtdKVxuXHQucHJvdmlkZXIoJ1VzZXJNb2RlbCcsIFVzZXJNb2RlbFByb3ZpZGVyKTtcbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBOYXZCYXJEaXJlY3RpdmUgPSBCYXNlRGlyZWN0aXZlLmV4dGVuZCh7XG4gICAgdXNlck1vZGVsOiBudWxsLFxuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG5cbiAgICBpbml0OiBmdW5jdGlvbigkc2NvcGUsIFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyl7XG4gICAgICAgIHRoaXMudXNlck1vZGVsID0gVXNlck1vZGVsO1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICB0aGlzLl9zdXBlcigkc2NvcGUpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVMaXN0ZW5lcnM6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5hZGRFdmVudExpc3RlbmVyKG1vZGVscy5ldmVudHMuVVNFUl9TSUdORURfSU4sIHRoaXMuaGFuZGxlVXNlclNpZ25lZEluLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLiRzY29wZS5sb2dvdXQgPSB0aGlzLmxvZ291dC5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVTY29wZTogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5uYXZTaG93aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRVc2VyID0gdGhpcy51c2VyTW9kZWwuY3VycmVudFVzZXI7XG4gICAgICAgIHRoaXMuaW5pdE5hdigpO1xuICAgIH0sXG5cbiAgICBpbml0TmF2OiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbW9iaWxlTWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwianMtbW9iaWxlLW1lbnVcIik7XG4gICAgICAgIHZhciBuYXZNZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJqcy1uYXZpZ2F0aW9uLW1lbnVcIik7XG4gICAgICAgIG5hdk1lbnUuY2xhc3NOYW1lID0gbmF2TWVudS5jbGFzc05hbWUucmVwbGFjZSgvXFxic2hvd1xcYi8sJycpO1xuICAgICAgICBtb2JpbGVNZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYodGhpcy5uYXZTaG93aW5nKXtcbiAgICAgICAgICAgICAgICBuYXZNZW51LmNsYXNzTmFtZSA9IG5hdk1lbnUuY2xhc3NOYW1lLnJlcGxhY2UoL1xcYnNob3dcXGIvLCcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmF2TWVudS5jbGFzc05hbWUgPSBuYXZNZW51LmNsYXNzTmFtZSArIFwiIHNob3dcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubmF2U2hvd2luZyA9ICF0aGlzLm5hdlNob3dpbmc7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGxvZ291dDogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy51c2VyTW9kZWwubG9nb3V0KCk7XG4gICAgICAgIHRoaXMuJGxvY2F0aW9uLnVybChcIi9cIik7XG4gICAgfSxcblxuICAgIC8qKiBFVkVOVCBIQU5ETEVSUyAqKi9cbiAgICBoYW5kbGVVc2VyU2lnbmVkSW46IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRVc2VyID0gdGhpcy51c2VyTW9kZWwuY3VycmVudFVzZXI7XG4gICAgfVxuXG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25hdmJhcicsW10pXG4gICAgLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24oVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKXtcblx0cmV0dXJuIHtcblx0ICAgIHJlc3RyaWN0OidFJyxcblx0ICAgIGlzb2xhdGU6dHJ1ZSxcblx0ICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSl7XG5cdFx0bmV3IE5hdkJhckRpcmVjdGl2ZSgkc2NvcGUsIFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyk7XG5cdCAgICB9LFxuXHQgICAgc2NvcGU6dHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL25hdmJhci9uYXZiYXIuaHRtbFwiXG5cdH07XG4gICAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBHYW1lU2VydmljZSA9IENsYXNzLmV4dGVuZCh7XG4gICAgJGh0dHA6IG51bGwsXG5cbiAgICBnZXRHYW1lQnlJZDogZnVuY3Rpb24oaWQpe1xuXG4gICAgfVxuXG59KTtcblxuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgR2FtZVNlcnZpY2VQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgR2FtZVNlcnZpY2UoKSxcblx0JGdldDogZnVuY3Rpb24oJGh0dHApe1xuXHQgICAgdGhpcy5pbnN0YW5jZS4kaHR0cCA9ICRodHRwO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdnYW1lcy5HYW1lU2VydmljZScsW10pXG5cdC5wcm92aWRlcignR2FtZVNlcnZpY2UnLCBHYW1lU2VydmljZVByb3ZpZGVyKTtcbn0oKSk7XG4iLCIvKlxyXG4qIHJ3ZEltYWdlTWFwcyBqUXVlcnkgcGx1Z2luIHYxLjVcclxuKlxyXG4qIEFsbG93cyBpbWFnZSBtYXBzIHRvIGJlIHVzZWQgaW4gYSByZXNwb25zaXZlIGRlc2lnbiBieSByZWNhbGN1bGF0aW5nIHRoZSBhcmVhIGNvb3JkaW5hdGVzIHRvIG1hdGNoIHRoZSBhY3R1YWwgaW1hZ2Ugc2l6ZSBvbiBsb2FkIGFuZCB3aW5kb3cucmVzaXplXHJcbipcclxuKiBDb3B5cmlnaHQgKGMpIDIwMTMgTWF0dCBTdG93XHJcbiogaHR0cHM6Ly9naXRodWIuY29tL3N0b3diYWxsL2pRdWVyeS1yd2RJbWFnZU1hcHNcclxuKiBodHRwOi8vbWF0dHN0b3cuY29tXHJcbiogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiovXHJcbjsoZnVuY3Rpb24oYSl7YS5mbi5yd2RJbWFnZU1hcHM9ZnVuY3Rpb24oKXt2YXIgYz10aGlzO3ZhciBiPWZ1bmN0aW9uKCl7Yy5lYWNoKGZ1bmN0aW9uKCl7aWYodHlwZW9mKGEodGhpcykuYXR0cihcInVzZW1hcFwiKSk9PVwidW5kZWZpbmVkXCIpe3JldHVybn12YXIgZT10aGlzLGQ9YShlKTthKFwiPGltZyAvPlwiKS5sb2FkKGZ1bmN0aW9uKCl7dmFyIGc9XCJ3aWR0aFwiLG09XCJoZWlnaHRcIixuPWQuYXR0cihnKSxqPWQuYXR0cihtKTtpZighbnx8IWope3ZhciBvPW5ldyBJbWFnZSgpO28uc3JjPWQuYXR0cihcInNyY1wiKTtpZighbil7bj1vLndpZHRofWlmKCFqKXtqPW8uaGVpZ2h0fX12YXIgZj1kLndpZHRoKCkvMTAwLGs9ZC5oZWlnaHQoKS8xMDAsaT1kLmF0dHIoXCJ1c2VtYXBcIikucmVwbGFjZShcIiNcIixcIlwiKSxsPVwiY29vcmRzXCI7YSgnbWFwW25hbWU9XCInK2krJ1wiXScpLmZpbmQoXCJhcmVhXCIpLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1hKHRoaXMpO2lmKCFyLmRhdGEobCkpe3IuZGF0YShsLHIuYXR0cihsKSl9dmFyIHE9ci5kYXRhKGwpLnNwbGl0KFwiLFwiKSxwPW5ldyBBcnJheShxLmxlbmd0aCk7Zm9yKHZhciBoPTA7aDxwLmxlbmd0aDsrK2gpe2lmKGglMj09PTApe3BbaF09cGFyc2VJbnQoKChxW2hdL24pKjEwMCkqZil9ZWxzZXtwW2hdPXBhcnNlSW50KCgocVtoXS9qKSoxMDApKmspfX1yLmF0dHIobCxwLnRvU3RyaW5nKCkpfSl9KS5hdHRyKFwic3JjXCIsZC5hdHRyKFwic3JjXCIpKX0pfTthKHdpbmRvdykucmVzaXplKGIpLnRyaWdnZXIoXCJyZXNpemVcIik7cmV0dXJuIHRoaXN9fSkoalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBVc2VyU2VydmljZSA9IENsYXNzLmV4dGVuZCh7XG4gICAgJGh0dHA6IG51bGwsXG4gICAgY29uZmlnTW9kZWw6IG51bGwsXG5cbiAgICBzaWduSW46IGZ1bmN0aW9uKGVtYWlsLCBwYXNzd29yZCl7XG4gICAgICAgIHZhciB1cmwgPSB0aGlzLmNvbmZpZ01vZGVsLmNvbmZpZy5iYXNlVVJMICsgXCIvbG9naW4vcGxheWZhYlwiO1xuICAgICAgICB2YXIgcmVxID0ge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogIHtcbiAgICAgICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcSk7XG4gICAgICAgIHJldHVybiB0aGlzLiRodHRwKHJlcSk7XG4gICAgfSxcblxuICAgIHNpZ25PdXQ6IGZ1bmN0aW9uKCl7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlVXNlcjogZnVuY3Rpb24odXNlcil7XG5cbiAgICB9XG5cbn0pO1xuXG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBVc2VyU2VydmljZVByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBVc2VyU2VydmljZSgpLFxuXHQkZ2V0OiBmdW5jdGlvbigkaHR0cCwgJGNvb2tpZXMsIENvbmZpZ01vZGVsKXtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuY29uZmlnTW9kZWwgPSBDb25maWdNb2RlbDtcblx0ICAgIHRoaXMuaW5zdGFuY2UuJGh0dHAgPSAkaHR0cDtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgndXNlcnMuVXNlclNlcnZpY2UnLFtdKVxuXHQucHJvdmlkZXIoJ1VzZXJTZXJ2aWNlJywgVXNlclNlcnZpY2VQcm92aWRlcik7XG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR3ltTWFwQ29udHJvbGxlciA9IEJhc2VDb250cm9sbGVyLmV4dGVuZCh7XG4gICAgbm90aWZpY2F0aW9uczpudWxsLFxuXG4gICAgaW5pdDpmdW5jdGlvbigkc2NvcGUsIE5vdGlmaWNhdGlvbnMpe1xuXHR0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuXHR0aGlzLl9zdXBlcigkc2NvcGUpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVMaXN0ZW5lcnM6ZnVuY3Rpb24oKXtcblx0dGhpcy5fc3VwZXIoKTtcbiAgICAgICAgdGhpcy4kc2NvcGUuYXJlYUNsaWNrZWQgPSB0aGlzLmFyZWFDbGlja2VkLmJpbmQodGhpcyk7XG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcyk7XG4gICAgfSxcblxuICAgIGRlZmluZVNjb3BlOmZ1bmN0aW9uKCl7XG4gICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICQoJ2ltZ1t1c2VtYXBdJykucndkSW1hZ2VNYXBzKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRvbmVcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TWFwKCk7XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6ZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnY2FudmFzJykub2ZmKCcub21nbWFwcycpO1xuICAgIH0sXG5cblxuICAgIGFyZWFDbGlja2VkOiBmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJDSFwiKTtcbiAgICB9LFxuXG4gICAgaGlnaGxpZ2h0TWFwOiBmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAgICAgdmFyIGJvZHkgPSAkKCdib2R5JyksXG4gICAgICAgICAgICBtYXAgPSAkKFwiI2d5bU1hcFwiKSxcbiAgICAgICAgICAgIG1hcEVsID0gJChcIiNneW1NYXBcIikuZ2V0KDApLFxuICAgICAgICAgICAgbWFwQXJlYXMgPSBtYXAuZmluZCgnYXJlYScpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICQuZWFjaChtYXBBcmVhcywgZnVuY3Rpb24oaW5kZXgsIG9iamVjdCl7XG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0gJChvYmplY3QpO1xuICAgICAgICAgICAgdmFyIGFyZWEgPSBvYmplY3QuZ2V0KDApO1xuICAgICAgICAgICAgdmFyIGNvb3JkcyA9IGFyZWEuY29vcmRzLnNwbGl0KFwiLCBcIik7XG5cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nvb3JkcycpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhjb29yZHMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBjYW52YXNcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSAkKCc8Y2FudmFzPicpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICAvLyBhcHBlbmQgc2FpZCBjYW52YXNcbiAgICAgICAgICAgIGJvZHkuYXBwZW5kKGNhbnZhcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGdyYWIgdGhlIGNhbnZhcyBjb250ZXh0XG4gICAgICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldCgwKS5nZXRDb250ZXh0KCcyZCcpO1xuLy8gICAgICAgICAgICBjb25zb2xlLmxvZygnY3R4Jyk7XG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKGN0eCk7XG5cbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnI2YwMCc7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgICAgIHZhciB4ID0gY29vcmRzWzBdO1xuICAgICAgICAgICAgdmFyIHkgPSBjb29yZHNbMV07XG5cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgY29uc29sZS5sb2coXCJ4OiBcIiArIHgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhcInk6IFwiICsgeSk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKGNvb3Jkc1swXSwgY29vcmRzWzFdKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgY29uc29sZS5sb2coY29vcmRzLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IodmFyIGogPSAyOyBqIDwgY29vcmRzLmxlbmd0aC0xIDsgaiArPSAyICl7XG4gICAgICAgICAgICAgICAgeCA9IGNvb3Jkc1tqXTtcbiAgICAgICAgICAgICAgICB5ID0gY29vcmRzW2ogKyAxXTtcblxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwieDogXCIgKyB4KTtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInk6IFwiICsgeSk7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJqOiBcIiArIGopO1xuXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgICAgIH1cblxuXG5cblxuICAgICAgICAgICAgY3R4LmxpbmVUbygxMDAsIDUwKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oNTAsIDEwMCk7XG4gICAgICAgICAgICBjdHgubGluZVRvKDAsIDkwKTtcbiAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG5cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICBjdHguZmlsbCgpO1xuXG4gICAgICAgICAgICAvLyAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbnZhcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhbiBhcmVhIG1vdXNlZW50ZXIgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgICAgIG9iamVjdC5vbignbW91c2VlbnRlci5vbWdtYXBzJywgKGZ1bmN0aW9uKGNhbnZhcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLmNzcygnZGlzcGxheScsICdpbmxpbmUtYmxvY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShjYW52YXMpKTtcblxuICAgICAgICAgICAgb2JqZWN0Lm9uKCdtb3VzZWxlYXZlLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShjYW52YXMpKTtcblxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgfSxcblxuICAgIHJlc2l6ZTogZnVuY3Rpb24oKXtcblxuICAgIH1cblxufSk7XG5cblxuR3ltTWFwQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnLCdOb3RpZmljYXRpb25zJ107XG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdwbGF5ZmFiJywgW1xuICAgICdub3RpZmljYXRpb25zJyxcblxuICAgICduYXZiYXInLFxuXG4gICAgLy9Vc2VyXG4gICAgJ3VzZXJzLlVzZXJNb2RlbCcsXG4gICAgJ3VzZXJzLlVzZXJTZXJ2aWNlJyxcblxuICAgIC8vQ29uZmlnXG4gICAgJ2R1eHRlci5Db25maWdNb2RlbCcsXG5cbiAgICAvKlxuICAgICAvL0FydGljbGVzXG4gICAgICdhcnRpY2xlcy5BcnRpY2xlTW9kZWwnLFxuICAgICAnYXJ0aWNsZXMuQXJ0aWNsZVNlcnZpY2UnLFxuICAgICAnYXJ0aWNsZXMuYXJ0aWNsZUxpc3QnLFxuICAgICAnYXJ0aWNsZXMuYXJ0aWNsZUxpc3RJdGVtJyxcblxuICAgICAvL0NvbW1lbnRzXG4gICAgICdjb21tZW50cy5Db21tZW50TW9kZWwnLFxuICAgICAnY29tbWVudHMuQ29tbWVudFNlcnZpY2UnLFxuICAgICAnY29tbWVudHMuY29tbWVudExpc3QnLFxuICAgICAnY29tbWVudHMuY29tbWVudExpc3RJdGVtJyxcbiAgICAgKi9cblxuICAgICd1aS5yb3V0ZXInLFxuICAgICduZ0Nvb2tpZXMnLFxuICAgICduZ0FuaW1hdGUnXG5cbl0pLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgLy9cbiAgICAvLyBGb3IgYW55IHVubWF0Y2hlZCB1cmwsIHJlZGlyZWN0IHRvIC9zdGF0ZTFcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL2d5bS9tYXBcIik7XG4gICAgLy9cbiAgICAvLyBOb3cgc2V0IHVwIHRoZSBzdGF0ZXNcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2d5bU1hcCcsIHtcbiAgICAgICAgICAgIHVybDogXCIvZ3ltL21hcFwiLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvZ3ltL21hcC9tYXAuaHRtbFwiLFxuICAgICAgICAgICAgY29udHJvbGxlcjogR3ltTWFwQ29udHJvbGxlclxuXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgndXNlclNldHRpbmdzJywge1xuICAgICAgICAgICAgdXJsOiBcIi91c2Vycy86aWQvc2V0dGluZ3NcIixcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3NldHRpbmdzUGFnZS5odG1sXCJcbiAgICAgICAgfSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==