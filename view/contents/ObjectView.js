define(['jquery','underscore','backbone',
        'ObjectController'],
    function($,_,Backbone){
        var ObjectView = Backbone.View.extend({

            cameraModule : null,
            world : null,
            viewType : 'workspace', //viewType = workspace || 'sequence' || 'show'

            initialize : function()
            {
                this.model.bind('change',this.updateView,this);
                this.cameraModule = this.options.cameraModule;

                this.disableControl =  this.options.disableControl;
                this.world = this.options.world;

                if(this.options.viewType)
                {
                    this.viewType = this.options.viewType;
                }
            },

            events : {
               "mousedown" : "objectSelect",
                "mouseup" : "saveSelectRange"
            },

            eventBind : function()
            {

                var this_ = this;
                var model_ = this.model;
                var prevX = 0 ;
                var prevY = 0 ;
                var moveEnable = false;

                var ctrlKey = 17;
                var ctrlDown = false;

                $(document).keydown(function(e)
                {

                    if (e.keyCode == ctrlKey) ctrlDown = true;

                }).keyup(function(e)
                {
                    if (e.keyCode == ctrlKey) ctrlDown = false;
                });



                $('#workSpace').bind('mousewheel',function(e){

                    if(model_.isSelected())
                    {
                        var pos3d = model_.controller.getDepth(-e.originalEvent.wheelDelta/10);
                        model_.set({
                                'translateX':pos3d.getX(),
                                'translateY':pos3d.getY(),
                                'translateZ':pos3d.getZ()}
                        );
                    }
                });


            },

            moveCenterPosition : function()
            {

            },


            objectSelect : function(e)
            {

                if(e.ctrlKey)
                {
                    this.model.addSelectedToCollection(this.model);
                }
                else
                {
                    this.model.setSelected();
                }


                e.stopPropagation();

            },

            saveSelectRange : function()
            {
                window.saveSelectRange();
            },

            render : function()
            {

                $(this.world).append($(this.el));
                $(this.el).append('<div class=objectWrap></div>');

                if(this.viewType == 'workspace')
                {
                    this.eventBind();
//                    this.initPosition();

                    this.controlBox = ControlBox( this.model, $(this.el) );
                    $(this.el).append( this.controlBox.getBox() );
                    this.cameraModule.getCamera().moveFor();

                    this.model.setSelected();
                }
                else
                {
                    this.updateView();
                }

                return this;
            },

            initPosition: function(){
                                console.log('init');
                var w = parseInt( this.model.get('width') );
                var h = parseInt( this.model.get('height') );


                var angle = this.model.controller.getFacadeAngle();
                var pos = this.model.controller.getFacadePosition();

                this.model.attributes.rotateX=  angle.getX();
                this.model.attributes.rotateY=  angle.getY();
                this.model.attributes.rotateZ=  angle.getZ();

                this.model.attributes.translateX=  pos.getX()-w/2;
                this.model.attributes.translateY=  pos.getY()+h/2;
                this.model.attributes.translateZ=  pos.getZ();

                console.log('size',w,h);
                console.log('translate in init',this.model.attributes.translateX,this.model.attributes.translateY);




                if(this.model.get('copyData'))
                {

                    console.log('copyData model',this.model,this.model.attributes.rotateXBias);
//                    this.model.attributes.rotateX+=  this.model.attributes.rotateXBias;
//                    this.model.attributes.rotateY+=   this.model.attributes.rotateYBias;
//                    this.model.attributes.rotateZ+=   this.model.attributes.rotateZBias;

//                    this.model.attributes.translateX+=   this.model.attributes.translateXBias;
//                    this.model.attributes.translateY+=  this.model.attributes.translateYBias;
//                    this.model.attributes.translateZ+=  this.model.attributes.translateZBias;


                    this.model.set('copyData', true);
                }

            },

            cssRenderer : function()
            {
                var backgroundColor = this.model.get('background');
                var borderWidth = this.model.get('borderWidth');
                var borderColor = this.model.get('borderColor');
                var borderStyle = this.model.get('borderStyle');
                var borderTopLeftRadius = this.model.get('borderTopLeftRadius');
                var borderTopRightRadius = this.model.get('borderTopRightRadius');
                var borderBottomLeftRadius = this.model.get('borderBottomLeftRadius');
                var borderBottomRightRadius = this.model.get('borderBottomRightRadius');
                var borderBottomRightRadius = this.model.get('borderBottomRightRadius');
                var boxShadows = this.model.get('boxShadows');



                var objectWrap = $(this.el).find('.objectWrap')[0];

                objectWrap.style['borderWidth'] = borderWidth+'px';

                objectWrap.style['borderColor'] = borderColor;
                objectWrap.style['borderStyle'] = borderStyle;
                objectWrap.style['borderTopLeftRadius'] = borderTopLeftRadius+'px';
                objectWrap.style['borderTopRightRadius'] = borderTopRightRadius+'px';
                objectWrap.style['borderBottomLeftRadius'] = borderBottomLeftRadius+'px';
                objectWrap.style['borderBottomRightRadius'] = borderBottomRightRadius+'px';
                objectWrap.style['backgroundColor'] = backgroundColor;


                var boxShadowsCss = '';
                for(i in boxShadows)
                {
                    var boxShadow = boxShadows[i]+',';
                    boxShadowsCss += boxShadow;
                }

                boxShadowsCss = boxShadowsCss.slice(0,boxShadowsCss.length-1);
                objectWrap.style['boxShadow'] = boxShadowsCss;
            },

            updateView : function()
            {

                var top = this.model.get('top');
                var left = this.model.get('left');

                var width = this.model.get('width');
                var height = this.model.get('height');
                var matrix3d = 0;

                if(this.viewType=='workspace')
                {
                    this.model.controller.setRotation(this.model.get('rotateX'),this.model.get('rotateY'),this.model.get('rotateZ'))

                    this.model.controller.setPosition(this.model.get('translateX'),this.model.get('translateY'),this.model.get('translateZ'));

                    console.log('asdv',this.model.get('translateX'),this.model.get('translateY'),this.model.get('translateZ'));
                    matrix3d = this.model.controller.getMatrixQuery();
                    this.model.attributes.matrix3d = matrix3d;

                    if( this.controlBox && !this.model.get('selected') ){
                        this.controlBox.disable();
                    }else if(this.model.get('selected')){
                        this.controlBox.refresh();
                    }

                }
                else
                {
                    matrix3d = this.model.get('matrix3d');
                }


                $(this.el).css({
                    position: 'absolute',
                    padding : '0px',
                    margin : '0px',
                    webkitTransformStyle : 'preserve-3d',
                    webkitTransform: 'matrix3d('+matrix3d+')'
                });

                $(this.el).find('.objectWrap').css({
                   "width" : width,
                    "height" : height,
                    "padding" : '0px',
                    "margin" : '0px'
                });

                 console.log('matrix3d',matrix3d);
                this.cssRenderer();




            }
    });

        return ObjectView;


    });


