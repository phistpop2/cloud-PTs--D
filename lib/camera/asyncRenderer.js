/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 5
 * Time: 오전 2:56
 * To change this template use File | Settings | File Templates.
 */

asyncRenderer = function(){
    console.log( 'hi~ asynchronous :)' );
    var worker = new Worker( '/lib/camera/RenderFPS.js' );
    var world = $("#world");
    var viewPort = $("#viewPort");
    var mCamera = camera();
    var mListener = groundListener();

    mListener.attachReceiver( mCamera );
    mListener.attachSender( viewPort );

    //asynchronous message event
    worker.onmessage = function(e){
        //refresh or redraw
        if( mCamera.isTransformed() ){
            console.debug( 'transform! :D');
            world.css({
                webkitTransform: 'matrix3d('+mCamera.getMatrixQuery()+')'
            });
        }
    }

    return{
        run: function(){
            worker.postMessage();
        },
        setSpeed: function( s ){
            speed = s;
        }

    };
}