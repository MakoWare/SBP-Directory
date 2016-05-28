var express = require('express');
var app = express();
var _ = require('underscore');

/******* DEFINES *******/


// function for toggling the currentGym of a user
Parse.Cloud.define("updateUser", function(req, resp) {
  var userId = req.params.userId,
      gymId = req.params.gymId,
      username = req.params.username,
      email = req.params.username,
      setter = req.params.setter,
      userQuery = new Parse.Query(Parse.User);

    Parse.Cloud.useMasterKey();

  // TODO: add logic for ACL test to determine if user can toggle

  userQuery.get(userId).then(function(user){
      var Gym = Parse.Object.extend("Gym");
      var gym = new Gym();
      gym.id = gymId;
      user.set('currentGym', gym);
      user.set('username', username);
      //user.set('email', email);
      user.set('setter', setter);
      return user.save();
  }).then(function(user){
    resp.success(user);
  },
  function(err){
    resp.error(""+userId+" "+gymId+"; err: "+err.message);
  });

});


// function for toggling the setter status of a user
Parse.Cloud.define("toggleUserSetterStatus", function(req, resp) {
  var userId = req.params.userId,
      setter = req.params.setter,
      userQuery = new Parse.Query(Parse.User);

  Parse.Cloud.useMasterKey();

  // TODO: add logic for ACL test to determine if user can toggle

  userQuery.get(userId).then(function(user){
    user.set('setter',setter);
    return user.save();
  }).then(function(user){
    resp.success(user);
  },
  function(err){
    resp.error(""+userId+" "+setter+"; err: "+err.message);
  });

});

// function for sending routes
Parse.Cloud.define("sendRoutes", function(req, resp) {
  var SentRoute = Parse.Object.extend("SentRoute");
  var Route = Parse.Object.extend("Route");

  var userId = req.params.userId,
      routes = req.params.routes;

  var routesToSave = [];

  var userQuery = new Parse.Query(Parse.User);
  Parse.Cloud.useMasterKey();
  userQuery.get(userId).then(function(user){
    return user;
  }).then(function(user){
    var sentRouteQuery = new Parse.Query("SentRoute");
    sentRouteQuery.limit(1000);
    sentRouteQuery.equalTo("user", user);
    sentRouteQuery.find().then(function(sentRoutes){
      var routesToDelete = [];
      var routesToCreate = [];
      routes.forEach(function(routeToBeUpdated){
        var found = false;
        sentRoutes.forEach(function(sentRoute){
          if(sentRoute.id === routeToBeUpdated.id){
            found = true;
            if(!routeToBeUpdated.sent){
              routesToDelete.push(sentRoute);
            }
          }
        });
        if(!found){
          routesToCreate.push(routeToBeUpdated);
        }
      });

      //Create Sent Routes
      routesToCreate.forEach(function(routeToCreate){
        var route = new Route();
        route.id = routeToCreate.id;
        var sentRoute = new SentRoute();
        sentRoute.set("user", user);
        sentRoute.set("route", route);
        routesToSave.push(sentRoute);
      });

      Parse.Object.saveAll(routesToSave, {
        success: function(routes){
          var query = new Parse.Query("SentRoute");
          query.equalTo("user", user);
          query.limit(1000);
          query.include("route");
          query.find({
            success: function(sentRoutes){
              resp.success(sentRoutes);
            }, error: function(error){
              resp.error(error);
            }
          });
        }, error: function(){
          resp.error(err.message);
        }
      });
    }, function(err){
      resp.error(err.message);
    });
  }, function(err){
    resp.error(err.message);
  });
});


Parse.Cloud.define('getUsersAndStatsForGym', function(req, resp){
    var gymId = req.params.gymId;

    var gymQuery = new Parse.Query('Gym');

    gymQuery.get(gymId).then(function(gym){
        var query = new Parse.Query(Parse.User);
        query.equalTo('currentGym', gym);
        return query.find();
    }).then(function(users){
        var promises = [];
        _.each(users, function(user){
            promises.push(this.getRoutesAndStats(user));
        })
        return Parse.Promise.when(promises);
    }).then(function(){
        var users = [];
        _.each(arguments, function(obj){
            obj.user.attributes.routes = obj.stats.routes;
            obj.user.attributes.mostColor = obj.stats.mostColor;
            obj.user.attributes.mostTheme = obj.stats.mostTheme;
            obj.user.attributes.mostGrade = obj.stats.mostGrade;

            users.push(obj.user);
        });
        resp.success(users);
    });
});

