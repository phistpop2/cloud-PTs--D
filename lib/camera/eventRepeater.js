/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 5
 * Time: 오후 7:34
 * To change this template use File | Settings | File Templates.
 */

eventRepater = function(){
    var mReciever;
    var mSender;
    var mController;
    var baseX, baseY;

    return{
        attahcReciever: function( reciever ){
            mReciever = reciever;
            mController = reciever.controller;
        },
        attachSender: function( sender ){
            mSender = sender;
            sender.on('mousedown', function(e){
                sender.focus()
                if(e.shiftKey )
                    mController.lookFacade();
                else
                    mController.showFacade();
                baseX = e.clientX;
                baseY = e.clientY;
                sender.on('mousemove', mousemove );
                console.debug( 'basket down' );
            });
            sender.on('mouseup', function(e){
                sender.off( 'mousemove', mousemove );
            });
            sender.on('keydown', function(e){
                console.debug( 'basket keydown' );
                switch(e.keyCode){
                    case 87:    //up(w)
                        mController.moveFor();
                        break;
                    case 83:    //down(s)
                       mController.moveBack();
                        break;
                    case 65:    //left(a)
                        mController.moveLeft();

                        break;
                    case 68:    //right(d)
                        mController.moveRight();
                        break;
                }
                mReciever.transform();
                e.stopPropagation();
            });
            function mousemove(e){
                console.debug('basket mousemove');
                if(e.shiftKey){
                    mController.rotateZ(3);
                }else{
                    mController.rotateX( e.clientX-baseX );
                    mController.rotateY( e.clientY-baseY );
                }
                baseX = e.clientX;
                baseY = e.clientY;
                e.stopPropagation();
            }
        }
    }

}
