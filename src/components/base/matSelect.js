angular.module('matSelect',[])
.directive('matSelect', function(){

  var traverse = function(obj, str){
    var keys = str.split('.'),
        newObj = obj;
    for(var i=0,l=keys.length; i<l; i++){
      newObj = newObj[keys[i]];
    }
    return newObj
  }

  var link = function(scope, element, attrs, ctrls){
    var ngModel = ctrls[0],
        params = attrs['matSelect'];

    var go = function(){
      $(element).material_select();

      if(params){
        $(element).siblings("input.select-dropdown").val(ngModel.$viewValue);
      }
    };

    if(params){
      ngModel.$formatters.push(function(val) {
        return val ? traverse(val,params) : val;
      });
    }

    scope.$watch(attrs['ngModel'], go);

  };

  return {
    restrict: 'A',
    require: ['ngModel'],
    link: link
  };
});