ControlBox = function( target, tt ){
    var box = $("<div id='control_box'></div>");
    //var context = box[0].getContext("2d");

    var width = 0;
    var height = 0;
    var gap = 10;
    var line = 0;
    var lineWidth = 1;
    var moveButtonRange = lineWidth * 12;
    var buttonSize = lineWidth*8;
    var buttonSize2 = buttonSize*1.5;

    var job = 0;
    var prevX, prevY;
    var srcX, srcY;
    var srcTop;
    var originDistance = 0;
    var moveEnable = false;
    var originWidth = 0;
    var originHeight = 0;
    var originPos = null;
    var originRotationX = 0;
    var originRotationY = 0;
    var originAspect = 1;
    var transTime = 0;


    function setJob( _job, x,y ){
        job = _job;
        prevX = x;
        prevY = y;
        srcX = x;
        srcY = y;
        moveEnable = true;
        originWidth = width;
        originHeight = height;
        originPos = target.controller.getLocation().clone();
        originRotationX = target.get('rotateX');
        originRotationY = target.get('rotateY');
        originAspect = width/height;


        console.debug( 'job', job)
        switch( _job ){
            case JOB['RESIZE_N']:
                target.controller.lookFacade();
                target.controller.zoomResizeFacade( width, height, x, y, gap, 0, transTime );
                break;
            case JOB['RESIZE_S']:
                target.controller.lookFacade();
                target.controller.zoomResizeFacade( width, height, x, y, gap, 1, transTime );
                break;
            case JOB['RESIZE_W']:
                target.controller.lookFacade();
                target.controller.zoomResizeFacade( width, height, x, y, gap, 2, transTime );
                break;
            case JOB['RESIZE_E']:
                target.controller.lookFacade();
                target.controller.zoomResizeFacade( width, height, x, y, gap, 3, transTime );
                break;
            case JOB['RESIZE_NW']:
                target.controller.lookFacade();
                target.controller.zoomResizeFacade( width, height, x, y, gap, 4, transTime );
                break;
            case JOB['RESIZE_NE']:
                target.controller.lookFacade();
                target.controller.zoomResizeFacade( width, height, x, y, gap, 5, transTime );
                break;
            case JOB['RESIZE_SW']:
                target.controller.lookFacade();
                target.controller.zoomResizeFacade( width, height, x, y, gap, 6, transTime );
                break;
            case JOB['RESIZE_SE']:
                target.controller.lookFacade();
                target.controller.zoomResizeFacade( width, height, x, y, gap, 7, transTime );
                break;
        }

    }
    function length( x0, y0, x1, y1){
        x0 = parseInt( x0 );
        y0 = parseInt( y0 );
        x1 = parseInt( x1 );
        y1 = parseInt( y1 );
        console.debug( x0, y0, x1, y1 );
        return Math.sqrt( (x1-x0)*(x1-x0)+(y1-y0)*(y1-y0))

    }

    var options = {
        target : target,
        lineWidth : lineWidth,
        gap : gap,
        setJob : setJob,
        moveButtonRange : moveButtonRange
    }


    $('#workSpace').bind('mousemove',function(e){

        if(moveEnable && target.isSelected())
        {
            var currX = e.clientX;
            var currY = e.clientY;

            var scalar1 = currX-prevX;
            var scalar2 = currY-prevY;

            switch( job ){
                case 0:   //move
                    var pos3d = target.controller.getPosition(scalar1,scalar2);

                    target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ()}
                    );

                    break;
                case 1: //rotateX
                    var rot3d = target.controller.getRotation(0,prevY-currY);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    break;
                case 2: //rotateY
                    var rot3d = target.controller.getRotation(prevX-currX,0);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    break;
                case 3: //rotateZ
                    var rot3d = target.controller.getRotation(0,0,-(prevX-currX+prevY-currY)/2);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    break;
                case 4: //resize n
                    if( originHeight + srcY-currY >= 0  ){
                        var pos3d = target.controller.getResizePosition(originPos, 0,currY-srcY );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            height : originHeight + srcY-currY,
                            rotateX : originRotationX
                        });
                        target.controller.zoomResizeFacade( width, originHeight + srcY-currY, srcX, currY, gap, 0 );
                    }else{
                        var pos3d = target.controller.getResizePosition(originPos, 0,originHeight );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            height : Math.abs(originHeight + srcY-currY),
                            rotateX : originRotationX+180
                        });
                        target.controller.zoomResizeFacade( width, Math.abs(originHeight + srcY-currY), srcX, srcY+originHeight, gap, 0 );

                    }
                    break;
                case 5: //resize s
                    if( originHeight + currY-srcY >= 0  ){
                        var pos3d = target.controller.getResizePosition(originPos, 0,0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            height : originHeight + currY-srcY,
                            rotateX : originRotationX
                        });
                        target.controller.zoomResizeFacade( width, originHeight + currY-srcY, srcX, currY, gap, 1 );
                    }else{
                        var pos3d = target.controller.getResizePosition(originPos, 0, originHeight+currY-srcY );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            height : Math.abs(originHeight + currY-srcY),
                            rotateX : originRotationX+180
                        });
                        target.controller.zoomResizeFacade( width, Math.abs( originHeight + currY-srcY), srcX,srcY-originHeight, gap, 1 );
                    }
                    break;
                case 6: //resize w
                    if( originWidth + srcX - currX >= 0  ){
                        var pos3d = target.controller.getResizePosition(originPos, currX-srcX,0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : originWidth + srcX - currX,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( originWidth + srcX - currX, height, currX, srcY, gap, 2 );
                    }else{
                        var pos3d = target.controller.getResizePosition(originPos, originWidth,0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : Math.abs(originWidth + srcX - currX),
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( Math.abs(originWidth + srcX - currX), height, srcX+originWidth, srcY, gap, 2 );

                    }
                    break;
                case 7: //resize e
                    if( originWidth + currX - srcX >= 0  ){
                        var pos3d = target.controller.getResizePosition(originPos, 0,0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : originWidth + currX - srcX,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( originWidth + currX - srcX, height, currX, srcY, gap, 3 );
                    }else{
                        var pos3d = target.controller.getResizePosition(originPos, originWidth+currX-srcX,0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : Math.abs(originWidth + currX - srcX),
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( Math.abs(originWidth + currX - srcX), height, srcX-originWidth, srcY, gap, 3 );

                    }
                    break;
                case 8: //resize nw

                    if( originHeight + srcY-currY >= 0 && originWidth + srcX - currX >= 0  ){
                        var newW =  originWidth + srcX-currX;
                        var newH = originHeight + srcY-currY;
                        var newX = currX;
                        var newY = currY;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                var tempW = newH*originAspect;
                                newX = newX - (tempW-newW);
                                newW = tempW;
                            }else{

                                var tempH = newW/originAspect;
                                newY = newY - (tempH-newH);
                                newH = tempH;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, originWidth-newW, originHeight-newH );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 4 );
                    }else if(originWidth + srcX - currX >= 0){
                        var newW =  originWidth + srcX-currX;
                        var newH = Math.abs(originHeight + srcY-currY);
                        var newX = currX;
                        var newY = srcY+originHeight;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                var tempW = newH*originAspect;
                                newX = newX - (tempW-newW);
                                newW = tempW;
                            }else{

                                newH = newW/originAspect;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, originWidth-newW,originHeight );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX+180,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 4 );
                    }else if(originHeight + srcY-currY >= 0){
                        var newW = Math.abs(originWidth + srcX - currX);
                        var newH = originHeight + srcY-currY;
                        var newX = srcX+originWidth;
                        var newY = currY;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{

                                var tempH = newW/originAspect;
                                newY = newY - (tempH-newH);
                                newH = tempH;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, originWidth, originHeight-newH );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX,
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 4 );

                    }else{
                        var newW = Math.abs(originWidth + srcX - currX);
                        var newH = Math.abs(originHeight + srcY-currY);
                        var newX = srcX+originWidth;
                        var newY = srcY+originHeight;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, originWidth,originHeight );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX+180,
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 4 );
                    }
                    break;
                case 9: //resize ne
                    if(originHeight + srcY-currY >= 0 && originWidth + currX - srcX >= 0){
                        var newW = originWidth + currX-srcX;
                        var newH = originHeight + srcY-currY;
                        var newX = currX;
                        var newY = currY;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                var tempW = newH*originAspect;
                                newX = newX + (tempW-newW);
                                newW = tempW;
                            }else{

                                var tempH = newW/originAspect;
                                newY = newY - (tempH-newH);
                                newH = tempH;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, 0,originHeight-newH );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 5 );

                    }else if(originWidth + currX - srcX >= 0){
                        var newW = originWidth + currX-srcX;
                        var newH = Math.abs(originHeight + srcY-currY);
                        var newX = currX;
                        var newY = srcY+originHeight;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                var tempW = newH*originAspect;
                                newX = newX + (tempW-newW);
                                newW = tempW;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, 0,originHeight );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX+180,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 5 );

                    }else if(originHeight + srcY-currY >= 0){
                        var newW = originWidth + currX - srcX;
                        var newH = Math.abs(originHeight + srcY-currY);
                        var newX = srcX-originWidth;
                        var newY = currY;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                var tempH = newW/originAspect;
                                newY = newY - (tempH-newH);
                                newH = tempH;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, -newW,originHeight-newH  );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX,
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 5 );
                    }else{
                        var newW = Math.abs(originWidth + currX - srcX);
                        var newH = Math.abs(originHeight + srcY-currY);
                        var newX = srcX-originWidth;
                        var newY = srcY+originHeight;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                newH = newW/originAspect;
                            }
                        }

                        var pos3d = target.controller.getResizePosition(originPos, -newW, originHeight );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX+180,
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 5 );
                    }
                    break;
                case 10: //resize sw
                    if(originHeight + currY-srcY >= 0 && originWidth + srcX - currX >= 0){
                        var newW = originWidth + srcX - currX;
                        var newH = originHeight + currY-srcY;
                        var newX = currX;
                        var newY = currY;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                var tempW = newH*originAspect;
                                newX = newX - (tempW-newW);
                                newW = tempW;
                            }else{

                                var tempH = newW/originAspect;
                                newY = newY + (tempH-newH);
                                newH = tempH;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, originWidth-newW, 0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 6 );

                    }else if(originWidth + srcX - currX >= 0){
                        var newW = originWidth + srcX - currX;
                        var newH = Math.abs(originHeight + currY-srcY);
                        var newX = currX;
                        var newY = srcY-originHeight;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                var tempW = newH*originAspect;
                                newX = newX - (tempW-newW);
                                newW = tempW;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, originWidth-newW, -newH);
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX+180,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 6 );

                    }else if(originHeight + currY-srcY >= 0){
                        var newW = Math.abs(originWidth + srcX - currX);
                        var newH = originHeight + currY-srcY;
                        var newX = srcX+originWidth;
                        var newY = currY;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                var tempH = newW/originAspect;
                                newY = newY + (tempH-newH);
                                newH = tempH;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, originWidth,0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX,
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 6 );

                    }else{
                        var newW = Math.abs(originWidth + srcX-currX);
                        var newH = Math.abs(originHeight + currY-srcY);
                        var newX = srcX+originWidth;
                        var newY = srcY-originHeight;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, originWidth, -newH);
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX+180,
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 6 );

                    }
                    break;
                case 11: //resize se
                    if( originHeight + currY-srcY >= 0 && originWidth + currX - srcX >= 0 ){
                        var newW =  originWidth + currX - srcX;
                        var newH = originHeight + currY-srcY;
                        var newX = currX;
                        var newY = currY;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                var tempW = newH*originAspect;
                                newX = newX + (tempW-newW);
                                newW = tempW;
                            }else{

                                var tempH = newW/originAspect;
                                newY = newY + (tempH-newH);
                                newH = tempH;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, 0,0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 7 );
                    }else if( originWidth + currX - srcX >= 0 ){

                        var newW =  originWidth + currX - srcX;
                        var newH = Math.abs(originHeight + currY-srcY);
                        var newX = currX;
                        var newY = srcY-originHeight;

                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                var tempW = newH*originAspect;
                                newX = newX + (tempW-newW);
                                newW = tempW;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, 0, -newH );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX+180 ,
                            rotateY : originRotationY
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX,newY, gap, 7 );
                    }else if( originHeight + currY-srcY >= 0 ){
                        var newW = Math.abs(originWidth + currX - srcX);
                        var newH =  originHeight + currY-srcY;
                        var newX =  srcX-originWidth;
                        var newY = currY;

                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                var tempH = newW/originAspect;
                                newY = newY + (tempH-newH);
                                newH = tempH;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, -newW,0 );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX,
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade( newW, newH, newX, newY, gap, 7 );
                    }else{
                        var newW = Math.abs(originWidth + currX - srcX);
                        var newH = Math.abs(originHeight + currY-srcY);
                        var newX =  srcX-originWidth;
                        var newY = srcY-originHeight;

                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        var pos3d = target.controller.getResizePosition(originPos, -newW, -newH );
                        target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ(),
                            width : newW,
                            height : newH,
                            rotateX : originRotationX+180,
                            rotateY : originRotationY+180
                        });
                        target.controller.zoomResizeFacade(newW, newH, newX, newY, gap, 7 );
                    }
                    break;
            }
            prevX = currX;
            prevY = currY;
        }
    }).bind('mouseup',function(e){
            moveEnable = false;
            if( target.isSelected())
            {
                target.commitToCollection({
                    'rotateX': target.get('rotateX'),
                    'rotateY': target.get('rotateY'),
                    'rotateZ': target.get('rotateZ'),
                    'translateX': target.get('translateX'),
                    'translateY': target.get('translateY'),
                    'translateZ': target.get('translateZ')
                });
            }
        });


    //move button
    var moveNorthBar = MoveButton( options, true );
    var moveSouthBar = MoveButton( options, true );
    var moveWestBar = MoveButton( options );
    var moveEastBar = MoveButton( options );

    box.append( moveNorthBar.getButton() );
    box.append( moveSouthBar.getButton() );
    box.append( moveWestBar.getButton() );
    box.append( moveEastBar.getButton() );

    moveNorthBar.getButton().css({
        position: 'absolute',
        top : - (line+moveButtonRange)/2,
        left : -(line+moveButtonRange/2)/2
    });
    moveSouthBar.getButton().css({
        position: 'absolute',
        left : -(line+moveButtonRange/2)/2
    });
    moveWestBar.getButton().css({
        position: 'absolute',
        top : - (line+moveButtonRange)/2+lineWidth,
        left : -line/2 - moveButtonRange/2
    });
    moveEastBar.getButton().css({
        position: 'absolute',
        top : - (line+moveButtonRange)/2+lineWidth
    });

    //scale button;
    var resizeNorth = ResizeButtonRectangle( options, buttonSize, 0 );
    var resizeSouth = ResizeButtonRectangle( options, buttonSize, 1 );
    var resizeWest = ResizeButtonRectangle( options, buttonSize, 2 );
    var resizeEast = ResizeButtonRectangle( options, buttonSize, 3 );

    var resizeNW = ResizeButtonCircle( options, buttonSize2, 0 );
    var resizeNE = ResizeButtonCircle( options, buttonSize2, 1 );
    var resizeSW = ResizeButtonCircle( options, buttonSize2, 2 );
    var resizeSE = ResizeButtonCircle( options, buttonSize2, 3 );


    box.append( resizeNorth.getButton() );
    box.append( resizeSouth.getButton() );
    box.append( resizeWest.getButton() );
    box.append( resizeEast.getButton() );

    box.append( resizeNW.getButton() );
    box.append( resizeNE.getButton() );
    box.append( resizeSW.getButton() );
    box.append( resizeSE.getButton() );

    resizeNorth.getButton().css({
        position: 'absolute',
        top : -(line+buttonSize)/2,
        left : '50%'
    });
    resizeSouth.getButton().css({
        position: 'absolute',
        left : '50%'
    });
    resizeWest.getButton().css({
        position: 'absolute',
        left : -(line+buttonSize)/2
    });
    resizeEast.getButton().css({
        position: 'absolute'
    });

    resizeNW.getButton().css({
        position: 'absolute',
        top : -(line+buttonSize2*4)/2,
        left : -(line+buttonSize2*4)/2
    });
    resizeNE.getButton().css({
        position: 'absolute',
        top : -(line+buttonSize2*4)/2
    });
    resizeSW.getButton().css({
        position: 'absolute',
        left : -(line+buttonSize2*4)/2
    });
    resizeSE.getButton().css({
        position: 'absolute'
    });

    //rotation
    var rotationX = RotationButton( options );
    box.append( rotationX.getButton() );



    box.css({
        visibility : 'hidden'
    })

    function refresh(){
        width = parseInt( target.get( 'width' ) );
        height = parseInt( target.get( 'height' ) );



        /*
         box.css({
         position : 'absolute',
         left : -gap,
         top : -gap,
         width : tw+gap*2,
         height : th+gap*2,
         });
         console.debug( 'bw',box[0].width, box[0].height )
         context.beginPath();
         context.lineWidtdh = "2";
         context.rect( 0,0,width,height);
         context.strokeStyle = "#ff0000";
         context.stroke();

         */

        box[0].width = width + gap*3;
        box[0].height = height + gap*3;


        box.css({
            position : 'absolute',
            left : -(line+gap+1),
            top : -(line+gap+1),
            margin : 0,
            padding : 0,
            visibility : 'visible'
        });

        var widthCenter = (width+gap*2)/2-buttonSize/2 - 1;
        var heightCenter = (height+gap*2)/2 - buttonSize/2;


        resizeNorth.getButton().css({
            left : widthCenter
        });
        resizeSouth.getButton().css({
            top : height+gap*2+(line-buttonSize)/2,
            left : widthCenter
        });
        resizeWest.getButton().css({
            top : heightCenter
        });
        resizeEast.getButton().css({
            top : heightCenter,
            left : width+gap*2+(line-buttonSize)/2
        });


        var eastCenter = width+gap*2+(line-buttonSize2*4)/2;
        var southCenter = height+gap*2+(line-buttonSize2*4)/2;
        resizeNE.getButton().css({
            left : eastCenter
        });
        resizeSW.getButton().css({
            top : southCenter
        });
        resizeSE.getButton().css({
            top : southCenter,
            left : eastCenter
        });



        moveNorthBar.getButton().css({
            width : width+gap*2
        });

        moveSouthBar.getButton().css({
            top : height+gap*2+line/2-moveButtonRange/2,
            width : width+gap*2
        });
        moveWestBar.getButton().css({
            height : height+gap*2+line/2
        });
        moveEastBar.getButton().css({
            left : width+gap*2-line/2-moveButtonRange/2,
            height : height+gap*2+line/2
        });


        rotationX.refresh( width, height );
        /*
         context.beginPath();
         context.lineWidtdh = "2";
         context.rect( 0,0,width+gap,height+gap);
         context.strokeStyle = "#ff0000";
         context.stroke();*/

    }




    return{
        getBox: function(){
            return box;
        },
        enable : function(){
            refresh();
        },
        disable : function(){
            box.css({
                visibility : 'hidden'
            });
        },
        refresh : function(){
            refresh();
        }
    };
}
ResizeButtonRectangle = function( options, size, position ){
    var button = $("<a href='#' class='resize_button'></a>");
    var thick = 1;
    var resizeEvent;
    button.css({
        width : size,
        height : size,
        margin : '0px',
        padding : '0px',
        background : '#ffffff',
        border : thick + 'px solid #000000'
    })

    switch( position ){
        case 0: //north
            button.css({
                cursor : 'n-resize'
            })
            button.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_N'], e.clientX, e.clientY );
            });
            break;
        case 1: //south
            button.css({
                cursor : 's-resize'
            })
            button.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_S'], e.clientX, e.clientY );
            });
            break;
        case 2: //west
            button.css({
                cursor : 'w-resize'
            })
            button.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_W'], e.clientX, e.clientY );
            });
            break;
        case 3: //east
            button.css({
                cursor : 'e-resize'
            })
            button.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_E'], e.clientX, e.clientY );
            });
            break;
        default:
    }




    return{
        addResizeEvent : function( f ){
            resizeEvent = f;
        },
        getButton : function(){
            return button;
        }
    }
}

