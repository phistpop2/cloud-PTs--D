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
                var selection = $('<div>').addClass('selection-box');
                var wBias = 200;    //workspace bias(gap)

                var ctrlKey = 17;
                var ctrlDown = false;

                var camera_ = this.camera;

                $(document).unbind('keydown').bind('keydown', function (event) {
                    event.preventDefault();
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
                    console.log('workspace');
                    this_.contentsCollection.setSelected();
                    if(e.altKey){
                        zooming = true;
                        selection.css({
                            'position': 'absolute',
                            'border': '2px dotted #ffff00',
                            'top': prevY,
                            'left': prevX-wBias,
                            'width': 0,
                            'height': 0
                        });
                        $('#world').append( selection );

                    }else
                        moveEnable = true;

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
                }).bind('mouseup',function(e){
                        selection.remove();
                        moveEnable = false;
                        zooming = false;

                    });


                $('#workSpace').bind('mousewheel',function(e){
                    if(!this_.contentsCollection.getSelectedObjects())
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
               var color = this.setting.get('backgroundColor');
               var rgb = this.hexToRgb(color);

               var r_ = (rgb.r+60)%255;
               var g_ = (rgb.g+60)%255;
               var b_ = (rgb.b+60)%255;

               var secondColor = this.rgbToHex(r_,g_,b_);

               var background = '-webkit-radial-gradient(center, circle cover,'+secondColor+' 0%, '+color+' 100%);'
               $('#workSpace').css('background',background);
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

        }) ;



        return workSpace;
    }) ;