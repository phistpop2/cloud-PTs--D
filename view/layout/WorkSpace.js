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


                    this_.contentsCollection.setSelected();
                    if(e.altKey){
                        zooming = true;
                        zoomer.init(prevX, prevY);
                    }else
                        moveEnable = true;
                    console.debug(e.clientX, e.clientY, e.pageX, e.pageY);
                })



                $('#workSpace').bind('mousemove',function(e){
                    if(moveEnable)
                    {
                        var currX = e.clientX;
                        var currY = e.clientY;

                        var scalar1 = (currX-prevX)/2;
                        var scalar2 = (currY-prevY)/2;


                        if(e.altKey)    //zoom
                        {

                        }
                        else if(e.ctrlKey && e.shiftKey)
                        {
                            camera_.rotateZ(-(scalar2+scalar1));
                        }
                        else if(e.ctrlKey)
                        {
                            camera_.rotateX(scalar2);
                            camera_.rotateY(-scalar1);

                        }
                        else
                        {
                            camera_.setPosition( -scalar1, scalar2, 0);
                        }

                        prevX = currX;
                        prevY = currY;
                    }else if( zooming ){
                        zoomer.focusing(e.clientX, e.clientY, prevX, prevY);
                    }
                }).bind('mouseup',function(e){
                        if( zooming )
                            zoomer.zoom(e.clientX, e.clientY, prevX, prevY );
                        moveEnable = false;
                        zooming = false;
                    });


                $('#workSpace').bind('mousewheel',function(e){
                    if(!this_.contentsCollection.getSelected())
                    {
                        var scalar = e.originalEvent.wheelDelta/10;
                        camera_.setPosition(0,0,scalar);
                    }

                });

                $('#workSpace').on('keydown',function(e){

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
               $('#mainCanvasLayout').css('background',this.setting.get('backgroundColor'));

               for(var i = 0 ; i < 2;  i++)
               {
                   var rotateX =  Math.floor(Math.random() * 359) + 1;
                   var rotateY =  Math.floor(Math.random() * 359) + 1;
                   var rotateZ =  Math.floor(Math.random() * 359) + 1;

                   var textModel1 = new TextModel({
                       width : 100,
                       height : 100,

                       translateX:100 + (500*i),

                       translateY:-100,
                       translateZ:0,

                       rotateX:0,
                       rotateY:0,
                       rotateZ:0
                   });



                   this.contentsCollection.add(textModel1);
               }




           }
        }) ;



        return workSpace;
    }) ;

