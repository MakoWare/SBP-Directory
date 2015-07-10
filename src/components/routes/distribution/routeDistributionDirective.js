

var RouteDistributionDirective = BaseDirective.extend({

    grades:{},

    /*
        OVERRIDE METHODS
    */
    initialize:function($scope, $el, RouteModel, Notifications, googleChartApiLoader){
        this.$el = $($el);
        this.notifications = Notifications;
        this.routeModel = RouteModel;
        this.googleChartApiLoader = googleChartApiLoader;

        this.boundDrawChart = this.drawChart.bind(this);
        googleChartApiLoader.then(this.boundDrawChart);

    },

    defineListeners:function(){

    },

    defineScope:function(){

    },

    destroy:function(){

    },

    /*
        INSTANCE METHODS
    */

    getTotals:function(){

        $.each(this.routeModel.routes, function(index,route){
            var gradeName = 'v'+route.get('grade');
            // get the grade array
            var gradeObject = this.grades[gradeName];
            if(!gradeObject){
                gradeObject = {};
                this.grades[gradeName] = gradeObject;
            }

            var colorName = route.get('color');
            // get the color array
            var colorArray = gradeObject[colorName];
            if(!colorArray){
                colorArray = [];
                gradeObject[colorName] = colorArray;
            }



            colorArray.push(route);


        }.bind(this));

        return this.grades;
    },

    drawChart:function(google){


        // Create the data table.

        var grades = this.getTotals();
        var colorsArray = ['Gray','Yellow','Green','Red','Blue','Orange','Purple','Black'];
        var gradesArray = ['v0','v1','v2','v3','v4','v5','v6','v7','v8','v9','v10','v11','v12'];
        var series = [];

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Grade');

        // add the color columns
        $.each(colorsArray, function(index, color){
            data.addColumn('number', color);
            series.push({
                color: color.toLowerCase(),
                annotations: {
                    textStyle: {fontSize: 12, color: 'red' }
                }
            });
        });



        // add the rows
        var row;
        var routes;
        $.each(gradesArray, function(index, grade){
            row = [];
            row.push(grade);
            $.each(colorsArray, function(i, color){
                routes = grades[grade];

                if(routes){
                    routes = grades[grade][color.toLowerCase()];
                }
                // console.log(routes);
                if(routes){
                    // row.push({v:routes.length, p:{style: 'border: 1px solid green;'}});
                    // p:{style: 'border: 1px solid green;'}
                    row.push(routes.length);
                } else {
                    row.push(0);
                }

            });

            data.addRow(row);
            data.addRow(row);
        });


        var colors = colorsArray.map(function(color){
            return color.toLowerCase();
        });
        console.log(colors);

        // Set chart options
        var options;
        // options = {'title':'How Much Pizza I Ate Last Night', 'width':400, 'height':300};
        options = {
            // 'chartArea':{left:'auto',top:0,width:'100%',height:'100%'}
            isStacked:true,
            width:'100%',
            height:'auto',
            colors:colors,
            // series:series,
            legend: {position: 'none'}
        };
        console.log(options);
        console.log(google.charts.Bar.convertOptions(options));
        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.ColumnChart(this.$el.find('#chart_div').get(0));
        chart.draw(data, options);

        // var chart = new google.visualization.Histogram(this.$el.find('#chart_div').get(0));
        // chart.draw(data, options);

        // var chart = new google.charts.Bar(this.$el.find('#chart_div').get(0));
        // chart.draw(data, google.charts.Bar.convertOptions(options));
    }

});

(function(){
    angular.module('routeDistribution',[])
    .directive('routeDistribution', ['RouteModel', 'Notifications', 'googleChartApiLoader', function(RouteModel, Notifications, googleChartApiLoader){
        return {
            restrict:'E',
            link: function($scope, el){
                new RouteDistributionDirective($scope, el, RouteModel, Notifications, googleChartApiLoader);
            },
            scope:{
                wall:'='
            },
            templateUrl: "partials/routes/routeDistributionDirective.html"
        };
    }])
    .factory('googleChartApiLoader', ['$rootScope', '$q', googleChartApiLoader]);

    function googleChartApiLoader($rootScope, $q) {
        var apiPromise = $q.defer();

        if($('#googleChartsScript').length===0){
            var onScriptLoad = function () {
                console.log('on script load');
                var onLoadCallback = function(){
                    console.log('on load callback');
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

})();
