angular.module('CustomModule',[])

.directive('matDropdownItem', function() {

  var dropdownId;

  var link = function(scope, elm, attrs, ctrl) {
    if(scope.$first === true){
      dropdownId = $(elm).closest('ul.dropdown-content').attr('id');
    }
    if(scope.$last === true){
      var dropdown = $('a.dropdown-button[data-activates="'+dropdownId+'"]');
      var options = dropdown.data('dropdown-options');
      dropdown.dropdown(options);
    }

    var params = attrs.matDropdownItem;
    if(params){
      var splits = params.split('('),
          funcName,
          pName,
          hasParam = false;

      if(splits.length>1){
        funcName = splits[0];
        pName = splits[1].split(')')[0];
        hasParam = true;
      }

      $(elm).on('click.'+params, function(event){
        event.preventDefault();
        if(hasParam){
          scope[funcName](scope[pName]);
        }
      });

      scope.$on('$destroy', function(){
        console.log('destory dropdown items');
        $(elm).off('click.'+params);
      });
    }
  };

  return {
    restrict: 'A',
    link: link
  };
})


;
