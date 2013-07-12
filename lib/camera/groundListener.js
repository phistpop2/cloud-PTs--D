/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 5
 * Time: 오전 3:57
 * To change this template use File | Settings | File Templates.
 */

groundListener = function(){
    var self = this;
    var mCamera = null;
    var mPressed = false;
    var baseX, baseY;

    return{
        attachReceiver: function( camera ){
            mCamera = camera;
        },
        attachSender: function( ground ){
            ground.on( 'mousedown', function(e){
                mPressed = true;
                baseX = e.clientX;
                baseY = e.clientY;
                console.debug( 'mousedown' );
                ground.on('mousemove', mousemove );
            });
            ground.on( 'mouseup', function(e){
                mPressed = false;
                console.debug( 'mouseup' );
                ground.off( 'mousemove', mousemove );
            });
            ground.on( 'mouseleave', function(e){
                ground.off( 'mousemove', mousemove );
                console.debug( 'mouse leave');
            });
            ground.on( 'keydown', function(e){
                console.debug('key', e.keyCode );
                switch( e.keyCode ){
                    case 81:    //forward(q)
                        mCamera.moveFor();
                        break;
                    case 69:    //backword(e)
                        mCamera.moveBack();
                        break;
                    case 87:    //up(w)
                        mCamera.moveUp();
                        break;
                    case 83:    //down(s)
                        mCamera.moveDown();
                        break;
                    case 65:    //left(a)
                        mCamera.moveLeft();
                        break;
                    case 68:    //right(d)
                        mCamera.moveRight();
                        break;
                }
            });
            function mousemove(e){

                console.debug('mousemove');
                if(e.shiftKey){
                    mCamera.rotateZ(3);
                }else{
                    //mCamera.handling(e.clientX-baseX, e.clientY-baseY);
                    mCamera.rotateX( e.clientX-baseX );
                    mCamera.rotateY( e.clientY-baseY );
                }
                baseX = e.clientX;
                baseY = e.clientY;
            }
        }
    }
}
