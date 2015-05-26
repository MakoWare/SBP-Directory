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
  $stateParams: null,

  initialize:function($scope, Notifications,$state,$stateParams){
    this.notifications = Notifications;
    this.$state = $state;
    this.$stateParams = $stateParams;
  },

  defineListeners:function(){
    this._super();
  },

  defineScope:function(){
    this.$scope.wallId = this.$stateParams.wallId;
  },

  destroy:function(){

  },

});

WallController.$inject = ['$scope','Notifications','$state','$stateParams'];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYXNzLmpzIiwiQmFzZUNvbnRyb2xsZXIuanMiLCJCYXNlRGlyZWN0aXZlLmpzIiwiRXZlbnREaXNwYXRjaGVyLmpzIiwiTmFtZXNwYWNlLmpzIiwiTm90aWZpY2F0aW9ucy5qcyIsImFwcC5qcyIsIm1vZGVscy9jb25maWdNb2RlbC5qcyIsIm1vZGVscy9nYW1lTW9kZWwuanMiLCJtb2RlbHMvdXNlck1vZGVsLmpzIiwic2VydmljZXMvZ2FtZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9pbWFnZU1hcC5taW4uanMiLCJzZXJ2aWNlcy91c2VyU2VydmljZS5qcyIsImNvbXBvbmVudHMvbmF2YmFyL25hdmJhckRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvZ3ltL21hcC9neW1NYXBDb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9neW0vd2FsbC93YWxsQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgZm5UZXN0ID0gL3h5ei8udGVzdChmdW5jdGlvbigpe3h5ejt9KSA/IC9cXGJfc3VwZXJcXGIvIDogLy4qLztcblxuICAvLyBUaGUgYmFzZSBDbGFzcyBpbXBsZW1lbnRhdGlvbiAoZG9lcyBub3RoaW5nKVxuICBmdW5jdGlvbiBCYXNlQ2xhc3MoKXt9XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IENsYXNzIHRoYXQgaW5oZXJpdHMgZnJvbSB0aGlzIGNsYXNzXG4gIEJhc2VDbGFzcy5leHRlbmQgPSBmdW5jdGlvbihwcm9wcykge1xuICAgIHZhciBfc3VwZXIgPSB0aGlzLnByb3RvdHlwZTtcblxuICAgIC8vIFNldCB1cCB0aGUgcHJvdG90eXBlIHRvIGluaGVyaXQgZnJvbSB0aGUgYmFzZSBjbGFzc1xuICAgIC8vIChidXQgd2l0aG91dCBydW5uaW5nIHRoZSBpbml0IGNvbnN0cnVjdG9yKVxuICAgIHZhciBwcm90byA9IE9iamVjdC5jcmVhdGUoX3N1cGVyKTtcblxuICAgIC8vIENvcHkgdGhlIHByb3BlcnRpZXMgb3ZlciBvbnRvIHRoZSBuZXcgcHJvdG90eXBlXG4gICAgZm9yICh2YXIgbmFtZSBpbiBwcm9wcykge1xuICAgICAgLy8gQ2hlY2sgaWYgd2UncmUgb3ZlcndyaXRpbmcgYW4gZXhpc3RpbmcgZnVuY3Rpb25cbiAgICAgIHByb3RvW25hbWVdID0gdHlwZW9mIHByb3BzW25hbWVdID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgdHlwZW9mIF9zdXBlcltuYW1lXSA9PSBcImZ1bmN0aW9uXCIgJiYgZm5UZXN0LnRlc3QocHJvcHNbbmFtZV0pXG4gICAgICAgID8gKGZ1bmN0aW9uKG5hbWUsIGZuKXtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIHRtcCA9IHRoaXMuX3N1cGVyO1xuXG4gICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyAuX3N1cGVyKCkgbWV0aG9kIHRoYXQgaXMgdGhlIHNhbWUgbWV0aG9kXG4gICAgICAgICAgICAgIC8vIGJ1dCBvbiB0aGUgc3VwZXItY2xhc3NcbiAgICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSBfc3VwZXJbbmFtZV07XG5cbiAgICAgICAgICAgICAgLy8gVGhlIG1ldGhvZCBvbmx5IG5lZWQgdG8gYmUgYm91bmQgdGVtcG9yYXJpbHksIHNvIHdlXG4gICAgICAgICAgICAgIC8vIHJlbW92ZSBpdCB3aGVuIHdlJ3JlIGRvbmUgZXhlY3V0aW5nXG4gICAgICAgICAgICAgIHZhciByZXQgPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB0aGlzLl9zdXBlciA9IHRtcDtcblxuICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KShuYW1lLCBwcm9wc1tuYW1lXSlcbiAgICAgICAgOiBwcm9wc1tuYW1lXTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbmV3IGNvbnN0cnVjdG9yXG4gICAgdmFyIG5ld0NsYXNzID0gdHlwZW9mIHByb3RvLmluaXQgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBwcm90by5oYXNPd25Qcm9wZXJ0eShcImluaXRcIilcbiAgICAgICAgPyBwcm90by5pbml0IC8vIEFsbCBjb25zdHJ1Y3Rpb24gaXMgYWN0dWFsbHkgZG9uZSBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgOiBmdW5jdGlvbiBTdWJDbGFzcygpeyBfc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9XG4gICAgICA6IGZ1bmN0aW9uIEVtcHR5Q2xhc3MoKXt9O1xuXG4gICAgLy8gUG9wdWxhdGUgb3VyIGNvbnN0cnVjdGVkIHByb3RvdHlwZSBvYmplY3RcbiAgICBuZXdDbGFzcy5wcm90b3R5cGUgPSBwcm90bztcblxuICAgIC8vIEVuZm9yY2UgdGhlIGNvbnN0cnVjdG9yIHRvIGJlIHdoYXQgd2UgZXhwZWN0XG4gICAgcHJvdG8uY29uc3RydWN0b3IgPSBuZXdDbGFzcztcblxuICAgIC8vIEFuZCBtYWtlIHRoaXMgY2xhc3MgZXh0ZW5kYWJsZVxuICAgIG5ld0NsYXNzLmV4dGVuZCA9IEJhc2VDbGFzcy5leHRlbmQ7XG5cbiAgICByZXR1cm4gbmV3Q2xhc3M7XG4gIH07XG5cbiAgLy8gZXhwb3J0XG4gIGdsb2JhbC5DbGFzcyA9IEJhc2VDbGFzcztcbn0pKHRoaXMpO1xuIiwidmFyIEJhc2VDb250cm9sbGVyID0gQ2xhc3MuZXh0ZW5kKHtcbiAgc2NvcGU6IG51bGwsXG5cbiAgaW5pdDpmdW5jdGlvbihzY29wZSl7XG4gICAgdGhpcy4kc2NvcGUgPSBzY29wZTtcbiAgICB0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuICAgIHRoaXMuZGVmaW5lTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5kZWZpbmVTY29wZSgpO1xuICB9LFxuXG4gIGluaXRpYWxpemU6ZnVuY3Rpb24oKXtcbiAgICAvL09WRVJSSURFXG4gIH0sXG5cbiAgZGVmaW5lTGlzdGVuZXJzOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuJHNjb3BlLiRvbignJGRlc3Ryb3knLHRoaXMuZGVzdHJveS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuXG4gIGRlZmluZVNjb3BlOiBmdW5jdGlvbigpe1xuICAgIC8vT1ZFUlJJREVcbiAgfSxcblxuXG4gIGRlc3Ryb3k6ZnVuY3Rpb24oZXZlbnQpe1xuICAgIC8vT1ZFUlJJREVcbiAgfVxufSk7XG5cbkJhc2VDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZSddO1xuIiwidmFyIEJhc2VEaXJlY3RpdmUgPSBDbGFzcy5leHRlbmQoe1xuICBzY29wZTogbnVsbCxcblxuICBpbml0OmZ1bmN0aW9uKHNjb3BlKXtcbiAgICB0aGlzLiRzY29wZSA9IHNjb3BlO1xuICAgIHRoaXMuZGVmaW5lTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5kZWZpbmVTY29wZSgpO1xuICB9LFxuXG4gIGRlZmluZUxpc3RlbmVyczogZnVuY3Rpb24oKXtcbiAgICB0aGlzLiRzY29wZS4kb24oJyRkZXN0cm95Jyx0aGlzLmRlc3Ryb3kuYmluZCh0aGlzKSk7XG4gIH0sXG5cblxuICBkZWZpbmVTY29wZTogZnVuY3Rpb24oKXtcbiAgICAvL09WRVJSSURFXG4gIH0sXG5cblxuICBkZXN0cm95OmZ1bmN0aW9uKGV2ZW50KXtcbiAgICAvL09WRVJSSURFXG4gIH1cbn0pO1xuXG5CYXNlRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRzY29wZSddO1xuIiwiLyoqXG4qIEV2ZW50IGRpc3BhdGNoZXIgY2xhc3MsXG4qIGFkZCBhYmlsaXR5IHRvIGRpc3BhdGNoIGV2ZW50XG4qIG9uIG5hdGl2ZSBjbGFzc2VzLlxuKlxuKiBVc2Ugb2YgQ2xhc3MuanNcbipcbiogQGF1dGhvciB1bml2ZXJzYWxtaW5kLmNvbVxuKi9cbnZhciBFdmVudERpc3BhdGNoZXIgPSBDbGFzcy5leHRlbmQoe1xuICAgIF9saXN0ZW5lcnM6e30sXG5cbiAgICAvKipcbiAgICAqIEFkZCBhIGxpc3RlbmVyIG9uIHRoZSBvYmplY3RcbiAgICAqIEBwYXJhbSB0eXBlIDogRXZlbnQgdHlwZVxuICAgICogQHBhcmFtIGxpc3RlbmVyIDogTGlzdGVuZXIgY2FsbGJhY2tcbiAgICAqLyAgXG4gICAgYWRkRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbih0eXBlLGxpc3RlbmVyKXtcbiAgICAgICAgaWYoIXRoaXMuX2xpc3RlbmVyc1t0eXBlXSl7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ucHVzaChsaXN0ZW5lcilcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgICAqIFJlbW92ZSBhIGxpc3RlbmVyIG9uIHRoZSBvYmplY3RcbiAgICAgICAqIEBwYXJhbSB0eXBlIDogRXZlbnQgdHlwZVxuICAgICAgICogQHBhcmFtIGxpc3RlbmVyIDogTGlzdGVuZXIgY2FsbGJhY2tcbiAgICAgICAqLyAgXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbih0eXBlLGxpc3RlbmVyKXtcbiAgICAgIGlmKHRoaXMuX2xpc3RlbmVyc1t0eXBlXSl7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5pbmRleE9mKGxpc3RlbmVyKTtcblxuICAgICAgICBpZihpbmRleCE9PS0xKXtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5zcGxpY2UoaW5kZXgsMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAqIERpc3BhdGNoIGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGxpc3RlbmVyXG4gICAgKiBAcGFyYW0gTXV0aXBsZSBwYXJhbXMgYXZhaWxhYmxlLCBmaXJzdCBtdXN0IGJlIHN0cmluZ1xuICAgICovIFxuICAgIGRpc3BhdGNoRXZlbnQ6ZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGxpc3RlbmVycztcblxuICAgICAgICBpZih0eXBlb2YgYXJndW1lbnRzWzBdICE9PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0V2ZW50RGlzcGF0Y2hlcicsJ0ZpcnN0IHBhcmFtcyBtdXN0IGJlIGFuIGV2ZW50IHR5cGUgKFN0cmluZyknKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1thcmd1bWVudHNbMF1dO1xuXG4gICAgICAgICAgICBmb3IodmFyIGtleSBpbiBsaXN0ZW5lcnMpe1xuICAgICAgICAgICAgICAgIC8vVGhpcyBjb3VsZCB1c2UgLmFwcGx5KGFyZ3VtZW50cykgaW5zdGVhZCwgYnV0IHRoZXJlIGlzIGN1cnJlbnRseSBhIGJ1ZyB3aXRoIGl0LlxuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1trZXldKGFyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KVxuXG5cbiIsIi8qKlxuKiBTaW1wbGUgbmFtZXNwYWNlIHV0aWwgdG8gZXh0YW5kIENsYXNzLmpzIGZ1bmN0aW9uYWxpdHlcbiogYW5kIHdyYXAgY2xhc3NlcyBpbiBuYW1lc3BhY2UuXG4qIEBhdXRob3IgdG9tbXkucm9jaGV0dGVbZm9sbG93ZWQgYnkgdGhlIHVzdWFsIHNpZ25ddW5pdmVyc2FsbWluZC5jb21cbiogQHR5cGUgeyp9XG4qIEByZXR1cm4gT2JqZWN0XG4qL1xud2luZG93Lm5hbWVzcGFjZSA9IGZ1bmN0aW9uKG5hbWVzcGFjZXMpe1xuICAgJ3VzZSBzdHJpY3QnO1xuICAgdmFyIG5hbWVzID0gbmFtZXNwYWNlcy5zcGxpdCgnLicpO1xuICAgdmFyIGxhc3QgID0gd2luZG93O1xuICAgdmFyIG5hbWUgID0gbnVsbDtcbiAgIHZhciBpICAgICA9IG51bGw7XG5cbiAgIGZvcihpIGluIG5hbWVzKXtcbiAgICAgICBuYW1lID0gbmFtZXNbaV07XG5cbiAgICAgICBpZihsYXN0W25hbWVdPT09dW5kZWZpbmVkKXtcbiAgICAgICAgICAgbGFzdFtuYW1lXSA9IHt9O1xuICAgICAgIH1cblxuICAgICAgIGxhc3QgPSBsYXN0W25hbWVdO1xuICAgfVxuICAgcmV0dXJuIGxhc3Q7XG59O1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICd1c2Ugc3RyaWN0JztcbiAgIC8qKlxuXHQgKiBDcmVhdGUgYSBnbG9iYWwgZXZlbnQgZGlzcGF0Y2hlclxuXHQgKiB0aGF0IGNhbiBiZSBpbmplY3RlZCBhY2Nyb3NzIG11bHRpcGxlIGNvbXBvbmVudHNcblx0ICogaW5zaWRlIHRoZSBhcHBsaWNhdGlvblxuXHQgKlxuXHQgKiBVc2Ugb2YgQ2xhc3MuanNcblx0ICogQHR5cGUge2NsYXNzfVxuXHQgKiBAYXV0aG9yIHVuaXZlcnNhbG1pbmQuY29tXG5cdCAqL1xuICAgdmFyIE5vdGlmaWNhdGlvbnNQcm92aWRlciA9IENsYXNzLmV4dGVuZCh7XG5cbiAgICAgICBpbnN0YW5jZTogbmV3IEV2ZW50RGlzcGF0Y2hlcigpLFxuXG4gICAgICAgLyoqXG4gICAgICAgICogQ29uZmlndXJlcyBhbmQgcmV0dXJucyBpbnN0YW5jZSBvZiBHbG9iYWxFdmVudEJ1cy5cbiAgICAgICAgKlxuICAgICAgICAqIEByZXR1cm4ge0dsb2JhbEV2ZW50QnVzfVxuICAgICAgICAqL1xuICAgICAgICRnZXQ6IFtmdW5jdGlvbiAoKSB7XG4gICAgICAgXHQgICB0aGlzLmluc3RhbmNlLm5vdGlmeSA9IHRoaXMuaW5zdGFuY2UuZGlzcGF0Y2hFdmVudDtcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG4gICAgICAgfV1cbiAgIH0pO1xuXG4gICBhbmd1bGFyLm1vZHVsZSgnbm90aWZpY2F0aW9ucycsIFtdKVxuICAgICAgIC5wcm92aWRlcignTm90aWZpY2F0aW9ucycsIE5vdGlmaWNhdGlvbnNQcm92aWRlcik7XG59KCkpOyIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3BsYXlmYWInLCBbXG4gICAgJ25vdGlmaWNhdGlvbnMnLFxuXG4gICAgJ25hdmJhcicsXG5cbiAgICAvL1VzZXJcbiAgICAndXNlcnMuVXNlck1vZGVsJyxcbiAgICAndXNlcnMuVXNlclNlcnZpY2UnLFxuXG4gICAgLy9Db25maWdcbiAgICAnZHV4dGVyLkNvbmZpZ01vZGVsJyxcblxuICAgIC8qXG4gICAgIC8vQXJ0aWNsZXNcbiAgICAgJ2FydGljbGVzLkFydGljbGVNb2RlbCcsXG4gICAgICdhcnRpY2xlcy5BcnRpY2xlU2VydmljZScsXG4gICAgICdhcnRpY2xlcy5hcnRpY2xlTGlzdCcsXG4gICAgICdhcnRpY2xlcy5hcnRpY2xlTGlzdEl0ZW0nLFxuXG4gICAgIC8vQ29tbWVudHNcbiAgICAgJ2NvbW1lbnRzLkNvbW1lbnRNb2RlbCcsXG4gICAgICdjb21tZW50cy5Db21tZW50U2VydmljZScsXG4gICAgICdjb21tZW50cy5jb21tZW50TGlzdCcsXG4gICAgICdjb21tZW50cy5jb21tZW50TGlzdEl0ZW0nLFxuICAgICAqL1xuXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ25nQ29va2llcycsXG4gICAgJ25nQW5pbWF0ZSdcblxuXSkuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAvL1xuICAgIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3N0YXRlMVxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvZ3ltL21hcFwiKTtcbiAgICAvL1xuICAgIC8vIE5vdyBzZXQgdXAgdGhlIHN0YXRlc1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnZ3ltTWFwJywge1xuICAgICAgICAgICAgdXJsOiBcIi9neW0vbWFwXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9neW0vbWFwL21hcC5odG1sXCIsXG4gICAgICAgICAgICBjb250cm9sbGVyOiBHeW1NYXBDb250cm9sbGVyXG5cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCd1c2VyU2V0dGluZ3MnLCB7XG4gICAgICAgICAgICB1cmw6IFwiL3VzZXJzLzppZC9zZXR0aW5nc1wiLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvc2V0dGluZ3NQYWdlLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3dhbGxWaWV3Jywge1xuICAgICAgICAgICAgdXJsOiBcIi93YWxsLzppZFwiLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvZ3ltL3dhbGwvd2FsbC5odG1sXCIsXG4gICAgICAgICAgICBjb250cm9sbGVyOldhbGxDb250cm9sbGVyXG4gICAgICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5DT05GSUdfTE9BREVEID0gXCJBY3Rpdml0eU1vZGVsLkNPTkZJR19MT0FERURcIjtcblxudmFyIENvbmZpZ01vZGVsID0gRXZlbnREaXNwYXRjaGVyLmV4dGVuZCh7XG4gICAgbm90aWZpY2F0aW9uczogbnVsbCxcbiAgICBjb25maWc6IG51bGxcblxufSk7XG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBDb25maWdNb2RlbFByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBDb25maWdNb2RlbCgpLFxuXG5cdCRnZXQ6IGZ1bmN0aW9uKCBOb3RpZmljYXRpb25zLCAkY29va2llcywgJGh0dHApe1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuJGNvb2tpZXMgPSAkY29va2llcztcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGJhc2VVUkw6IFwiaHR0cDovL3BsYXlmYWItc3RhZ2luZy5kdXhhcGkuY29tXCJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vdGhpcy5pbnN0YW5jZS5jdXJyZW50VXNlciA9IEpTT04ucGFyc2UoJGNvb2tpZXMuY3VycmVudFVzZXIpO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdkdXh0ZXIuQ29uZmlnTW9kZWwnLFtdKVxuXHQucHJvdmlkZXIoJ0NvbmZpZ01vZGVsJywgQ29uZmlnTW9kZWxQcm92aWRlcik7XG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuR0FNRV9MT0FERUQgPSBcIkFjdGl2aXR5TW9kZWwuR0FNRV9MT0FERURcIjtcblxudmFyIEdhbWVNb2RlbCA9IEV2ZW50RGlzcGF0Y2hlci5leHRlbmQoe1xuICAgIGdhbWU6IHtcbiAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL3VuaWNvcm4ucG5nXCIsXG4gICAgICAgIHRpdGxlOiBcIlVOSUNPUk4gQkFUVExFXCJcbiAgICB9LFxuXG4gICAgbm90aWZpY2F0aW9uczogbnVsbCxcbiAgICBnYW1lU2VydmljZTogbnVsbCxcblxuICAgIGdldEdhbWVCeUlkOiBmdW5jdGlvbihpZCl7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcy5HYW1lU2VydmljZS5nZXRHYW1lQnlJZChpZCk7XG4gICAgfVxuXG59KTtcblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIEdhbWVNb2RlbFByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBHYW1lTW9kZWwoKSxcblxuXHQkZ2V0OiBmdW5jdGlvbiggTm90aWZpY2F0aW9ucywgR2FtZVNlcnZpY2Upe1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuZ2FtZVNlcnZpY2UgPSBHYW1lU2VydmljZTtcblx0ICAgIHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnZ2FtZXMuR2FtZU1vZGVsJyxbXSlcblx0LnByb3ZpZGVyKCdHYW1lTW9kZWwnLCBHYW1lTW9kZWxQcm92aWRlcik7XG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5uYW1lc3BhY2UoJ21vZGVscy5ldmVudHMnKS5VU0VSX1NJR05FRF9JTiA9IFwiQWN0aXZpdHlNb2RlbC5VU0VSX1NJR05FRF9JTlwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuVVNFUl9TSUdORURfT1VUID0gXCJBY3Rpdml0eU1vZGVsLlVTRVJfU0lHTkVEX09VVFwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuVVNFUl9VUERBVEVEID0gXCJBY3Rpdml0eU1vZGVsLlVTRVJfVVBEQVRFRFwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuUFJPRklMRV9MT0FERUQgPSBcIkFjdGl2aXR5TW9kZWwuUFJPRklMRV9MT0FERURcIjtcbm5hbWVzcGFjZSgnbW9kZWxzLmV2ZW50cycpLkFVVEhfRVJST1IgPSBcIkFjdGl2aXR5TW9kZWwuQVVUSF9FUlJPUlwiO1xubmFtZXNwYWNlKCdtb2RlbHMuZXZlbnRzJykuTkVUV09SS19FUlJPUiA9IFwiQWN0aXZpdHlNb2RlbC5ORVRXT1JLX0VSUk9SXCI7XG5cbnZhciBVc2VyTW9kZWwgPSBFdmVudERpc3BhdGNoZXIuZXh0ZW5kKHtcbiAgICBjdXJyZW50VXNlcjogbnVsbCxcblxuICAgIFVzZXJTZXJ2aWNlOm51bGwsXG4gICAgbm90aWZpY2F0aW9uczogbnVsbCxcblxuICAgIHNpZ25JbjogZnVuY3Rpb24oZW1haWwsIHBhc3N3b3JkKXtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzLlVzZXJTZXJ2aWNlLnNpZ25JbihlbWFpbCwgcGFzc3dvcmQpO1xuICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFVzZXIgPSByZXN1bHRzLmRhdGEudXNlcjtcbiAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5ub3RpZnkobW9kZWxzLmV2ZW50cy5VU0VSX1NJR05FRF9JTik7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvclwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIGlmKGVycm9yLmRhdGEpe1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5ub3RpZnkobW9kZWxzLmV2ZW50cy5BVVRIX0VSUk9SLCBlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5ub3RpZnkobW9kZWxzLmV2ZW50cy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuXG5cblxuICAgICAgICAvKlxuICAgICAgICB2YXIgdXNlciA9IHtcbiAgICAgICAgICAgIG5hbWU6IFwidGFjb1wiLFxuICAgICAgICAgICAgYWdlOiAzNVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuJGNvb2tpZXMuY3VycmVudFVzZXIgPSBKU09OLnN0cmluZ2lmeSh1c2VyKTtcbiAgICAgICAgICovXG4gICAgfSxcblxuICAgIHNpZ25PdXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vdGhpcy5Vc2VyU2VydmljZS5zaWduT3V0KCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZVVzZXI6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuVXNlclNlcnZpY2UudXBkYXRlVXNlcih1c2VyKTtcbiAgICAgICAgLy9wcm9taXNlLnRoZW5cbiAgICB9XG5cbn0pO1xuXG5cbihmdW5jdGlvbiAoKXtcbiAgICB2YXIgVXNlck1vZGVsUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IFVzZXJNb2RlbCgpLFxuXG5cdCRnZXQ6IGZ1bmN0aW9uKFVzZXJTZXJ2aWNlLCBOb3RpZmljYXRpb25zLCAkY29va2llcyl7XG5cdCAgICB0aGlzLmluc3RhbmNlLlVzZXJTZXJ2aWNlID0gVXNlclNlcnZpY2U7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS4kY29va2llcyA9ICRjb29raWVzO1xuICAgICAgICAgICAgLy90aGlzLmluc3RhbmNlLmN1cnJlbnRVc2VyID0gSlNPTi5wYXJzZSgkY29va2llcy5jdXJyZW50VXNlcik7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ3VzZXJzLlVzZXJNb2RlbCcsW10pXG5cdC5wcm92aWRlcignVXNlck1vZGVsJywgVXNlck1vZGVsUHJvdmlkZXIpO1xufSgpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEdhbWVTZXJ2aWNlID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICAkaHR0cDogbnVsbCxcblxuICAgIGdldEdhbWVCeUlkOiBmdW5jdGlvbihpZCl7XG5cbiAgICB9XG5cbn0pO1xuXG5cblxuKGZ1bmN0aW9uICgpe1xuICAgIHZhciBHYW1lU2VydmljZVByb3ZpZGVyID0gQ2xhc3MuZXh0ZW5kKHtcblx0aW5zdGFuY2U6IG5ldyBHYW1lU2VydmljZSgpLFxuXHQkZ2V0OiBmdW5jdGlvbigkaHR0cCl7XG5cdCAgICB0aGlzLmluc3RhbmNlLiRodHRwID0gJGh0dHA7XG5cdCAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxuICAgIH0pO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2dhbWVzLkdhbWVTZXJ2aWNlJyxbXSlcblx0LnByb3ZpZGVyKCdHYW1lU2VydmljZScsIEdhbWVTZXJ2aWNlUHJvdmlkZXIpO1xufSgpKTtcbiIsIi8qXHJcbiogcndkSW1hZ2VNYXBzIGpRdWVyeSBwbHVnaW4gdjEuNVxyXG4qXHJcbiogQWxsb3dzIGltYWdlIG1hcHMgdG8gYmUgdXNlZCBpbiBhIHJlc3BvbnNpdmUgZGVzaWduIGJ5IHJlY2FsY3VsYXRpbmcgdGhlIGFyZWEgY29vcmRpbmF0ZXMgdG8gbWF0Y2ggdGhlIGFjdHVhbCBpbWFnZSBzaXplIG9uIGxvYWQgYW5kIHdpbmRvdy5yZXNpemVcclxuKlxyXG4qIENvcHlyaWdodCAoYykgMjAxMyBNYXR0IFN0b3dcclxuKiBodHRwczovL2dpdGh1Yi5jb20vc3Rvd2JhbGwvalF1ZXJ5LXJ3ZEltYWdlTWFwc1xyXG4qIGh0dHA6Ly9tYXR0c3Rvdy5jb21cclxuKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuKi9cclxuOyhmdW5jdGlvbihhKXthLmZuLnJ3ZEltYWdlTWFwcz1mdW5jdGlvbigpe3ZhciBjPXRoaXM7dmFyIGI9ZnVuY3Rpb24oKXtjLmVhY2goZnVuY3Rpb24oKXtpZih0eXBlb2YoYSh0aGlzKS5hdHRyKFwidXNlbWFwXCIpKT09XCJ1bmRlZmluZWRcIil7cmV0dXJufXZhciBlPXRoaXMsZD1hKGUpO2EoXCI8aW1nIC8+XCIpLmxvYWQoZnVuY3Rpb24oKXt2YXIgZz1cIndpZHRoXCIsbT1cImhlaWdodFwiLG49ZC5hdHRyKGcpLGo9ZC5hdHRyKG0pO2lmKCFufHwhail7dmFyIG89bmV3IEltYWdlKCk7by5zcmM9ZC5hdHRyKFwic3JjXCIpO2lmKCFuKXtuPW8ud2lkdGh9aWYoIWope2o9by5oZWlnaHR9fXZhciBmPWQud2lkdGgoKS8xMDAsaz1kLmhlaWdodCgpLzEwMCxpPWQuYXR0cihcInVzZW1hcFwiKS5yZXBsYWNlKFwiI1wiLFwiXCIpLGw9XCJjb29yZHNcIjthKCdtYXBbbmFtZT1cIicraSsnXCJdJykuZmluZChcImFyZWFcIikuZWFjaChmdW5jdGlvbigpe3ZhciByPWEodGhpcyk7aWYoIXIuZGF0YShsKSl7ci5kYXRhKGwsci5hdHRyKGwpKX12YXIgcT1yLmRhdGEobCkuc3BsaXQoXCIsXCIpLHA9bmV3IEFycmF5KHEubGVuZ3RoKTtmb3IodmFyIGg9MDtoPHAubGVuZ3RoOysraCl7aWYoaCUyPT09MCl7cFtoXT1wYXJzZUludCgoKHFbaF0vbikqMTAwKSpmKX1lbHNle3BbaF09cGFyc2VJbnQoKChxW2hdL2opKjEwMCkqayl9fXIuYXR0cihsLHAudG9TdHJpbmcoKSl9KX0pLmF0dHIoXCJzcmNcIixkLmF0dHIoXCJzcmNcIikpfSl9O2Eod2luZG93KS5yZXNpemUoYikudHJpZ2dlcihcInJlc2l6ZVwiKTtyZXR1cm4gdGhpc319KShqUXVlcnkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFVzZXJTZXJ2aWNlID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICAkaHR0cDogbnVsbCxcbiAgICBjb25maWdNb2RlbDogbnVsbCxcblxuICAgIHNpZ25JbjogZnVuY3Rpb24oZW1haWwsIHBhc3N3b3JkKXtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMuY29uZmlnTW9kZWwuY29uZmlnLmJhc2VVUkwgKyBcIi9sb2dpbi9wbGF5ZmFiXCI7XG4gICAgICAgIHZhciByZXEgPSB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiAge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc29sZS5sb2cocmVxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAocmVxKTtcbiAgICB9LFxuXG4gICAgc2lnbk91dDogZnVuY3Rpb24oKXtcblxuICAgIH0sXG5cbiAgICB1cGRhdGVVc2VyOiBmdW5jdGlvbih1c2VyKXtcblxuICAgIH1cblxufSk7XG5cblxuXG4oZnVuY3Rpb24gKCl7XG4gICAgdmFyIFVzZXJTZXJ2aWNlUHJvdmlkZXIgPSBDbGFzcy5leHRlbmQoe1xuXHRpbnN0YW5jZTogbmV3IFVzZXJTZXJ2aWNlKCksXG5cdCRnZXQ6IGZ1bmN0aW9uKCRodHRwLCAkY29va2llcywgQ29uZmlnTW9kZWwpe1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5jb25maWdNb2RlbCA9IENvbmZpZ01vZGVsO1xuXHQgICAgdGhpcy5pbnN0YW5jZS4kaHR0cCA9ICRodHRwO1xuXHQgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbiAgICB9KTtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd1c2Vycy5Vc2VyU2VydmljZScsW10pXG5cdC5wcm92aWRlcignVXNlclNlcnZpY2UnLCBVc2VyU2VydmljZVByb3ZpZGVyKTtcbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBOYXZCYXJEaXJlY3RpdmUgPSBCYXNlRGlyZWN0aXZlLmV4dGVuZCh7XG4gIHVzZXJNb2RlbDogbnVsbCxcbiAgbm90aWZpY2F0aW9uczogbnVsbCxcblxuICBpbml0OiBmdW5jdGlvbigkc2NvcGUsIFVzZXJNb2RlbCwgTm90aWZpY2F0aW9ucyl7XG4gICAgdGhpcy51c2VyTW9kZWwgPSBVc2VyTW9kZWw7XG4gICAgdGhpcy5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICB0aGlzLl9zdXBlcigkc2NvcGUpO1xuICB9LFxuXG4gIGRlZmluZUxpc3RlbmVyczogZnVuY3Rpb24oKXtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMuYWRkRXZlbnRMaXN0ZW5lcihtb2RlbHMuZXZlbnRzLlVTRVJfU0lHTkVEX0lOLCB0aGlzLmhhbmRsZVVzZXJTaWduZWRJbi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLiRzY29wZS5sb2dvdXQgPSB0aGlzLmxvZ291dC5iaW5kKHRoaXMpO1xuICB9LFxuXG4gIGRlZmluZVNjb3BlOiBmdW5jdGlvbigpe1xuICAgIHRoaXMubmF2U2hvd2luZyA9IGZhbHNlO1xuICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRVc2VyID0gdGhpcy51c2VyTW9kZWwuY3VycmVudFVzZXI7XG4gICAgdGhpcy5pbml0TmF2KCk7XG4gIH0sXG5cbiAgaW5pdE5hdjogZnVuY3Rpb24oKXtcbiAgICB2YXIgbW9iaWxlTWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwianMtbW9iaWxlLW1lbnVcIik7XG4gICAgdmFyIG5hdk1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpzLW5hdmlnYXRpb24tbWVudVwiKTtcbiAgICBuYXZNZW51LmNsYXNzTmFtZSA9IG5hdk1lbnUuY2xhc3NOYW1lLnJlcGxhY2UoL1xcYnNob3dcXGIvLCcnKTtcbiAgICBtb2JpbGVNZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYodGhpcy5uYXZTaG93aW5nKXtcbiAgICAgICAgbmF2TWVudS5jbGFzc05hbWUgPSBuYXZNZW51LmNsYXNzTmFtZS5yZXBsYWNlKC9cXGJzaG93XFxiLywnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYXZNZW51LmNsYXNzTmFtZSA9IG5hdk1lbnUuY2xhc3NOYW1lICsgXCIgc2hvd1wiO1xuICAgICAgfVxuICAgICAgdGhpcy5uYXZTaG93aW5nID0gIXRoaXMubmF2U2hvd2luZztcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIGxvZ291dDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnVzZXJNb2RlbC5sb2dvdXQoKTtcbiAgICB0aGlzLiRsb2NhdGlvbi51cmwoXCIvXCIpO1xuICB9LFxuXG4gIC8qKiBFVkVOVCBIQU5ETEVSUyAqKi9cbiAgaGFuZGxlVXNlclNpZ25lZEluOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRVc2VyID0gdGhpcy51c2VyTW9kZWwuY3VycmVudFVzZXI7XG4gIH1cblxufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduYXZiYXInLFtdKVxuLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24oVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDonRScsXG4gICAgaXNvbGF0ZTp0cnVlLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICBuZXcgTmF2QmFyRGlyZWN0aXZlKCRzY29wZSwgVXNlck1vZGVsLCBOb3RpZmljYXRpb25zKTtcbiAgICB9LFxuICAgIHNjb3BlOnRydWUsXG4gICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvbmF2YmFyL25hdmJhci5odG1sXCJcbiAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR3ltTWFwQ29udHJvbGxlciA9IEJhc2VDb250cm9sbGVyLmV4dGVuZCh7XG4gIG5vdGlmaWNhdGlvbnM6bnVsbCxcbiAgcm9vdENhbnZhczpudWxsLFxuICByb290SW1hZ2U6bnVsbCxcbiAgJHN0YXRlOiBudWxsLFxuXG4gIC8vIGluaXQ6ZnVuY3Rpb24oJHNjb3BlLCBOb3RpZmljYXRpb25zLCRzdGF0ZSl7XG4gIC8vICAgdGhpcy5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgLy8gICB0aGlzLiRzdGF0ZSA9ICRzdGF0ZTtcbiAgLy8gICB0aGlzLl9zdXBlcigkc2NvcGUpO1xuICAvLyB9LFxuXG4gIGluaXRpYWxpemU6ZnVuY3Rpb24oJHNjb3BlLCBOb3RpZmljYXRpb25zLCRzdGF0ZSl7XG4gICAgdGhpcy5ub3RpZmljYXRpb25zID0gTm90aWZpY2F0aW9ucztcbiAgICB0aGlzLiRzdGF0ZSA9ICRzdGF0ZTtcbiAgfSxcblxuICBkZWZpbmVMaXN0ZW5lcnM6ZnVuY3Rpb24oKXtcbiAgICB0aGlzLl9zdXBlcigpO1xuICAgIHRoaXMuJHNjb3BlLmFyZWFDbGlja2VkID0gdGhpcy5hcmVhQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IHRoaXMub25SZXNpemUuYmluZCh0aGlzKTtcbiAgfSxcblxuICBkZWZpbmVTY29wZTpmdW5jdGlvbigpe1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbihlKSB7XG5cbiAgICAgIHRoYXQucm9vdEltYWdlID0gJCgnLmltYWdlTGF5ZXIgaW1nJykub24oJ2xvYWQub21nbWFwcycsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgJCh0aGlzKS5yd2RJbWFnZU1hcHMoKTtcbiAgICAgICAgdGhhdC5oaWdobGlnaHRNYXAoKTtcblxuXG4gICAgICB9KS5jc3MoJ29wYWNpdHknLCcwJyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiZG9uZVwiKTtcblxuICAgIH0pO1xuXG5cbiAgfSxcblxuICBkZXN0cm95OmZ1bmN0aW9uKCl7XG4gICAgJCgnYXJlYScpLm9mZignLm9tZ21hcHMnKTtcbiAgICAkKCdpbWcnKS5vZmYoJy5vbWdtYXBzJyk7XG4gIH0sXG5cblxuICBhcmVhQ2xpY2tlZDogZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZyhcIlJDSFwiKTtcbiAgfSxcblxuICBjcmVhdGVSb290Q2FudmFzOmZ1bmN0aW9uKCl7XG4gICAgdmFyIGltYWdlID0gdGhpcy5yb290SW1hZ2UsXG4gICAgaW1nV2lkdGggPSBpbWFnZS53aWR0aCgpLFxuICAgIGltZ0hlaWdodCA9IGltYWdlLmhlaWdodCgpO1xuXG4gICAgdGhpcy5yb290Q2FudmFzID0gJCgnPGNhbnZhcz4nKS5hdHRyKCd3aWR0aCcsaW1nV2lkdGgpLmF0dHIoJ2hlaWdodCcsaW1nSGVpZ2h0KTtcbiAgICB0aGlzLnJvb3RDYW52YXMuY3NzKHtcbiAgICAgIHBvc2l0aW9uOidhYnNvbHV0ZScsXG4gICAgICB0b3A6JzBweCcsXG4gICAgICBsZWZ0OicwcHgnLFxuICAgICAgaGVpZ2h0OidhdXRvJ1xuICAgIH0pO1xuICAgIGltYWdlLmJlZm9yZSh0aGlzLnJvb3RDYW52YXMpO1xuICAgIHZhciBjdHggPSB0aGlzLnJvb3RDYW52YXMuZ2V0KDApLmdldENvbnRleHQoJzJkJyk7XG4gICAgY3R4LmRyYXdJbWFnZShpbWFnZS5nZXQoMCksMCwwLGltZ1dpZHRoLCBpbWdIZWlnaHQpO1xuICB9LFxuXG4gIHJlZHJhd1Jvb3RDYW52YXM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGltYWdlID0gdGhpcy5yb290SW1hZ2UsXG4gICAgaW1nV2lkdGggPSBpbWFnZS53aWR0aCgpLFxuICAgIGltZ0hlaWdodCA9IGltYWdlLmhlaWdodCgpO1xuXG4gICAgdmFyIGN0eCA9IHRoaXMucm9vdENhbnZhcy5nZXQoMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMucm9vdENhbnZhcy5nZXQoMCkud2lkdGgsIHRoaXMucm9vdENhbnZhcy5nZXQoMCkud2lkdGgpO1xuXG4gICAgdGhpcy5yb290Q2FudmFzLmF0dHIoJ3dpZHRoJyxpbWdXaWR0aCkuYXR0cignaGVpZ2h0JyxpbWdIZWlnaHQpO1xuXG4gICAgY3R4LmRyYXdJbWFnZShpbWFnZS5nZXQoMCksMCwwLGltYWdlLndpZHRoKCksIGltYWdlLmhlaWdodCgpKTtcbiAgfSxcblxuICBoaWdobGlnaHRNYXA6IGZ1bmN0aW9uKCl7XG5cbiAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgYm9keSA9ICQoJ2JvZHknKSxcbiAgICBjb250ZW50QXJlYSA9ICQoJy5tYXBDb250ZW50JyksXG4gICAgbWFwID0gJChcIiNneW1NYXBcIiksXG4gICAgbWFwRWwgPSAkKFwiI2d5bU1hcFwiKS5nZXQoMCksXG4gICAgbWFwQXJlYXMgPSBtYXAuZmluZCgnYXJlYScpLFxuICAgIGltYWdlID0gdGhpcy5yb290SW1hZ2UsXG5cbiAgICAvLyBnZXQgdGhlIHdpZHRoIGFuZCBoZWlnaHQgZnJvbSB0aGUgaW1hZ2UgdGFnXG4gICAgaW1nV2lkdGggPSBpbWFnZS53aWR0aCgpLFxuICAgIGltZ0hlaWdodCA9IGltYWdlLmhlaWdodCgpLFxuICAgIGltZ0F0dHJXaWR0aCA9IGltYWdlLmF0dHIoJ3dpZHRoJyksXG4gICAgaW1nQXR0ckhlaWdodCA9IGltYWdlLmF0dHIoJ2hlaWdodCcpLFxuICAgIHhGYWN0b3IgPSBwYXJzZUZsb2F0KGltZ1dpZHRoL2ltZ0F0dHJXaWR0aCksXG4gICAgeUZhY3RvciA9IHBhcnNlRmxvYXQoaW1nSGVpZ2h0L2ltZ0F0dHJIZWlnaHQpO1xuXG4gICAgLy8gICAgICAgIGNvbnNvbGUubG9nKCdpbWdBdHRyV2lkdGg6ICcraW1nQXR0cldpZHRoKTtcbiAgICAvLyAgICAgICAgY29uc29sZS5sb2coJ2ltZ0F0dHJIZWlnaHQ6ICcraW1nQXR0ckhlaWdodCk7XG4gICAgLy8gICAgICAgIGNvbnNvbGUubG9nKCd4RmFjdG9yOiAnK3hGYWN0b3IpO1xuICAgIC8vICAgICAgICBjb25zb2xlLmxvZygneUZhY3RvcjogJyt5RmFjdG9yKTtcblxuXG4gICAgdmFyIHJvb3RDYW52YXMgPSB0aGlzLmNyZWF0ZVJvb3RDYW52YXMoKTtcblxuICAgICQuZWFjaChtYXBBcmVhcywgZnVuY3Rpb24oaW5kZXgsIGFyZWEpe1xuICAgICAgdmFyIGFyZWEgPSAkKGFyZWEpO1xuICAgICAgdmFyIGFyZWFFbCA9IGFyZWEuZ2V0KDApO1xuICAgICAgdmFyIGNvb3JkcyA9IGFyZWFFbC5jb29yZHMuc3BsaXQoXCIsIFwiKTtcblxuICAgICAgLy8gbWFwIHRoZSBjb29yZHMgYmVjYXVzZSB0aGV5IGFyZSBzY2FsZWQgZm9yIHRoZSBpbWFnZSBzaXplIGFuZCBub3QgdGhlIG90aGVyIHNpemVcbiAgICAgIGNvb3JkcyA9IGNvb3Jkcy5tYXAoZnVuY3Rpb24odmFsdWUsIGluZGV4KXtcbiAgICAgICAgaWYoaW5kZXglMiA9PT0gMCl7XG4gICAgICAgICAgLy8geCBjb29yZFxuICAgICAgICAgIHJldHVybiB2YWx1ZSAqIHhGYWN0b3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8geSBjb29yZFxuICAgICAgICAgIHJldHVybiB2YWx1ZSAqIHlGYWN0b3I7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBjcmVhdGUgYSBjYW52YXNcbiAgICAgIHZhciBjYW52YXMgPSAkKCc8Y2FudmFzPicpLmF0dHIoJ3dpZHRoJyxpbWdXaWR0aCkuYXR0cignaGVpZ2h0JyxpbWdIZWlnaHQpLmFkZENsYXNzKCdtYXAtb3ZlcmxheScpO1xuICAgICAgY2FudmFzLmNzcyh7XG4gICAgICAgIHBvc2l0aW9uOidhYnNvbHV0ZScsXG4gICAgICAgIHRvcDonMHB4JyxcbiAgICAgICAgbGVmdDonMHB4JyxcbiAgICAgICAgb3BhY2l0eTonMC4wJyxcbiAgICAgICAgZGlzcGxheTonbm9uZSdcbiAgICAgIH0pO1xuXG4gICAgICAvLyBhdHRhY2ggc2FpZCBjYW52YXMgdG8gRE9NXG4gICAgICBjb250ZW50QXJlYS5maW5kKCdpbWcnKS5iZWZvcmUoY2FudmFzKTtcblxuICAgICAgLy8gZ3JhYiB0aGUgY2FudmFzIGNvbnRleHRcbiAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0KDApLmdldENvbnRleHQoJzJkJyk7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJyNmMDAnO1xuXG4gICAgICB2YXIgeCA9IGNvb3Jkc1swXSxcbiAgICAgIHkgPSBjb29yZHNbMV07XG5cbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5tb3ZlVG8oeCwgeSk7XG4gICAgICBmb3IodmFyIGogPSAyLGxlbiA9IGNvb3Jkcy5sZW5ndGg7IGogPCBsZW4tMSA7IGogKz0gMiApe1xuICAgICAgICB4ID0gY29vcmRzW2pdO1xuICAgICAgICB5ID0gY29vcmRzW2ogKyAxXTtcblxuICAgICAgICBjdHgubGluZVRvKHgsIHkpO1xuICAgICAgfVxuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgY3R4LmZpbGwoKTtcblxuICAgICAgLy8gY3JlYXRlIGFuIGFyZWEgbW91c2VlbnRlciBldmVudCBsaXN0ZW5lclxuICAgICAgYXJlYS5vbignbW91c2VlbnRlci5vbWdtYXBzJywgKGZ1bmN0aW9uKGNhbnZhcyl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdXNlIGVudGVyJyk7XG4gICAgICAgICAgY2FudmFzLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICAgIGNhbnZhcy5hbmltYXRlKHtvcGFjaXR5OicxLjAnfSwyMDAsJ2xpbmVhcicpO1xuICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBjYW52YXMuYW5pbWF0ZSh7ZGlzcGxheTonYmxvY2snfSwyMDAsJ2xpbmVhcicpO1xuICAgICAgICB9XG4gICAgICB9KShjYW52YXMpKTtcblxuICAgICAgYXJlYS5vbignbW91c2VsZWF2ZS5vbWdtYXBzJywgKGZ1bmN0aW9uKGNhbnZhcyl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdXNlIGxlYXZlJyk7XG4gICAgICAgICAgY2FudmFzLmFuaW1hdGUoe29wYWNpdHk6JzAuMCd9LDIwMCwnbGluZWFyJyxmdW5jdGlvbigpe1xuICAgICAgICAgICAgY2FudmFzLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5hbmltYXRlKHtkaXNwbGF5Oidub25lJ30sMjAwLCdsaW5lYXInKTtcbiAgICAgICAgfVxuICAgICAgfSkoY2FudmFzKSk7XG5cbiAgICAgIGFyZWEub24oJ2NsaWNrLm9tZ21hcHMnLCAoZnVuY3Rpb24oY2FudmFzKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoYXQuJHN0YXRlLmdvKCd3YWxsVmlldycse2lkOicxMCd9KTtcbiAgICAgICAgfVxuICAgICAgfSkoY2FudmFzKSk7XG5cbiAgICB9KTtcblxuICB9LFxuXG4gIG9uUmVzaXplOiBmdW5jdGlvbigpe1xuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIGlmKHRoaXMucmVzaXplVGltZW91dCl7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5yZXNpemVUaW1lb3V0KTtcbiAgICB9XG4gICAgdGhpcy5yZXNpemVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgdGhhdC5yZXNpemUoKTtcbiAgICB9LCAyMDApO1xuICB9LFxuXG4gIHJlc2l6ZTogZnVuY3Rpb24oKXtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgY29uc29sZS5sb2coJ3Jlc2l6ZScpO1xuXG4gICAgaWYodGhpcy5yb290Q2FudmFzKXtcbiAgICAgIHRoaXMucmVkcmF3Um9vdENhbnZhcygpO1xuICAgIH1cblxuICAgICQoJ2NhbnZhcy5tYXAtb3ZlcmxheScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGNhbnZhcyl7XG4gICAgICBjYW52YXMgPSAkKGNhbnZhcyk7XG5cbiAgICAgIGNhbnZhcy5jc3Moe1xuICAgICAgICBoZWlnaHQ6IHRoYXQucm9vdEltYWdlLmhlaWdodCgpLFxuICAgICAgICB3aWR0aDogdGhhdC5yb290SW1hZ2Uud2lkdGgoKVxuICAgICAgfSlcbiAgICB9KTtcbiAgfVxuXG59KTtcblxuXG5HeW1NYXBDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZScsJ05vdGlmaWNhdGlvbnMnLCckc3RhdGUnXTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFdhbGxDb250cm9sbGVyID0gQmFzZUNvbnRyb2xsZXIuZXh0ZW5kKHtcbiAgbm90aWZpY2F0aW9uczpudWxsLFxuICByb290Q2FudmFzOm51bGwsXG4gIHJvb3RJbWFnZTpudWxsLFxuICAkc3RhdGU6IG51bGwsXG4gICRzdGF0ZVBhcmFtczogbnVsbCxcblxuICBpbml0aWFsaXplOmZ1bmN0aW9uKCRzY29wZSwgTm90aWZpY2F0aW9ucywkc3RhdGUsJHN0YXRlUGFyYW1zKXtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBOb3RpZmljYXRpb25zO1xuICAgIHRoaXMuJHN0YXRlID0gJHN0YXRlO1xuICAgIHRoaXMuJHN0YXRlUGFyYW1zID0gJHN0YXRlUGFyYW1zO1xuICB9LFxuXG4gIGRlZmluZUxpc3RlbmVyczpmdW5jdGlvbigpe1xuICAgIHRoaXMuX3N1cGVyKCk7XG4gIH0sXG5cbiAgZGVmaW5lU2NvcGU6ZnVuY3Rpb24oKXtcbiAgICB0aGlzLiRzY29wZS53YWxsSWQgPSB0aGlzLiRzdGF0ZVBhcmFtcy53YWxsSWQ7XG4gIH0sXG5cbiAgZGVzdHJveTpmdW5jdGlvbigpe1xuXG4gIH0sXG5cbn0pO1xuXG5XYWxsQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnLCdOb3RpZmljYXRpb25zJywnJHN0YXRlJywnJHN0YXRlUGFyYW1zJ107XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=