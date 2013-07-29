define(['jquery','underscore','backbone',

          'model/contents/ObjectModel',
          'model/contents/TextModel',
            'CameraModule'],
    function($,_,Backbone,
             ObjectModel,
             TextModel){
        var workSpace = Backbone.View.extend({
            el : $('#workSpace'),

            contentsCollection : null,
            cameraModule : null,

           initialize : function()
           {
                _.bindAll(this);
               this.setting = this.options.setting;
               this.contentsCollection = this.options.contentsCollection;
               this.cameraModule = this.options.cameraModule;
               this.camera = this.cameraModule.getCamera();

               this.eventBind();
               this.render();
               this.draw();
           },

            events : {
                "mousedown" : "focusedWorkSpace"
            },

            eventBind : function()
            {
                var this_ = this;
                var model_ = this.model;
                var prevX = 0 ;
                var prevY = 0 ;
                var moveEnable = false;


                var zooming = false;
                var zoomer = Zoomer(this.camera);

                var ctrlKey = 17;
                var ctrlDown = false;

                var camera_ = this.camera;
                var fov = 20;


                $(window).bind('resize',function(){
                   var width =  parseInt(window.innerWidth);

                   width-=200;
                    $('#mainCanvasLayout #workSpace').css({'width':width});
                    this_.cameraModule.resize();
                    console.log('workSpace width',width);
                });

                $(document).keydown(function(e)
                {
                    if (e.keyCode == ctrlKey) ctrlDown = true;


                }).keyup(function(e)
                    {
                        if (e.keyCode == ctrlKey) ctrlDown = false;
                    });

                $(this.el).bind('mousedown',function(e){
                    prevX = e.clientX;
                    prevY = e.clientY;

                    if(e.ctrlKey){
                    }else if ((e.which && e.which == 3) || (e.button && e.button == 2)){
                        this_.contentsCollection.setSelected();
                        //zooming = true;
                        //zoomer.init(prevX, prevY);
                    }else if(e.shiftKey){
                        moveEnable = true;
                    }else{
                        this_.contentsCollection.setSelected();
                        moveEnable = true;
                    }
                })



                $('#workSpace').bind('mousemove',function(e){
                    if(moveEnable)
                    {
                        var currX = e.clientX;
                        var currY = e.clientY;

                        var scalar1 = (currX-prevX)/2;
                        var scalar2 = (currY-prevY)/2;


                        if(e.ctrlKey)    //multi select
                        {

                        }
                        else if(e.altKey && e.shiftKey)
                        {
                            camera_.rotateZ(-(scalar2+scalar1));
                        }
                        else if(e.altKey)
                        {
                            camera_.rotateX(scalar2);
                            camera_.rotateY(-scalar1);
                        }
                        else
                        {
                            camera_.setPosition( -scalar1*2, scalar2*2, 0);
                        }
                        prevX = currX;
                        prevY = currY;

                    }else if( zooming ){
                        var currX = e.clientX;
                        var currY = e.clientY;


                        var width  = Math.abs(currX - prevX);
                        var height = Math.abs(currY - prevY);
                        var newX, newY;

                        newX = (currX < prevX) ? (prevX - width) : prevX;
                        newY = (currY < prevY) ? (prevY - height) : prevY;

                        selection.css({
                            'width': width,
                            'height': height,
                            'top': newY,
                            'left': newX-wBias
                        });
                    }
                    else if ( ( (e.which && e.which == 3) || (e.button && e.button == 2) ) && zooming )
                    {
                        zoomer.focusing(e.clientX, e.clientY, prevX, prevY);

                    }
                }).bind('mouseup',function(e){
                        if ( ( (e.which && e.which == 3) || (e.button && e.button == 2) ) && zooming )
                        {
                            zoomer.zoom(e.clientX, e.clientY, prevX, prevY );
                        }
                        zooming = false;
                        moveEnable = false;
                })


                $('#workSpace').bind('mousewheel',function(e){

                    if(e.shiftKey || !this_.contentsCollection.getSelectedObjects())
                    {
                        var scalar = e.originalEvent.wheelDelta/10;
                        camera_.setPosition(0,0,scalar);

                    }

                });

                $('#workSpace').on('keydown',function(e){
/*
                    switch( e.keyCode ){
                        case 81:    //forward(q)
                            camera_.moveFor();
                            break;
                        case 69:    //backword(e)
                            camera_.moveBack();
                            break;
                        case 87:    //up(w)
                            camera_.moveUp();
                            break;
                        case 83:    //down(s)
                            camera_.moveDown();
                            break;
                        case 65:    //left(a)
                            camera_.moveLeft();
                            break;
                        case 68:    //right(d)
                            camera_.moveRight();
                            break;
                    }

                    */
                });
            },


            focusedWorkSpace : function()
            {
                this.contentsCollection.setSelected();
            },

           draw : function()
           {

           },

           render : function()
           {
               var width =  parseInt(window.innerWidth);

               width-=200;
               $('#mainCanvasLayout #workSpace').css({'width':width});

               var color = this.setting.get('backgroundColor');
               var rgb = this.hexToRgb(color);

               var r_ = Math.abs(rgb.r+57)%255;
               var g_ = Math.abs(rgb.g+57)%255;
               var b_ = Math.abs(rgb.b+57)%255;

               var secondColor = this.rgbToHex(r_,g_,b_);

               var background = '-webkit-radial-gradient(center, circle cover,'+secondColor+' 0%, '+color+' 100%)'

               $('#mainCanvasLayout #workSpace').css('background',background);
           },

           componentToHex : function(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
           },

           rgbToHex : function(r, g, b) {
                return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
           },

            hexToRgb : function(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }

        });







        return workSpace;
});

