/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 5
 * Time: 오전 3:14
 * To change this template use File | Settings | File Templates.
 */
(function RenderFPS(){

    var i = 5;
    var self = this;
    self.addEventListener( 'message', function(e){
        chainning();
    });

    function chainning(){

            setTimeout( chainning, 1000/1000 );
        self.postMessage( 'down chain' );
    }
})();
