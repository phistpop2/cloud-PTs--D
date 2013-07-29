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

                //...
                this.prevX = 0;
                this.prevY = 0;
                this.moving = 0;
                this.shifting = false;

                if(this.options.viewType)
                {
                    this.viewType = this.options.viewType;
                }
            },

            events : {
                "mousedown" : "objectSelect",
                "mouseup" : "saveSelectRange",
                "mousemove" : "objectMove"
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
                    if(!e.shiftKey && model_.isSelected())
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

            objectSelect : function(e)
            {

                if(e.ctrlKey)
                {
                    this.model.addSelectedToCollection(this.model);
                    e.stopPropagation();
                }else if(e.shiftKey){
                    this.shifting = true;
                }
                else
                {
                    this.model.setSelected();
                    e.stopPropagation();
                }
            },
            objectMove : function(e)
            {
                if( this.moving < 1 ){
                    this.moving++;
                    e.stopPropagation();
                }else{
                    this.shifting = false;
                }
            },
            saveSelectRange : function(e)
            {
                window.saveSelectRange();
                if( this.shifting ){
                    this.model.controller.lookFacade();
                    this.model.controller.zoomFacade(parseInt(this.model.get('width')),parseInt(this.model.get('height')));
                    this.shifting = false;
                }
            },

            render : function()
            {

                $(this.world).append($(this.el));
                $(this.el).append('<div class=objectWrap></div>');

                if(this.viewType == 'workspace')
                {
                    this.eventBind();
//                    this.initPosition();

                    this.controlBox = this.model.controller.genControlBox( this.model );
                    $(this.el).append( this.controlBox.getBox() );
                    this.cameraModule.getCamera().shot();

                    this.model.setSelected();
                }
                else
                {
                    this.updateView();
                }

                return this;
            },

            initPosition: function(){
                var w = parseInt( this.model.get('width') );
                var h = parseInt( this.model.get('height') );


                var angle = this.model.controller.getFacadeAngle();
                var pos = this.model.controller.setFacadePosition( parseInt( $('#workSpace').width() )/2, -parseInt( $('#workSpace').height())/2, w, h );

                this.model.attributes.rotateX=  angle.getX();
                this.model.attributes.rotateY=  angle.getY();
                this.model.attributes.rotateZ=  angle.getZ();

                this.model.attributes.translateX=  pos.getX();
                this.model.attributes.translateY=  pos.getY();
                this.model.attributes.translateZ=  pos.getZ();





                if(this.model.get('copyData'))
                {
                    this.model.controller.setRotation(this.model.attributes.rotateX,this.model.attributes.rotateY,this.model.attributes.rotateZ);
                    this.model.controller.setPosition(this.model.attributes.translateX,this.model.attributes.translateY,this.model.attributes.translateZ);

                    var angle = this.model.controller.rotateBias(quaternion(this.model.attributes.rotateXBias, this.model.attributes.rotateYBias, this.model.attributes.rotateZBias, this.model.attributes.rotateWBias));
                    var pos = this.model.controller.translateBias( this.model.attributes.translateXBias, this.model.attributes.translateYBias, this.model.attributes.translateZBias );

                    this.model.attributes.rotateX = angle.getX();
                    this.model.attributes.rotateY = angle.getY();
                    this.model.attributes.rotateZ = angle.getZ();
                    this.model.attributes.translateX =  pos.getX();
                    this.model.attributes.translateY =  pos.getY();
                    this.model.attributes.translateZ =  pos.getZ();

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

                var width = parseInt(this.model.get('width'));
                var height = parseInt(this.model.get('height'));
                var matrix3d = 0;

                if(this.viewType=='workspace')
                {
                    this.model.controller.setRotation(this.model.get('rotateX'),this.model.get('rotateY'),this.model.get('rotateZ'))
                    this.model.controller.setPosition(this.model.get('translateX'),this.model.get('translateY'),this.model.get('translateZ'));


                    matrix3d = this.model.controller.getMatrixQuery();
                    this.model.attributes.matrix3d = matrix3d;

                    if( this.controlBox && !this.model.get('selected') ){
                        this.controlBox.disable();
                    }else if(this.model.get('selected')){

                        var borderWidth = parseInt(this.model.get('borderWidth'));
                        var borderStyle = this.model.get('borderStyle');

                        if(borderStyle && borderStyle!='none')
                        {

                            this.controlBox.refresh(borderWidth*2);
                        }
                        else

                        {
                            this.controlBox.refresh();
                        }
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
                this.cssRenderer();




            }
        });

        return ObjectView;


    });


