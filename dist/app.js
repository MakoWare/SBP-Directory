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
    rootCanvas: $('<canvas>'),
    resizeTimeout: null,

    init:function($scope, Notifications){
	this.notifications = Notifications;
	this._super($scope);
    },

    defineListeners:function(){
        this._super();
        this.$scope.areaClicked = this.areaClicked.bind(this);
        
    },

    defineScope:function(){
        var that = this;
        
        $(document).ready(function(e) {
            $(window).on('resize', this.resize.bind(this));
            $('img[usemap]').rwdImageMaps();
            
            $('.imageLayer img').on('load.omgmaps', function(event){
                that.setUpRootCanvas($(this));
                that.highlightMap();
            });
            
            console.log("done");
        }.bind(this));


        
    },

    destroy:function(){
        $('canvas').off('.omgmaps');
        $('.img').off('.omgmaps');
    },


    areaClicked: function(){
        console.log("RCH");
    },
    
    setUpRootCanvas: function(image){
        var imgWidth = image.width(),
            imgHeight = image.height();
        
        this.rootCanvas.attr('width',imgWidth).attr('height',imgHeight);
        this.rootCanvas.css({
            position:'absolute',
            top:'0px',
            left:'0px',
            width:'100%',
            height:'100%',
            display:'none'
        });
        
        // TEST CASE
        this.rootCanvas.css('opacity','0');
        
        this.redrawRootCanvas(image);
        
        image.before(this.rootCanvas);
        this.rootCanvas.fadeIn('slow');
    },
    
    redrawRootCanvas: function(image){
        var ctx = this.rootCanvas.get(0).getContext('2d');
        ctx.clearRect(0, 0, this.rootCanvas.get(0).width, this.rootCanvas.get(0).width);
        
        
        var imgWidth = image.width(),
            imgHeight = image.height();

        this.rootCanvas.attr('width',imgWidth).attr('height',imgHeight);
        
        ctx.drawImage(image.get(0),0,0,image.width(), image.height());
        
        console.log('rootCanvas: '+this.rootCanvas.get(0).width + ', '+this.rootCanvas.get(0).height);
        console.log('draw image: '+image.width() + ', '+image.height());
    },
    
    highlightMap: function(){
        
        var that = this,
            body = $('body'),
            contentArea = $('.mapContent'),
            imageLayer = $('.imageLayer'),
            map = $("#gymMap"),
            mapEl = $("#gymMap").get(0),
            mapAreas = map.find('area'),
            image = $("img[usemap='#gymMap']").css('opacity','0'),
            
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
        
        // set up the image layer css
//        imageLayer.css({
//            width:'100%',
//            height:'auto'
//        });
        
        var rootCanvas = this.rootCanvas;
        
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
            var canvas = $('<canvas>').attr('width',imgWidth).attr('height',imgHeight).attr('id','canvas_'+index).addClass('map-overlay');
            canvas.css({
                position:'absolute',
                top:'0px',
                left:'0px',
                opacity:'0.0',
                display:'none'//,
//                width:rootCanvas.width(),
//                height:rootCanvas.height()//,
//                'z-index':'1'
            });
            
            // attach said canvas to DOM
            imageLayer.find('img').before(canvas);
            
            console.log('create canvas: '+imgWidth+', '+imgHeight);
            // TEST CASE
            canvas.css({opacity:'1', display:'block'});
            
            // grab the canvas context
            var ctx = canvas.get(0).getContext('2d');
            
            ctx.fillStyle = '#f00';
            
            var x = coords[0],
                y = coords[1];
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            if(coords.length>0){
                for(var j = 2,len = coords.length; j < len-1 ; j += 2 ){
                    x = coords[j];
                    y = coords[j + 1];

                    ctx.lineTo(x, y);
                }
            } else {
                console.log('NO COORDS!!');
            }
            
            ctx.closePath();
            ctx.fill();

            // create an area mouseenter event listener
//            area.on('mouseenter.omgmaps', (function(canvas){
//                return function(event){
//                    event.preventDefault();
////                    console.log('mouseenter');
//                    canvas.css('display', 'block');
//                    canvas.animate({opacity:'1.0'},200,'linear');
////                    canvas.animate({display:'block'},200,'linear');
//                }
//            })(canvas));
//
//            area.on('mouseleave.omgmaps', (function(canvas){
//                return function(event){
//                    event.preventDefault();
//                    canvas.animate({opacity:'0.0'},200,'linear',function(){
//                        canvas.css('display', 'none');
//                    });
////                    canvas.animate({display:'none'},200,'linear');
//                }
//            })(canvas));
            
            
//            console.log('ctx');
//            console.log(ctx);
        });
        
    },
    
    // TESt CASE: is canvas blank
    isCanvasBlank:function(canvas){
        var blank = $('<canvas>').get(0);
        blank.width = canvas.width;
        blank.height = canvas.width;

        return canvas.toDataURL() == blank.toDataURL();
    },

    resize: function(){
        var that = this;
        
        if(this.resizeTimeout){
            clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(function(){
            that.doResize();
        }, 200);
        
       
    },
    
    doResize: function(){
        var that = this;
        console.log('do resize');
        
        this.redrawRootCanvas($('.imageLayer img'));
        
        $('canvas.map-overlay').remove();
        this.highlightMap();

    }

});


