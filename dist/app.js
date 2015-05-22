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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYXNzLmpzIiwiQmFzZUNvbnRyb2xsZXIuanMiLCJCYXNlRGlyZWN0aXZlLmpzIiwiRXZlbnREaXNwYXRjaGVyLmpzIiwiTmFtZXNwYWNlLmpzIiwiTm90aWZpY2F0aW9ucy5qcyIsImFwcC5qcyIsIm1vZGVscy9jb25maWdNb2RlbC5qcyIsIm1vZGVscy9nYW1lTW9kZWwuanMiLCJtb2RlbHMvdXNlck1vZGVsLmpzIiwic2VydmljZXMvZ2FtZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9pbWFnZU1hcC5taW4uanMiLCJzZXJ2aWNlcy91c2VyU2VydmljZS5qcyIsImNvbXBvbmVudHMvbmF2YmFyL25hdmJhckRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvZ3ltL21hcC9neW1NYXBDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBmblRlc3QgPSAveHl6Ly50ZXN0KGZ1bmN0aW9uKCl7eHl6O30pID8gL1xcYl9zdXBlclxcYi8gOiAvLiovO1xuXG4gIC8vIFRoZSBiYXNlIENsYXNzIGltcGxlbWVudGF0aW9uIChkb2VzIG5vdGhpbmcpXG4gIGZ1bmN0aW9uIEJhc2VDbGFzcygpe31cblxuICAvLyBDcmVhdGUgYSBuZXcgQ2xhc3MgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMgY2xhc3NcbiAgQmFzZUNsYXNzLmV4dGVuZCA9IGZ1bmN0aW9uKHByb3BzKSB7XG4gICAgdmFyIF9zdXBlciA9IHRoaXMucHJvdG90eXBlO1xuXG4gICAgLy8gU2V0IHVwIHRoZSBwcm90b3R5cGUgdG8gaW5oZXJpdCBmcm9tIHRoZSBiYXNlIGNsYXNzXG4gICAgLy8gKGJ1dCB3aXRob3V0IHJ1bm5pbmcgdGhlIGluaXQgY29uc3RydWN0b3IpXG4gICAgdmFyIHByb3RvID0gT2JqZWN0LmNyZWF0ZShfc3VwZXIpO1xuXG4gICAgLy8gQ29weSB0aGUgcHJvcGVydGllcyBvdmVyIG9udG8gdGhlIG5ldyBwcm90b3R5cGVcbiAgICBmb3IgKHZhciBuYW1lIGluIHByb3BzKSB7XG4gICAgICAvLyBDaGVjayBpZiB3ZSdyZSBvdmVyd3JpdGluZyBhbiBleGlzdGluZyBmdW5jdGlvblxuICAgICAgcHJvdG9bbmFtZV0gPSB0eXBlb2YgcHJvcHNbbmFtZV0gPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICB0eXBlb2YgX3N1cGVyW25hbWVdID09IFwiZnVuY3Rpb25cIiAmJiBmblRlc3QudGVzdChwcm9wc1tuYW1lXSlcbiAgICAgICAgPyAoZnVuY3Rpb24obmFtZSwgZm4pe1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgdG1wID0gdGhpcy5fc3VwZXI7XG5cbiAgICAgICAgICAgICAgLy8gQWRkIGEgbmV3IC5fc3VwZXIoKSBtZXRob2QgdGhhdCBpcyB0aGUgc2FtZSBtZXRob2RcbiAgICAgICAgICAgICAgLy8gYnV0IG9uIHRoZSBzdXBlci1jbGFzc1xuICAgICAgICAgICAgICB0aGlzLl9zdXBlciA9IF9zdXBlcltuYW1lXTtcblxuICAgICAgICAgICAgICAvLyBUaGUgbWV0aG9kIG9ubHkgbmVlZCB0byBiZSBib3VuZCB0ZW1wb3JhcmlseSwgc28gd2VcbiAgICAgICAgICAgICAgLy8gcmVtb3ZlIGl0IHdoZW4gd2UncmUgZG9uZSBleGVjdXRpbmdcbiAgICAgICAgICAgICAgdmFyIHJldCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgIHRoaXMuX3N1cGVyID0gdG1wO1xuXG4gICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKG5hbWUsIHByb3BzW25hbWVdKVxuICAgICAgICA6IHByb3BzW25hbWVdO1xuICAgIH1cblxuICAgIC8vIFRoZSBuZXcgY29uc3RydWN0b3JcbiAgICB2YXIgbmV3Q2xhc3MgPSB0eXBlb2YgcHJvdG8uaW5pdCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IHByb3RvLmhhc093blByb3BlcnR5KFwiaW5pdFwiKVxuICAgICAgICA/IHByb3RvLmluaXQgLy8gQWxsIGNvbnN0cnVjdGlvbiBpcyBhY3R1YWxseSBkb25lIGluIHRoZSBpbml0IG1ldGhvZFxuICAgICAgICA6IGZ1bmN0aW9uIFN1YkNsYXNzKCl7IF9zdXBlci5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cbiAgICAgIDogZnVuY3Rpb24gRW1wdHlDbGFzcygpe307XG5cbiAgICAvLyBQb3B1bGF0ZSBvdXIgY29uc3RydWN0ZWQgcHJvdG90eXBlIG9iamVjdFxuICAgIG5ld0NsYXNzLnByb3RvdHlwZSA9IHByb3RvO1xuXG4gICAgLy8gRW5mb3JjZSB0aGUgY29uc3RydWN0b3IgdG8gYmUgd2hhdCB3ZSBleHBlY3RcbiAgICBwcm90by5jb25zdHJ1Y3RvciA9IG5ld0NsYXNzO1xuXG4gICAgLy8gQW5kIG1ha2UgdGhpcyBjbGFzcyBleHRlbmRhYmxlXG4gICAgbmV3Q2xhc3MuZXh0ZW5kID0gQmFzZUNsYXNzLmV4dGVuZDtcblxuICAgIHJldHVybiBuZXdDbGFzcztcbiAgfTtcblxuICAvLyBleHBvcnRcbiAgZ2xvYmFsLkNsYXNzID0gQmFzZUNsYXNzO1xufSkodGhpcyk7XG4iLCJ2YXIgQmFzZUNvbnRyb2xsZXIgPSBDbGFzcy5leHRlbmQoe1xuICAgIHNjb3BlOiBudWxsLFxuXG4gICAgaW5pdDpmdW5jdGlvbihzY29wZSl7XG5cdHRoaXMuJHNjb3BlID0gc2NvcGU7XG5cdHRoaXMuZGVmaW5lTGlzdGVuZXJzKCk7XG5cdHRoaXMuZGVmaW5lU2NvcGUoKTtcbiAgICB9LFxuXG4gICAgZGVmaW5lTGlzdGVuZXJzOiBmdW5jdGlvbigpe1xuXHR0aGlzLiRzY29wZS4kb24oJyRkZXN0cm95Jyx0aGlzLmRlc3Ryb3kuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuXG4gICAgZGVmaW5lU2NvcGU6IGZ1bmN0aW9uKCl7XG5cdC8vT1ZFUlJJREVcbiAgICB9LFxuXG5cbiAgICBkZXN0cm95OmZ1bmN0aW9uKGV2ZW50KXtcblx0Ly9PVkVSUklERVxuICAgIH1cbn0pO1xuXG5CYXNlQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnXTtcbiIsInZhciBCYXNlRGlyZWN0aXZlID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICBzY29wZTogbnVsbCxcblxuICAgIGluaXQ6ZnVuY3Rpb24oc2NvcGUpe1xuXHR0aGlzLiRzY29wZSA9IHNjb3BlO1xuXHR0aGlzLmRlZmluZUxpc3RlbmVycygpO1xuXHR0aGlzLmRlZmluZVNjb3BlKCk7XG4gICAgfSxcblxuICAgIGRlZmluZUxpc3RlbmVyczogZnVuY3Rpb24oKXtcblx0dGhpcy4kc2NvcGUuJG9uKCckZGVzdHJveScsdGhpcy5kZXN0cm95LmJpbmQodGhpcykpO1xuICAgIH0sXG5cblxuICAgIGRlZmluZVNjb3BlOiBmdW5jdGlvbigpe1xuXHQvL09WRVJSSURFXG4gICAgfSxcblxuXG4gICAgZGVzdHJveTpmdW5jdGlvbihldmVudCl7XG5cdC8vT1ZFUlJJREVcbiAgICB9XG59KTtcblxuQmFzZURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckc2NvcGUnXTtcbiIsIi8qKlxuKiBFdmVudCBkaXNwYXRjaGVyIGNsYXNzLFxuKiBhZGQgYWJpbGl0eSB0byBkaXNwYXRjaCBldmVudFxuKiBvbiBuYXRpdmUgY2xhc3Nlcy5cbipcbiogVXNlIG9mIENsYXNzLmpzXG4qXG4qIEBhdXRob3IgdW5pdmVyc2FsbWluZC5jb21cbiovXG52YXIgRXZlbnREaXNwYXRjaGVyID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICBfbGlzdGVuZXJzOnt9LFxuXG4gICAgLyoqXG4gICAgKiBBZGQgYSBsaXN0ZW5lciBvbiB0aGUgb2JqZWN0XG4gICAgKiBAcGFyYW0gdHlwZSA6IEV2ZW50IHR5cGVcbiAgICAqIEBwYXJhbSBsaXN0ZW5lciA6IExpc3RlbmVyIGNhbGxiYWNrXG4gICAgKi8gIFxuICAgIGFkZEV2ZW50TGlzdGVuZXI6ZnVuY3Rpb24odHlwZSxsaXN0ZW5lcil7XG4gICAgICAgIGlmKCF0aGlzLl9saXN0ZW5lcnNbdHlwZV0pe1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnB1c2gobGlzdGVuZXIpXG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICAgKiBSZW1vdmUgYSBsaXN0ZW5lciBvbiB0aGUgb2JqZWN0XG4gICAgICAgKiBAcGFyYW0gdHlwZSA6IEV2ZW50IHR5cGVcbiAgICAgICAqIEBwYXJhbSBsaXN0ZW5lciA6IExpc3RlbmVyIGNhbGxiYWNrXG4gICAgICAgKi8gIFxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6ZnVuY3Rpb24odHlwZSxsaXN0ZW5lcil7XG4gICAgICBpZih0aGlzLl9saXN0ZW5lcnNbdHlwZV0pe1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9saXN0ZW5lcnNbdHlwZV0uaW5kZXhPZihsaXN0ZW5lcik7XG5cbiAgICAgICAgaWYoaW5kZXghPT0tMSl7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0uc3BsaWNlKGluZGV4LDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgKiBEaXNwYXRjaCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lclxuICAgICogQHBhcmFtIE11dGlwbGUgcGFyYW1zIGF2YWlsYWJsZSwgZmlyc3QgbXVzdCBiZSBzdHJpbmdcbiAgICAqLyBcbiAgICBkaXNwYXRjaEV2ZW50OmZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBsaXN0ZW5lcnM7XG5cbiAgICAgICAgaWYodHlwZW9mIGFyZ3VtZW50c1swXSAhPT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdFdmVudERpc3BhdGNoZXInLCdGaXJzdCBwYXJhbXMgbXVzdCBiZSBhbiBldmVudCB0eXBlIChTdHJpbmcpJylcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbYXJndW1lbnRzWzBdXTtcblxuICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gbGlzdGVuZXJzKXtcbiAgICAgICAgICAgICAgICAvL1RoaXMgY291bGQgdXNlIC5hcHBseShhcmd1bWVudHMpIGluc3RlYWQsIGJ1dCB0aGVyZSBpcyBjdXJyZW50bHkgYSBidWcgd2l0aCBpdC5cbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNba2V5XShhcmd1bWVudHNbMF0sYXJndW1lbnRzWzFdLGFyZ3VtZW50c1syXSxhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSlcblxuXG4iLCIvKipcbiogU2ltcGxlIG5hbWVzcGFjZSB1dGlsIHRvIGV4dGFuZCBDbGFzcy5qcyBmdW5jdGlvbmFsaXR5XG4qIGFuZCB3cmFwIGNsYXNzZXMgaW4gbmFtZXNwYWNlLlxuKiBAYXV0aG9yIHRvbW15LnJvY2hldHRlW2ZvbGxvd2VkIGJ5IHRoZSB1c3VhbCBzaWduXXVuaXZlcnNhbG1pbmQuY29tXG4qIEB0eXBlIHsqfVxuKiBAcmV0dXJuIE9iamVjdFxuKi9cbndpbmRvdy5uYW1lc3BhY2UgPSBmdW5jdGlvbihuYW1lc3BhY2VzKXtcbiAgICd1c2Ugc3RyaWN0JztcbiAgIHZhciBuYW1lcyA9IG5hbWVzcGFjZXMuc3BsaXQoJy4nKTtcbiAgIHZhciBsYXN0ICA9IHdpbmRvdztcbiAgIHZhciBuYW1lICA9IG51bGw7XG4gICB2YXIgaSAgICAgPSBudWxsO1xuXG4gICBmb3IoaSBpbiBuYW1lcyl7XG4gICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuXG4gICAgICAgaWYobGFzdFtuYW1lXT09PXVuZGVmaW5lZCl7XG4gICAgICAgICAgIGxhc3RbbmFtZV0gPSB7fTtcbiAgICAgICB9XG5cbiAgICAgICBsYXN0ID0gbGFzdFtuYW1lXTtcbiAgIH1cbiAgIHJldHVybiBsYXN0O1xufTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAndXNlIHN0cmljdCc7XG4gICAvKipcblx0ICogQ3JlYXRlIGEgZ2xvYmFsIGV2ZW50IGRpc3BhdGNoZXJcblx0ICogdGhhdCBjYW4gYmUgaW5qZWN0ZWQgYWNjcm9zcyBtdWx0aXBsZSBjb21wb25lbnRzXG5cdCAqIGluc2lkZSB0aGUgYXBwbGljYXRpb25cblx0ICpcblx0ICogVXNlIG9mIENsYXNzLmpzXG5cdCAqIEB0eXBlIHtjbGFzc31cblx0ICogQGF1dGhvciB1bml2ZXJzYWxtaW5kLmNvbVxuXHQgKi9cbiAgIHZhciBOb3RpZmljYXRpb25zUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXG4gICAgICAgaW5zdGFuY2U6IG5ldyBFdmVudERpc3BhdGNoZXIoKSxcblxuICAgICAgIC8qKlxuICAgICAgICAqIENvbmZpZ3VyZXMgYW5kIHJldHVybnMgaW5zdGFuY2Ugb2YgR2xvYmFsRXZlbnRCdXMuXG4gICAgICAgICpcbiAgICAgICAgKiBAcmV0dXJuIHtHbG9iYWxFdmVudEJ1c31cbiAgICAgICAgKi9cbiAgICAgICAkZ2V0OiBbZnVuY3Rpb24gKCkge1xuICAgICAgIFx0ICAgdGhpcy5pbnN0YW5jZS5ub3RpZnkgPSB0aGlzLmluc3RhbmNlLmRpc3BhdGNoRXZlbnQ7XG4gICAgICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuICAgICAgIH1dXG4gICB9KTtcblxuICAgYW5ndWxhci5tb2R1bGUoJ25vdGlmaWNhdGlvbnMnLCBbXSlcbiAgICAgICAucHJvdmlkZXIoJ05vdGlmaWNhdGlvbnMnLCBOb3RpZmljYXRpb25zUHJvdmlkZXIpO1xufSgpKTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdwbGF5ZmFiJywgW1xuICAgICdub3RpZmljYXRpb25zJyxcblxuICAgICduYXZiYXInLFxuXG4gICAgLy9Vc2VyXG4gICAgJ3VzZXJzLlVzZXJNb2RlbCcsXG4gICAgJ3VzZXJzLlVzZXJTZXJ2aWNlJyxcblxuICAgIC8vQ29uZmlnXG4gICAgJ2R1eHRlci5Db25maWdNb2RlbCcsXG5cbiAgICAvKlxuICAgICAvL0FydGljbGVzXG4gICAgICdhcnRpY2xlcy5BcnRpY2xlTW9kZWwnLFxuICAgICAnYXJ0aWNsZXMuQXJ0aWNsZVNlcnZpY2UnLFxuICAgICAnYXJ0aWNsZXMuYXJ0aWNsZUxpc3QnLFxuICAgICAnYXJ0aWNsZXMuYXJ0aWNsZUxpc3RJdGVtJyxcblxuICAgICAvL0NvbW1lbnRzXG4gICAgICdjb21tZW50cy5Db21tZW50TW9kZWwnLFxuICAgICAnY29tbWVudHMuQ29tbWVudFNlcnZpY2UnLFxuICAgICAnY29tbWVudHMuY29tbWVudExpc3QnLFxuICAgICAnY29tbWVudHMuY29tbWVudExpc3RJdGVtJyxcbiAgICAgKi9cblxuICAgICd1aS5yb3V0ZXInLFxuICAgICduZ0Nvb2tpZXMnLFxuICAgICduZ0FuaW1hdGUnXG5cbl0pLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgLy9cbiAgICAvLyBGb3IgYW55IHVubWF0Y2hlZCB1cmwsIHJlZGlyZWN0IHRvIC9zdGF0ZTFcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL2d5bS9tYXBcIik7XG4gICAgLy9cbiAgICAvLyBOb3cgc2V0IHVwIHRoZSBzdGF0ZXNcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2d5bU1hcCcsIHtcbiAgICAgICAgICAgIHVybDogXCIvZ3ltL21hcFwiLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvZ3ltL21hcC9tYXAuaHRtbFwiLFxuICAgICAgICAgICAgY29udHJvbGxlcjogR3ltTWFwQ29udHJvbGxlclxuXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgndXNlclNldHRpbmdzJywge1xuICAgICAgICAgICAgdXJsOiBcIi91c2Vycy86aWQvc2V0dGluZ3NcIixcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3NldHRpbmdzUGFnZS5odG1sXCJcbiAgICAgICAgfSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0Jztcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLkNPTkZJR19MT0FERUQgPSBcIkFjdGl2aXR5TW9kZWwuQ09ORklHX0xPQURFRFwiO1xuXG52YXIgQ29uZmlnTW9kZWwgPSBFdmVudERpc3BhdGNoZXIuZXh0ZW5kKHtcbiAgICBub3RpZmljYXRpb25zOiBudWxsLFxuICAgIGNvbmZpZzogbnVsbFxuXG59KTtcblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIENvbmZpZ01vZGVsUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IENvbmZpZ01vZGVsKCksXG5cblx0JGdldDogZnVuY3Rpb24oIE5vdGlmaWNhdGlvbnMsICRjb29raWVzLCAkaHR0cCl7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS4kY29va2llcyA9ICRjb29raWVzO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5jb25maWcgPSB7XG4gICAgICAgICAgICAgICAgYmFzZVVSTDogXCJodHRwOi8vcGxheWZhYi1zdGFnaW5nLmR1eGFwaS5jb21cIlxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy90aGlzLmluc3RhbmNlLmN1cnJlbnRVc2VyID0gSlNPTi5wYXJzZSgkY29va2llcy5jdXJyZW50VXNlcik7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2R1eHRlci5Db25maWdNb2RlbCcsW10pXG5cdC5wcm92aWRlcignQ29uZmlnTW9kZWwnLCBDb25maWdNb2RlbFByb3ZpZGVyKTtcbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5HQU1FX0xPQURFRCA9IFwiQWN0aXZpdHlNb2RlbC5HQU1FX0xPQURFRFwiO1xuXG52YXIgR2FtZU1vZGVsID0gRXZlbnREaXNwYXRjaGVyLmV4dGVuZCh7XG4gICAgZ2FtZToge1xuICAgICAgICBpbWFnZTogXCJpbWFnZXMvdW5pY29ybi5wbmdcIixcbiAgICAgICAgdGl0bGU6IFwiVU5JQ09STiBCQVRUTEVcIlxuICAgIH0sXG5cbiAgICBub3RpZmljYXRpb25zOiBudWxsLFxuICAgIGdhbWVTZXJ2aWNlOiBudWxsLFxuXG4gICAgZ2V0R2FtZUJ5SWQ6IGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzLkdhbWVTZXJ2aWNlLmdldEdhbWVCeUlkKGlkKTtcbiAgICB9XG5cbn0pO1xuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgR2FtZU1vZGVsUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IEdhbWVNb2RlbCgpLFxuXG5cdCRnZXQ6IGZ1bmN0aW9uKCBOb3RpZmljYXRpb25zLCBHYW1lU2VydmljZSl7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5nYW1lU2VydmljZSA9IEdhbWVTZXJ2aWNlO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdnYW1lcy5HYW1lTW9kZWwnLFtdKVxuXHQucHJvdmlkZXIoJ0dhbWVNb2RlbCcsIEdhbWVNb2RlbFByb3ZpZGVyKTtcbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLlVTRVJfU0lHTkVEX0lOID0gXCJBY3Rpdml0eU1vZGVsLlVTRVJfU0lHTkVEX0lOXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5VU0VSX1NJR05FRF9PVVQgPSBcIkFjdGl2aXR5TW9kZWwuVVNFUl9TSUdORURfT1VUXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5VU0VSX1VQREFURUQgPSBcIkFjdGl2aXR5TW9kZWwuVVNFUl9VUERBVEVEXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5QUk9GSUxFX0xPQURFRCA9IFwiQWN0aXZpdHlNb2RlbC5QUk9GSUxFX0xPQURFRFwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuQVVUSF9FUlJPUiA9IFwiQWN0aXZpdHlNb2RlbC5BVVRIX0VSUk9SXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5ORVRXT1JLX0VSUk9SID0gXCJBY3Rpdml0eU1vZGVsLk5FVFdPUktfRVJST1JcIjtcblxudmFyIFVzZXJNb2RlbCA9IEV2ZW50RGlzcGF0Y2hlci5leHRlbmQoe1xuICAgIGN1cnJlbnRVc2VyOiBudWxsLFxuXG4gICAgVXNlclNlcnZpY2U6bnVsbCxcbiAgICBub3RpZmljYXRpb25zOiBudWxsLFxuXG4gICAgc2lnbkluOiBmdW5jdGlvbihlbWFpbCwgcGFzc3dvcmQpe1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuVXNlclNlcnZpY2Uuc2lnbkluKGVtYWlsLCBwYXNzd29yZCk7XG4gICAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VXNlciA9IHJlc3VsdHMuZGF0YS51c2VyO1xuICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLm5vdGlmeShtb2RlbHMuZXZlbnRzLlVTRVJfU0lHTkVEX0lOKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCBmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgaWYoZXJyb3IuZGF0YSl7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLm5vdGlmeShtb2RlbHMuZXZlbnRzLkFVVEhfRVJST1IsIGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLm5vdGlmeShtb2RlbHMuZXZlbnRzLk5FVFdPUktfRVJST1IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG5cblxuXG4gICAgICAgIC8qXG4gICAgICAgIHZhciB1c2VyID0ge1xuICAgICAgICAgICAgbmFtZTogXCJ0YWNvXCIsXG4gICAgICAgICAgICBhZ2U6IDM1XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy4kY29va2llcy5jdXJyZW50VXNlciA9IEpTT04uc3RyaW5naWZ5KHVzZXIpO1xuICAgICAgICAgKi9cbiAgICB9LFxuXG4gICAgc2lnbk91dDogZnVuY3Rpb24oKXtcbiAgICAgICAgLy90aGlzLlVzZXJTZXJ2aWNlLnNpZ25PdXQoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlVXNlcjogZnVuY3Rpb24odXNlcil7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcy5Vc2VyU2VydmljZS51cGRhdGVVc2VyKHVzZXIpO1xuICAgICAgICAvL3Byb21pc2UudGhlblxuICAgIH1cblxufSk7XG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBVc2VyTW9kZWxQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgVXNlck1vZGVsKCksXG5cblx0JGdldDogZnVuY3Rpb24oVXNlclNlcnZpY2UsIE5vdGlmaWNhdGlvbnMsICRjb29raWVzKXtcblx0ICAgIHRoaXMuaW5zdGFuY2UuVXNlclNlcnZpY2UgPSBVc2VyU2VydmljZTtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLiRjb29raWVzID0gJGNvb2tpZXM7XG4gICAgICAgICAgICAvL3RoaXMuaW5zdGFuY2UuY3VycmVudFVzZXIgPSBKU09OLnBhcnNlKCRjb29raWVzLmN1cnJlbnRVc2VyKTtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgndXNlcnMuVXNlck1vZGVsJyxbXSlcblx0LnByb3ZpZGVyKCdVc2VyTW9kZWwnLCBVc2VyTW9kZWxQcm92aWRlcik7XG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR2FtZVNlcnZpY2UgPSBDbGFzcy5leHRlbmQoe1xuICAgICRodHRwOiBudWxsLFxuXG4gICAgZ2V0R2FtZUJ5SWQ6IGZ1bmN0aW9uKGlkKXtcblxuICAgIH1cblxufSk7XG5cblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIEdhbWVTZXJ2aWNlUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IEdhbWVTZXJ2aWNlKCksXG5cdCRnZXQ6IGZ1bmN0aW9uKCRodHRwKXtcblx0ICAgIHRoaXMuaW5zdGFuY2UuJGh0dHAgPSAkaHR0cDtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnZ2FtZXMuR2FtZVNlcnZpY2UnLFtdKVxuXHQucHJvdmlkZXIoJ0dhbWVTZXJ2aWNlJywgR2FtZVNlcnZpY2VQcm92aWRlcik7XG59KCkpO1xuIiwiLypcclxuKiByd2RJbWFnZU1hcHMgalF1ZXJ5IHBsdWdpbiB2MS41XHJcbipcclxuKiBBbGxvd3MgaW1hZ2UgbWFwcyB0byBiZSB1c2VkIGluIGEgcmVzcG9uc2l2ZSBkZXNpZ24gYnkgcmVjYWxjdWxhdGluZyB0aGUgYXJlYSBjb29yZGluYXRlcyB0byBtYXRjaCB0aGUgYWN0dWFsIGltYWdlIHNpemUgb24gbG9hZCBhbmQgd2luZG93LnJlc2l6ZVxyXG4qXHJcbiogQ29weXJpZ2h0IChjKSAyMDEzIE1hdHQgU3Rvd1xyXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9zdG93YmFsbC9qUXVlcnktcndkSW1hZ2VNYXBzXHJcbiogaHR0cDovL21hdHRzdG93LmNvbVxyXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4qL1xyXG47KGZ1bmN0aW9uKGEpe2EuZm4ucndkSW1hZ2VNYXBzPWZ1bmN0aW9uKCl7dmFyIGM9dGhpczt2YXIgYj1mdW5jdGlvbigpe2MuZWFjaChmdW5jdGlvbigpe2lmKHR5cGVvZihhKHRoaXMpLmF0dHIoXCJ1c2VtYXBcIikpPT1cInVuZGVmaW5lZFwiKXtyZXR1cm59dmFyIGU9dGhpcyxkPWEoZSk7YShcIjxpbWcgLz5cIikubG9hZChmdW5jdGlvbigpe3ZhciBnPVwid2lkdGhcIixtPVwiaGVpZ2h0XCIsbj1kLmF0dHIoZyksaj1kLmF0dHIobSk7aWYoIW58fCFqKXt2YXIgbz1uZXcgSW1hZ2UoKTtvLnNyYz1kLmF0dHIoXCJzcmNcIik7aWYoIW4pe249by53aWR0aH1pZighail7aj1vLmhlaWdodH19dmFyIGY9ZC53aWR0aCgpLzEwMCxrPWQuaGVpZ2h0KCkvMTAwLGk9ZC5hdHRyKFwidXNlbWFwXCIpLnJlcGxhY2UoXCIjXCIsXCJcIiksbD1cImNvb3Jkc1wiO2EoJ21hcFtuYW1lPVwiJytpKydcIl0nKS5maW5kKFwiYXJlYVwiKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9YSh0aGlzKTtpZighci5kYXRhKGwpKXtyLmRhdGEobCxyLmF0dHIobCkpfXZhciBxPXIuZGF0YShsKS5zcGxpdChcIixcIikscD1uZXcgQXJyYXkocS5sZW5ndGgpO2Zvcih2YXIgaD0wO2g8cC5sZW5ndGg7KytoKXtpZihoJTI9PT0wKXtwW2hdPXBhcnNlSW50KCgocVtoXS9uKSoxMDApKmYpfWVsc2V7cFtoXT1wYXJzZUludCgoKHFbaF0vaikqMTAwKSprKX19ci5hdHRyKGwscC50b1N0cmluZygpKX0pfSkuYXR0cihcInNyY1wiLGQuYXR0cihcInNyY1wiKSl9KX07YSh3aW5kb3cpLnJlc2l6ZShiKS50cmlnZ2VyKFwicmVzaXplXCIpO3JldHVybiB0aGlzfX0pKGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVXNlclNlcnZpY2UgPSBDbGFzcy5leHRlbmQoe1xuICAgICRodHRwOiBudWxsLFxuICAgIGNvbmZpZ01vZGVsOiBudWxsLFxuXG4gICAgc2lnbkluOiBmdW5jdGlvbihlbWFpbCwgcGFzc3dvcmQpe1xuICAgICAgICB2YXIgdXJsID0gdGhpcy5jb25maWdNb2RlbC5jb25maWcuYmFzZVVSTCArIFwiL2xvZ2luL3BsYXlmYWJcIjtcbiAgICAgICAgdmFyIHJlcSA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6ICB7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhyZXEpO1xuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChyZXEpO1xuICAgIH0sXG5cbiAgICBzaWduT3V0OiBmdW5jdGlvbigpe1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZVVzZXI6IGZ1bmN0aW9uKHVzZXIpe1xuXG4gICAgfVxuXG59KTtcblxuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgVXNlclNlcnZpY2VQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgVXNlclNlcnZpY2UoKSxcblx0JGdldDogZnVuY3Rpb24oJGh0dHAsICRjb29raWVzLCBDb25maWdNb2RlbCl7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmNvbmZpZ01vZGVsID0gQ29uZmlnTW9kZWw7XG5cdCAgICB0aGlzLmluc3RhbmNlLiRodHRwID0gJGh0dHA7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ3VzZXJzLlVzZXJTZXJ2aWNlJyxbXSlcblx0LnByb3ZpZGVyKCdVc2VyU2VydmljZScsIFVzZXJTZXJ2aWNlUHJvdmlkZXIpO1xufSgpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE5hdkJhckRpcmVjdGl2ZSA9IEJhc2VEaXJlY3RpdmUuZXh0ZW5kKHtcbiAgICB1c2VyTW9kZWw6IG51bGwsXG4gICAgbm90aWZpY2F0aW9uczogbnVsbCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCRzY29wZSwgVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKXtcbiAgICAgICAgdGhpcy51c2VyTW9kZWwgPSBVc2VyTW9kZWw7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgICAgIHRoaXMuX3N1cGVyKCRzY29wZSk7XG4gICAgfSxcblxuICAgIGRlZmluZUxpc3RlbmVyczogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLmFkZEV2ZW50TGlzdGVuZXIobW9kZWxzLmV2ZW50cy5VU0VSX1NJR05FRF9JTiwgdGhpcy5oYW5kbGVVc2VyU2lnbmVkSW4uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuJHNjb3BlLmxvZ291dCA9IHRoaXMubG9nb3V0LmJpbmQodGhpcyk7XG4gICAgfSxcblxuICAgIGRlZmluZVNjb3BlOiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLm5hdlNob3dpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFVzZXIgPSB0aGlzLnVzZXJNb2RlbC5jdXJyZW50VXNlcjtcbiAgICAgICAgdGhpcy5pbml0TmF2KCk7XG4gICAgfSxcblxuICAgIGluaXROYXY6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtb2JpbGVNZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJqcy1tb2JpbGUtbWVudVwiKTtcbiAgICAgICAgdmFyIG5hdk1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpzLW5hdmlnYXRpb24tbWVudVwiKTtcbiAgICAgICAgbmF2TWVudS5jbGFzc05hbWUgPSBuYXZNZW51LmNsYXNzTmFtZS5yZXBsYWNlKC9cXGJzaG93XFxiLywnJyk7XG4gICAgICAgIG1vYmlsZU1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZih0aGlzLm5hdlNob3dpbmcpe1xuICAgICAgICAgICAgICAgIG5hdk1lbnUuY2xhc3NOYW1lID0gbmF2TWVudS5jbGFzc05hbWUucmVwbGFjZSgvXFxic2hvd1xcYi8sJycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuYXZNZW51LmNsYXNzTmFtZSA9IG5hdk1lbnUuY2xhc3NOYW1lICsgXCIgc2hvd1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5uYXZTaG93aW5nID0gIXRoaXMubmF2U2hvd2luZztcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLnVzZXJNb2RlbC5sb2dvdXQoKTtcbiAgICAgICAgdGhpcy4kbG9jYXRpb24udXJsKFwiL1wiKTtcbiAgICB9LFxuXG4gICAgLyoqIEVWRU5UIEhBTkRMRVJTICoqL1xuICAgIGhhbmRsZVVzZXJTaWduZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFVzZXIgPSB0aGlzLnVzZXJNb2RlbC5jdXJyZW50VXNlcjtcbiAgICB9XG5cbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmF2YmFyJyxbXSlcbiAgICAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbihVc2VyTW9kZWwsIE5vdGlmaWNhdGlvbnMpe1xuXHRyZXR1cm4ge1xuXHQgICAgcmVzdHJpY3Q6J0UnLFxuXHQgICAgaXNvbGF0ZTp0cnVlLFxuXHQgICAgbGluazogZnVuY3Rpb24oJHNjb3BlKXtcblx0XHRuZXcgTmF2QmFyRGlyZWN0aXZlKCRzY29wZSwgVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKTtcblx0ICAgIH0sXG5cdCAgICBzY29wZTp0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvbmF2YmFyL25hdmJhci5odG1sXCJcblx0fTtcbiAgICB9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEd5bU1hcENvbnRyb2xsZXIgPSBCYXNlQ29udHJvbGxlci5leHRlbmQoe1xuICAgIG5vdGlmaWNhdGlvbnM6bnVsbCxcbiAgICByb290Q2FudmFzOm51bGwsXG4gICAgcm9vdEltYWdlOm51bGwsXG5cbiAgICBpbml0OmZ1bmN0aW9uKCRzY29wZSwgTm90aWZpY2F0aW9ucyl7XG5cdCAgIHRoaXMubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG5cdCAgIHRoaXMuX3N1cGVyKCRzY29wZSk7XG4gICAgfSxcblxuICAgIGRlZmluZUxpc3RlbmVyczpmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICB0aGlzLiRzY29wZS5hcmVhQ2xpY2tlZCA9IHRoaXMuYXJlYUNsaWNrZWQuYmluZCh0aGlzKTtcbiAgICAgICAgd2luZG93Lm9ucmVzaXplID0gdGhpcy5vblJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVTY29wZTpmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhhdC5yb290SW1hZ2UgPSAkKCcuaW1hZ2VMYXllciBpbWcnKS5vbignbG9hZC5vbWdtYXBzJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICQodGhpcykucndkSW1hZ2VNYXBzKCk7XG4gICAgICAgICAgICAgICAgdGhhdC5oaWdobGlnaHRNYXAoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pLmNzcygnb3BhY2l0eScsJzAnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkb25lXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBkZXN0cm95OmZ1bmN0aW9uKCl7XG4gICAgICAgICQoJ2FyZWEnKS5vZmYoJy5vbWdtYXBzJyk7XG4gICAgICAgICQoJ2ltZycpLm9mZignLm9tZ21hcHMnKTtcbiAgICB9LFxuXG5cbiAgICBhcmVhQ2xpY2tlZDogZnVuY3Rpb24oKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJSQ0hcIik7XG4gICAgfSxcbiAgICBcbiAgICBjcmVhdGVSb290Q2FudmFzOmZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpbWFnZSA9IHRoaXMucm9vdEltYWdlLFxuICAgICAgICAgICAgaW1nV2lkdGggPSBpbWFnZS53aWR0aCgpLFxuICAgICAgICAgICAgaW1nSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0KCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJvb3RDYW52YXMgPSAkKCc8Y2FudmFzPicpLmF0dHIoJ3dpZHRoJyxpbWdXaWR0aCkuYXR0cignaGVpZ2h0JyxpbWdIZWlnaHQpO1xuICAgICAgICB0aGlzLnJvb3RDYW52YXMuY3NzKHtcbiAgICAgICAgICAgIHBvc2l0aW9uOidhYnNvbHV0ZScsXG4gICAgICAgICAgICB0b3A6JzBweCcsXG4gICAgICAgICAgICBsZWZ0OicwcHgnLFxuICAgICAgICAgICAgaGVpZ2h0OidhdXRvJ1xuICAgICAgICB9KTtcbiAgICAgICAgaW1hZ2UuYmVmb3JlKHRoaXMucm9vdENhbnZhcyk7XG4gICAgICAgIHZhciBjdHggPSB0aGlzLnJvb3RDYW52YXMuZ2V0KDApLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UuZ2V0KDApLDAsMCxpbWdXaWR0aCwgaW1nSGVpZ2h0KTtcbiAgICB9LFxuICAgIFxuICAgIHJlZHJhd1Jvb3RDYW52YXM6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpbWFnZSA9IHRoaXMucm9vdEltYWdlLFxuICAgICAgICAgICAgaW1nV2lkdGggPSBpbWFnZS53aWR0aCgpLFxuICAgICAgICAgICAgaW1nSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0KCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5yb290Q2FudmFzLmdldCgwKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMucm9vdENhbnZhcy5nZXQoMCkud2lkdGgsIHRoaXMucm9vdENhbnZhcy5nZXQoMCkud2lkdGgpO1xuXG4gICAgICAgIHRoaXMucm9vdENhbnZhcy5hdHRyKCd3aWR0aCcsaW1nV2lkdGgpLmF0dHIoJ2hlaWdodCcsaW1nSGVpZ2h0KTtcblxuICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLmdldCgwKSwwLDAsaW1hZ2Uud2lkdGgoKSwgaW1hZ2UuaGVpZ2h0KCkpO1xuICAgIH0sXG5cbiAgICBoaWdobGlnaHRNYXA6IGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICB2YXIgYm9keSA9ICQoJ2JvZHknKSxcbiAgICAgICAgICAgIGNvbnRlbnRBcmVhID0gJCgnLm1hcENvbnRlbnQnKSxcbiAgICAgICAgICAgIG1hcCA9ICQoXCIjZ3ltTWFwXCIpLFxuICAgICAgICAgICAgbWFwRWwgPSAkKFwiI2d5bU1hcFwiKS5nZXQoMCksXG4gICAgICAgICAgICBtYXBBcmVhcyA9IG1hcC5maW5kKCdhcmVhJyksXG4gICAgICAgICAgICBpbWFnZSA9IHRoaXMucm9vdEltYWdlLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBnZXQgdGhlIHdpZHRoIGFuZCBoZWlnaHQgZnJvbSB0aGUgaW1hZ2UgdGFnXG4gICAgICAgICAgICBpbWdXaWR0aCA9IGltYWdlLndpZHRoKCksXG4gICAgICAgICAgICBpbWdIZWlnaHQgPSBpbWFnZS5oZWlnaHQoKSxcbiAgICAgICAgICAgIGltZ0F0dHJXaWR0aCA9IGltYWdlLmF0dHIoJ3dpZHRoJyksXG4gICAgICAgICAgICBpbWdBdHRySGVpZ2h0ID0gaW1hZ2UuYXR0cignaGVpZ2h0JyksXG4gICAgICAgICAgICB4RmFjdG9yID0gcGFyc2VGbG9hdChpbWdXaWR0aC9pbWdBdHRyV2lkdGgpLFxuICAgICAgICAgICAgeUZhY3RvciA9IHBhcnNlRmxvYXQoaW1nSGVpZ2h0L2ltZ0F0dHJIZWlnaHQpO1xuXG4vLyAgICAgICAgY29uc29sZS5sb2coJ2ltZ0F0dHJXaWR0aDogJytpbWdBdHRyV2lkdGgpO1xuLy8gICAgICAgIGNvbnNvbGUubG9nKCdpbWdBdHRySGVpZ2h0OiAnK2ltZ0F0dHJIZWlnaHQpO1xuLy8gICAgICAgIGNvbnNvbGUubG9nKCd4RmFjdG9yOiAnK3hGYWN0b3IpO1xuLy8gICAgICAgIGNvbnNvbGUubG9nKCd5RmFjdG9yOiAnK3lGYWN0b3IpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHZhciByb290Q2FudmFzID0gdGhpcy5jcmVhdGVSb290Q2FudmFzKCk7XG4gICAgICAgIFxuICAgICAgICAkLmVhY2gobWFwQXJlYXMsIGZ1bmN0aW9uKGluZGV4LCBhcmVhKXtcbiAgICAgICAgICAgIHZhciBhcmVhID0gJChhcmVhKTtcbiAgICAgICAgICAgIHZhciBhcmVhRWwgPSBhcmVhLmdldCgwKTtcbiAgICAgICAgICAgIHZhciBjb29yZHMgPSBhcmVhRWwuY29vcmRzLnNwbGl0KFwiLCBcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIG1hcCB0aGUgY29vcmRzIGJlY2F1c2UgdGhleSBhcmUgc2NhbGVkIGZvciB0aGUgaW1hZ2Ugc2l6ZSBhbmQgbm90IHRoZSBvdGhlciBzaXplXG4gICAgICAgICAgICBjb29yZHMgPSBjb29yZHMubWFwKGZ1bmN0aW9uKHZhbHVlLCBpbmRleCl7XG4gICAgICAgICAgICAgICAgaWYoaW5kZXglMiA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIC8vIHggY29vcmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICogeEZhY3RvcjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB5IGNvb3JkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIHlGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIGNhbnZhc1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9ICQoJzxjYW52YXM+JykuYXR0cignd2lkdGgnLGltZ1dpZHRoKS5hdHRyKCdoZWlnaHQnLGltZ0hlaWdodCkuYWRkQ2xhc3MoJ21hcC1vdmVybGF5Jyk7XG4gICAgICAgICAgICBjYW52YXMuY3NzKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjonYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgIHRvcDonMHB4JyxcbiAgICAgICAgICAgICAgICBsZWZ0OicwcHgnLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6JzAuMCcsXG4gICAgICAgICAgICAgICAgZGlzcGxheTonbm9uZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBhdHRhY2ggc2FpZCBjYW52YXMgdG8gRE9NXG4gICAgICAgICAgICBjb250ZW50QXJlYS5maW5kKCdpbWcnKS5iZWZvcmUoY2FudmFzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZ3JhYiB0aGUgY2FudmFzIGNvbnRleHRcbiAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0KDApLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJyNmMDAnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgeCA9IGNvb3Jkc1swXSxcbiAgICAgICAgICAgICAgICB5ID0gY29vcmRzWzFdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKHgsIHkpO1xuICAgICAgICAgICAgZm9yKHZhciBqID0gMixsZW4gPSBjb29yZHMubGVuZ3RoOyBqIDwgbGVuLTEgOyBqICs9IDIgKXtcbiAgICAgICAgICAgICAgICB4ID0gY29vcmRzW2pdO1xuICAgICAgICAgICAgICAgIHkgPSBjb29yZHNbaiArIDFdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICBjdHguZmlsbCgpO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYW4gYXJlYSBtb3VzZWVudGVyIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgICBhcmVhLm9uKCdtb3VzZWVudGVyLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtb3VzZSBlbnRlcicpO1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5hbmltYXRlKHtvcGFjaXR5OicxLjAnfSwyMDAsJ2xpbmVhcicpO1xuLy8gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5hbmltYXRlKHtkaXNwbGF5OidibG9jayd9LDIwMCwnbGluZWFyJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoY2FudmFzKSk7XG5cbiAgICAgICAgICAgIGFyZWEub24oJ21vdXNlbGVhdmUub21nbWFwcycsIChmdW5jdGlvbihjYW52YXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdXNlIGxlYXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5hbmltYXRlKHtvcGFjaXR5OicwLjAnfSwyMDAsJ2xpbmVhcicsZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgICAgICAgICAgICBjYW52YXMuYW5pbWF0ZSh7ZGlzcGxheTonbm9uZSd9LDIwMCwnbGluZWFyJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoY2FudmFzKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFyZWEub24oJ2NsaWNrLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2xpY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KShjYW52YXMpKTtcblxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgfSxcblxuICAgIG9uUmVzaXplOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgaWYodGhpcy5yZXNpemVUaW1lb3V0KXtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2l6ZVRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzaXplVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoYXQucmVzaXplKCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSxcbiAgICBcbiAgICByZXNpemU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc2l6ZScpO1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy5yb290Q2FudmFzKXtcbiAgICAgICAgICAgIHRoaXMucmVkcmF3Um9vdENhbnZhcygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCdjYW52YXMubWFwLW92ZXJsYXknKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBjYW52YXMpe1xuICAgICAgICAgICAgY2FudmFzID0gJChjYW52YXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjYW52YXMuY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoYXQucm9vdEltYWdlLmhlaWdodCgpLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGF0LnJvb3RJbWFnZS53aWR0aCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cbn0pO1xuXG5cbkd5bU1hcENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywnTm90aWZpY2F0aW9ucyddO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9