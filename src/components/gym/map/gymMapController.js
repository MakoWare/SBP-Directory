'use strict';

var GymMapController = BaseController.extend({
  notifications:null,
  rootCanvas:null,
  rootImage:null,
  $state: null,

  // init:function($scope, Notifications,$state){
  //   this.notifications = Notifications;
  //   this.$state = $state;
  //   this._super($scope);
  // },

  initialize:function($scope, Notifications,$state){
    this.notifications = Notifications;
    this.$state = $state;
  },

  defineListeners:function(){
    this.$scope.areaClicked = this.areaClicked.bind(this);
    window.onresize = this.onResize.bind(this);
  },

  defineScope:function(){
    var that = this;
    $(document).ready(function(e) {

      that.rootImage = $('.imageLayer img').on('load.omgmaps', function(event){
        $(this).rwdImageMaps();
        that.highlightMap();


      }).css('opacity','0');

      console.log("done");

    });


  },

  destroy:function(){
    $('area').off('.omgmaps');
    $('img').off('.omgmaps');
  },


  areaClicked: function(){
    console.log("RCH");
  },

  createRootCanvas:function(){
    var image = this.rootImage,
    imgWidth = image.width(),
    imgHeight = image.height();

    this.rootCanvas = $('<canvas>').attr('width',imgWidth).attr('height',imgHeight);
    this.rootCanvas.css({
      position:'absolute',
      top:'0px',
      left:'0px',
      height:'auto'
    });
    image.before(this.rootCanvas);
    var ctx = this.rootCanvas.get(0).getContext('2d');
    ctx.drawImage(image.get(0),0,0,imgWidth, imgHeight);
  },

  redrawRootCanvas: function(){
    var image = this.rootImage,
    imgWidth = image.width(),
    imgHeight = image.height();

    var ctx = this.rootCanvas.get(0).getContext('2d');
    ctx.clearRect(0, 0, this.rootCanvas.get(0).width, this.rootCanvas.get(0).width);

    this.rootCanvas.attr('width',imgWidth).attr('height',imgHeight);

    ctx.drawImage(image.get(0),0,0,image.width(), image.height());
  },

  highlightMap: function(){

    var that = this,
    body = $('body'),
    contentArea = $('.mapContent'),
    map = $("#gymMap"),
    mapEl = $("#gymMap").get(0),
    mapAreas = map.find('area'),
    image = this.rootImage,

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


    var rootCanvas = this.createRootCanvas();

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
      var canvas = $('<canvas>').attr('width',imgWidth).attr('height',imgHeight).addClass('map-overlay');
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
          //                    console.log('mouse enter');
          canvas.css('display', 'block');
          canvas.animate({opacity:'1.0'},200,'linear');
          //                    canvas.animate({display:'block'},200,'linear');
        }
      })(canvas));

      area.on('mouseleave.omgmaps', (function(canvas){
        return function(event){
          event.preventDefault();
          //                    console.log('mouse leave');
          canvas.animate({opacity:'0.0'},200,'linear',function(){
            canvas.css('display', 'none');
          });
          //                    canvas.animate({display:'none'},200,'linear');
        }
      })(canvas));

      area.on('click.omgmaps', (function(canvas){
        return function(event){
          event.preventDefault();
          that.$state.go('wallView',{id:'10'});
        }
      })(canvas));

    });

  },

  onResize: function(){
    var that = this;

    if(this.resizeTimeout){
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(function(){
      that.resize();
    }, 200);
  },

  resize: function(){
    var that = this;
    console.log('resize');

    if(this.rootCanvas){
      this.redrawRootCanvas();
    }

    $('canvas.map-overlay').each(function(index, canvas){
      canvas = $(canvas);

      canvas.css({
        height: that.rootImage.height(),
        width: that.rootImage.width()
      })
    });
  }

});


GymMapController.$inject = ['$scope','Notifications','$state'];
