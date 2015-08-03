angular.module('mw.materialize',['mw.materialize.matSelect','ui.materialize.inputfield']);

angular.module('mw.materialize.matSelect',[])
.directive('matSelect', function(){

    var traverse = function(obj, str){
        var keys = str.split('.'),
        newObj = obj;
        for(var i=0,l=keys.length; i<l; i++){
            newObj = newObj[keys[i]];
        }
        return newObj;
    };

    var link = function(scope, element, attrs, ctrls){
        var ngModel = ctrls[0],
        params = attrs.matSelect;

        var go = function(){
            $(element).material_select();

            if(params){
                $(element).siblings("input.select-dropdown").val(ngModel.$viewValue);
            }
        };

        if(params){
            ngModel.$formatters.push(function(val) {
                var ret = val ? traverse(val,params) : val;
                return ret;
            });
        }

        scope.$watch(attrs.ngModel, go);

    };

    return {
        restrict: 'A',
        require: ['ngModel'],
        link: link
    };
});

/** (taken from https://github.com/krescruz/angular-materialize)
 * Instead of adding the .input-field class to a div surrounding a label and input, add the attribute input-field.
 * That way it will also work when angular destroys/recreates the elements.
 *
 * Example:
 <inputfield style="margin-top:10px">
 <label>{{name}}:</label>
 <input type="text" name="{{name}}" ng-model="value">
 </inputfield>
 */
angular.module("ui.materialize.inputfield", [])
    .directive('inputField', ["$compile", "$timeout", function ($compile, $timeout) {
        return {
            transclude: true,
            scope: {},
            link: function (scope, element) {
                $timeout(function () {
                    Materialize.updateTextFields();

                    element.find('textarea, input').each(function (index, countable) {
                        countable = angular.element(countable);
                        if (!countable.siblings('span[class="character-counter"]').length) {
                            countable.characterCounter();
                        }
                    });
                });
            },
            template: '<div ng-transclude class="input-field"></div>'
        };
    }]);
