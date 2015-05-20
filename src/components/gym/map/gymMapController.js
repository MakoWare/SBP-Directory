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

    },


    areaClicked: function(){
        console.log("RCH");
    },

    highlightMap: function(){

        var map = $("#gymMap")[0];
        for(var i = 0; i < map.children.length; i++){

            var area = map.children[i];
            var coords = area.coords.split(", ");
            console.log(coords);

            var canvas = document.createElement("canvas");

            //canvas.style.cssText = 'position:absolute';
            document.body.appendChild(canvas);
            var ctx = canvas.getContext('2d');

            ctx.fillStyle = '#f00';
            ctx.beginPath();

            var x = coords[0];
            var y = coords[1];

            console.log("x: " + x);
            console.log("y: " + y);
            ctx.moveTo(coords[0], coords[1]);
            console.log(coords.length);
            for(var j = 2; j < coords.length-1 ; j += 2 ){
                x = coords[j];
                y = coords[j + 1];

                console.log("x: " + x);
                console.log("y: " + y);
                console.log("j: " + j);

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

        }
    },

    resize: function(){

    }

});


GymMapController.$inject = ['$scope','Notifications'];
