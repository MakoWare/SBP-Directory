angular.module('GoogleCharts',[])
.factory('googleChartApiLoader', ['$rootScope', '$q', googleChartApiLoader]);

function googleChartApiLoader($rootScope, $q) {
    var apiPromise = $q.defer();

    if($('#googleChartsScript').length===0){
        var onScriptLoad = function () {
            var onLoadCallback = function(){
                apiPromise.resolve(window.google);
            };

            window.google.load('visualization', '1.0', {'packages':['corechart', 'bar'], 'callback':onLoadCallback});
            // window.google.setOnLoadCallback(onLoadCallback);
        };

        var scriptTag = $('<script id="googleChartsScript" type="text/javascript" src="https://www.google.com/jsapi"></script>');

        // var head = document.getElementsByTagName('head')[0];
        // var script = document.createElement('script');

        // scriptTag.on('load', onScriptLoad);
        //
        // $('body').append(scriptTag);

        $.getScript("https://www.google.com/jsapi", function(data, textStatus, jqxhr){
            if(jqxhr.status===200){
                onScriptLoad();
            } else {
                apiPromise.reject({code:jqxhr.status, status:textStatus});
            }
        });

    } else {
        apiPromise.resolve(window.google);
    }


    return apiPromise.promise;
}
