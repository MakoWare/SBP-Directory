'use strict';

var GymMapController = BaseController.extend({
    notifications:null,

    init:function($scope, Notifications){
	this.notifications = Notifications;
	this._super($scope);
    },

    defineListeners:function(){
	this._super();
        this.$scope.areaClicked = this.areaClicked.bind(this);
        window.onresize = this.resize.bind(this);
    },

    defineScope:function(){
        $(document).ready(function(e) {
            $('img[usemap]').rwdImageMaps();
            
            
            
            console.log("done");
        });

        this.highlightMap();
    },

    destroy:function(){
        $('canvas').off('.omgmaps');
    },


    areaClicked: function(){
        console.log("RCH");
    },

    highlightMap: function(){
        
        var body = $('body'),
            map = $("#gymMap"),
            mapEl = $("#gymMap").get(0),
            mapAreas = map.find('area');
        
        
        $.each(mapAreas, function(index, object){
            var object = $(object);
            var area = object.get(0);
            var coords = area.coords.split(", ");

            //            console.log('coords');
            //            console.log(coords);
            
            // create a canvas
            var canvas = $('<canvas>').css('display', 'none');
            // append said canvas
            body.append(canvas);
            
            // grab the canvas context
            var ctx = canvas.get(0).getContext('2d');
//            console.log('ctx');
//            console.log(ctx);

            ctx.fillStyle = '#f00';
            ctx.beginPath();

            var x = coords[0];
            var y = coords[1];

            //            console.log("x: " + x);
            //            console.log("y: " + y);
            ctx.moveTo(coords[0], coords[1]);
            //            console.log(coords.length);
            for(var j = 2; j < coords.length-1 ; j += 2 ){
                x = coords[j];
                y = coords[j + 1];

                //                console.log("x: " + x);
                //                console.log("y: " + y);
                //                console.log("j: " + j);

                ctx.lineTo(x, y);
            }




            ctx.lineTo(100, 50);
            ctx.lineTo(50, 100);
            ctx.lineTo(0, 90);
            ctx.closePath();
            ctx.fill();

            //            ctx.closePath();
            //            ctx.fill();

            //            console.log(canvas);
            
            // create an area mouseenter event listener
            object.on('mouseenter.omgmaps', (function(canvas){
                return function(event){
                    canvas.css('display', 'inline-block');
                }
            })(canvas));

            object.on('mouseleave.omgmaps', (function(canvas){
                return function(event){
                    canvas.css('display', 'none');
                }
            })(canvas));

        });
        
    },

    resize: function(){

    }

});


GymMapController.$inject = ['$scope','Notifications'];