Zoomer = function( _camera ){
    var selection = $('<div>').addClass('selection-box');
    var innerSelection = $('<div>').addClass('selection-box');
    var innerPillar = new Array();
    var camera = _camera;
    var controller = new ObjectController( _camera );
    var wBias = 200;
    var size= 3000;
    var gap = 20;



    setAngle = function(){
        controller.resetAngle();
        controller.showFacade();
    }

    setPosition =  function( obj, x, y, _width, _height){


        var width = _width? _width : 1;
        var height = _height? _height: 1;
        var w = parseInt( $('#workSpace').css('width') );
        var h = parseInt( $('#workSpace').css('height') );
        controller.resetPosition();
        var v = controller.getFacadePosition( width, height );
        console.debug( 'asaaa', v.getX(), v.getY(), v.getZ(),w, h, width, height)
        //controller.resetPosition();
        controller.setPosition(v.getX()- width/2, v.getY()+height/2, v.getZ());

        obj.css({
            position: 'absolute',
            padding : '0px',
            margin : '0px',
            width : width,
            height : height,
            webkitTransform: 'matrix3d('+controller.getMatrixQuery()+')'
        });
    }
    initPosition2 =  function( obj, w, h, x, y){


        //controller.showFacade();
        var a = controller.getFacadeAngle();
        var v = controller.getFacadePosition( w, h );
        //controller.setRotatePosition( -camera.getLocation().getX()+x-wBias, -camera.getLocation().getY()-y, -camera.getLocation().getZ() );

        controller.setRotation(a.getX(), a.getY(),a.getZ());
        controller.setPosition(v.getX()-w/2, v.getY()+h/2, v.getZ());

        console.debug('asdf',controller.getLocation().getX(), controller.getLocation().getY(), controller.getLocation().getZ())
        console.debug('asdf',v.getX(), v.getY(), v.getZ())
        //controller.setRotatePosition(v.getX(), v.getY(), v.getZ());

        innerSelection.css({
            'width': w,
            'height': h,
            webkitTransform: 'matrix3d('+controller.getMatrixQuery()+')'
        });

        /*
        innerSelection.css({
            'width': w,
            'height': h,
            webkitTransform: 'matrix3d('+controller.getMatrixQuery()+')'
        });
        */
    }

    return{
        init: function(x, y){
            selection.css({
                'position': 'absolute',
                'border': '2px dotted #ffff00',
                'top': x,
                'left': y-wBias,
                'width': 0,
                'height': 0
            });
            //$('#workSpace').append( selection );
            innerSelection.css({
                'position': 'absolute',
                'border': '5px dotted #00ffff',
                'width': 0,
                'height': 0,
                webkitPerspective: '600px',
                webkitTransformStyle: 'preserve-3d'
            });
            $('#world').append( innerSelection );


            setAngle();
            innerPillar[0] = $('<div>').addClass('innerPannel');
            innerPillar[1] = $('<div>').addClass('innerPannel');
            innerPillar[2] = $('<div>').addClass('innerPannel');
            innerPillar[3] = $('<div>').addClass('innerPannel');
            for( var i = 0; i < 4; i++ ){
                innerPillar[i].css({
                    'position': 'absolute',
                    'border': '2px dotted #ffff00',
                    background: 'rgba(255,0,0,0.3)',
                    'width': 0,
                    'height': 0
                });
                innerSelection.append( innerPillar[i] );
            }

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


            console.debug( centerX,$('#workSpace').width()/2 )
            var sw = parseInt( $('#workSpace').width() );
            var sh = parseInt( $('#workSpace').height() );

            var screenAspect = sw/sh;
            var zoomAspect = width/height;
            console.debug( sw, sh, screenAspect, zoomAspect );
            if( screenAspect < zoomAspect ){
                camera.zoom( centerX-sw/2, sh/2-centerY, - parseInt( $('#workSpace').css('-webkit-perspective') )/2*(sw-width)/sw);
            }else{
                camera.zoom( centerX-sw/2, sh/2-centerY, - parseInt( $('#workSpace').css('-webkit-perspective') )/2*(sh-height)/sh);
            }
            var world = $('#world');
            world.one( 'webkitTransitionEnd', function(e){
                selection.remove();
                innerSelection.remove();
                for( var i = 0; i < 4; i++ ){
                    innerPillar[i].remove();
                }
                $('#world').css({
                    transition: 'none'
                });
            });
            world.css({
                webkitTransform: 'matrix3d('+camera.getMatrixQuery()+')',
                transition: 'all 400ms ease-in-out'
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

            selection.css({
                'width': width,
                'height': height,
                'top': newY,
                'left': newX-wBias
            });

            setPosition(innerSelection, newX, newY, width, height);

            //initPosition( innerSelection, width, height, newX, newY );

            innerPillar[0].css({
                'width': size,
                'height': height,
                'top': 0,
                'left': -size/2,
                webkitTransform: 'rotateY(90deg)'
            });
            innerPillar[1].css({
                'width': size,
                'height': height,
                'top': 0,
                'left': -size/2+width,
                webkitTransform: 'rotateY(90deg)'
            });
            innerPillar[2].css({
                'width': width,
                'height': size,
                'top': -size/2,
                'left': 0,
                webkitTransform: 'rotateX(90deg)'
            });
            innerPillar[3].css({
                'width': width,
                'height': size,
                'top': -size/2+height,
                'left': 0,
                webkitTransform: 'rotateX(90deg)'
            });
            console.debug('focusing', newX, newY, prevX, prevY);
        }

    };
}