ResizeButtonCircle = function( options, size, position ){
    var button = $("<a class='circle_button'></a>");
    var circle = $("<canvas id='resize_button2'></canvas>");
    var context = circle[0].getContext("2d");
    var thick = 1;
    var resizeEvent;

    button.append( circle );
    button.css({
        width : size*4,
        height : size*4
    })



    circle.css({
        position : 'absolute',
        top : size*2-size/2,
        left : size*2-size/2
    });
    circle[0].width = size+thick*2;
    circle[0].height = size+thick*2;

    //eventListener;
    context.beginPath();
    context.arc(size/2+thick, size/2+thick, size/2,0, 2*Math.PI, false);
    context.fillStyle = '#ffffff';
    context.fill();
    context.lineWidth = thick;
    context.stroke();

    switch( position ){
        case 0: //NW
            circle.css({
                cursor : 'nw-resize'
            });
            circle.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_NW'], e.clientX, e.clientY );
                e.stopPropagation();
            });
            break;
        case 1: //NE
            circle.css({
                cursor : 'ne-resize'
            });
            circle.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_NE'], e.clientX, e.clientY );
                e.stopPropagation();
            });
            break;
        case 2: //SW
            circle.css({
                cursor : 'sw-resize'
            });
            circle.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_SW'], e.clientX, e.clientY );
                e.stopPropagation();
            });
            break;
        case 3: //SE
            circle.css({
                cursor : 'se-resize'
            });
            circle.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_SE'], e.clientX, e.clientY );
                e.stopPropagation();
            });
            break;
        default:
    }
    button.css({
        cursor : 'crosshair'
    })

    button.bind('mousedown',function(e){
        options.setJob(JOB['ROTATE_Z'], e.clientX, e.clientY );
    });


    return{
        addResizeEvent : function( f ){
            resizeEvent = f;
        },
        getButton : function(){
            return button;
        }
    }
}
MoveButton = function(options, horizontal){
    var target = options.target;
    var lineWidth = options.lineWidth;
    var range = options.moveButtonRange;
    var button = $("<div class='move_button'></div>");
    var line = $("<div class='dot_line'></div>");
    var color = '#ffffff';
    button.append( line );


    if( horizontal ){
        line.css({
            position : 'absolute',
            top : range/2 - lineWidth,
            width : '100%',
            margin : '0px',
            padding : '0px',
            border : lineWidth+'px dotted '+color
        });
        button.css({
            height: range
        });
    }else{
        line.css({
            position : 'absolute',
            left : range/2 - lineWidth,
            height : '100%',
            width : 0,
            margin : '0px',
            padding : '0px',
            border : lineWidth+'px dotted '+color
        });
        button.css({
            width: range
        });
    }
    line.css({
        userSelect : 'none',
        webkitUserSelect : 'none'
    });

    button.css({
        cursor : 'move'
    });


    button.bind('mousedown',function(e){
        options.setJob( JOB['MOVE'], e.clientX, e.clientY );
    });


    return{
        addResizeEvent : function( f ){
            resizeEvent = f;
        },
        getButton : function(){
            return button;
        }
    }
}
RotationButton = function(options){
    var button = $("<div class='rotationButton'></div>");

    var axisYNorth = $("<div class='rotationButton'></div>");
    var axisYSouth = $("<div class='rotationButton'></div>");
    var axisXWest = $("<div class='rotationButton'></div>");
    var axisXEast = $("<div class='rotationButton'></div>");

    var length = 20;
    var slice = 10;
    var gap = options.gap;


    button.css({
        position : 'absolute',
        margin : '0px',
        padding : '0px',
        border : '#0000ff'
    });
    //
    var axisXWest = Cylinder(options, 0, slice, length);
    var axisXEast = Cylinder(options, 0, slice, length);
    var axisYNorth = Cylinder(options, 1, slice, length);
    var axisYSouth = Cylinder(options, 1, slice, length);

    button.append( axisXWest.getCylinder() );
    button.append( axisXEast.getCylinder() );
    button.append( axisYNorth.getCylinder() );
    button.append( axisYSouth.getCylinder() );

    axisXWest.getCylinder().css({
        left : -(length/2+gap*5),
        webkitTransform: 'rotateY(90deg)'
    });
    axisXEast.getCylinder().css({
        webkitTransform: 'rotateY(90deg)'
    });

    axisYNorth.getCylinder().css({
        top : -(length/2+gap*2),
        webkitTransform: 'rotateX(90deg)'
    });
    axisYSouth.getCylinder().css({
        webkitTransform: 'rotateX(90deg)'
    });



    return{
        addRotationEvent : function( f ){
            resizeEvent = f;
        },
        getButton : function(){
            return button;
        },
        refresh : function(width, height){
            var ratio = 0.3
            axisXWest.refresh((height/2+gap)*ratio);
            axisXWest.getCylinder().css({
                top : height/2+gap
            });

            axisXEast.refresh((height/2+gap)*ratio);
            axisXEast.getCylinder().css({
                top : height/2+gap,
                left : width+gap*5+length/2+gap*2
            });

            axisYNorth.refresh((width/2+gap)*ratio);
            axisYNorth.getCylinder().css({
                left : width/2+gap
            });

            axisYSouth.refresh((width/2+gap)*ratio);
            axisYSouth.getCylinder().css({
                top : height+gap*2+length/2+gap*2,
                left : width/2+gap
            });
        }
    }
}

