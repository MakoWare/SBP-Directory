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
    this.initialize.apply(this,arguments);
    this.defineListeners();
    this.defineScope();
  },

  initialize:function(){
    //OVERRIDE
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
        })
        .state('wallView', {
            url: "/wall/:id",
            templateUrl: "partials/gym/wall/wall.html",
            controller:WallController
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
  $state: null,

  // init:function($scope, Notifications,$state){
  //   this.notifications = Notifications;
  //   this.$state = $state;
  //   this._super($scope);
  // },

  initialize:function($scope, Notifications,$state){
    this.notifications = Notifications;
    this.$state = $state;
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

    var that = this,
    body = $('body'),
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
          that.$state.go('wallView',{id:'10'});
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


GymMapController.$inject = ['$scope','Notifications','$state'];

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYXNzLmpzIiwiQmFzZUNvbnRyb2xsZXIuanMiLCJCYXNlRGlyZWN0aXZlLmpzIiwiRXZlbnREaXNwYXRjaGVyLmpzIiwiTmFtZXNwYWNlLmpzIiwiTm90aWZpY2F0aW9ucy5qcyIsImFwcC5qcyIsIm1vZGVscy9jb25maWdNb2RlbC5qcyIsIm1vZGVscy9nYW1lTW9kZWwuanMiLCJtb2RlbHMvdXNlck1vZGVsLmpzIiwic2VydmljZXMvZ2FtZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9pbWFnZU1hcC5taW4uanMiLCJzZXJ2aWNlcy91c2VyU2VydmljZS5qcyIsImNvbXBvbmVudHMvbmF2YmFyL25hdmJhckRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvZ3ltL21hcC9neW1NYXBDb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9neW0vd2FsbC93YWxsQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBmblRlc3QgPSAveHl6Ly50ZXN0KGZ1bmN0aW9uKCl7eHl6O30pID8gL1xcYl9zdXBlclxcYi8gOiAvLiovO1xuXG4gIC8vIFRoZSBiYXNlIENsYXNzIGltcGxlbWVudGF0aW9uIChkb2VzIG5vdGhpbmcpXG4gIGZ1bmN0aW9uIEJhc2VDbGFzcygpe31cblxuICAvLyBDcmVhdGUgYSBuZXcgQ2xhc3MgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMgY2xhc3NcbiAgQmFzZUNsYXNzLmV4dGVuZCA9IGZ1bmN0aW9uKHByb3BzKSB7XG4gICAgdmFyIF9zdXBlciA9IHRoaXMucHJvdG90eXBlO1xuXG4gICAgLy8gU2V0IHVwIHRoZSBwcm90b3R5cGUgdG8gaW5oZXJpdCBmcm9tIHRoZSBiYXNlIGNsYXNzXG4gICAgLy8gKGJ1dCB3aXRob3V0IHJ1bm5pbmcgdGhlIGluaXQgY29uc3RydWN0b3IpXG4gICAgdmFyIHByb3RvID0gT2JqZWN0LmNyZWF0ZShfc3VwZXIpO1xuXG4gICAgLy8gQ29weSB0aGUgcHJvcGVydGllcyBvdmVyIG9udG8gdGhlIG5ldyBwcm90b3R5cGVcbiAgICBmb3IgKHZhciBuYW1lIGluIHByb3BzKSB7XG4gICAgICAvLyBDaGVjayBpZiB3ZSdyZSBvdmVyd3JpdGluZyBhbiBleGlzdGluZyBmdW5jdGlvblxuICAgICAgcHJvdG9bbmFtZV0gPSB0eXBlb2YgcHJvcHNbbmFtZV0gPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICB0eXBlb2YgX3N1cGVyW25hbWVdID09IFwiZnVuY3Rpb25cIiAmJiBmblRlc3QudGVzdChwcm9wc1tuYW1lXSlcbiAgICAgICAgPyAoZnVuY3Rpb24obmFtZSwgZm4pe1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgdG1wID0gdGhpcy5fc3VwZXI7XG5cbiAgICAgICAgICAgICAgLy8gQWRkIGEgbmV3IC5fc3VwZXIoKSBtZXRob2QgdGhhdCBpcyB0aGUgc2FtZSBtZXRob2RcbiAgICAgICAgICAgICAgLy8gYnV0IG9uIHRoZSBzdXBlci1jbGFzc1xuICAgICAgICAgICAgICB0aGlzLl9zdXBlciA9IF9zdXBlcltuYW1lXTtcblxuICAgICAgICAgICAgICAvLyBUaGUgbWV0aG9kIG9ubHkgbmVlZCB0byBiZSBib3VuZCB0ZW1wb3JhcmlseSwgc28gd2VcbiAgICAgICAgICAgICAgLy8gcmVtb3ZlIGl0IHdoZW4gd2UncmUgZG9uZSBleGVjdXRpbmdcbiAgICAgICAgICAgICAgdmFyIHJldCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgIHRoaXMuX3N1cGVyID0gdG1wO1xuXG4gICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKG5hbWUsIHByb3BzW25hbWVdKVxuICAgICAgICA6IHByb3BzW25hbWVdO1xuICAgIH1cblxuICAgIC8vIFRoZSBuZXcgY29uc3RydWN0b3JcbiAgICB2YXIgbmV3Q2xhc3MgPSB0eXBlb2YgcHJvdG8uaW5pdCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IHByb3RvLmhhc093blByb3BlcnR5KFwiaW5pdFwiKVxuICAgICAgICA/IHByb3RvLmluaXQgLy8gQWxsIGNvbnN0cnVjdGlvbiBpcyBhY3R1YWxseSBkb25lIGluIHRoZSBpbml0IG1ldGhvZFxuICAgICAgICA6IGZ1bmN0aW9uIFN1YkNsYXNzKCl7IF9zdXBlci5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cbiAgICAgIDogZnVuY3Rpb24gRW1wdHlDbGFzcygpe307XG5cbiAgICAvLyBQb3B1bGF0ZSBvdXIgY29uc3RydWN0ZWQgcHJvdG90eXBlIG9iamVjdFxuICAgIG5ld0NsYXNzLnByb3RvdHlwZSA9IHByb3RvO1xuXG4gICAgLy8gRW5mb3JjZSB0aGUgY29uc3RydWN0b3IgdG8gYmUgd2hhdCB3ZSBleHBlY3RcbiAgICBwcm90by5jb25zdHJ1Y3RvciA9IG5ld0NsYXNzO1xuXG4gICAgLy8gQW5kIG1ha2UgdGhpcyBjbGFzcyBleHRlbmRhYmxlXG4gICAgbmV3Q2xhc3MuZXh0ZW5kID0gQmFzZUNsYXNzLmV4dGVuZDtcblxuICAgIHJldHVybiBuZXdDbGFzcztcbiAgfTtcblxuICAvLyBleHBvcnRcbiAgZ2xvYmFsLkNsYXNzID0gQmFzZUNsYXNzO1xufSkodGhpcyk7XG4iLCJ2YXIgQmFzZUNvbnRyb2xsZXIgPSBDbGFzcy5leHRlbmQoe1xuICBzY29wZTogbnVsbCxcblxuICBpbml0OmZ1bmN0aW9uKHNjb3BlKXtcbiAgICB0aGlzLiRzY29wZSA9IHNjb3BlO1xuICAgIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgdGhpcy5kZWZpbmVMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmRlZmluZVNjb3BlKCk7XG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xuICAgIC8vT1ZFUlJJREVcbiAgfSxcblxuICBkZWZpbmVMaXN0ZW5lcnM6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kc2NvcGUuJG9uKCckZGVzdHJveScsdGhpcy5kZXN0cm95LmJpbmQodGhpcykpO1xuICB9LFxuXG5cbiAgZGVmaW5lU2NvcGU6IGZ1bmN0aW9uKCl7XG4gICAgLy9PVkVSUklERVxuICB9LFxuXG5cbiAgZGVzdHJveTpmdW5jdGlvbihldmVudCl7XG4gICAgLy9PVkVSUklERVxuICB9XG59KTtcblxuQmFzZUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XG4iLCJ2YXIgQmFzZURpcmVjdGl2ZSA9IENsYXNzLmV4dGVuZCh7XG4gIHNjb3BlOiBudWxsLFxuXG4gIGluaXQ6ZnVuY3Rpb24oc2NvcGUpe1xuICAgIHRoaXMuJHNjb3BlID0gc2NvcGU7XG4gICAgdGhpcy5kZWZpbmVMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmRlZmluZVNjb3BlKCk7XG4gIH0sXG5cbiAgZGVmaW5lTGlzdGVuZXJzOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuJHNjb3BlLiRvbignJGRlc3Ryb3knLHRoaXMuZGVzdHJveS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuXG4gIGRlZmluZVNjb3BlOiBmdW5jdGlvbigpe1xuICAgIC8vT1ZFUlJJREVcbiAgfSxcblxuXG4gIGRlc3Ryb3k6ZnVuY3Rpb24oZXZlbnQpe1xuICAgIC8vT1ZFUlJJREVcbiAgfVxufSk7XG5cbkJhc2VEaXJlY3RpdmUuJGluamVjdCA9IFsnJHNjb3BlJ107XG4iLCIvKipcbiogRXZlbnQgZGlzcGF0Y2hlciBjbGFzcyxcbiogYWRkIGFiaWxpdHkgdG8gZGlzcGF0Y2ggZXZlbnRcbiogb24gbmF0aXZlIGNsYXNzZXMuXG4qXG4qIFVzZSBvZiBDbGFzcy5qc1xuKlxuKiBAYXV0aG9yIHVuaXZlcnNhbG1pbmQuY29tXG4qL1xudmFyIEV2ZW50RGlzcGF0Y2hlciA9IENsYXNzLmV4dGVuZCh7XG4gICAgX2xpc3RlbmVyczp7fSxcblxuICAgIC8qKlxuICAgICogQWRkIGEgbGlzdGVuZXIgb24gdGhlIG9iamVjdFxuICAgICogQHBhcmFtIHR5cGUgOiBFdmVudCB0eXBlXG4gICAgKiBAcGFyYW0gbGlzdGVuZXIgOiBMaXN0ZW5lciBjYWxsYmFja1xuICAgICovICBcbiAgICBhZGRFdmVudExpc3RlbmVyOmZ1bmN0aW9uKHR5cGUsbGlzdGVuZXIpe1xuICAgICAgICBpZighdGhpcy5fbGlzdGVuZXJzW3R5cGVdKXtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5wdXNoKGxpc3RlbmVyKVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAgICogUmVtb3ZlIGEgbGlzdGVuZXIgb24gdGhlIG9iamVjdFxuICAgICAgICogQHBhcmFtIHR5cGUgOiBFdmVudCB0eXBlXG4gICAgICAgKiBAcGFyYW0gbGlzdGVuZXIgOiBMaXN0ZW5lciBjYWxsYmFja1xuICAgICAgICovICBcbiAgICByZW1vdmVFdmVudExpc3RlbmVyOmZ1bmN0aW9uKHR5cGUsbGlzdGVuZXIpe1xuICAgICAgaWYodGhpcy5fbGlzdGVuZXJzW3R5cGVdKXtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fbGlzdGVuZXJzW3R5cGVdLmluZGV4T2YobGlzdGVuZXIpO1xuXG4gICAgICAgIGlmKGluZGV4IT09LTEpe1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnNwbGljZShpbmRleCwxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICogRGlzcGF0Y2ggYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgbGlzdGVuZXJcbiAgICAqIEBwYXJhbSBNdXRpcGxlIHBhcmFtcyBhdmFpbGFibGUsIGZpcnN0IG11c3QgYmUgc3RyaW5nXG4gICAgKi8gXG4gICAgZGlzcGF0Y2hFdmVudDpmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbGlzdGVuZXJzO1xuXG4gICAgICAgIGlmKHR5cGVvZiBhcmd1bWVudHNbMF0gIT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignRXZlbnREaXNwYXRjaGVyJywnRmlyc3QgcGFyYW1zIG11c3QgYmUgYW4gZXZlbnQgdHlwZSAoU3RyaW5nKScpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW2FyZ3VtZW50c1swXV07XG5cbiAgICAgICAgICAgIGZvcih2YXIga2V5IGluIGxpc3RlbmVycyl7XG4gICAgICAgICAgICAgICAgLy9UaGlzIGNvdWxkIHVzZSAuYXBwbHkoYXJndW1lbnRzKSBpbnN0ZWFkLCBidXQgdGhlcmUgaXMgY3VycmVudGx5IGEgYnVnIHdpdGggaXQuXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzW2tleV0oYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSxhcmd1bWVudHNbMl0sYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pXG5cblxuIiwiLyoqXG4qIFNpbXBsZSBuYW1lc3BhY2UgdXRpbCB0byBleHRhbmQgQ2xhc3MuanMgZnVuY3Rpb25hbGl0eVxuKiBhbmQgd3JhcCBjbGFzc2VzIGluIG5hbWVzcGFjZS5cbiogQGF1dGhvciB0b21teS5yb2NoZXR0ZVtmb2xsb3dlZCBieSB0aGUgdXN1YWwgc2lnbl11bml2ZXJzYWxtaW5kLmNvbVxuKiBAdHlwZSB7Kn1cbiogQHJldHVybiBPYmplY3RcbiovXG53aW5kb3cubmFtZXNwYWNlID0gZnVuY3Rpb24obmFtZXNwYWNlcyl7XG4gICAndXNlIHN0cmljdCc7XG4gICB2YXIgbmFtZXMgPSBuYW1lc3BhY2VzLnNwbGl0KCcuJyk7XG4gICB2YXIgbGFzdCAgPSB3aW5kb3c7XG4gICB2YXIgbmFtZSAgPSBudWxsO1xuICAgdmFyIGkgICAgID0gbnVsbDtcblxuICAgZm9yKGkgaW4gbmFtZXMpe1xuICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcblxuICAgICAgIGlmKGxhc3RbbmFtZV09PT11bmRlZmluZWQpe1xuICAgICAgICAgICBsYXN0W25hbWVdID0ge307XG4gICAgICAgfVxuXG4gICAgICAgbGFzdCA9IGxhc3RbbmFtZV07XG4gICB9XG4gICByZXR1cm4gbGFzdDtcbn07XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgJ3VzZSBzdHJpY3QnO1xuICAgLyoqXG5cdCAqIENyZWF0ZSBhIGdsb2JhbCBldmVudCBkaXNwYXRjaGVyXG5cdCAqIHRoYXQgY2FuIGJlIGluamVjdGVkIGFjY3Jvc3MgbXVsdGlwbGUgY29tcG9uZW50c1xuXHQgKiBpbnNpZGUgdGhlIGFwcGxpY2F0aW9uXG5cdCAqXG5cdCAqIFVzZSBvZiBDbGFzcy5qc1xuXHQgKiBAdHlwZSB7Y2xhc3N9XG5cdCAqIEBhdXRob3IgdW5pdmVyc2FsbWluZC5jb21cblx0ICovXG4gICB2YXIgTm90aWZpY2F0aW9uc1Byb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgIGluc3RhbmNlOiBuZXcgRXZlbnREaXNwYXRjaGVyKCksXG5cbiAgICAgICAvKipcbiAgICAgICAgKiBDb25maWd1cmVzIGFuZCByZXR1cm5zIGluc3RhbmNlIG9mIEdsb2JhbEV2ZW50QnVzLlxuICAgICAgICAqXG4gICAgICAgICogQHJldHVybiB7R2xvYmFsRXZlbnRCdXN9XG4gICAgICAgICovXG4gICAgICAgJGdldDogW2Z1bmN0aW9uICgpIHtcbiAgICAgICBcdCAgIHRoaXMuaW5zdGFuY2Uubm90aWZ5ID0gdGhpcy5pbnN0YW5jZS5kaXNwYXRjaEV2ZW50O1xuICAgICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcbiAgICAgICB9XVxuICAgfSk7XG5cbiAgIGFuZ3VsYXIubW9kdWxlKCdub3RpZmljYXRpb25zJywgW10pXG4gICAgICAgLnByb3ZpZGVyKCdOb3RpZmljYXRpb25zJywgTm90aWZpY2F0aW9uc1Byb3ZpZGVyKTtcbn0oKSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgncGxheWZhYicsIFtcbiAgICAnbm90aWZpY2F0aW9ucycsXG5cbiAgICAnbmF2YmFyJyxcblxuICAgIC8vVXNlclxuICAgICd1c2Vycy5Vc2VyTW9kZWwnLFxuICAgICd1c2Vycy5Vc2VyU2VydmljZScsXG5cbiAgICAvL0NvbmZpZ1xuICAgICdkdXh0ZXIuQ29uZmlnTW9kZWwnLFxuXG4gICAgLypcbiAgICAgLy9BcnRpY2xlc1xuICAgICAnYXJ0aWNsZXMuQXJ0aWNsZU1vZGVsJyxcbiAgICAgJ2FydGljbGVzLkFydGljbGVTZXJ2aWNlJyxcbiAgICAgJ2FydGljbGVzLmFydGljbGVMaXN0JyxcbiAgICAgJ2FydGljbGVzLmFydGljbGVMaXN0SXRlbScsXG5cbiAgICAgLy9Db21tZW50c1xuICAgICAnY29tbWVudHMuQ29tbWVudE1vZGVsJyxcbiAgICAgJ2NvbW1lbnRzLkNvbW1lbnRTZXJ2aWNlJyxcbiAgICAgJ2NvbW1lbnRzLmNvbW1lbnRMaXN0JyxcbiAgICAgJ2NvbW1lbnRzLmNvbW1lbnRMaXN0SXRlbScsXG4gICAgICovXG5cbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdDb29raWVzJyxcbiAgICAnbmdBbmltYXRlJ1xuXG5dKS5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgIC8vXG4gICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvc3RhdGUxXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9neW0vbWFwXCIpO1xuICAgIC8vXG4gICAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdneW1NYXAnLCB7XG4gICAgICAgICAgICB1cmw6IFwiL2d5bS9tYXBcIixcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2d5bS9tYXAvbWFwLmh0bWxcIixcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEd5bU1hcENvbnRyb2xsZXJcblxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3VzZXJTZXR0aW5ncycsIHtcbiAgICAgICAgICAgIHVybDogXCIvdXNlcnMvOmlkL3NldHRpbmdzXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9zZXR0aW5nc1BhZ2UuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnd2FsbFZpZXcnLCB7XG4gICAgICAgICAgICB1cmw6IFwiL3dhbGwvOmlkXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9neW0vd2FsbC93YWxsLmh0bWxcIixcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6V2FsbENvbnRyb2xsZXJcbiAgICAgICAgfSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0Jztcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLkNPTkZJR19MT0FERUQgPSBcIkFjdGl2aXR5TW9kZWwuQ09ORklHX0xPQURFRFwiO1xuXG52YXIgQ29uZmlnTW9kZWwgPSBFdmVudERpc3BhdGNoZXIuZXh0ZW5kKHtcbiAgICBub3RpZmljYXRpb25zOiBudWxsLFxuICAgIGNvbmZpZzogbnVsbFxuXG59KTtcblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIENvbmZpZ01vZGVsUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IENvbmZpZ01vZGVsKCksXG5cblx0JGdldDogZnVuY3Rpb24oIE5vdGlmaWNhdGlvbnMsICRjb29raWVzLCAkaHR0cCl7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS4kY29va2llcyA9ICRjb29raWVzO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5jb25maWcgPSB7XG4gICAgICAgICAgICAgICAgYmFzZVVSTDogXCJodHRwOi8vcGxheWZhYi1zdGFnaW5nLmR1eGFwaS5jb21cIlxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy90aGlzLmluc3RhbmNlLmN1cnJlbnRVc2VyID0gSlNPTi5wYXJzZSgkY29va2llcy5jdXJyZW50VXNlcik7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2R1eHRlci5Db25maWdNb2RlbCcsW10pXG5cdC5wcm92aWRlcignQ29uZmlnTW9kZWwnLCBDb25maWdNb2RlbFByb3ZpZGVyKTtcbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5HQU1FX0xPQURFRCA9IFwiQWN0aXZpdHlNb2RlbC5HQU1FX0xPQURFRFwiO1xuXG52YXIgR2FtZU1vZGVsID0gRXZlbnREaXNwYXRjaGVyLmV4dGVuZCh7XG4gICAgZ2FtZToge1xuICAgICAgICBpbWFnZTogXCJpbWFnZXMvdW5pY29ybi5wbmdcIixcbiAgICAgICAgdGl0bGU6IFwiVU5JQ09STiBCQVRUTEVcIlxuICAgIH0sXG5cbiAgICBub3RpZmljYXRpb25zOiBudWxsLFxuICAgIGdhbWVTZXJ2aWNlOiBudWxsLFxuXG4gICAgZ2V0R2FtZUJ5SWQ6IGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzLkdhbWVTZXJ2aWNlLmdldEdhbWVCeUlkKGlkKTtcbiAgICB9XG5cbn0pO1xuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgR2FtZU1vZGVsUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IEdhbWVNb2RlbCgpLFxuXG5cdCRnZXQ6IGZ1bmN0aW9uKCBOb3RpZmljYXRpb25zLCBHYW1lU2VydmljZSl7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5nYW1lU2VydmljZSA9IEdhbWVTZXJ2aWNlO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdnYW1lcy5HYW1lTW9kZWwnLFtdKVxuXHQucHJvdmlkZXIoJ0dhbWVNb2RlbCcsIEdhbWVNb2RlbFByb3ZpZGVyKTtcbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLlVTRVJfU0lHTkVEX0lOID0gXCJBY3Rpdml0eU1vZGVsLlVTRVJfU0lHTkVEX0lOXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5VU0VSX1NJR05FRF9PVVQgPSBcIkFjdGl2aXR5TW9kZWwuVVNFUl9TSUdORURfT1VUXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5VU0VSX1VQREFURUQgPSBcIkFjdGl2aXR5TW9kZWwuVVNFUl9VUERBVEVEXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5QUk9GSUxFX0xPQURFRCA9IFwiQWN0aXZpdHlNb2RlbC5QUk9GSUxFX0xPQURFRFwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuQVVUSF9FUlJPUiA9IFwiQWN0aXZpdHlNb2RlbC5BVVRIX0VSUk9SXCI7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5ORVRXT1JLX0VSUk9SID0gXCJBY3Rpdml0eU1vZGVsLk5FVFdPUktfRVJST1JcIjtcblxudmFyIFVzZXJNb2RlbCA9IEV2ZW50RGlzcGF0Y2hlci5leHRlbmQoe1xuICAgIGN1cnJlbnRVc2VyOiBudWxsLFxuXG4gICAgVXNlclNlcnZpY2U6bnVsbCxcbiAgICBub3RpZmljYXRpb25zOiBudWxsLFxuXG4gICAgc2lnbkluOiBmdW5jdGlvbihlbWFpbCwgcGFzc3dvcmQpe1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuVXNlclNlcnZpY2Uuc2lnbkluKGVtYWlsLCBwYXNzd29yZCk7XG4gICAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VXNlciA9IHJlc3VsdHMuZGF0YS51c2VyO1xuICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLm5vdGlmeShtb2RlbHMuZXZlbnRzLlVTRVJfU0lHTkVEX0lOKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCBmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgaWYoZXJyb3IuZGF0YSl7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLm5vdGlmeShtb2RlbHMuZXZlbnRzLkFVVEhfRVJST1IsIGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLm5vdGlmeShtb2RlbHMuZXZlbnRzLk5FVFdPUktfRVJST1IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG5cblxuXG4gICAgICAgIC8qXG4gICAgICAgIHZhciB1c2VyID0ge1xuICAgICAgICAgICAgbmFtZTogXCJ0YWNvXCIsXG4gICAgICAgICAgICBhZ2U6IDM1XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy4kY29va2llcy5jdXJyZW50VXNlciA9IEpTT04uc3RyaW5naWZ5KHVzZXIpO1xuICAgICAgICAgKi9cbiAgICB9LFxuXG4gICAgc2lnbk91dDogZnVuY3Rpb24oKXtcbiAgICAgICAgLy90aGlzLlVzZXJTZXJ2aWNlLnNpZ25PdXQoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlVXNlcjogZnVuY3Rpb24odXNlcil7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcy5Vc2VyU2VydmljZS51cGRhdGVVc2VyKHVzZXIpO1xuICAgICAgICAvL3Byb21pc2UudGhlblxuICAgIH1cblxufSk7XG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBVc2VyTW9kZWxQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgVXNlck1vZGVsKCksXG5cblx0JGdldDogZnVuY3Rpb24oVXNlclNlcnZpY2UsIE5vdGlmaWNhdGlvbnMsICRjb29raWVzKXtcblx0ICAgIHRoaXMuaW5zdGFuY2UuVXNlclNlcnZpY2UgPSBVc2VyU2VydmljZTtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLiRjb29raWVzID0gJGNvb2tpZXM7XG4gICAgICAgICAgICAvL3RoaXMuaW5zdGFuY2UuY3VycmVudFVzZXIgPSBKU09OLnBhcnNlKCRjb29raWVzLmN1cnJlbnRVc2VyKTtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgndXNlcnMuVXNlck1vZGVsJyxbXSlcblx0LnByb3ZpZGVyKCdVc2VyTW9kZWwnLCBVc2VyTW9kZWxQcm92aWRlcik7XG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR2FtZVNlcnZpY2UgPSBDbGFzcy5leHRlbmQoe1xuICAgICRodHRwOiBudWxsLFxuXG4gICAgZ2V0R2FtZUJ5SWQ6IGZ1bmN0aW9uKGlkKXtcblxuICAgIH1cblxufSk7XG5cblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIEdhbWVTZXJ2aWNlUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IEdhbWVTZXJ2aWNlKCksXG5cdCRnZXQ6IGZ1bmN0aW9uKCRodHRwKXtcblx0ICAgIHRoaXMuaW5zdGFuY2UuJGh0dHAgPSAkaHR0cDtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnZ2FtZXMuR2FtZVNlcnZpY2UnLFtdKVxuXHQucHJvdmlkZXIoJ0dhbWVTZXJ2aWNlJywgR2FtZVNlcnZpY2VQcm92aWRlcik7XG59KCkpO1xuIiwiLypcclxuKiByd2RJbWFnZU1hcHMgalF1ZXJ5IHBsdWdpbiB2MS41XHJcbipcclxuKiBBbGxvd3MgaW1hZ2UgbWFwcyB0byBiZSB1c2VkIGluIGEgcmVzcG9uc2l2ZSBkZXNpZ24gYnkgcmVjYWxjdWxhdGluZyB0aGUgYXJlYSBjb29yZGluYXRlcyB0byBtYXRjaCB0aGUgYWN0dWFsIGltYWdlIHNpemUgb24gbG9hZCBhbmQgd2luZG93LnJlc2l6ZVxyXG4qXHJcbiogQ29weXJpZ2h0IChjKSAyMDEzIE1hdHQgU3Rvd1xyXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9zdG93YmFsbC9qUXVlcnktcndkSW1hZ2VNYXBzXHJcbiogaHR0cDovL21hdHRzdG93LmNvbVxyXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4qL1xyXG47KGZ1bmN0aW9uKGEpe2EuZm4ucndkSW1hZ2VNYXBzPWZ1bmN0aW9uKCl7dmFyIGM9dGhpczt2YXIgYj1mdW5jdGlvbigpe2MuZWFjaChmdW5jdGlvbigpe2lmKHR5cGVvZihhKHRoaXMpLmF0dHIoXCJ1c2VtYXBcIikpPT1cInVuZGVmaW5lZFwiKXtyZXR1cm59dmFyIGU9dGhpcyxkPWEoZSk7YShcIjxpbWcgLz5cIikubG9hZChmdW5jdGlvbigpe3ZhciBnPVwid2lkdGhcIixtPVwiaGVpZ2h0XCIsbj1kLmF0dHIoZyksaj1kLmF0dHIobSk7aWYoIW58fCFqKXt2YXIgbz1uZXcgSW1hZ2UoKTtvLnNyYz1kLmF0dHIoXCJzcmNcIik7aWYoIW4pe249by53aWR0aH1pZighail7aj1vLmhlaWdodH19dmFyIGY9ZC53aWR0aCgpLzEwMCxrPWQuaGVpZ2h0KCkvMTAwLGk9ZC5hdHRyKFwidXNlbWFwXCIpLnJlcGxhY2UoXCIjXCIsXCJcIiksbD1cImNvb3Jkc1wiO2EoJ21hcFtuYW1lPVwiJytpKydcIl0nKS5maW5kKFwiYXJlYVwiKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9YSh0aGlzKTtpZighci5kYXRhKGwpKXtyLmRhdGEobCxyLmF0dHIobCkpfXZhciBxPXIuZGF0YShsKS5zcGxpdChcIixcIikscD1uZXcgQXJyYXkocS5sZW5ndGgpO2Zvcih2YXIgaD0wO2g8cC5sZW5ndGg7KytoKXtpZihoJTI9PT0wKXtwW2hdPXBhcnNlSW50KCgocVtoXS9uKSoxMDApKmYpfWVsc2V7cFtoXT1wYXJzZUludCgoKHFbaF0vaikqMTAwKSprKX19ci5hdHRyKGwscC50b1N0cmluZygpKX0pfSkuYXR0cihcInNyY1wiLGQuYXR0cihcInNyY1wiKSl9KX07YSh3aW5kb3cpLnJlc2l6ZShiKS50cmlnZ2VyKFwicmVzaXplXCIpO3JldHVybiB0aGlzfX0pKGpRdWVyeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVXNlclNlcnZpY2UgPSBDbGFzcy5leHRlbmQoe1xuICAgICRodHRwOiBudWxsLFxuICAgIGNvbmZpZ01vZGVsOiBudWxsLFxuXG4gICAgc2lnbkluOiBmdW5jdGlvbihlbWFpbCwgcGFzc3dvcmQpe1xuICAgICAgICB2YXIgdXJsID0gdGhpcy5jb25maWdNb2RlbC5jb25maWcuYmFzZVVSTCArIFwiL2xvZ2luL3BsYXlmYWJcIjtcbiAgICAgICAgdmFyIHJlcSA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6ICB7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhyZXEpO1xuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChyZXEpO1xuICAgIH0sXG5cbiAgICBzaWduT3V0OiBmdW5jdGlvbigpe1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZVVzZXI6IGZ1bmN0aW9uKHVzZXIpe1xuXG4gICAgfVxuXG59KTtcblxuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgVXNlclNlcnZpY2VQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cdGluc3RhbmNlOiBuZXcgVXNlclNlcnZpY2UoKSxcblx0JGdldDogZnVuY3Rpb24oJGh0dHAsICRjb29raWVzLCBDb25maWdNb2RlbCl7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmNvbmZpZ01vZGVsID0gQ29uZmlnTW9kZWw7XG5cdCAgICB0aGlzLmluc3RhbmNlLiRodHRwID0gJGh0dHA7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ3VzZXJzLlVzZXJTZXJ2aWNlJyxbXSlcblx0LnByb3ZpZGVyKCdVc2VyU2VydmljZScsIFVzZXJTZXJ2aWNlUHJvdmlkZXIpO1xufSgpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE5hdkJhckRpcmVjdGl2ZSA9IEJhc2VEaXJlY3RpdmUuZXh0ZW5kKHtcbiAgdXNlck1vZGVsOiBudWxsLFxuICBub3RpZmljYXRpb25zOiBudWxsLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKCRzY29wZSwgVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKXtcbiAgICB0aGlzLnVzZXJNb2RlbCA9IFVzZXJNb2RlbDtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgIHRoaXMuX3N1cGVyKCRzY29wZSk7XG4gIH0sXG5cbiAgZGVmaW5lTGlzdGVuZXJzOiBmdW5jdGlvbigpe1xuICAgIHRoaXMubm90aWZpY2F0aW9ucy5hZGRFdmVudExpc3RlbmVyKG1vZGVscy5ldmVudHMuVVNFUl9TSUdORURfSU4sIHRoaXMuaGFuZGxlVXNlclNpZ25lZEluLmJpbmQodGhpcykpO1xuICAgIHRoaXMuJHNjb3BlLmxvZ291dCA9IHRoaXMubG9nb3V0LmJpbmQodGhpcyk7XG4gIH0sXG5cbiAgZGVmaW5lU2NvcGU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5uYXZTaG93aW5nID0gZmFsc2U7XG4gICAgdGhpcy4kc2NvcGUuY3VycmVudFVzZXIgPSB0aGlzLnVzZXJNb2RlbC5jdXJyZW50VXNlcjtcbiAgICB0aGlzLmluaXROYXYoKTtcbiAgfSxcblxuICBpbml0TmF2OiBmdW5jdGlvbigpe1xuICAgIHZhciBtb2JpbGVNZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJqcy1tb2JpbGUtbWVudVwiKTtcbiAgICB2YXIgbmF2TWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwianMtbmF2aWdhdGlvbi1tZW51XCIpO1xuICAgIG5hdk1lbnUuY2xhc3NOYW1lID0gbmF2TWVudS5jbGFzc05hbWUucmVwbGFjZSgvXFxic2hvd1xcYi8sJycpO1xuICAgIG1vYmlsZU1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZih0aGlzLm5hdlNob3dpbmcpe1xuICAgICAgICBuYXZNZW51LmNsYXNzTmFtZSA9IG5hdk1lbnUuY2xhc3NOYW1lLnJlcGxhY2UoL1xcYnNob3dcXGIvLCcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5hdk1lbnUuY2xhc3NOYW1lID0gbmF2TWVudS5jbGFzc05hbWUgKyBcIiBzaG93XCI7XG4gICAgICB9XG4gICAgICB0aGlzLm5hdlNob3dpbmcgPSAhdGhpcy5uYXZTaG93aW5nO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgbG9nb3V0OiBmdW5jdGlvbigpe1xuICAgIHRoaXMudXNlck1vZGVsLmxvZ291dCgpO1xuICAgIHRoaXMuJGxvY2F0aW9uLnVybChcIi9cIik7XG4gIH0sXG5cbiAgLyoqIEVWRU5UIEhBTkRMRVJTICoqL1xuICBoYW5kbGVVc2VyU2lnbmVkSW46IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kc2NvcGUuY3VycmVudFVzZXIgPSB0aGlzLnVzZXJNb2RlbC5jdXJyZW50VXNlcjtcbiAgfVxuXG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25hdmJhcicsW10pXG4uZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbihVc2VyTW9kZWwsIE5vdGlmaWNhdGlvbnMpe1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OidFJyxcbiAgICBpc29sYXRlOnRydWUsXG4gICAgbGluazogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgIG5ldyBOYXZCYXJEaXJlY3RpdmUoJHNjb3BlLCBVc2VyTW9kZWwsIE5vdGlmaWNhdGlvbnMpO1xuICAgIH0sXG4gICAgc2NvcGU6dHJ1ZSxcbiAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9uYXZiYXIvbmF2YmFyLmh0bWxcIlxuICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBHeW1NYXBDb250cm9sbGVyID0gQmFzZUNvbnRyb2xsZXIuZXh0ZW5kKHtcbiAgbm90aWZpY2F0aW9uczpudWxsLFxuICByb290Q2FudmFzOm51bGwsXG4gIHJvb3RJbWFnZTpudWxsLFxuICAkc3RhdGU6IG51bGwsXG5cbiAgLy8gaW5pdDpmdW5jdGlvbigkc2NvcGUsIE5vdGlmaWNhdGlvbnMsJHN0YXRlKXtcbiAgLy8gICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAvLyAgIHRoaXMuJHN0YXRlID0gJHN0YXRlO1xuICAvLyAgIHRoaXMuX3N1cGVyKCRzY29wZSk7XG4gIC8vIH0sXG5cbiAgaW5pdGlhbGl6ZTpmdW5jdGlvbigkc2NvcGUsIE5vdGlmaWNhdGlvbnMsJHN0YXRlKXtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgIHRoaXMuJHN0YXRlID0gJHN0YXRlO1xuICB9LFxuXG4gIGRlZmluZUxpc3RlbmVyczpmdW5jdGlvbigpe1xuICAgIHRoaXMuX3N1cGVyKCk7XG4gICAgdGhpcy4kc2NvcGUuYXJlYUNsaWNrZWQgPSB0aGlzLmFyZWFDbGlja2VkLmJpbmQodGhpcyk7XG4gICAgd2luZG93Lm9ucmVzaXplID0gdGhpcy5vblJlc2l6ZS5iaW5kKHRoaXMpO1xuICB9LFxuXG4gIGRlZmluZVNjb3BlOmZ1bmN0aW9uKCl7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKGUpIHtcblxuICAgICAgdGhhdC5yb290SW1hZ2UgPSAkKCcuaW1hZ2VMYXllciBpbWcnKS5vbignbG9hZC5vbWdtYXBzJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAkKHRoaXMpLnJ3ZEltYWdlTWFwcygpO1xuICAgICAgICB0aGF0LmhpZ2hsaWdodE1hcCgpO1xuXG5cbiAgICAgIH0pLmNzcygnb3BhY2l0eScsJzAnKTtcblxuICAgICAgY29uc29sZS5sb2coXCJkb25lXCIpO1xuXG4gICAgfSk7XG5cblxuICB9LFxuXG4gIGRlc3Ryb3k6ZnVuY3Rpb24oKXtcbiAgICAkKCdhcmVhJykub2ZmKCcub21nbWFwcycpO1xuICAgICQoJ2ltZycpLm9mZignLm9tZ21hcHMnKTtcbiAgfSxcblxuXG4gIGFyZWFDbGlja2VkOiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUubG9nKFwiUkNIXCIpO1xuICB9LFxuXG4gIGNyZWF0ZVJvb3RDYW52YXM6ZnVuY3Rpb24oKXtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJvb3RJbWFnZSxcbiAgICBpbWdXaWR0aCA9IGltYWdlLndpZHRoKCksXG4gICAgaW1nSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0KCk7XG5cbiAgICB0aGlzLnJvb3RDYW52YXMgPSAkKCc8Y2FudmFzPicpLmF0dHIoJ3dpZHRoJyxpbWdXaWR0aCkuYXR0cignaGVpZ2h0JyxpbWdIZWlnaHQpO1xuICAgIHRoaXMucm9vdENhbnZhcy5jc3Moe1xuICAgICAgcG9zaXRpb246J2Fic29sdXRlJyxcbiAgICAgIHRvcDonMHB4JyxcbiAgICAgIGxlZnQ6JzBweCcsXG4gICAgICBoZWlnaHQ6J2F1dG8nXG4gICAgfSk7XG4gICAgaW1hZ2UuYmVmb3JlKHRoaXMucm9vdENhbnZhcyk7XG4gICAgdmFyIGN0eCA9IHRoaXMucm9vdENhbnZhcy5nZXQoMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjdHguZHJhd0ltYWdlKGltYWdlLmdldCgwKSwwLDAsaW1nV2lkdGgsIGltZ0hlaWdodCk7XG4gIH0sXG5cbiAgcmVkcmF3Um9vdENhbnZhczogZnVuY3Rpb24oKXtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJvb3RJbWFnZSxcbiAgICBpbWdXaWR0aCA9IGltYWdlLndpZHRoKCksXG4gICAgaW1nSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0KCk7XG5cbiAgICB2YXIgY3R4ID0gdGhpcy5yb290Q2FudmFzLmdldCgwKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5yb290Q2FudmFzLmdldCgwKS53aWR0aCwgdGhpcy5yb290Q2FudmFzLmdldCgwKS53aWR0aCk7XG5cbiAgICB0aGlzLnJvb3RDYW52YXMuYXR0cignd2lkdGgnLGltZ1dpZHRoKS5hdHRyKCdoZWlnaHQnLGltZ0hlaWdodCk7XG5cbiAgICBjdHguZHJhd0ltYWdlKGltYWdlLmdldCgwKSwwLDAsaW1hZ2Uud2lkdGgoKSwgaW1hZ2UuaGVpZ2h0KCkpO1xuICB9LFxuXG4gIGhpZ2hsaWdodE1hcDogZnVuY3Rpb24oKXtcblxuICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICBib2R5ID0gJCgnYm9keScpLFxuICAgIGNvbnRlbnRBcmVhID0gJCgnLm1hcENvbnRlbnQnKSxcbiAgICBtYXAgPSAkKFwiI2d5bU1hcFwiKSxcbiAgICBtYXBFbCA9ICQoXCIjZ3ltTWFwXCIpLmdldCgwKSxcbiAgICBtYXBBcmVhcyA9IG1hcC5maW5kKCdhcmVhJyksXG4gICAgaW1hZ2UgPSB0aGlzLnJvb3RJbWFnZSxcblxuICAgIC8vIGdldCB0aGUgd2lkdGggYW5kIGhlaWdodCBmcm9tIHRoZSBpbWFnZSB0YWdcbiAgICBpbWdXaWR0aCA9IGltYWdlLndpZHRoKCksXG4gICAgaW1nSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0KCksXG4gICAgaW1nQXR0cldpZHRoID0gaW1hZ2UuYXR0cignd2lkdGgnKSxcbiAgICBpbWdBdHRySGVpZ2h0ID0gaW1hZ2UuYXR0cignaGVpZ2h0JyksXG4gICAgeEZhY3RvciA9IHBhcnNlRmxvYXQoaW1nV2lkdGgvaW1nQXR0cldpZHRoKSxcbiAgICB5RmFjdG9yID0gcGFyc2VGbG9hdChpbWdIZWlnaHQvaW1nQXR0ckhlaWdodCk7XG5cbiAgICAvLyAgICAgICAgY29uc29sZS5sb2coJ2ltZ0F0dHJXaWR0aDogJytpbWdBdHRyV2lkdGgpO1xuICAgIC8vICAgICAgICBjb25zb2xlLmxvZygnaW1nQXR0ckhlaWdodDogJytpbWdBdHRySGVpZ2h0KTtcbiAgICAvLyAgICAgICAgY29uc29sZS5sb2coJ3hGYWN0b3I6ICcreEZhY3Rvcik7XG4gICAgLy8gICAgICAgIGNvbnNvbGUubG9nKCd5RmFjdG9yOiAnK3lGYWN0b3IpO1xuXG5cbiAgICB2YXIgcm9vdENhbnZhcyA9IHRoaXMuY3JlYXRlUm9vdENhbnZhcygpO1xuXG4gICAgJC5lYWNoKG1hcEFyZWFzLCBmdW5jdGlvbihpbmRleCwgYXJlYSl7XG4gICAgICB2YXIgYXJlYSA9ICQoYXJlYSk7XG4gICAgICB2YXIgYXJlYUVsID0gYXJlYS5nZXQoMCk7XG4gICAgICB2YXIgY29vcmRzID0gYXJlYUVsLmNvb3Jkcy5zcGxpdChcIiwgXCIpO1xuXG4gICAgICAvLyBtYXAgdGhlIGNvb3JkcyBiZWNhdXNlIHRoZXkgYXJlIHNjYWxlZCBmb3IgdGhlIGltYWdlIHNpemUgYW5kIG5vdCB0aGUgb3RoZXIgc2l6ZVxuICAgICAgY29vcmRzID0gY29vcmRzLm1hcChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpe1xuICAgICAgICBpZihpbmRleCUyID09PSAwKXtcbiAgICAgICAgICAvLyB4IGNvb3JkXG4gICAgICAgICAgcmV0dXJuIHZhbHVlICogeEZhY3RvcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB5IGNvb3JkXG4gICAgICAgICAgcmV0dXJuIHZhbHVlICogeUZhY3RvcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGNyZWF0ZSBhIGNhbnZhc1xuICAgICAgdmFyIGNhbnZhcyA9ICQoJzxjYW52YXM+JykuYXR0cignd2lkdGgnLGltZ1dpZHRoKS5hdHRyKCdoZWlnaHQnLGltZ0hlaWdodCkuYWRkQ2xhc3MoJ21hcC1vdmVybGF5Jyk7XG4gICAgICBjYW52YXMuY3NzKHtcbiAgICAgICAgcG9zaXRpb246J2Fic29sdXRlJyxcbiAgICAgICAgdG9wOicwcHgnLFxuICAgICAgICBsZWZ0OicwcHgnLFxuICAgICAgICBvcGFjaXR5OicwLjAnLFxuICAgICAgICBkaXNwbGF5Oidub25lJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGF0dGFjaCBzYWlkIGNhbnZhcyB0byBET01cbiAgICAgIGNvbnRlbnRBcmVhLmZpbmQoJ2ltZycpLmJlZm9yZShjYW52YXMpO1xuXG4gICAgICAvLyBncmFiIHRoZSBjYW52YXMgY29udGV4dFxuICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXQoMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnI2YwMCc7XG5cbiAgICAgIHZhciB4ID0gY29vcmRzWzBdLFxuICAgICAgeSA9IGNvb3Jkc1sxXTtcblxuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgY3R4Lm1vdmVUbyh4LCB5KTtcbiAgICAgIGZvcih2YXIgaiA9IDIsbGVuID0gY29vcmRzLmxlbmd0aDsgaiA8IGxlbi0xIDsgaiArPSAyICl7XG4gICAgICAgIHggPSBjb29yZHNbal07XG4gICAgICAgIHkgPSBjb29yZHNbaiArIDFdO1xuXG4gICAgICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gICAgICB9XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICBjdHguZmlsbCgpO1xuXG4gICAgICAvLyBjcmVhdGUgYW4gYXJlYSBtb3VzZWVudGVyIGV2ZW50IGxpc3RlbmVyXG4gICAgICBhcmVhLm9uKCdtb3VzZWVudGVyLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbW91c2UgZW50ZXInKTtcbiAgICAgICAgICBjYW52YXMuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgY2FudmFzLmFuaW1hdGUoe29wYWNpdHk6JzEuMCd9LDIwMCwnbGluZWFyJyk7XG4gICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5hbmltYXRlKHtkaXNwbGF5OidibG9jayd9LDIwMCwnbGluZWFyJyk7XG4gICAgICAgIH1cbiAgICAgIH0pKGNhbnZhcykpO1xuXG4gICAgICBhcmVhLm9uKCdtb3VzZWxlYXZlLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbW91c2UgbGVhdmUnKTtcbiAgICAgICAgICBjYW52YXMuYW5pbWF0ZSh7b3BhY2l0eTonMC4wJ30sMjAwLCdsaW5lYXInLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjYW52YXMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgY2FudmFzLmFuaW1hdGUoe2Rpc3BsYXk6J25vbmUnfSwyMDAsJ2xpbmVhcicpO1xuICAgICAgICB9XG4gICAgICB9KShjYW52YXMpKTtcblxuICAgICAgYXJlYS5vbignY2xpY2sub21nbWFwcycsIChmdW5jdGlvbihjYW52YXMpe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhhdC4kc3RhdGUuZ28oJ3dhbGxWaWV3Jyx7aWQ6JzEwJ30pO1xuICAgICAgICB9XG4gICAgICB9KShjYW52YXMpKTtcblxuICAgIH0pO1xuXG4gIH0sXG5cbiAgb25SZXNpemU6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgaWYodGhpcy5yZXNpemVUaW1lb3V0KXtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2l6ZVRpbWVvdXQpO1xuICAgIH1cbiAgICB0aGlzLnJlc2l6ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICB0aGF0LnJlc2l6ZSgpO1xuICAgIH0sIDIwMCk7XG4gIH0sXG5cbiAgcmVzaXplOiBmdW5jdGlvbigpe1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBjb25zb2xlLmxvZygncmVzaXplJyk7XG5cbiAgICBpZih0aGlzLnJvb3RDYW52YXMpe1xuICAgICAgdGhpcy5yZWRyYXdSb290Q2FudmFzKCk7XG4gICAgfVxuXG4gICAgJCgnY2FudmFzLm1hcC1vdmVybGF5JykuZWFjaChmdW5jdGlvbihpbmRleCwgY2FudmFzKXtcbiAgICAgIGNhbnZhcyA9ICQoY2FudmFzKTtcblxuICAgICAgY2FudmFzLmNzcyh7XG4gICAgICAgIGhlaWdodDogdGhhdC5yb290SW1hZ2UuaGVpZ2h0KCksXG4gICAgICAgIHdpZHRoOiB0aGF0LnJvb3RJbWFnZS53aWR0aCgpXG4gICAgICB9KVxuICAgIH0pO1xuICB9XG5cbn0pO1xuXG5cbkd5bU1hcENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywnTm90aWZpY2F0aW9ucycsJyRzdGF0ZSddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgV2FsbENvbnRyb2xsZXIgPSBCYXNlQ29udHJvbGxlci5leHRlbmQoe1xuICBub3RpZmljYXRpb25zOm51bGwsXG4gIHJvb3RDYW52YXM6bnVsbCxcbiAgcm9vdEltYWdlOm51bGwsXG4gICRzdGF0ZTogbnVsbCxcblxuICBpbml0OmZ1bmN0aW9uKCRzY29wZSwgTm90aWZpY2F0aW9ucywkc3RhdGUpe1xuICAgIHRoaXMubm90aWZpY2F0aW9ucyA9IE5vdGlmaWNhdGlvbnM7XG4gICAgdGhpcy4kc3RhdGUgPSAkc3RhdGU7XG4gICAgdGhpcy5fc3VwZXIoJHNjb3BlKTtcbiAgfSxcblxuICBkZWZpbmVMaXN0ZW5lcnM6ZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZygnd2FsbCBjb250cm9sbGVyOiBkZWZpbmUgbGlzdGVuZXJzJyk7XG4gICAgdGhpcy5fc3VwZXIoKTtcbiAgfSxcblxuICBkZWZpbmVTY29wZTpmdW5jdGlvbigpe1xuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICB9LFxuXG4gIGRlc3Ryb3k6ZnVuY3Rpb24oKXtcblxuICB9LFxuXG59KTtcblxuV2FsbENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywnTm90aWZpY2F0aW9ucycsJyRzdGF0ZSddO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9