var getRoutesAndStats = function(user){
    var routesQuery = new Parse.Query('Route');

    routesQuery.include('wall');
    routesQuery.equalTo("setter", user);
    routesQuery.limit(1000);
    return routesQuery.find().then(function(routes){
        var stats = this.generateStats(routes);
        return Parse.Promise.as({user:user, stats:stats});
    });
};

// function for generating user stats on server rather than client
Parse.Cloud.define('generateUserStats', function(req, resp){
    var userId = req.params.userId,

        userQuery = new Parse.Query(Parse.User);

    userQuery.get(userId).then(function(user){
        var routesQuery = new Parse.Query('Route');

        routesQuery.include('wall');
        routesQuery.equalTo("setter", user);
        routesQuery.limit(1000);
        return routesQuery.find();
    }).then(function(routes){
        var stats = this.generateStats(routes);
        resp.success(stats);
    });


});

var generateStats = function(routes){
    var colors = [],
        grades = [],
        themes = [],
        retObj = {routes:routes};

    routes.forEach(function(route){
        switch(route.get('color')){
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
        }

        grades.push(route.get('grade'));
        themes.push(route.get('theme'));
    });

    retObj.mostColor = this.modeString(colors);
    retObj.mostTheme = this.modeString(themes);
    retObj.mostGrade = this.modeString(grades);

    return retObj;
};

var modeString = function(array){
    if (array.length === 0)
        return null;

    var modeMap = {},
        maxEl = array[0],
        maxCount = 1;

    for(var i = 0, l=array.length; i < l; i++)
    {
        var el = array[i];

        if (modeMap[el] === null)
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
};

Parse.Cloud.define('createUser', function(req, resp){
    Parse.Cloud.useMasterKey();

    var user = new Parse.User();
    user.set('username', req.params.username);
    user.set('password', req.params.password);
    user.set('email', req.params.email);
    user.set('setter', false);

    var gymQuery = new Parse.Query('Gym');
    gymQuery.get(req.params.currentGym).then(function(gym){
        user.set('currentGym', gym);
        return user.signUp().then(function(newUser){
            var roleQuery = new Parse.Query(Parse.Role);
            roleQuery.equalTo('name', 'Setter');
            return roleQuery.find().then(function(roles){
                console.log(roles);
                var role = roles[0];
                role.getUsers().add(newUser);
                return role.save().then(function(r){
                    return Parse.Promise.as(newUser);
                });
            });
        });
    }).then(function(newUser){
        console.log(newUser);
        resp.success(newUser);
    },function(e){
        resp.error(e);
    });


});

/******* JOBS *******/

Parse.Cloud.job("routeMigration", function(request, status) {
  // Set up to modify user data
  Parse.Cloud.useMasterKey();
  //leKOMiOlV6

  var fromUser = null,
      toUser = null,
      classToChange = 'Route',

      parameterToChange = 'setter',

      fromValue = new Parse.User({id:"leKOMiOlV6"}),
      toValue = null;


  var userQuery = new Parse.Query(Parse.User);
  userQuery.get("H6k2hWzeaa").then(function(user){
    toValue = user;

    var query = new Parse.Query(classToChange);
    query.equalTo(parameterToChange,fromValue);
    return query.find();

  }).then(function(objects) {

      console.log(objects.length);
      for(var i=0,l=objects.length; i<l; i++){
        objects[i].set(parameterToChange,toValue);
      }
      return Parse.Object.saveAll(objects);

  }).then(function() {
    // Set the job's success status
    status.success("Migration completed successfully.");
  }, function(error) {
    // Set the job's error status
    console.error(error);
    status.error("Uh oh, something went wrong.");
  });
});

Parse.Cloud.job("setUpRoles", function(req, status){
    // use master key
    Parse.Cloud.useMasterKey();

    var roleQuery = new Parse.Query(Parse.Role),
        setterRole;

    roleQuery.equalTo('name', 'Setter');

    // get the setter role
    roleQuery.first().then(function(role){
        console.log(role);
        setterRole  = role;

        // get the users to add to this role
        return new Parse.Query(Parse.User).find();
    }).then(function(users){
        console.log(users);
        setterRole.getUsers().add(users);
        return setterRole.save();
    }).then(function(role){
        status.success('!');
    },function(e){
        status.error(e);
    });
});

/******* Express Rest API *******/

app.get('/appcodes.js', function(req, res) {
  res.send('Parse.initialize("'+Parse.applicationId + '","' + Parse.javaScriptKey+'");');
});

// This line is required to make Express respond to http requests.
app.listen();