ControlBox = function( target ){
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
    var originQuatern = quaternion(0,0,0,0);
    var originVector = vector3(0,0,0);
    var currRotationX = 0;
    var currRotationY = 0;
    var xReverse = false;
    var yReverse = false;
    var currAngle = vector3(0,0,0);



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
        currRotationX = originRotationX;
        currRotationY = originRotationY;
        currAngle = target.controller.getAngle().clone();

        xReverse = false;
        yReverse = false;



        console.debug( 'job', job, prevX, prevY)
        if( job > 3 ){
            originQuatern = target.controller.lookFacade();
            originVector = target.controller.getParent().getLocation().clone();
            target.controller.zoomResizeFacade( width, height, x, y, gap, job-4, transTime );
        }
        var values = new Array();
        var modify = {
            'caster' : target.cid,
            'job': job,
            'setting' : true,
            'value' : values
        };
        values.push( prevX );
        values.push( prevY );
        target.notifyModify( modify );
        /*
         switch( _job ){
         case JOB['RESIZE_N']:
         target.controller.zoomResizeFacade( width, height, x, y, gap, 0, transTime );
         break;
         case JOB['RESIZE_S']:
         target.controller.zoomResizeFacade( width, height, x, y, gap, 1, transTime );
         break;
         case JOB['RESIZE_W']:
         target.controller.zoomResizeFacade( width, height, x, y, gap, 2, transTime );
         break;
         case JOB['RESIZE_E']:
         target.controller.zoomResizeFacade( width, height, x, y, gap, 3, transTime );
         break;
         case JOB['RESIZE_NW']:
         target.controller.zoomResizeFacade( width, height, x, y, gap, 4, transTime );
         break;
         case JOB['RESIZE_NE']:
         target.controller.zoomResizeFacade( width, height, x, y, gap, 5, transTime );
         break;
         case JOB['RESIZE_SW']:
         target.controller.zoomResizeFacade( width, height, x, y, gap, 6, transTime );
         break;
         case JOB['RESIZE_SE']:
         target.controller.zoomResizeFacade( width, height, x, y, gap, 7, transTime );
         break;
         }                 */

    }
    function remoteSettingJob( data ){
        job = data.job;
        prevX = data.value[0];
        prevY = data.value[1];
        srcX = data.value[0];
        srcY = data.value[1];
        moveEnable = false;
        originWidth = width;
        originHeight = height;
        originPos = target.controller.getLocation().clone();
        originRotationX = target.get('rotateX');
        originRotationY = target.get('rotateY');
        originAspect = width/height;
        currRotationX = originRotationX;
        currRotationY = originRotationY;
        currAngle = target.controller.getAngle().clone();

        xReverse = false;
        yReverse = false;
    }
    function remoteResize( data ){
        var currX = data.value[0];
        var currY = data.value[1];
        var pos3d = vector3(0,0,0);
        var currW = originWidth;
        var currH = originHeight;
        var newX = currX;
        var newY = currY;
        console.debug( 'remoteResize', data );



        switch( job ){
            case 4: //resize n
                if( originHeight + srcY-currY >= 0  ){
                    reverseX( false );
                    pos3d = target.controller.getResizePosition(originPos, 0,currY-srcY );
                    newX = srcX;
                    newY = currY;
                }else{
                    reverseX( true );
                    pos3d = target.controller.getResizePosition(originPos, 0,originHeight );
                    newX = srcX;
                    newY = srcY+originHeight;
                }
                currH = Math.abs(originHeight + srcY-currY);
                break;
            case 5: //resize s
                if( originHeight + currY-srcY >= 0  ){
                    reverseX( false );
                    pos3d = target.controller.getResizePosition(originPos, 0,0 );
                    newX = srcX;
                    newY = currY;
                }else{
                    reverseX( true );
                    pos3d = target.controller.getResizePosition(originPos, 0, originHeight+currY-srcY );
                    newX = srcX;
                    newY = srcY-originHeight;
                }
                break;
            case 6: //resize w
                if( originWidth + srcX - currX >= 0  ){
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, currX-srcX,0 );
                    newX = currX;
                    newY = srcY;
                }else{
                    reverseY( true );
                    pos3d = target.controller.getResizePosition(originPos, originWidth,0 );
                    newX = srcX+originWidth;
                    newY = srcY;
                }
                break;
            case 7: //resize e
                if( originWidth + currX - srcX >= 0  ){
                    reverseY( false );
                    //pos3d = target.controller.getResizePosition(originPos, 0,0 );
                    newX = currX;
                    newY = srcY;
                }else{
                    reverseY( true );
                    //pos3d = target.controller.getResizePosition(originPos, originWidth+currX-srcX,0 );
                    newX = srcX-originWidth;
                    newY = srcY;
                }
                currW = Math.abs(originWidth + currX - srcX)
                break;
            case 8: //resize nw
                var newW = Math.abs(originWidth + srcX-currX);
                var newH = Math.abs(originHeight + srcY-currY);
                var newX = currX;
                var newY = currY;

                if( originHeight + srcY-currY >= 0 && originWidth + srcX - currX >= 0  ){
                    if( data.shiftKey ){
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
                    reverseX( false );
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, originWidth-newW, originHeight-newH );
                }else if(originWidth + srcX - currX >= 0){
                    newX = currX;
                    newY = srcY+originHeight;

                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            var tempW = newH*originAspect;
                            newX = newX - (tempW-newW);
                            newW = tempW;
                        }else{

                            newH = newW/originAspect;
                        }
                    }
                    reverseX( true );
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, originWidth-newW,originHeight );
                }else if(originHeight + srcY-currY >= 0){
                    newX = srcX+originWidth;
                    newY = currY;

                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            newW = newH*originAspect;
                        }else{

                            var tempH = newW/originAspect;
                            newY = newY - (tempH-newH);
                            newH = tempH;
                        }
                    }
                    reverseX(false);
                    reverseY(true);
                    pos3d = target.controller.getResizePosition(originPos, originWidth, originHeight-newH );
                }else{
                    newX = srcX+originWidth;
                    newY = srcY+originHeight;

                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            newW = newH*originAspect;
                        }else{
                            newH = newW/originAspect;
                        }
                    }
                    reverseX( true );
                    reverseY( true );
                    pos3d = target.controller.getResizePosition(originPos, originWidth,originHeight );
                }
                currW = newW;
                currH = newH;
                break;
            case 9: //resize ne
                if(originHeight + srcY-currY >= 0 && originWidth + currX - srcX >= 0){
                    newW = originWidth + currX-srcX;
                    newH = originHeight + srcY-currY;
                    newX = currX;
                    newY = currY;


                    if( data.shiftKey ){
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
                    reverseX( false );
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, 0,originHeight-newH );
                }else if(originWidth + currX - srcX >= 0){
                    newW = originWidth + currX-srcX;
                    newH = Math.abs(originHeight + srcY-currY);
                    newX = currX;
                    newY = srcY+originHeight;


                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            var tempW = newH*originAspect;
                            newX = newX + (tempW-newW);
                            newW = tempW;
                        }else{
                            newH = newW/originAspect;
                        }
                    }
                    reverseX( true );
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, 0,originHeight );
                }else if(originHeight + srcY-currY >= 0){
                    newW = Math.abs(originWidth + currX - srcX);
                    newH = originHeight + srcY-currY;
                    newX = srcX-originWidth;
                    newY = currY;


                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            newW = newH*originAspect;
                        }else{
                            var tempH = newW/originAspect;
                            newY = newY - (tempH-newH);
                            newH = tempH;
                        }
                    }

                    reverseX( false );
                    reverseY( true );
                    pos3d = target.controller.getResizePosition(originPos, -newW, originHeight-newH  );
                }else{
                    newW = Math.abs(originWidth + currX - srcX);
                    newH = Math.abs(originHeight + srcY-currY);
                    newX = srcX-originWidth;
                    newY = srcY+originHeight;




                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            newW = newH*originAspect;
                        }else{
                            newH = newW/originAspect;
                        }
                    }
                    reverseX( true );
                    reverseY( true );
                    pos3d = target.controller.getResizePosition(originPos, -newW, originHeight );
                }
                currW = newW;
                currH = newH;
                break;
            case 10: //resize sw
                if(originHeight + currY-srcY >= 0 && originWidth + srcX - currX >= 0){
                    newW = originWidth + srcX - currX;
                    newH = originHeight + currY-srcY;
                    newX = currX;
                    newY = currY;


                    if( data.shiftKey ){
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
                    reverseX( false );
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, originWidth-newW, 0 );

                }else if(originWidth + srcX - currX >= 0){
                    newW = originWidth + srcX - currX;
                    newH = Math.abs(originHeight + currY-srcY);
                    newX = currX;
                    newY = srcY-originHeight;


                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            var tempW = newH*originAspect;
                            newX = newX - (tempW-newW);
                            newW = tempW;
                        }else{
                            newH = newW/originAspect;
                        }
                    }
                    reverseX( true );
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, originWidth-newW, -newH);
                }else if(originHeight + currY-srcY >= 0){
                    newW = Math.abs(originWidth + srcX - currX);
                    newH = originHeight + currY-srcY;
                    newX = srcX+originWidth;
                    newY = currY;


                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            newW = newH*originAspect;
                        }else{
                            var tempH = newW/originAspect;
                            newY = newY + (tempH-newH);
                            newH = tempH;
                        }
                    }
                    reverseX( false );
                    reverseY( true );
                    pos3d = target.controller.getResizePosition(originPos, originWidth,0 );
                }else{
                    newW = Math.abs(originWidth + srcX-currX);
                    newH = Math.abs(originHeight + currY-srcY);
                    newX = srcX+originWidth;
                    newY = srcY-originHeight;


                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            newW = newH*originAspect;
                        }else{
                            newH = newW/originAspect;
                        }
                    }
                    reverseX( true );
                    reverseY( true );
                    var pos3d = target.controller.getResizePosition(originPos, originWidth, -newH);
                }
                currW = newW;
                currH = newH;
                break;
            case 11: //resize se
                if( originHeight + currY-srcY >= 0 && originWidth + currX - srcX >= 0 ){
                    newW =  originWidth + currX - srcX;
                    newH = originHeight + currY-srcY;
                    newX = currX;
                    newY = currY;


                    if( data.shiftKey ){
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
                    reverseX( false );
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, 0,0 );
                }else if( originWidth + currX - srcX >= 0 ){
                    newW =  originWidth + currX - srcX;
                    newH = Math.abs(originHeight + currY-srcY);
                    newX = currX;
                    newY = srcY-originHeight;

                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            var tempW = newH*originAspect;
                            newX = newX + (tempW-newW);
                            newW = tempW;
                        }else{
                            newH = newW/originAspect;
                        }
                    }
                    reverseX( true );
                    reverseY( false );
                    pos3d = target.controller.getResizePosition(originPos, 0, -newH );
                }else if( originHeight + currY-srcY >= 0 ){
                    newW = Math.abs(originWidth + currX - srcX);
                    newH =  originHeight + currY-srcY;
                    newX =  srcX-originWidth;
                    newY = currY;

                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            newW = newH*originAspect;
                        }else{
                            var tempH = newW/originAspect;
                            newY = newY + (tempH-newH);
                            newH = tempH;
                        }
                    }
                    reverseX( false );
                    reverseY( true );
                    pos3d = target.controller.getResizePosition(originPos, -newW,0 );
                }else{
                    newW = Math.abs(originWidth + currX - srcX);
                    newH = Math.abs(originHeight + currY-srcY);
                    newX =  srcX-originWidth;
                    newY = srcY-originHeight;

                    if( data.shiftKey ){
                        var aspect = newW/newH;
                        if( originAspect > aspect ){
                            newW = newH*originAspect;
                        }else{
                            newH = newW/originAspect;
                        }
                    }
                    reverseX( true );
                    reverseY( true );
                    var pos3d = target.controller.getResizePosition(originPos, -newW, -newH );
                }
                currW = newW;
                currH = newH;
                break;
        }


        target.set({
            'translateX':pos3d.getX(),
            'translateY':pos3d.getY(),
            'translateZ':pos3d.getZ(),
            width : currW,
            height : currH
        });

        prevX = currX;
        prevY = currY;

    }


    var options = {
        target : target,
        lineWidth : lineWidth,
        gap : gap,
        setJob : setJob,
        moveButtonRange : moveButtonRange
    }


    $('#workSpace').bind('mousemove',function(e){

        if( moveEnable && target.isSelected())
        {

            var currX = e.clientX;
            var currY = e.clientY;

            var scalar1 = currX-prevX;
            var scalar2 = currY-prevY;


            if( job > JOB['ROTATE_Z'] ){
                var pos3d = vector3(0,0,0);
                var currW = originWidth;
                var currH = originHeight;
                var newX = currX;
                var newY = currY;
            }
            var values = new Array();
            var modify = {
                'caster' : target.cid,
                'job': job,
                'value' : values
            };
            switch( job ){
                case 0:   //move
                    if( e.shiftKey )
                        break;
                    var pos3d = target.controller.getPosition(scalar1,scalar2);

                    target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ()}
                    );
                    values.push( scalar1 );
                    values.push( scalar2 );
                    break;
                case 1: //rotateX
                    var rot3d = target.controller.rotateX(prevY-currY);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    values.push( prevY - currY );
                    break;
                case 2: //rotateY
                    var rot3d = target.controller.rotateY(prevX-currX);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    values.push( prevX - currX );
                    break;
                case 3: //rotateZ
                    var rot3d = target.controller.rotateZ(-(prevX-currX+prevY-currY)/2);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    values.push( -(prevX-currX+prevY-currY)/2 );
                    break;
                case 4: //resize n
                    if( originHeight + srcY-currY >= 0  ){
                        reverseX( false );
                        pos3d = target.controller.getResizePosition(originPos, 0,currY-srcY );
                        newX = srcX;
                        newY = currY;
                    }else{
                        reverseX( true );
                        pos3d = target.controller.getResizePosition(originPos, 0,originHeight );
                        newX = srcX;
                        newY = srcY+originHeight;
                    }
                    currH = Math.abs(originHeight + srcY-currY);
                    break;
                case 5: //resize s
                    if( originHeight + currY-srcY >= 0  ){
                        reverseX( false );
                        pos3d = target.controller.getResizePosition(originPos, 0,0 );
                        newX = srcX;
                        newY = currY;
                    }else{
                        reverseX( true );
                        pos3d = target.controller.getResizePosition(originPos, 0, originHeight+currY-srcY );
                        newX = srcX;
                        newY = srcY-originHeight;
                    }
                    currH = Math.abs(originHeight + currY-srcY);
                    break;
                case 6: //resize w
                    if( originWidth + srcX - currX >= 0  ){
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, currX-srcX,0 );
                        newX = currX;
                        newY = srcY;
                    }else{
                        reverseY( true );
                        pos3d = target.controller.getResizePosition(originPos, originWidth,0 );
                        newX = srcX+originWidth;
                        newY = srcY;
                    }
                    currW =  Math.abs(originWidth + srcX - currX);
                    break;
                case 7: //resize e
                    if( originWidth + currX - srcX >= 0  ){
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, 0,0 );
                        newX = currX;
                        newY = srcY;
                    }else{
                        reverseY( true );
                        pos3d = target.controller.getResizePosition(originPos, originWidth+currX-srcX,0 );
                        newX = srcX-originWidth;
                        newY = srcY;
                    }
                    currW = Math.abs(originWidth + currX - srcX)
                    break;
                case 8: //resize nw
                    var newW = Math.abs(originWidth + srcX-currX);
                    var newH = Math.abs(originHeight + srcY-currY);
                    var newX = currX;
                    var newY = currY;

                    if( originHeight + srcY-currY >= 0 && originWidth + srcX - currX >= 0  ){
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
                        reverseX( false );
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, originWidth-newW, originHeight-newH );
                    }else if(originWidth + srcX - currX >= 0){
                        newX = currX;
                        newY = srcY+originHeight;

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
                        reverseX( true );
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, originWidth-newW,originHeight );
                    }else if(originHeight + srcY-currY >= 0){
                        newX = srcX+originWidth;
                        newY = currY;

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
                        reverseX(false);
                        reverseY(true);
                        pos3d = target.controller.getResizePosition(originPos, originWidth, originHeight-newH );
                    }else{
                        newX = srcX+originWidth;
                        newY = srcY+originHeight;

                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        reverseX( true );
                        reverseY( true );
                        pos3d = target.controller.getResizePosition(originPos, originWidth,originHeight );
                    }
                    currW = newW;
                    currH = newH;
                    break;
                case 9: //resize ne
                    if(originHeight + srcY-currY >= 0 && originWidth + currX - srcX >= 0){
                        newW = originWidth + currX-srcX;
                        newH = originHeight + srcY-currY;
                        newX = currX;
                        newY = currY;


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
                        reverseX( false );
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, 0,originHeight-newH );
                    }else if(originWidth + currX - srcX >= 0){
                        newW = originWidth + currX-srcX;
                        newH = Math.abs(originHeight + srcY-currY);
                        newX = currX;
                        newY = srcY+originHeight;


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
                        reverseX( true );
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, 0,originHeight );
                    }else if(originHeight + srcY-currY >= 0){
                        newW = Math.abs(originWidth + currX - srcX);
                        newH = originHeight + srcY-currY;
                        newX = srcX-originWidth;
                        newY = currY;


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

                        reverseX( false );
                        reverseY( true );
                        pos3d = target.controller.getResizePosition(originPos, -newW, originHeight-newH  );
                    }else{
                        newW = Math.abs(originWidth + currX - srcX);
                        newH = Math.abs(originHeight + srcY-currY);
                        newX = srcX-originWidth;
                        newY = srcY+originHeight;




                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        reverseX( true );
                        reverseY( true );
                        pos3d = target.controller.getResizePosition(originPos, -newW, originHeight );
                    }
                    currW = newW;
                    currH = newH;
                    break;
                case 10: //resize sw
                    if(originHeight + currY-srcY >= 0 && originWidth + srcX - currX >= 0){
                        newW = originWidth + srcX - currX;
                        newH = originHeight + currY-srcY;
                        newX = currX;
                        newY = currY;


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
                        reverseX( false );
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, originWidth-newW, 0 );

                    }else if(originWidth + srcX - currX >= 0){
                        newW = originWidth + srcX - currX;
                        newH = Math.abs(originHeight + currY-srcY);
                        newX = currX;
                        newY = srcY-originHeight;


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

                        reverseX( true );
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, originWidth-newW, -newH);
                    }else if(originHeight + currY-srcY >= 0){
                        newW = Math.abs(originWidth + srcX - currX);
                        newH = originHeight + currY-srcY;
                        newX = srcX+originWidth;
                        newY = currY;


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
                        reverseX( false );
                        reverseY( true );
                        pos3d = target.controller.getResizePosition(originPos, originWidth,0 );


                    }else{
                        newW = Math.abs(originWidth + srcX-currX);
                        newH = Math.abs(originHeight + currY-srcY);
                        newX = srcX+originWidth;
                        newY = srcY-originHeight;


                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        reverseX( true );
                        reverseY( true );
                        var pos3d = target.controller.getResizePosition(originPos, originWidth, -newH);
                    }
                    currW = newW;
                    currH = newH;
                    break;
                case 11: //resize se
                    if( originHeight + currY-srcY >= 0 && originWidth + currX - srcX >= 0 ){
                        newW =  originWidth + currX - srcX;
                        newH = originHeight + currY-srcY;
                        newX = currX;
                        newY = currY;


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
                        reverseX( false );
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, 0,0 );
                    }else if( originWidth + currX - srcX >= 0 ){
                        newW =  originWidth + currX - srcX;
                        newH = Math.abs(originHeight + currY-srcY);
                        newX = currX;
                        newY = srcY-originHeight;

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
                        reverseX( true );
                        reverseY( false );
                        pos3d = target.controller.getResizePosition(originPos, 0, -newH );
                    }else if( originHeight + currY-srcY >= 0 ){
                        newW = Math.abs(originWidth + currX - srcX);
                        newH =  originHeight + currY-srcY;
                        newX =  srcX-originWidth;
                        newY = currY;

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
                        reverseX( false );
                        reverseY( true );
                        pos3d = target.controller.getResizePosition(originPos, -newW,0 );

                    }else{
                        newW = Math.abs(originWidth + currX - srcX);
                        newH = Math.abs(originHeight + currY-srcY);
                        newX =  srcX-originWidth;
                        newY = srcY-originHeight;

                        if( e.shiftKey ){
                            var aspect = newW/newH;
                            if( originAspect > aspect ){
                                newW = newH*originAspect;
                            }else{
                                newH = newW/originAspect;
                            }
                        }
                        reverseX( true );
                        reverseY( true );
                        var pos3d = target.controller.getResizePosition(originPos, -newW, -newH );
                    }
                    currW = newW;
                    currH = newH;
                    break;
            }

            if( job > JOB['ROTATE_Z'] ){
                target.set({
                    'translateX':pos3d.getX(),
                    'translateY':pos3d.getY(),
                    'translateZ':pos3d.getZ(),
                    width : currW,
                    height : currH
                });
                target.controller.zoomResizeFacade( currW, currH, newX, newY, gap, job-4 );

                values.push( currX );
                values.push( currY );
                target.notifyModify( modify );
            }else{
                target.notifyModify( modify );
            }
            prevX = currX;
            prevY = currY;
        }
    }).bind('mouseup',function(e){


            if( target.isSelected() )
            {
                target.commitToCollection({
                    'rotateX': target.get('rotateX'),
                    'rotateY': target.get('rotateY'),
                    'rotateZ': target.get('rotateZ'),
                    'translateX': target.get('translateX'),
                    'translateY': target.get('translateY'),
                    'translateZ': target.get('translateZ')
                });
                if( job > 3 && moveEnable ){
                    target.controller.zoomOut( originQuatern, originVector );
                }
            }
            moveEnable = false;
            job = 0;
        });

    function reverseX( curr ){
        if( curr != xReverse ){
        console.debug( 'reverseX')
            xReverse = curr;
            currAngle = target.controller.rotateX( 180 );
            target.set({
                rotateX : currAngle.getX(),
                rotateY : currAngle.getY(),
                rotateZ : currAngle.getZ()
            });
        }
    }
    function reverseY( curr ){
        if( curr != yReverse ){
        console.debug( 'reverseY')
            yReverse = curr;
            currAngle = target.controller.rotateY( 180 );
            target.set({
                rotateX : currAngle.getX(),
                rotateY : currAngle.getY(),
                rotateZ : currAngle.getZ()
            });
        }
    }



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

    function refresh(bias){

        if(!bias)
        {
            bias = 0;
        }

        width = parseInt( target.get( 'width' ))+bias;
        height = parseInt( target.get( 'height' ))+bias;



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
        refresh : function(bias){
            refresh(bias);
        },
        remoteModify : function( data ){
            console.debug( 'remote', data )
            if( data.setting ){
                remoteSettingJob( data );
                return;
            }
            switch( data.job ){
                case 0:   //move
                    var pos3d = target.controller.getPosition(data.value[0], data.value[1]);
                    target.set({
                            'translateX':pos3d.getX(),
                            'translateY':pos3d.getY(),
                            'translateZ':pos3d.getZ()}
                    );
                    break;
                case 1: //rotateX
                    var rot3d = target.controller.rotateX(data.value[0]);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    break;
                case 2: //rotateY
                    var rot3d = target.controller.rotateY(data.value[0]);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    break;
                case 3: //rotateZ
                    var rot3d = target.controller.rotateZ(data.value[0]);
                    target.set({
                        'rotateX':rot3d.getX(),
                        'rotateY':rot3d.getY(),
                        'rotateZ':rot3d.getZ()
                    });
                    break;
                default:
                    remoteResize( data );
                    break;
            }

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
                e.stopPropagation();
            });
            break;
        case 1: //south
            button.css({
                cursor : 's-resize'
            })
            button.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_S'], e.clientX, e.clientY );
                e.stopPropagation();
            });
            break;
        case 2: //west
            button.css({
                cursor : 'w-resize'
            })
            button.bind('mousedown',function(e){
                options.setJob(JOB['RESIZE_W'], e.clientX, e.clientY );
                e.stopPropagation();
            });
            break;
        case 3: //east
            button.css({
                cursor : 'e-resize'
            })
            button.bind('mousedown',function(e){
                console.debug( 'mousedown e')
                options.setJob(JOB['RESIZE_E'], e.clientX, e.clientY );
                e.stopPropagation();
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
        e.stopPropagation();
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
        e.stopPropagation();
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
    var length = 20;
    var slice = 3;
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
    var color = 'rgba(255,255,255,0)';

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
            e.stopPropagation();
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


                panel[i][0].width = w+1;
                panel[i][0].height = h;




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

var JOB = {'SETTING': -1,'MOVE':0, 'ROTATE_X':1, 'ROTATE_Y':2, 'ROTATE_Z':3
    ,'RESIZE_N':4, 'RESIZE_S':5, 'RESIZE_W':6, 'RESIZE_E':7
    ,'RESIZE_NW':8, 'RESIZE_NE':9, 'RESIZE_SW':10, 'RESIZE_SE':11}