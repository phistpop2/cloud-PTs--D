var CameraModule = function(options)
{
    var navi = WorldNavi();
    if(!options)
        options = {};

    var viewPort = options.viewPort ? options.viewPort : $('#viewPort');
    var world = $("<div id='world'></div>");
    viewPort.append(world);

    var width = world.css('width');
    var height = world.css('height');

    this.mCamera = new Camera();
    this.navi = navi;
    this.mCamera.setNavi( this.navi );

    var worker = new Worker('/lib/camera/RenderFPS.js');
    worker.postMessage();
    var this_ = this;


    worker.onmessage = function()
    {

        if( this_.mCamera.isTransformed() ){
            world.css({
                webkitTransform: 'matrix3d('+this_.mCamera.getMatrixQuery()+')'
            });
            navi.getVirtualWorld().css({
                webkitTransform: 'matrix3d('+this_.mCamera.getRotateQuery()+')'
            });
        }
    }
    navi.getNavi().on( 'click', function(e){
       console.debug( 'go center~');
       this_.mCamera.setCenterPosition(100);
        navi.getVirtualWorld().css({
            webkitTransform: 'matrix3d('+this_.mCamera.getRotateQuery()+')'
        });
    });

}


CameraModule.prototype.getCamera = function()
{
    return this.mCamera;
}
CameraModule.prototype.resize = function()
{
   this.navi.resize();
}

WorldNavi = function(){
    var hider = $('<div>').addClass('navigation');
    var navi = $('<div>').addClass('navigation');

    var w = 70;
    var h = 70;
    var cw = w*1;
    var ch = h*1;


    hider.css({
        position : 'absolute',
        top : $('#workSpace').height() - h-5,
        width : w+2,
        height : h+2,
        marginLeft : 3,
        overflow : 'hidden'
    });

    navi.css({
        position : 'absolute',
        width : w,
        height : h,
        border : '1px solid #ffffff',
        webkitBorderRadius : 10,
        background :'rgba( 255,255,255, 0.1 )'
    })



    var virtualWorld = $('<div>').addClass('world');
    virtualWorld.css({
        position : 'absolute',
        top : h/2,
        left : w/2,
        webkitTransformStyle: 'preserve-3d'
    })



    var axisXY = $("<canvas id='axis'></canvas>");
    var axisZ = $("<canvas id='axis'></canvas>");

    var contextXY = axisXY[0].getContext("2d");
    var contextZ = axisZ[0].getContext("2d");
    var thick = 2;

    axisXY[0].width = cw;
    axisXY[0].height = ch;

    //y
    contextXY.beginPath();
    contextXY.moveTo(cw/2,0);
    contextXY.lineTo(cw/2,ch);
    contextXY.strokeStyle = '#00ff00';
    contextXY.stroke();


    //x
    contextXY.beginPath();
    contextXY.moveTo(0,ch/2);
    contextXY.lineTo(cw,ch/2);
    contextXY.lineWidth = thick;
    contextXY.strokeStyle = '#ff0000';
    contextXY.stroke();

    axisZ[0].width = cw;
    axisZ[0].height = ch;
    //z
    contextZ.beginPath();
    contextZ.moveTo(0,ch/2);
    contextZ.lineTo(cw,ch/2);
    contextZ.lineWidth = thick;
    contextZ.strokeStyle = '#0000ff';
    contextZ.stroke();

    axisXY.css({
        position : 'absolute',
        top : -ch/2,
        left : -cw/2
    });
    axisZ.css({
        position : 'absolute',
        webkitTransform : 'translateX('+(-ch/2)+'px) translateY('+(-ch/2)+'px) rotateY(90deg)'
    });



    $('#workSpace').append( hider );
    hider.append( navi );
    navi.append( virtualWorld );
    virtualWorld.append( axisZ );
    virtualWorld.append( axisXY );






    return{
        getNavi : function(){
            return navi;
        },
        getVirtualWorld : function(){
            return virtualWorld;
        },
        resize : function(){
            hider.css({
                top : $('#workSpace').height() - h-5
            });
        },
        refresh : function( m ){
            virtualWorld.css({
                webkitTransform: 'matrix3d('+m+')'
            });
        }


    }
}

