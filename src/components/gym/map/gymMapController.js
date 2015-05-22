'use strict';

var GymMapController = BaseController.extend({
    
    notifications:null,
    rootCanvas: $('<canvas>'),
    resizeTimeout: null,

    init:function($scope, Notifications){
	this.notifications = Notifications;
	this._super($scope);
    },

    defineListeners:function(){
        this._super();
        this.$scope.areaClicked = this.areaClicked.bind(this);
        
    },

    defineScope:function(){
        var that = this;
        
        $(document).ready(function(e) {
            $(window).on('resize', this.resize.bind(this));
            $('img[usemap]').rwdImageMaps();
            
            $('.imageLayer img').on('load.omgmaps', function(event){
                that.setUpRootCanvas($(this));
                that.highlightMap();
            });
            
            console.log("done");
        }.bind(this));


        
    },

    destroy:function(){
        $('canvas').off('.omgmaps');
        $('.img').off('.omgmaps');
    },


    areaClicked: function(){
        console.log("RCH");
    },
    
    setUpRootCanvas: function(image){
        var imgWidth = image.width(),
            imgHeight = image.height();
        
        this.rootCanvas.attr('width',imgWidth).attr('height',imgHeight);
        this.rootCanvas.css({
            position:'absolute',
            top:'0px',
            left:'0px',
            width:'100%',
            height:'100%',
            display:'none'
        });
        
        // TEST CASE
        this.rootCanvas.css('opacity','0');
        
        this.redrawRootCanvas(image);
        
        image.before(this.rootCanvas);
        this.rootCanvas.fadeIn('slow');
    },
    
    redrawRootCanvas: function(image){
        var ctx = this.rootCanvas.get(0).getContext('2d');
        ctx.clearRect(0, 0, this.rootCanvas.get(0).width, this.rootCanvas.get(0).width);
        
        
        var imgWidth = image.width(),
            imgHeight = image.height();

        this.rootCanvas.attr('width',imgWidth).attr('height',imgHeight);
        
        ctx.drawImage(image.get(0),0,0,image.width(), image.height());
        
        console.log('rootCanvas: '+this.rootCanvas.get(0).width + ', '+this.rootCanvas.get(0).height);
        console.log('draw image: '+image.width() + ', '+image.height());
    },
    
    highlightMap: function(){
        
        var that = this,
            body = $('body'),
            contentArea = $('.mapContent'),
            imageLayer = $('.imageLayer'),
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

//        console.log('imgAttrWidth: '+imgAttrWidth);
//        console.log('imgAttrHeight: '+imgAttrHeight);
//        console.log('xFactor: '+xFactor);
//        console.log('yFactor: '+yFactor);
        
        // set up the image layer css
//        imageLayer.css({
//            width:'100%',
//            height:'auto'
//        });
        
        var rootCanvas = this.rootCanvas;
        
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
            var canvas = $('<canvas>').attr('width',imgWidth).attr('height',imgHeight).attr('id','canvas_'+index).addClass('map-overlay');
            canvas.css({
                position:'absolute',
                top:'0px',
                left:'0px',
                opacity:'0.0',
                display:'none'//,
//                width:rootCanvas.width(),
//                height:rootCanvas.height()//,
//                'z-index':'1'
            });
            
            // attach said canvas to DOM
            imageLayer.find('img').before(canvas);
            
            console.log('create canvas: '+imgWidth+', '+imgHeight);
            // TEST CASE
            canvas.css({opacity:'1', display:'block'});
            
            // grab the canvas context
            var ctx = canvas.get(0).getContext('2d');
            
            ctx.fillStyle = '#f00';
            
            var x = coords[0],
                y = coords[1];
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            if(coords.length>0){
                for(var j = 2,len = coords.length; j < len-1 ; j += 2 ){
                    x = coords[j];
                    y = coords[j + 1];

                    ctx.lineTo(x, y);
                }
            } else {
                console.log('NO COORDS!!');
            }
            
            ctx.closePath();
            ctx.fill();

            // create an area mouseenter event listener
//            area.on('mouseenter.omgmaps', (function(canvas){
//                return function(event){
//                    event.preventDefault();
////                    console.log('mouseenter');
//                    canvas.css('display', 'block');
//                    canvas.animate({opacity:'1.0'},200,'linear');
////                    canvas.animate({display:'block'},200,'linear');
//                }
//            })(canvas));
//
//            area.on('mouseleave.omgmaps', (function(canvas){
//                return function(event){
//                    event.preventDefault();
//                    canvas.animate({opacity:'0.0'},200,'linear',function(){
//                        canvas.css('display', 'none');
//                    });
////                    canvas.animate({display:'none'},200,'linear');
//                }
//            })(canvas));
            
            
//            console.log('ctx');
//            console.log(ctx);
        });
        
    },
    
    // TESt CASE: is canvas blank
    isCanvasBlank:function(canvas){
        var blank = $('<canvas>').get(0);
        blank.width = canvas.width;
        blank.height = canvas.width;

        return canvas.toDataURL() == blank.toDataURL();
    },

    resize: function(){
        var that = this;
        
        if(this.resizeTimeout){
            clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(function(){
            that.doResize();
        }, 200);
        
       
    },
    
    doResize: function(){
        var that = this;
        console.log('do resize');
        
        this.redrawRootCanvas($('.imageLayer img'));
        
        $('canvas.map-overlay').remove();
        this.highlightMap();

    }

});


GymMapController.$inject = ['$scope','Notifications'];