GymMapController.$inject = ['$scope','Notifications'];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYXNzLmpzIiwiQmFzZUNvbnRyb2xsZXIuanMiLCJCYXNlRGlyZWN0aXZlLmpzIiwiRXZlbnREaXNwYXRjaGVyLmpzIiwiTmFtZXNwYWNlLmpzIiwiTm90aWZpY2F0aW9ucy5qcyIsImFwcC5qcyIsIm1vZGVscy9jb25maWdNb2RlbC5qcyIsIm1vZGVscy9nYW1lTW9kZWwuanMiLCJtb2RlbHMvdXNlck1vZGVsLmpzIiwic2VydmljZXMvZ2FtZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9pbWFnZU1hcC5taW4uanMiLCJzZXJ2aWNlcy91c2VyU2VydmljZS5qcyIsImNvbXBvbmVudHMvbmF2YmFyL25hdmJhckRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvZ3ltL21hcC9neW1NYXBDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKGdsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIGZuVGVzdCA9IC94eXovLnRlc3QoZnVuY3Rpb24oKXt4eXo7fSkgPyAvXFxiX3N1cGVyXFxiLyA6IC8uKi87XG5cbiAgLy8gVGhlIGJhc2UgQ2xhc3MgaW1wbGVtZW50YXRpb24gKGRvZXMgbm90aGluZylcbiAgZnVuY3Rpb24gQmFzZUNsYXNzKCl7fVxuXG4gIC8vIENyZWF0ZSBhIG5ldyBDbGFzcyB0aGF0IGluaGVyaXRzIGZyb20gdGhpcyBjbGFzc1xuICBCYXNlQ2xhc3MuZXh0ZW5kID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgICB2YXIgX3N1cGVyID0gdGhpcy5wcm90b3R5cGU7XG5cbiAgICAvLyBTZXQgdXAgdGhlIHByb3RvdHlwZSB0byBpbmhlcml0IGZyb20gdGhlIGJhc2UgY2xhc3NcbiAgICAvLyAoYnV0IHdpdGhvdXQgcnVubmluZyB0aGUgaW5pdCBjb25zdHJ1Y3RvcilcbiAgICB2YXIgcHJvdG8gPSBPYmplY3QuY3JlYXRlKF9zdXBlcik7XG5cbiAgICAvLyBDb3B5IHRoZSBwcm9wZXJ0aWVzIG92ZXIgb250byB0aGUgbmV3IHByb3RvdHlwZVxuICAgIGZvciAodmFyIG5hbWUgaW4gcHJvcHMpIHtcbiAgICAgIC8vIENoZWNrIGlmIHdlJ3JlIG92ZXJ3cml0aW5nIGFuIGV4aXN0aW5nIGZ1bmN0aW9uXG4gICAgICBwcm90b1tuYW1lXSA9IHR5cGVvZiBwcm9wc1tuYW1lXSA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgIHR5cGVvZiBfc3VwZXJbbmFtZV0gPT0gXCJmdW5jdGlvblwiICYmIGZuVGVzdC50ZXN0KHByb3BzW25hbWVdKVxuICAgICAgICA/IChmdW5jdGlvbihuYW1lLCBmbil7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciB0bXAgPSB0aGlzLl9zdXBlcjtcblxuICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgLl9zdXBlcigpIG1ldGhvZCB0aGF0IGlzIHRoZSBzYW1lIG1ldGhvZFxuICAgICAgICAgICAgICAvLyBidXQgb24gdGhlIHN1cGVyLWNsYXNzXG4gICAgICAgICAgICAgIHRoaXMuX3N1cGVyID0gX3N1cGVyW25hbWVdO1xuXG4gICAgICAgICAgICAgIC8vIFRoZSBtZXRob2Qgb25seSBuZWVkIHRvIGJlIGJvdW5kIHRlbXBvcmFyaWx5LCBzbyB3ZVxuICAgICAgICAgICAgICAvLyByZW1vdmUgaXQgd2hlbiB3ZSdyZSBkb25lIGV4ZWN1dGluZ1xuICAgICAgICAgICAgICB2YXIgcmV0ID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSB0bXA7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkobmFtZSwgcHJvcHNbbmFtZV0pXG4gICAgICAgIDogcHJvcHNbbmFtZV07XG4gICAgfVxuXG4gICAgLy8gVGhlIG5ldyBjb25zdHJ1Y3RvclxuICAgIHZhciBuZXdDbGFzcyA9IHR5cGVvZiBwcm90by5pbml0ID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gcHJvdG8uaGFzT3duUHJvcGVydHkoXCJpbml0XCIpXG4gICAgICAgID8gcHJvdG8uaW5pdCAvLyBBbGwgY29uc3RydWN0aW9uIGlzIGFjdHVhbGx5IGRvbmUgaW4gdGhlIGluaXQgbWV0aG9kXG4gICAgICAgIDogZnVuY3Rpb24gU3ViQ2xhc3MoKXsgX3N1cGVyLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfVxuICAgICAgOiBmdW5jdGlvbiBFbXB0eUNsYXNzKCl7fTtcblxuICAgIC8vIFBvcHVsYXRlIG91ciBjb25zdHJ1Y3RlZCBwcm90b3R5cGUgb2JqZWN0XG4gICAgbmV3Q2xhc3MucHJvdG90eXBlID0gcHJvdG87XG5cbiAgICAvLyBFbmZvcmNlIHRoZSBjb25zdHJ1Y3RvciB0byBiZSB3aGF0IHdlIGV4cGVjdFxuICAgIHByb3RvLmNvbnN0cnVjdG9yID0gbmV3Q2xhc3M7XG5cbiAgICAvLyBBbmQgbWFrZSB0aGlzIGNsYXNzIGV4dGVuZGFibGVcbiAgICBuZXdDbGFzcy5leHRlbmQgPSBCYXNlQ2xhc3MuZXh0ZW5kO1xuXG4gICAgcmV0dXJuIG5ld0NsYXNzO1xuICB9O1xuXG4gIC8vIGV4cG9ydFxuICBnbG9iYWwuQ2xhc3MgPSBCYXNlQ2xhc3M7XG59KSh0aGlzKTtcbiIsInZhciBCYXNlQ29udHJvbGxlciA9IENsYXNzLmV4dGVuZCh7XG4gICAgc2NvcGU6IG51bGwsXG5cbiAgICBpbml0OmZ1bmN0aW9uKHNjb3BlKXtcblx0dGhpcy4kc2NvcGUgPSBzY29wZTtcblx0dGhpcy5kZWZpbmVMaXN0ZW5lcnMoKTtcblx0dGhpcy5kZWZpbmVTY29wZSgpO1xuICAgIH0sXG5cbiAgICBkZWZpbmVMaXN0ZW5lcnM6IGZ1bmN0aW9uKCl7XG5cdHRoaXMuJHNjb3BlLiRvbignJGRlc3Ryb3knLHRoaXMuZGVzdHJveS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG5cbiAgICBkZWZpbmVTY29wZTogZnVuY3Rpb24oKXtcblx0Ly9PVkVSUklERVxuICAgIH0sXG5cblxuICAgIGRlc3Ryb3k6ZnVuY3Rpb24oZXZlbnQpe1xuXHQvL09WRVJSSURFXG4gICAgfVxufSk7XG5cbkJhc2VDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZSddO1xuIiwidmFyIEJhc2VEaXJlY3RpdmUgPSBDbGFzcy5leHRlbmQoe1xuICAgIHNjb3BlOiBudWxsLFxuXG4gICAgaW5pdDpmdW5jdGlvbihzY29wZSl7XG5cdHRoaXMuJHNjb3BlID0gc2NvcGU7XG5cdHRoaXMuZGVmaW5lTGlzdGVuZXJzKCk7XG5cdHRoaXMuZGVmaW5lU2NvcGUoKTtcbiAgICB9LFxuXG4gICAgZGVmaW5lTGlzdGVuZXJzOiBmdW5jdGlvbigpe1xuXHR0aGlzLiRzY29wZS4kb24oJyRkZXN0cm95Jyx0aGlzLmRlc3Ryb3kuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuXG4gICAgZGVmaW5lU2NvcGU6IGZ1bmN0aW9uKCl7XG5cdC8vT1ZFUlJJREVcbiAgICB9LFxuXG5cbiAgICBkZXN0cm95OmZ1bmN0aW9uKGV2ZW50KXtcblx0Ly9PVkVSUklERVxuICAgIH1cbn0pO1xuXG5CYXNlRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRzY29wZSddO1xuIiwiLyoqXG4qIEV2ZW50IGRpc3BhdGNoZXIgY2xhc3MsXG4qIGFkZCBhYmlsaXR5IHRvIGRpc3BhdGNoIGV2ZW50XG4qIG9uIG5hdGl2ZSBjbGFzc2VzLlxuKlxuKiBVc2Ugb2YgQ2xhc3MuanNcbipcbiogQGF1dGhvciB1bml2ZXJzYWxtaW5kLmNvbVxuKi9cbnZhciBFdmVudERpc3BhdGNoZXIgPSBDbGFzcy5leHRlbmQoe1xuICAgIF9saXN0ZW5lcnM6e30sXG5cbiAgICAvKipcbiAgICAqIEFkZCBhIGxpc3RlbmVyIG9uIHRoZSBvYmplY3RcbiAgICAqIEBwYXJhbSB0eXBlIDogRXZlbnQgdHlwZVxuICAgICogQHBhcmFtIGxpc3RlbmVyIDogTGlzdGVuZXIgY2FsbGJhY2tcbiAgICAqLyAgXG4gICAgYWRkRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbih0eXBlLGxpc3RlbmVyKXtcbiAgICAgICAgaWYoIXRoaXMuX2xpc3RlbmVyc1t0eXBlXSl7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ucHVzaChsaXN0ZW5lcilcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgICAqIFJlbW92ZSBhIGxpc3RlbmVyIG9uIHRoZSBvYmplY3RcbiAgICAgICAqIEBwYXJhbSB0eXBlIDogRXZlbnQgdHlwZVxuICAgICAgICogQHBhcmFtIGxpc3RlbmVyIDogTGlzdGVuZXIgY2FsbGJhY2tcbiAgICAgICAqLyAgXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbih0eXBlLGxpc3RlbmVyKXtcbiAgICAgIGlmKHRoaXMuX2xpc3RlbmVyc1t0eXBlXSl7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5pbmRleE9mKGxpc3RlbmVyKTtcblxuICAgICAgICBpZihpbmRleCE9PS0xKXtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5zcGxpY2UoaW5kZXgsMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAqIERpc3BhdGNoIGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGxpc3RlbmVyXG4gICAgKiBAcGFyYW0gTXV0aXBsZSBwYXJhbXMgYXZhaWxhYmxlLCBmaXJzdCBtdXN0IGJlIHN0cmluZ1xuICAgICovIFxuICAgIGRpc3BhdGNoRXZlbnQ6ZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGxpc3RlbmVycztcblxuICAgICAgICBpZih0eXBlb2YgYXJndW1lbnRzWzBdICE9PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0V2ZW50RGlzcGF0Y2hlcicsJ0ZpcnN0IHBhcmFtcyBtdXN0IGJlIGFuIGV2ZW50IHR5cGUgKFN0cmluZyknKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1thcmd1bWVudHNbMF1dO1xuXG4gICAgICAgICAgICBmb3IodmFyIGtleSBpbiBsaXN0ZW5lcnMpe1xuICAgICAgICAgICAgICAgIC8vVGhpcyBjb3VsZCB1c2UgLmFwcGx5KGFyZ3VtZW50cykgaW5zdGVhZCwgYnV0IHRoZXJlIGlzIGN1cnJlbnRseSBhIGJ1ZyB3aXRoIGl0LlxuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1trZXldKGFyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KVxuXG5cbiIsIi8qKlxuKiBTaW1wbGUgbmFtZXNwYWNlIHV0aWwgdG8gZXh0YW5kIENsYXNzLmpzIGZ1bmN0aW9uYWxpdHlcbiogYW5kIHdyYXAgY2xhc3NlcyBpbiBuYW1lc3BhY2UuXG4qIEBhdXRob3IgdG9tbXkucm9jaGV0dGVbZm9sbG93ZWQgYnkgdGhlIHVzdWFsIHNpZ25ddW5pdmVyc2FsbWluZC5jb21cbiogQHR5cGUgeyp9XG4qIEByZXR1cm4gT2JqZWN0XG4qL1xud2luZG93Lm5hbWVzcGFjZSA9IGZ1bmN0aW9uKG5hbWVzcGFjZXMpe1xuICAgJ3VzZSBzdHJpY3QnO1xuICAgdmFyIG5hbWVzID0gbmFtZXNwYWNlcy5zcGxpdCgnLicpO1xuICAgdmFyIGxhc3QgID0gd2luZG93O1xuICAgdmFyIG5hbWUgID0gbnVsbDtcbiAgIHZhciBpICAgICA9IG51bGw7XG5cbiAgIGZvcihpIGluIG5hbWVzKXtcbiAgICAgICBuYW1lID0gbmFtZXNbaV07XG5cbiAgICAgICBpZihsYXN0W25hbWVdPT09dW5kZWZpbmVkKXtcbiAgICAgICAgICAgbGFzdFtuYW1lXSA9IHt9O1xuICAgICAgIH1cblxuICAgICAgIGxhc3QgPSBsYXN0W25hbWVdO1xuICAgfVxuICAgcmV0dXJuIGxhc3Q7XG59O1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICd1c2Ugc3RyaWN0JztcbiAgIC8qKlxuXHQgKiBDcmVhdGUgYSBnbG9iYWwgZXZlbnQgZGlzcGF0Y2hlclxuXHQgKiB0aGF0IGNhbiBiZSBpbmplY3RlZCBhY2Nyb3NzIG11bHRpcGxlIGNvbXBvbmVudHNcblx0ICogaW5zaWRlIHRoZSBhcHBsaWNhdGlvblxuXHQgKlxuXHQgKiBVc2Ugb2YgQ2xhc3MuanNcblx0ICogQHR5cGUge2NsYXNzfVxuXHQgKiBAYXV0aG9yIHVuaXZlcnNhbG1pbmQuY29tXG5cdCAqL1xuICAgdmFyIE5vdGlmaWNhdGlvbnNQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cbiAgICAgICBpbnN0YW5jZTogbmV3IEV2ZW50RGlzcGF0Y2hlcigpLFxuXG4gICAgICAgLyoqXG4gICAgICAgICogQ29uZmlndXJlcyBhbmQgcmV0dXJucyBpbnN0YW5jZSBvZiBHbG9iYWxFdmVudEJ1cy5cbiAgICAgICAgKlxuICAgICAgICAqIEByZXR1cm4ge0dsb2JhbEV2ZW50QnVzfVxuICAgICAgICAqL1xuICAgICAgICRnZXQ6IFtmdW5jdGlvbiAoKSB7XG4gICAgICAgXHQgICB0aGlzLmluc3RhbmNlLm5vdGlmeSA9IHRoaXMuaW5zdGFuY2UuZGlzcGF0Y2hFdmVudDtcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG4gICAgICAgfV1cbiAgIH0pO1xuXG4gICBhbmd1bGFyLm1vZHVsZSgnbm90aWZpY2F0aW9ucycsIFtdKVxuICAgICAgIC5wcm92aWRlcignTm90aWZpY2F0aW9ucycsIE5vdGlmaWNhdGlvbnNQcm92aWRlcik7XG59KCkpOyIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3BsYXlmYWInLCBbXG4gICAgJ25vdGlmaWNhdGlvbnMnLFxuXG4gICAgJ25hdmJhcicsXG5cbiAgICAvL1VzZXJcbiAgICAndXNlcnMuVXNlck1vZGVsJyxcbiAgICAndXNlcnMuVXNlclNlcnZpY2UnLFxuXG4gICAgLy9Db25maWdcbiAgICAnZHV4dGVyLkNvbmZpZ01vZGVsJyxcblxuICAgIC8qXG4gICAgIC8vQXJ0aWNsZXNcbiAgICAgJ2FydGljbGVzLkFydGljbGVNb2RlbCcsXG4gICAgICdhcnRpY2xlcy5BcnRpY2xlU2VydmljZScsXG4gICAgICdhcnRpY2xlcy5hcnRpY2xlTGlzdCcsXG4gICAgICdhcnRpY2xlcy5hcnRpY2xlTGlzdEl0ZW0nLFxuXG4gICAgIC8vQ29tbWVudHNcbiAgICAgJ2NvbW1lbnRzLkNvbW1lbnRNb2RlbCcsXG4gICAgICdjb21tZW50cy5Db21tZW50U2VydmljZScsXG4gICAgICdjb21tZW50cy5jb21tZW50TGlzdCcsXG4gICAgICdjb21tZW50cy5jb21tZW50TGlzdEl0ZW0nLFxuICAgICAqL1xuXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ25nQ29va2llcycsXG4gICAgJ25nQW5pbWF0ZSdcblxuXSkuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAvL1xuICAgIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3N0YXRlMVxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvZ3ltL21hcFwiKTtcbiAgICAvL1xuICAgIC8vIE5vdyBzZXQgdXAgdGhlIHN0YXRlc1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnZ3ltTWFwJywge1xuICAgICAgICAgICAgdXJsOiBcIi9neW0vbWFwXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9neW0vbWFwL21hcC5odG1sXCIsXG4gICAgICAgICAgICBjb250cm9sbGVyOiBHeW1NYXBDb250cm9sbGVyXG5cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCd1c2VyU2V0dGluZ3MnLCB7XG4gICAgICAgICAgICB1cmw6IFwiL3VzZXJzLzppZC9zZXR0aW5nc1wiLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvc2V0dGluZ3NQYWdlLmh0bWxcIlxuICAgICAgICB9KTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuQ09ORklHX0xPQURFRCA9IFwiQWN0aXZpdHlNb2RlbC5DT05GSUdfTE9BREVEXCI7XG5cbnZhciBDb25maWdNb2RlbCA9IEV2ZW50RGlzcGF0Y2hlci5leHRlbmQoe1xuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG4gICAgY29uZmlnOiBudWxsXG5cbn0pO1xuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgQ29uZmlnTW9kZWxQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgQ29uZmlnTW9kZWwoKSxcblxuXHQkZ2V0OiBmdW5jdGlvbiggTm90aWZpY2F0aW9ucywgJGNvb2tpZXMsICRodHRwKXtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLiRjb29raWVzID0gJGNvb2tpZXM7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICBiYXNlVVJMOiBcImh0dHA6Ly9wbGF5ZmFiLXN0YWdpbmcuZHV4YXBpLmNvbVwiXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvL3RoaXMuaW5zdGFuY2UuY3VycmVudFVzZXIgPSBKU09OLnBhcnNlKCRjb29raWVzLmN1cnJlbnRVc2VyKTtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnZHV4dGVyLkNvbmZpZ01vZGVsJyxbXSlcblx0LnByb3ZpZGVyKCdDb25maWdNb2RlbCcsIENvbmZpZ01vZGVsUHJvdmlkZXIpO1xufSgpKTtcbiIsIid1c2Ugc3RyaWN0Jztcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLkdBTUVfTE9BREVEID0gXCJBY3Rpdml0eU1vZGVsLkdBTUVfTE9BREVEXCI7XG5cbnZhciBHYW1lTW9kZWwgPSBFdmVudERpc3BhdGNoZXIuZXh0ZW5kKHtcbiAgICBnYW1lOiB7XG4gICAgICAgIGltYWdlOiBcImltYWdlcy91bmljb3JuLnBuZ1wiLFxuICAgICAgICB0aXRsZTogXCJVTklDT1JOIEJBVFRMRVwiXG4gICAgfSxcblxuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG4gICAgZ2FtZVNlcnZpY2U6IG51bGwsXG5cbiAgICBnZXRHYW1lQnlJZDogZnVuY3Rpb24oaWQpe1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuR2FtZVNlcnZpY2UuZ2V0R2FtZUJ5SWQoaWQpO1xuICAgIH1cblxufSk7XG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBHYW1lTW9kZWxQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgR2FtZU1vZGVsKCksXG5cblx0JGdldDogZnVuY3Rpb24oIE5vdGlmaWNhdGlvbnMsIEdhbWVTZXJ2aWNlKXtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmdhbWVTZXJ2aWNlID0gR2FtZVNlcnZpY2U7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2dhbWVzLkdhbWVNb2RlbCcsW10pXG5cdC5wcm92aWRlcignR2FtZU1vZGVsJywgR2FtZU1vZGVsUHJvdmlkZXIpO1xufSgpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuVVNFUl9TSUdORURfSU4gPSBcIkFjdGl2aXR5TW9kZWwuVVNFUl9TSUdORURfSU5cIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLlVTRVJfU0lHTkVEX09VVCA9IFwiQWN0aXZpdHlNb2RlbC5VU0VSX1NJR05FRF9PVVRcIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLlVTRVJfVVBEQVRFRCA9IFwiQWN0aXZpdHlNb2RlbC5VU0VSX1VQREFURURcIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLlBST0ZJTEVfTE9BREVEID0gXCJBY3Rpdml0eU1vZGVsLlBST0ZJTEVfTE9BREVEXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5BVVRIX0VSUk9SID0gXCJBY3Rpdml0eU1vZGVsLkFVVEhfRVJST1JcIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLk5FVFdPUktfRVJST1IgPSBcIkFjdGl2aXR5TW9kZWwuTkVUV09SS19FUlJPUlwiO1xuXG52YXIgVXNlck1vZGVsID0gRXZlbnREaXNwYXRjaGVyLmV4dGVuZCh7XG4gICAgY3VycmVudFVzZXI6IG51bGwsXG5cbiAgICBVc2VyU2VydmljZTpudWxsLFxuICAgIG5vdGlmaWNhdGlvbnM6IG51bGwsXG5cbiAgICBzaWduSW46IGZ1bmN0aW9uKGVtYWlsLCBwYXNzd29yZCl7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcy5Vc2VyU2VydmljZS5zaWduSW4oZW1haWwsIHBhc3N3b3JkKTtcbiAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRVc2VyID0gcmVzdWx0cy5kYXRhLnVzZXI7XG4gICAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMubm90aWZ5KG1vZGVscy5ldmVudHMuVVNFUl9TSUdORURfSU4pO1xuICAgICAgICB9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3JcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICBpZihlcnJvci5kYXRhKXtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMubm90aWZ5KG1vZGVscy5ldmVudHMuQVVUSF9FUlJPUiwgZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMubm90aWZ5KG1vZGVscy5ldmVudHMuTkVUV09SS19FUlJPUik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cblxuXG5cbiAgICAgICAgLypcbiAgICAgICAgdmFyIHVzZXIgPSB7XG4gICAgICAgICAgICBuYW1lOiBcInRhY29cIixcbiAgICAgICAgICAgIGFnZTogMzVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLiRjb29raWVzLmN1cnJlbnRVc2VyID0gSlNPTi5zdHJpbmdpZnkodXNlcik7XG4gICAgICAgICAqL1xuICAgIH0sXG5cbiAgICBzaWduT3V0OiBmdW5jdGlvbigpe1xuICAgICAgICAvL3RoaXMuVXNlclNlcnZpY2Uuc2lnbk91dCgpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVVc2VyOiBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzLlVzZXJTZXJ2aWNlLnVwZGF0ZVVzZXIodXNlcik7XG4gICAgICAgIC8vcHJvbWlzZS50aGVuXG4gICAgfVxuXG59KTtcblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIFVzZXJNb2RlbFByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBVc2VyTW9kZWwoKSxcblxuXHQkZ2V0OiBmdW5jdGlvbihVc2VyU2VydmljZSwgTm90aWZpY2F0aW9ucywgJGNvb2tpZXMpe1xuXHQgICAgdGhpcy5pbnN0YW5jZS5Vc2VyU2VydmljZSA9IFVzZXJTZXJ2aWNlO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuJGNvb2tpZXMgPSAkY29va2llcztcbiAgICAgICAgICAgIC8vdGhpcy5pbnN0YW5jZS5jdXJyZW50VXNlciA9IEpTT04ucGFyc2UoJGNvb2tpZXMuY3VycmVudFVzZXIpO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd1c2Vycy5Vc2VyTW9kZWwnLFtdKVxuXHQucHJvdmlkZXIoJ1VzZXJNb2RlbCcsIFVzZXJNb2RlbFByb3ZpZGVyKTtcbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBHYW1lU2VydmljZSA9IENsYXNzLmV4dGVuZCh7XG4gICAgJGh0dHA6IG51bGwsXG5cbiAgICBnZXRHYW1lQnlJZDogZnVuY3Rpb24oaWQpe1xuXG4gICAgfVxuXG59KTtcblxuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgR2FtZVNlcnZpY2VQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgR2FtZVNlcnZpY2UoKSxcblx0JGdldDogZnVuY3Rpb24oJGh0dHApe1xuXHQgICAgdGhpcy5pbnN0YW5jZS4kaHR0cCA9ICRodHRwO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdnYW1lcy5HYW1lU2VydmljZScsW10pXG5cdC5wcm92aWRlcignR2FtZVNlcnZpY2UnLCBHYW1lU2VydmljZVByb3ZpZGVyKTtcbn0oKSk7XG4iLCIvKlxyXG4qIHJ3ZEltYWdlTWFwcyBqUXVlcnkgcGx1Z2luIHYxLjVcclxuKlxyXG4qIEFsbG93cyBpbWFnZSBtYXBzIHRvIGJlIHVzZWQgaW4gYSByZXNwb25zaXZlIGRlc2lnbiBieSByZWNhbGN1bGF0aW5nIHRoZSBhcmVhIGNvb3JkaW5hdGVzIHRvIG1hdGNoIHRoZSBhY3R1YWwgaW1hZ2Ugc2l6ZSBvbiBsb2FkIGFuZCB3aW5kb3cucmVzaXplXHJcbipcclxuKiBDb3B5cmlnaHQgKGMpIDIwMTMgTWF0dCBTdG93XHJcbiogaHR0cHM6Ly9naXRodWIuY29tL3N0b3diYWxsL2pRdWVyeS1yd2RJbWFnZU1hcHNcclxuKiBodHRwOi8vbWF0dHN0b3cuY29tXHJcbiogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiovXHJcbjsoZnVuY3Rpb24oYSl7YS5mbi5yd2RJbWFnZU1hcHM9ZnVuY3Rpb24oKXt2YXIgYz10aGlzO3ZhciBiPWZ1bmN0aW9uKCl7Yy5lYWNoKGZ1bmN0aW9uKCl7aWYodHlwZW9mKGEodGhpcykuYXR0cihcInVzZW1hcFwiKSk9PVwidW5kZWZpbmVkXCIpe3JldHVybn12YXIgZT10aGlzLGQ9YShlKTthKFwiPGltZyAvPlwiKS5sb2FkKGZ1bmN0aW9uKCl7dmFyIGc9XCJ3aWR0aFwiLG09XCJoZWlnaHRcIixuPWQuYXR0cihnKSxqPWQuYXR0cihtKTtpZighbnx8IWope3ZhciBvPW5ldyBJbWFnZSgpO28uc3JjPWQuYXR0cihcInNyY1wiKTtpZighbil7bj1vLndpZHRofWlmKCFqKXtqPW8uaGVpZ2h0fX12YXIgZj1kLndpZHRoKCkvMTAwLGs9ZC5oZWlnaHQoKS8xMDAsaT1kLmF0dHIoXCJ1c2VtYXBcIikucmVwbGFjZShcIiNcIixcIlwiKSxsPVwiY29vcmRzXCI7YSgnbWFwW25hbWU9XCInK2krJ1wiXScpLmZpbmQoXCJhcmVhXCIpLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1hKHRoaXMpO2lmKCFyLmRhdGEobCkpe3IuZGF0YShsLHIuYXR0cihsKSl9dmFyIHE9ci5kYXRhKGwpLnNwbGl0KFwiLFwiKSxwPW5ldyBBcnJheShxLmxlbmd0aCk7Zm9yKHZhciBoPTA7aDxwLmxlbmd0aDsrK2gpe2lmKGglMj09PTApe3BbaF09cGFyc2VJbnQoKChxW2hdL24pKjEwMCkqZil9ZWxzZXtwW2hdPXBhcnNlSW50KCgocVtoXS9qKSoxMDApKmspfX1yLmF0dHIobCxwLnRvU3RyaW5nKCkpfSl9KS5hdHRyKFwic3JjXCIsZC5hdHRyKFwic3JjXCIpKX0pfTthKHdpbmRvdykucmVzaXplKGIpLnRyaWdnZXIoXCJyZXNpemVcIik7cmV0dXJuIHRoaXN9fSkoalF1ZXJ5KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBVc2VyU2VydmljZSA9IENsYXNzLmV4dGVuZCh7XG4gICAgJGh0dHA6IG51bGwsXG4gICAgY29uZmlnTW9kZWw6IG51bGwsXG5cbiAgICBzaWduSW46IGZ1bmN0aW9uKGVtYWlsLCBwYXNzd29yZCl7XG4gICAgICAgIHZhciB1cmwgPSB0aGlzLmNvbmZpZ01vZGVsLmNvbmZpZy5iYXNlVVJMICsgXCIvbG9naW4vcGxheWZhYlwiO1xuICAgICAgICB2YXIgcmVxID0ge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogIHtcbiAgICAgICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcSk7XG4gICAgICAgIHJldHVybiB0aGlzLiRodHRwKHJlcSk7XG4gICAgfSxcblxuICAgIHNpZ25PdXQ6IGZ1bmN0aW9uKCl7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlVXNlcjogZnVuY3Rpb24odXNlcil7XG5cbiAgICB9XG5cbn0pO1xuXG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBVc2VyU2VydmljZVByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBVc2VyU2VydmljZSgpLFxuXHQkZ2V0OiBmdW5jdGlvbigkaHR0cCwgJGNvb2tpZXMsIENvbmZpZ01vZGVsKXtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuY29uZmlnTW9kZWwgPSBDb25maWdNb2RlbDtcblx0ICAgIHRoaXMuaW5zdGFuY2UuJGh0dHAgPSAkaHR0cDtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgndXNlcnMuVXNlclNlcnZpY2UnLFtdKVxuXHQucHJvdmlkZXIoJ1VzZXJTZXJ2aWNlJywgVXNlclNlcnZpY2VQcm92aWRlcik7XG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTmF2QmFyRGlyZWN0aXZlID0gQmFzZURpcmVjdGl2ZS5leHRlbmQoe1xuICAgIHVzZXJNb2RlbDogbnVsbCxcbiAgICBub3RpZmljYXRpb25zOiBudWxsLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oJHNjb3BlLCBVc2VyTW9kZWwsIE5vdGlmaWNhdGlvbnMpe1xuICAgICAgICB0aGlzLnVzZXJNb2RlbCA9IFVzZXJNb2RlbDtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICAgICAgdGhpcy5fc3VwZXIoJHNjb3BlKTtcbiAgICB9LFxuXG4gICAgZGVmaW5lTGlzdGVuZXJzOiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMuYWRkRXZlbnRMaXN0ZW5lcihtb2RlbHMuZXZlbnRzLlVTRVJfU0lHTkVEX0lOLCB0aGlzLmhhbmRsZVVzZXJTaWduZWRJbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy4kc2NvcGUubG9nb3V0ID0gdGhpcy5sb2dvdXQuYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgZGVmaW5lU2NvcGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMubmF2U2hvd2luZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLiRzY29wZS5jdXJyZW50VXNlciA9IHRoaXMudXNlck1vZGVsLmN1cnJlbnRVc2VyO1xuICAgICAgICB0aGlzLmluaXROYXYoKTtcbiAgICB9LFxuXG4gICAgaW5pdE5hdjogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIG1vYmlsZU1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpzLW1vYmlsZS1tZW51XCIpO1xuICAgICAgICB2YXIgbmF2TWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwianMtbmF2aWdhdGlvbi1tZW51XCIpO1xuICAgICAgICBuYXZNZW51LmNsYXNzTmFtZSA9IG5hdk1lbnUuY2xhc3NOYW1lLnJlcGxhY2UoL1xcYnNob3dcXGIvLCcnKTtcbiAgICAgICAgbW9iaWxlTWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmKHRoaXMubmF2U2hvd2luZyl7XG4gICAgICAgICAgICAgICAgbmF2TWVudS5jbGFzc05hbWUgPSBuYXZNZW51LmNsYXNzTmFtZS5yZXBsYWNlKC9cXGJzaG93XFxiLywnJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5hdk1lbnUuY2xhc3NOYW1lID0gbmF2TWVudS5jbGFzc05hbWUgKyBcIiBzaG93XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm5hdlNob3dpbmcgPSAhdGhpcy5uYXZTaG93aW5nO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMudXNlck1vZGVsLmxvZ291dCgpO1xuICAgICAgICB0aGlzLiRsb2NhdGlvbi51cmwoXCIvXCIpO1xuICAgIH0sXG5cbiAgICAvKiogRVZFTlQgSEFORExFUlMgKiovXG4gICAgaGFuZGxlVXNlclNpZ25lZEluOiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLiRzY29wZS5jdXJyZW50VXNlciA9IHRoaXMudXNlck1vZGVsLmN1cnJlbnRVc2VyO1xuICAgIH1cblxufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduYXZiYXInLFtdKVxuICAgIC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uKFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyl7XG5cdHJldHVybiB7XG5cdCAgICByZXN0cmljdDonRScsXG5cdCAgICBpc29sYXRlOnRydWUsXG5cdCAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUpe1xuXHRcdG5ldyBOYXZCYXJEaXJlY3RpdmUoJHNjb3BlLCBVc2VyTW9kZWwsIE5vdGlmaWNhdGlvbnMpO1xuXHQgICAgfSxcblx0ICAgIHNjb3BlOnRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9uYXZiYXIvbmF2YmFyLmh0bWxcIlxuXHR9O1xuICAgIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR3ltTWFwQ29udHJvbGxlciA9IEJhc2VDb250cm9sbGVyLmV4dGVuZCh7XG4gICAgXG4gICAgbm90aWZpY2F0aW9uczpudWxsLFxuICAgIHJvb3RDYW52YXM6ICQoJzxjYW52YXM+JyksXG4gICAgcmVzaXplVGltZW91dDogbnVsbCxcblxuICAgIGluaXQ6ZnVuY3Rpb24oJHNjb3BlLCBOb3RpZmljYXRpb25zKXtcblx0dGhpcy5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcblx0dGhpcy5fc3VwZXIoJHNjb3BlKTtcbiAgICB9LFxuXG4gICAgZGVmaW5lTGlzdGVuZXJzOmZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuX3N1cGVyKCk7XG4gICAgICAgIHRoaXMuJHNjb3BlLmFyZWFDbGlja2VkID0gdGhpcy5hcmVhQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICAgICAgICBcbiAgICB9LFxuXG4gICAgZGVmaW5lU2NvcGU6ZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICQoJ2ltZ1t1c2VtYXBdJykucndkSW1hZ2VNYXBzKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJy5pbWFnZUxheWVyIGltZycpLm9uKCdsb2FkLm9tZ21hcHMnLCBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAgICAgdGhhdC5zZXRVcFJvb3RDYW52YXMoJCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhhdC5oaWdobGlnaHRNYXAoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRvbmVcIik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cblxuICAgICAgICBcbiAgICB9LFxuXG4gICAgZGVzdHJveTpmdW5jdGlvbigpe1xuICAgICAgICAkKCdjYW52YXMnKS5vZmYoJy5vbWdtYXBzJyk7XG4gICAgICAgICQoJy5pbWcnKS5vZmYoJy5vbWdtYXBzJyk7XG4gICAgfSxcblxuXG4gICAgYXJlYUNsaWNrZWQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUkNIXCIpO1xuICAgIH0sXG4gICAgXG4gICAgc2V0VXBSb290Q2FudmFzOiBmdW5jdGlvbihpbWFnZSl7XG4gICAgICAgIHZhciBpbWdXaWR0aCA9IGltYWdlLndpZHRoKCksXG4gICAgICAgICAgICBpbWdIZWlnaHQgPSBpbWFnZS5oZWlnaHQoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucm9vdENhbnZhcy5hdHRyKCd3aWR0aCcsaW1nV2lkdGgpLmF0dHIoJ2hlaWdodCcsaW1nSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5yb290Q2FudmFzLmNzcyh7XG4gICAgICAgICAgICBwb3NpdGlvbjonYWJzb2x1dGUnLFxuICAgICAgICAgICAgdG9wOicwcHgnLFxuICAgICAgICAgICAgbGVmdDonMHB4JyxcbiAgICAgICAgICAgIHdpZHRoOicxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDonMTAwJScsXG4gICAgICAgICAgICBkaXNwbGF5Oidub25lJ1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRFU1QgQ0FTRVxuICAgICAgICB0aGlzLnJvb3RDYW52YXMuY3NzKCdvcGFjaXR5JywnMCcpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5yZWRyYXdSb290Q2FudmFzKGltYWdlKTtcbiAgICAgICAgXG4gICAgICAgIGltYWdlLmJlZm9yZSh0aGlzLnJvb3RDYW52YXMpO1xuICAgICAgICB0aGlzLnJvb3RDYW52YXMuZmFkZUluKCdzbG93Jyk7XG4gICAgfSxcbiAgICBcbiAgICByZWRyYXdSb290Q2FudmFzOiBmdW5jdGlvbihpbWFnZSl7XG4gICAgICAgIHZhciBjdHggPSB0aGlzLnJvb3RDYW52YXMuZ2V0KDApLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5yb290Q2FudmFzLmdldCgwKS53aWR0aCwgdGhpcy5yb290Q2FudmFzLmdldCgwKS53aWR0aCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdmFyIGltZ1dpZHRoID0gaW1hZ2Uud2lkdGgoKSxcbiAgICAgICAgICAgIGltZ0hlaWdodCA9IGltYWdlLmhlaWdodCgpO1xuXG4gICAgICAgIHRoaXMucm9vdENhbnZhcy5hdHRyKCd3aWR0aCcsaW1nV2lkdGgpLmF0dHIoJ2hlaWdodCcsaW1nSGVpZ2h0KTtcbiAgICAgICAgXG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UuZ2V0KDApLDAsMCxpbWFnZS53aWR0aCgpLCBpbWFnZS5oZWlnaHQoKSk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygncm9vdENhbnZhczogJyt0aGlzLnJvb3RDYW52YXMuZ2V0KDApLndpZHRoICsgJywgJyt0aGlzLnJvb3RDYW52YXMuZ2V0KDApLmhlaWdodCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdkcmF3IGltYWdlOiAnK2ltYWdlLndpZHRoKCkgKyAnLCAnK2ltYWdlLmhlaWdodCgpKTtcbiAgICB9LFxuICAgIFxuICAgIGhpZ2hsaWdodE1hcDogZnVuY3Rpb24oKXtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGJvZHkgPSAkKCdib2R5JyksXG4gICAgICAgICAgICBjb250ZW50QXJlYSA9ICQoJy5tYXBDb250ZW50JyksXG4gICAgICAgICAgICBpbWFnZUxheWVyID0gJCgnLmltYWdlTGF5ZXInKSxcbiAgICAgICAgICAgIG1hcCA9ICQoXCIjZ3ltTWFwXCIpLFxuICAgICAgICAgICAgbWFwRWwgPSAkKFwiI2d5bU1hcFwiKS5nZXQoMCksXG4gICAgICAgICAgICBtYXBBcmVhcyA9IG1hcC5maW5kKCdhcmVhJyksXG4gICAgICAgICAgICBpbWFnZSA9ICQoXCJpbWdbdXNlbWFwPScjZ3ltTWFwJ11cIikuY3NzKCdvcGFjaXR5JywnMCcpLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBnZXQgdGhlIHdpZHRoIGFuZCBoZWlnaHQgZnJvbSB0aGUgaW1hZ2UgdGFnXG4gICAgICAgICAgICBpbWdXaWR0aCA9IGltYWdlLndpZHRoKCksXG4gICAgICAgICAgICBpbWdIZWlnaHQgPSBpbWFnZS5oZWlnaHQoKSxcbiAgICAgICAgICAgIGltZ0F0dHJXaWR0aCA9IGltYWdlLmF0dHIoJ3dpZHRoJyksXG4gICAgICAgICAgICBpbWdBdHRySGVpZ2h0ID0gaW1hZ2UuYXR0cignaGVpZ2h0JyksXG4gICAgICAgICAgICB4RmFjdG9yID0gcGFyc2VGbG9hdChpbWdXaWR0aC9pbWdBdHRyV2lkdGgpLFxuICAgICAgICAgICAgeUZhY3RvciA9IHBhcnNlRmxvYXQoaW1nSGVpZ2h0L2ltZ0F0dHJIZWlnaHQpO1xuXG4vLyAgICAgICAgY29uc29sZS5sb2coJ2ltZ0F0dHJXaWR0aDogJytpbWdBdHRyV2lkdGgpO1xuLy8gICAgICAgIGNvbnNvbGUubG9nKCdpbWdBdHRySGVpZ2h0OiAnK2ltZ0F0dHJIZWlnaHQpO1xuLy8gICAgICAgIGNvbnNvbGUubG9nKCd4RmFjdG9yOiAnK3hGYWN0b3IpO1xuLy8gICAgICAgIGNvbnNvbGUubG9nKCd5RmFjdG9yOiAnK3lGYWN0b3IpO1xuICAgICAgICBcbiAgICAgICAgLy8gc2V0IHVwIHRoZSBpbWFnZSBsYXllciBjc3Ncbi8vICAgICAgICBpbWFnZUxheWVyLmNzcyh7XG4vLyAgICAgICAgICAgIHdpZHRoOicxMDAlJyxcbi8vICAgICAgICAgICAgaGVpZ2h0OidhdXRvJ1xuLy8gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdmFyIHJvb3RDYW52YXMgPSB0aGlzLnJvb3RDYW52YXM7XG4gICAgICAgIFxuICAgICAgICAkLmVhY2gobWFwQXJlYXMsIGZ1bmN0aW9uKGluZGV4LCBhcmVhKXtcbiAgICAgICAgICAgIHZhciBhcmVhID0gJChhcmVhKTtcbiAgICAgICAgICAgIHZhciBhcmVhRWwgPSBhcmVhLmdldCgwKTtcbiAgICAgICAgICAgIHZhciBjb29yZHMgPSBhcmVhRWwuY29vcmRzLnNwbGl0KFwiLCBcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIG1hcCB0aGUgY29vcmRzIGJlY2F1c2UgdGhleSBhcmUgc2NhbGVkIGZvciB0aGUgaW1hZ2Ugc2l6ZSBhbmQgbm90IHRoZSBvdGhlciBzaXplXG4gICAgICAgICAgICBjb29yZHMgPSBjb29yZHMubWFwKGZ1bmN0aW9uKHZhbHVlLCBpbmRleCl7XG4gICAgICAgICAgICAgICAgaWYoaW5kZXglMiA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIC8vIHggY29vcmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICogeEZhY3RvcjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB5IGNvb3JkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIHlGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIGNhbnZhc1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9ICQoJzxjYW52YXM+JykuYXR0cignd2lkdGgnLGltZ1dpZHRoKS5hdHRyKCdoZWlnaHQnLGltZ0hlaWdodCkuYXR0cignaWQnLCdjYW52YXNfJytpbmRleCkuYWRkQ2xhc3MoJ21hcC1vdmVybGF5Jyk7XG4gICAgICAgICAgICBjYW52YXMuY3NzKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjonYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgIHRvcDonMHB4JyxcbiAgICAgICAgICAgICAgICBsZWZ0OicwcHgnLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6JzAuMCcsXG4gICAgICAgICAgICAgICAgZGlzcGxheTonbm9uZScvLyxcbi8vICAgICAgICAgICAgICAgIHdpZHRoOnJvb3RDYW52YXMud2lkdGgoKSxcbi8vICAgICAgICAgICAgICAgIGhlaWdodDpyb290Q2FudmFzLmhlaWdodCgpLy8sXG4vLyAgICAgICAgICAgICAgICAnei1pbmRleCc6JzEnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gYXR0YWNoIHNhaWQgY2FudmFzIHRvIERPTVxuICAgICAgICAgICAgaW1hZ2VMYXllci5maW5kKCdpbWcnKS5iZWZvcmUoY2FudmFzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NyZWF0ZSBjYW52YXM6ICcraW1nV2lkdGgrJywgJytpbWdIZWlnaHQpO1xuICAgICAgICAgICAgLy8gVEVTVCBDQVNFXG4gICAgICAgICAgICBjYW52YXMuY3NzKHtvcGFjaXR5OicxJywgZGlzcGxheTonYmxvY2snfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGdyYWIgdGhlIGNhbnZhcyBjb250ZXh0XG4gICAgICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldCgwKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJyNmMDAnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgeCA9IGNvb3Jkc1swXSxcbiAgICAgICAgICAgICAgICB5ID0gY29vcmRzWzFdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKHgsIHkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihjb29yZHMubGVuZ3RoPjApe1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaiA9IDIsbGVuID0gY29vcmRzLmxlbmd0aDsgaiA8IGxlbi0xIDsgaiArPSAyICl7XG4gICAgICAgICAgICAgICAgICAgIHggPSBjb29yZHNbal07XG4gICAgICAgICAgICAgICAgICAgIHkgPSBjb29yZHNbaiArIDFdO1xuXG4gICAgICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTk8gQ09PUkRTISEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmZpbGwoKTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIGFuIGFyZWEgbW91c2VlbnRlciBldmVudCBsaXN0ZW5lclxuLy8gICAgICAgICAgICBhcmVhLm9uKCdtb3VzZWVudGVyLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbi8vICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihldmVudCl7XG4vLyAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbi8vLy8gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtb3VzZWVudGVyJyk7XG4vLyAgICAgICAgICAgICAgICAgICAgY2FudmFzLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuLy8gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5hbmltYXRlKHtvcGFjaXR5OicxLjAnfSwyMDAsJ2xpbmVhcicpO1xuLy8vLyAgICAgICAgICAgICAgICAgICAgY2FudmFzLmFuaW1hdGUoe2Rpc3BsYXk6J2Jsb2NrJ30sMjAwLCdsaW5lYXInKTtcbi8vICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgfSkoY2FudmFzKSk7XG4vL1xuLy8gICAgICAgICAgICBhcmVhLm9uKCdtb3VzZWxlYXZlLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbi8vICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihldmVudCl7XG4vLyAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbi8vICAgICAgICAgICAgICAgICAgICBjYW52YXMuYW5pbWF0ZSh7b3BhY2l0eTonMC4wJ30sMjAwLCdsaW5lYXInLGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuLy8gICAgICAgICAgICAgICAgICAgIH0pO1xuLy8vLyAgICAgICAgICAgICAgICAgICAgY2FudmFzLmFuaW1hdGUoe2Rpc3BsYXk6J25vbmUnfSwyMDAsJ2xpbmVhcicpO1xuLy8gICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICB9KShjYW52YXMpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjdHgnKTtcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coY3R4KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgLy8gVEVTdCBDQVNFOiBpcyBjYW52YXMgYmxhbmtcbiAgICBpc0NhbnZhc0JsYW5rOmZ1bmN0aW9uKGNhbnZhcyl7XG4gICAgICAgIHZhciBibGFuayA9ICQoJzxjYW52YXM+JykuZ2V0KDApO1xuICAgICAgICBibGFuay53aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICAgICAgYmxhbmsuaGVpZ2h0ID0gY2FudmFzLndpZHRoO1xuXG4gICAgICAgIHJldHVybiBjYW52YXMudG9EYXRhVVJMKCkgPT0gYmxhbmsudG9EYXRhVVJMKCk7XG4gICAgfSxcblxuICAgIHJlc2l6ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy5yZXNpemVUaW1lb3V0KXtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2l6ZVRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzaXplVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoYXQuZG9SZXNpemUoKTtcbiAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgXG4gICAgICAgXG4gICAgfSxcbiAgICBcbiAgICBkb1Jlc2l6ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBjb25zb2xlLmxvZygnZG8gcmVzaXplJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJlZHJhd1Jvb3RDYW52YXMoJCgnLmltYWdlTGF5ZXIgaW1nJykpO1xuICAgICAgICBcbiAgICAgICAgJCgnY2FudmFzLm1hcC1vdmVybGF5JykucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TWFwKCk7XG5cbiAgICB9XG5cbn0pO1xuXG5cbkd5bU1hcENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywnTm90aWZpY2F0aW9ucyddO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9