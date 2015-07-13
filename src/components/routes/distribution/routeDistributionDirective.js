

var RouteDistributionDirective = BaseDirective.extend({

    grades:{},
    colorsArray:['Gray','Yellow','Green','Red','Blue','Orange','Purple','Black'],
    gradesArray:['v0','v1','v2','v3','v4','v5','v6','v7','v8','v9','v10','v11','v12'],

    /*
        OVERRIDE METHODS
    */
    initialize:function($scope, $el, RouteModel, Notifications, googleChartApiLoader){
        this.$el = $($el);
        this.notifications = Notifications;
        this.routeModel = RouteModel;
        this.googleChartApiLoader = googleChartApiLoader;

        this.chart1Div = this.$el.find('#chart_div');
        this.chart2Div = this.$el.find('#chart_div2');
        this.underChartDiv = this.$el.find('#under-chart');

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

        this.getTotals();

        // this.drawUnderChart();
        this.drawChart1();
        // this.drawChart2();


        // var chart = new google.visualization.Histogram(this.$el.find('#chart_div').get(0));
        // chart.draw(data, options);

        // var chart = new google.charts.Bar(this.$el.find('#chart_div').get(0));
        // chart.draw(data, google.charts.Bar.convertOptions(options));
    },

    drawChart1:function(data){
        var series = [];

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Grade');

        // add the color columns
        $.each(this.colorsArray, function(index, color){
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
        $.each(this.gradesArray, function(index, grade){
            row = [];
            row.push(grade);
            $.each(this.colorsArray, function(i, color){
                routes = this.grades[grade];

                if(routes){
                    routes = this.grades[grade][color.toLowerCase()];
                }
                // console.log(routes);
                if(routes){
                    // row.push({v:routes.length, p:{style: 'border: 1px solid green;'}});
                    // p:{style: 'border: 1px solid green;'}
                    row.push(routes.length);
                } else {
                    row.push(0);
                }

            }.bind(this));

            data.addRow(row);
        }.bind(this));


        var colors = this.colorsArray.map(function(color){
            return color.toLowerCase();
        });

        // Set chart options
        var options;
        options = {
            isStacked:true,
            width:'100%',
            height:'auto',
            colors:colors,
            backgroundColor:'transparent',
            // series:series,
            animation:{
                startup:true
            },
            legend:{
                position: 'none'
            },
            chartArea:{
                left:"10%",
                top:"5%",
                width:'90%',
                height:'90%'
            },
            bar:{
                groupWidth:'45%'
            },
            vAxis:{
                gridlines:{
                    count:-1
                }
            }
        };

        // Instantiate and draw our chart, passing in some options.
        this.chart1 = new google.visualization.ColumnChart(this.chart1Div.get(0));
        this.chart1.draw(data, options);
    },

    drawChart2:function(data){
        var series = [];
        var chartOverlay = this.$el.find('.chart-overlay');

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Grade');

        // add the color columns
        $.each(this.colorsArray, function(index, color){
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
        $.each(this.gradesArray, function(index, grade){
            row = [];
            row.push(grade);
            $.each(this.colorsArray, function(i, color){
                routes = this.grades[grade];

                if(routes){
                    routes = this.grades[grade][color.toLowerCase()];
                }
                // console.log(routes);
                if(routes){
                    // row.push({v:routes.length, p:{style: 'border: 1px solid green;'}});
                    // p:{style: 'border: 1px solid green;'}
                    row.push(routes.length);
                } else {
                    row.push(0);
                }

            }.bind(this));

            data.addRow(row);
        }.bind(this));


        var colors = this.colorsArray.map(function(color){
            return color.toLowerCase();
        });


        // Set chart options
        var options;
        options = {
            isStacked:true,
            width:'100%',
            height:'auto',
            backgroundColor:'transparent',
            colors:colors,
            dataOpacity:'0.6',
            // series:series,
            animation:{
                startup:true
            },
            legend:{
                position: 'none'
            },
            chartArea:{
                left:"10%",
                top:"5%",
                width:'90%',
                height:'90%'
            },
            bar:{
                groupWidth:'45%'
            },
            axisTitlePostions:'none',
            vAxis:{
                textStyle:{
                    color:'transparent'
                },
                gridlines:{
                    count:-1,
                    color:'transparent'
                }
            },
            hAxis:{
                textStyle:{
                    color:'transparent'
                }
            }
        };

        // shift the chart-overlay
        // chartOverlay.css('left', '29px');

        // Instantiate and draw our chart, passing in some options.
        this.chart2 = new google.visualization.ColumnChart(this.chart2Div.get(0));
        this.chart2.draw(data, options);

        // splice the charts
        var svg = this.chart2Div.find('svg');

        // find the clippath
        // var defs = svg.find('defs');
        // var clippath_rect = defs.find('rect');
        // var clippath_rect_y = clippath_rect.attr('y');
        // clippath_rect.attr('y', clippath_rect_y-=500);

        // svg.parent().css('top',-500);
        var barRectsGroup = svg.find('g').first().find('g').first().find('g').first();
        barRectsGroup.attr('transform', 'translate(29,0)');
        console.log();
        // svg.parent().css('left',29);
        // this.chart1Div.find('svg').find('g').first().find('g').first().children().first().next().after(barRectsGroup);

        // this.chart2Div.children().css('position', 'absolute').appendTo(this.chart1Div);

        // setup event passthrough
        google.visualization.events.addListener(this.chart2, 'onmouseover', function(e){
            console.log('chart2 : mouseover');
            console.log(e);
        }.bind(this));

        google.visualization.events.addListener(this.chart1, 'onmouseover', function(e){
            console.log('chart1 : mouseover');
            console.log(e);
        }.bind(this));

    },

    drawUnderChart:function(data){
        var series = [];
        var chartOverlay = this.$el.find('#under-chart-overlay');


        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Grade');

        // add the color columns
        $.each(this.colorsArray, function(index, color){
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
        $.each(this.gradesArray, function(index, grade){
            row = [];
            row.push(grade);
            $.each(this.colorsArray, function(i, color){
                routes = this.grades[grade];

                if(routes){
                    routes = this.grades[grade][color.toLowerCase()];
                }
                // console.log(routes);
                if(routes){
                    // row.push({v:routes.length, p:{style: 'border: 1px solid green;'}});
                    // p:{style: 'border: 1px solid green;'}
                    row.push(routes.length);
                } else {
                    row.push(0);
                }

            }.bind(this));

            data.addRow(row);
        }.bind(this));


        var colors = this.colorsArray.map(function(color){
            return color.toLowerCase();
        });


        // Set chart options
        var options;
        options = {
            isStacked:true,
            width:'100%',
            height:'auto',
            backgroundColor:'transparent',
            colors:colors,
            dataOpacity:'0.0',
            // series:series,
            animation:{
                startup:true
            },
            legend:{
                position: 'none'
            },
            chartArea:{
                left:"10%",
                top:"5%",
                width:'90%',
                height:'90%'
            },
            bar:{
                groupWidth:'45%'
            },

            vAxis:{
                gridlines:{
                    count:-1
                }
            }
        };

        // shift the chart-overlay
        chartOverlay.css('z-index', -100);

        // Instantiate and draw our chart, passing in some options.
        this.underChart = new google.visualization.ColumnChart(this.underChartDiv.get(0));
        this.underChart.draw(data, options);

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
    }]);
})();