Cylinder = function(options, axis, facets, length ){
    var cylinder = $("<div class='cylinder'></div>");
    var panel = [];
    //var color = 'linear-gradient(to bottom, #feffe8 0%,#d6dbbf 100%)';
    var color = 'rgba(255,255,255,1)';

    cylinder.css({
        position : 'absolute',
        border : '1px solid #ff0000',
        webkitTransformStyle: 'preserve-3d'
    })

    for(var i = 0 ; i < facets ; ++i) {
        panel[i] = $("<canvas id='resize_button2'></canvas>");
        cylinder.append(panel[i]);
        panel[i].bind('mousedown',function(e){
            if( axis == 0 ){
                options.setJob(JOB['ROTATE_X'], e.clientX, e.clientY );
            }else{
                options.setJob(JOB['ROTATE_Y'], e.clientX, e.clientY );
            }
        });
    }

    function epsilon( value ) {
        return Math.abs( value ) < 0.000001 ? 0 : value;
    };

    return {
        getCylinder : function(){
            return cylinder;
        },
        refresh : function( radius ){

            var thick = 2;


            var degree = 360 / facets,
                radian = degree * Math.PI / 180,
                distance = radius * Math.cos(radian/2),
                w = 2 * radius * Math.sin(radian/2 ),
                h = length;


            for(var i = 0 ; i < facets ; ++i) {
                var x = epsilon( distance * Math.cos(radian * i) );
                var y = epsilon( distance * Math.sin(radian * i) );

                var context = panel[i][0].getContext("2d");
                panel[i][0].width = w+1;
                panel[i][0].height = h;

                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(w+1, 0);
                context.moveTo(0, h);
                context.lineTo(w+1, h);
                context.lineWidth = thick;
                //context.rect(0,0,w,h);
                context.stroke();


                panel[i].css({
                    position : 'absolute',
                    display : 'inline-block',
                    width : w+1,
                    height : h,
                    margin : 0,
                    padding : 0,
                    webkitTransform : 'translate3d('+(x-w/2)+'px,'+(y-length/2)+'px,0px) rotateX( 90deg ) rotateY('+(degree*i+90)+'deg)',
                    background : color,
                    cursor : 'crosshair'
                })
            }
        }
    };
}

var JOB = {'MOVE':0, 'ROTATE_X':1, 'ROTATE_Y':2, 'ROTATE_Z':3
    ,'RESIZE_N':4, 'RESIZE_S':5, 'RESIZE_W':6, 'RESIZE_E':7
    ,'RESIZE_NW':8, 'RESIZE_NE':9, 'RESIZE_SW':10, 'RESIZE_SE':11}