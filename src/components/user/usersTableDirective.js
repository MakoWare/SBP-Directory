angular.module('UserModel')
.directive('usersTable', function(){
  return {
    restrict: 'E',
    templateUrl: '/partials/user/usersTableDirective.html',
    link: function(scope, element, attrs){
      scope.$watch('user', function(){
        scope.setUpUserObjectListeners();
      });

    }
  };
});
