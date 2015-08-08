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
        $(elm).off('click.'+params);
      });
    }
  };

  return {
    restrict: 'A',
    link: link
  };
})

.directive('noScroll', function(){

  var link = function(scope, el, attrs){
    $(el).on('focus.noScroll', function(e){
      $(this).on('mousewheel.noScroll',function(e){
        e.preventDefault();
      });
    });

    $(el).on('blur.noScroll', function(e){
      $(this).off('mousewheel.noScroll');
    });

    scope.$on('$destroy', function(){
      $(el).off('.noScroll');
    });
  };

  return {
    restrict: 'C',
    link:link,
    scope:{}
  };
})

;
