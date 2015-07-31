var express = require('express');
var app = express();

/******* DEFINES *******/

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
