var RouteDistributionDirective = BaseDirective.extend({

    grades:{},
    colorsArray:['Gray','Yellow','Green','Red','Blue','Orange','Purple','Black'],
    gradesArray:['v0','v1','v2','v3','v4','v5','v6','v7','v8','v9','v10','v11','v12'],

    chartIsVisible:false,

    /*
        OVERRIDE METHODS
    */
    initialize:function($scope, $el, RouteModel, Notifications, googleChartApiLoader, $rootScope){
        this.$el = $($el);
        this.notifications = Notifications;
        this.routeModel = RouteModel;
        this.googleChartApiLoader = googleChartApiLoader;
        this.$rootScope = $rootScope;

        this.chart1Div = this.$el.find('#chart_div');
        this.chart2Div = this.$el.find('#chart_div2');
        this.underChartDiv = this.$el.find('#under-chart');

        console.log(this.grades);
        console.log(this.routeModel.routes.length);

        this.boundDrawChart = this.drawChart.bind(this);
        this.boundOnChartLoaded = this.onChartLoaded.bind(this);
        googleChartApiLoader.then(this.boundOnChartLoaded);

        this.$el.parents('div.tab-page').on('$show', function(){
            this.chartIsVisible = true;
            this.drawChart();
        }.bind(this));

        this.$el.parents('div.tab-page').on('$hide', function(){
            this.chartIsVisible = false;
        }.bind(this));

    },

    defineListeners:function(){

    },

    defineScope:function(){
        this.$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            this.notifications.removeEventListener(models.events.ROUTES_LOADED, this.boundOnRoutesLoaded);
        }.bind(this));

        this.$scope.$on('__redrawGraph', this.boundDrawChart);
    },

    destroy:function(){
        this.notifications.removeEventListener(models.events.ROUTES_LOADED, this.boundOnRoutesLoaded);
    },

    /*
        INSTANCE METHODS
    */

    onRoutesLoaded:function(){
        console.log('reload chart');
        this.drawChart();
    },

    onChartLoaded: function(){
        // set up the notifications after the lib is loaded
        this.boundOnRoutesLoaded = this.onRoutesLoaded.bind(this);
        this.notifications.addEventListener(models.events.ROUTES_LOADED, this.boundOnRoutesLoaded);

        this.drawChart();
    },

    getTotals:function(){
        var grades = {};
        $.each(this.routeModel.routes, function(index,route){
            var gradeName = 'v'+route.get('grade');
            // get the grade array
            var gradeObject = grades[gradeName];
            if(!gradeObject){
                gradeObject = {};
                grades[gradeName] = gradeObject;
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
        this.grades = grades;
        return this.grades;
    },

    drawChart:function(google){

        console.log('drawChart');
        console.log(this.$scope.gym);
        console.log(this.chartIsVisible);

        // Create the data table.

        if(this.chartIsVisible){
            this.getTotals();

            // this.drawUnderChart();
            this.drawChart1();
            if(this.$scope.gym && this.$scope.ideal===true){
                this.drawChart2();
            }

        }



        // var chart = new google.visualization.Histogram(this.$el.find('#chart_div').get(0));
        // chart.draw(data, options);

        // var chart = new google.charts.Bar(this.$el.find('#chart_div').get(0));
        // chart.draw(data, google.charts.Bar.convertOptions(options));
    },

    drawChart1:function(data){
        var series = [];
        console.log('grades: '+this.grades.length);
        console.log(this.grades);
        var data = new google.visualization.DataTable();

        // first column is grade
        data.addColumn('string', 'Grade');

        // add the color columns
        $.each(this.colorsArray, function(index, color){
            data.addColumn('number', color);
            // set up ideal tooltip
            if(this.$scope.gym && this.$scope.ideal===true){
                data.addColumn({type: 'string', role: 'tooltip'});
            }
            // add the color style column
            data.addColumn({type: 'string', role: 'style'});
        }.bind(this));



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

                if(routes){
                    row.push(routes.length);
                } else {
                    row.push(0);
                }

                // set up ideal tooltip
                if(this.$scope.gym && this.$scope.ideal===true){
                    var num = this.$scope.gym.get( color.toLowerCase()+grade.toUpperCase() );
                    row.push( "Total: "+("0" && routes!== undefined && routes.length)+"\nIdeal: "+num );
                }

                // add the data for the color style column
                row.push('color:'+color+';');

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
            width:900,
            height:500,
            // colors:colors,
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
        // material chart (sorta broke)
        // this.chart1 = new google.charts.Bar(this.chart1Div.get(0));
        // google.charts.Bar.convertOptions(options)
        // this.chart1.draw(data, options);
    },

    drawChart2:function(data){
        var series = [];
        var chartOverlay = this.$el.find('.chart-overlay');

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Grade');

        // add the color columns
        $.each(this.colorsArray, function(index, color){
            data.addColumn('number', color);
            // add the color style column
            data.addColumn({type: 'string', role: 'style'});
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
                    var num = this.$scope.gym.get( color.toLowerCase()+grade.toUpperCase() );
                    row.push(num);
                    // row.push(routes.length);
                } else {
                    row.push(0);
                }

                // add the data for the color style column
                row.push('color:'+color+';'+'opacity:0.6;');

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
            width:900,
            height:500,
            backgroundColor:'transparent',
            // colors:colors,
            // dataOpacity:'0.6',
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
        // material chart (sorta broke)
        // this.chart2 = new google.charts.Bar(this.chart2Div.get(0));
        // google.charts.Bar.convertOptions(options)
        // this.chart2.draw(data, options);

        // splice the charts
        var svg = this.chart2Div.find('svg');

        // find the clippath
        // var defs = svg.find('defs');
        // var clippath_rect = defs.find('rect');
        // var clippath_rect_y = clippath_rect.attr('y');
        // clippath_rect.attr('y', clippath_rect_y-=500);

        // svg.parent().css('top',-500);
        var barRectsGroup = svg.find('g').first().find('g').first().find('g').first();
        barRectsGroup.attr('transform', 'translate(30,0)');
        // console.log();
        // svg.parent().css('left',29);
        this.chart1Div.find('svg').find('g').first().find('g').first().children().first().next().after(barRectsGroup);

        // this.chart2Div.children().css('position', 'absolute').appendTo(this.chart1Div);

        // setup event passthrough
        // google.visualization.events.addListener(this.chart2, 'onmouseover', function(e){
        //     console.log('chart2 : mouseover');
        //     console.log(e);
        // }.bind(this));
        //
        // google.visualization.events.addListener(this.chart1, 'onmouseover', function(e){
        //     console.log('chart1 : mouseover');
        //     console.log(e);
        // }.bind(this));

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
    .directive('routeDistribution', ['RouteModel', 'Notifications', 'googleChartApiLoader', '$rootScope', function(RouteModel, Notifications, googleChartApiLoader, $rootScope){
        return {
            restrict:'E',
            link: function($scope, el, attrs){
                // if(attrs.ideal && attrs.ideal==="true"){
                //     console.log('route is ideal');
                // }
                new RouteDistributionDirective($scope, el, RouteModel, Notifications, googleChartApiLoader, $rootScope);
            },
            scope:{
                wall:'=',
                gym:'=',
                ideal:'='
            },
            templateUrl: "partials/routes/routeDistributionDirective.html"
        };
    }]);
})();
