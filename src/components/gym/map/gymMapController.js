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
            contentArea = $('.mapContent'),
            map = $("#gymMap"),
            mapEl = $("#gymMap").get(0),
            mapAreas = map.find('area'),
            image = $("img[usemap='#gymMap']").css('opacity','0'),
            
            // get the width and height from the image tag
            imgWidth = image.width(),
            imgHeight = image.height(),
            imgAttrWidth = image.attr('width'),
            imgAttrHeight = image.attr('height'),
            xFactor = parseFloat(imgWidth/imgAttrWidth),
            yFactor = parseFloat(imgHeight/imgAttrHeight);

        console.log('imgAttrWidth: '+imgAttrWidth);
        console.log('imgAttrHeight: '+imgAttrHeight);
        console.log('xFactor: '+xFactor);
        console.log('yFactor: '+yFactor);
        
        
        var canvas = $('<canvas>').attr('width',imgWidth).attr('height',imgHeight);
        canvas.css({
            position:'absolute',
            top:'0px',
            left:'0px'
        });
        image.before(canvas);
        var ctx = canvas.get(0).getContext('2d');
        
        image.on('load.omgmaps', function(event){
            ctx.drawImage(this,0,0,imgWidth, imgHeight);
        });
        
        
        
        $.each(mapAreas, function(index, area){
            var area = $(area);
            var areaEl = area.get(0);
            var coords = areaEl.coords.split(", ");
            
            // map the coords because they are scaled for the image size and not the other size
            coords = coords.map(function(value, index){
                if(index%2 === 0){
                    // x coord
                    return value * xFactor;
                } else {
                    // y coord
                    return value * yFactor;
                }
            });
            
            // create a canvas
            var canvas = $('<canvas>').attr('width',imgAttrWidth).attr('height',imgAttrHeight);
            canvas.css({
                position:'absolute',
                top:'0px',
                left:'0px',
                opacity:'0.0',
                display:'none'
            });
            
            // attach said canvas to DOM
            contentArea.find('img').before(canvas);
            
            // grab the canvas context
            var ctx = canvas.get(0).getContext('2d');
            ctx.fillStyle = '#f00';
            
            var x = coords[0],
                y = coords[1];
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            for(var j = 2,len = coords.length; j < len-1 ; j += 2 ){
                x = coords[j];
                y = coords[j + 1];
                
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // create an area mouseenter event listener
            area.on('mouseenter.omgmaps', (function(canvas){
                return function(event){
                    event.preventDefault();
                    console.log('mouse enter');
                    canvas.css('display', 'block');
                    canvas.animate({opacity:'1.0'},200,'linear');
//                    canvas.animate({display:'block'},200,'linear');
                }
            })(canvas));

            area.on('mouseleave.omgmaps', (function(canvas){
                return function(event){
                    event.preventDefault();
                    console.log('mouse leave');
                    canvas.animate({opacity:'0.0'},200,'linear',function(){
                        canvas.css('display', 'none');
                    });
//                    canvas.animate({display:'none'},200,'linear');
                }
            })(canvas));

        });
        
    },

    resize: function(){

    }

});


GymMapController.$inject = ['$scope','Notifications'];