Zoomer = function( _camera ){
    var selection = $('<div>').addClass('selection-box');
    var innerDepth = new Array();
    var innerPillar = new Array();
    var camera = _camera;
    var controller = new ObjectController( _camera );
    var wBias = 0;
    var size= 2048;
    var tick = 0;
    var d = new Date();
    var floor = 25;



    setAngle = function(){
        controller.resetAngle();
        controller.showFacade();
    }

    setPosition =  function( obj, x, y, _width, _height){
        var width = _width? _width : 1;
        var height = _height? _height: 1;

        controller.resetPosition();
        controller.setFacadePosition( width, height, x-wBias, -y);

        obj.css({
            position: 'absolute',
            padding : '0px',
            margin : '0px',
            width : width,
            height : height,
            webkitTransform: 'matrix3d('+controller.getMatrixQuery()+')'
        });
    }

    initialize = function(){
        selection.css({
            'position': 'absolute',
            'border': '4px dotted #00ffff',
            'width': 0,
            'height': 0,
            visibility: 'hidden',
            webkitTransformStyle: 'preserve-3d'
        });
        $('#world').append( selection );

        for( var i = 0; i < 4; i++ ){
            innerPillar[i] = $('<div>').addClass('innerPannel');
            innerPillar[i].css({
                position: 'absolute',
                border: '1px solid #000000'
            });
            selection.append( innerPillar[i] );
        }

        for( var i = 0; i < floor; i++ ){
            innerDepth[i] = $('<div>').addClass('innerDepth');
            innerDepth[i].css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                border: '1px solid #cccc00',
                webkitTransform: 'translateZ('+(size/2-size/floor*i ) +'px)'
            });
            selection.append( innerDepth[i] );
        }
        innerPillar[0].css({
            'width': size,
            'height': '100%',
            'top': 0,
            'left': -size/2,
            webkitTransform: 'rotateY(90deg)'
        });
        innerPillar[1].css({
            'width': size,
            'height': '100%',
            'top': 0,
            'left': 0,
            webkitTransform: 'rotateY(90deg)'
        });
        innerPillar[2].css({
            'width': '100%',
            'height': size,
            'top': -size/2,
            'left': 0,
            webkitTransform: 'rotateX(90deg)'
        });
        innerPillar[3].css({
            'width': '100%',
            'height': size,
            'top': 0,
            'left': 0,
            webkitTransform: 'rotateX(90deg)'
        });

    }
    initialize();

    return{
        init: function(x, y){
            setAngle();
            setPosition(selection, x, y );
            selection.css({
                visibility: 'visible'
            });

            console.debug( 'zoomer.init');
        },
        zoom: function(x, y, prevX, prevY){
            var currX = x;
            var currY = y;


            var width  = Math.abs(currX - prevX);
            var height = Math.abs(currY - prevY);
            var newX, newY;

            var newX = (currX < prevX) ? (prevX - width) : prevX;
            var newY = (currY < prevY) ? (prevY - height) : prevY;

            var centerX = newX-wBias + width/2;
            var centerY = newY + height/2;


            var sw = parseInt( $('#workSpace').width() );
            var sh = parseInt( $('#workSpace').height() );

            var screenAspect = sw/sh;
            var zoomAspect = width/height;
            if( screenAspect < zoomAspect ){
                camera.zoom( centerX-sw/2, sh/2-centerY, - parseInt( $('#workSpace').css('-webkit-perspective') )*(sw-width)/sw);
            }else{
                camera.zoom( centerX-sw/2, sh/2-centerY, - parseInt( $('#workSpace').css('-webkit-perspective') )*(sh-height)/sh);
            }


            var world = $('#world');
            world.on( 'webkitTransitionEnd', function(e){
                selection.css({
                    visibility: 'hidden'
                });
            });
            world.css({
                webkitTransform: 'matrix3d('+camera.getMatrixQuery()+')',
                transition: 'all 350ms ease-in-out'
            });
        },
        focusing: function(x, y, prevX, prevY){
            var currX = x;
            var currY = y;

            var width  = Math.abs(currX - prevX);
            var height = Math.abs(currY - prevY);
            var newX, newY;

            newX = (currX < prevX) ? (prevX - width) : prevX;
            newY = (currY < prevY) ? (prevY - height) : prevY;

            setPosition(selection, newX, newY, width, height);




            innerPillar[1].css({
                'left': -size/2+width
            });
            innerPillar[3].css({
                'top': -size/2+height
            });
        }

    };
}
