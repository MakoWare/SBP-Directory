angular.module('CustomModule',[])

.directive('nullable', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.nullable = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        console.log(modelValue);
        console.log(viewValue);

        // if () {
        //   // it is valid
        //   return true;
        // }

        // it is invalid
        return false;
      };
    }
  };
})
.directive('wallConverter', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        // var num = parseInt(val, 10);

        console.log('parsers');
        console.log(val);
        console.log(ngModel.$modelValue);

        // ngModel.$modelValue.name = num;
        return ngModel.$modelValue;
      });
      ngModel.$formatters.push(function(val) {
        console.log('formatters');
        console.log(val);
        // return '' + val.name;
      });
    }
  };
})


;
