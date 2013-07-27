/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 3
 * Time: 오후 11:20
 * To change this template use File | Settings | File Templates.
 */

Camera = function(){
    var eye = vector3(0, 0, 0);
    var mQuaternion = null;
    var speed = 3;
    var transformed = false;
    var angle = angle3(0,0,0);
    var quaternMatrix4 = {};

    function initialize(){
        mQuaternion = quaternion().quaternionFromAxisAngle( vector3(1, 0, 0), 0 );
        quaternMatrix4 = mQuaternion.getMatrix();
    }

    function epsilon( value ) {
        return Math.abs( value ) < 0.000001 ? 0 : value;
    }


    function matrixToQuery(m){
        return    m.x0 +',' + m.x1 +','+ m.x2 +','+ m.x3 +','
            + m.y0 +',' + m.y1 +','+ m.y2 +','+ m.y3 +','
            + m.z0 +',' + m.z1 +','+ m.z2 +','+ m.z3 +','
            + m.t0 +',' + m.t1 +','+ m.t2 +','+ m.t3
    }
    initialize();


    return {
        getRevisedMatrixQuery : function( left, top, mq ){
           var mqParams = mq.split(',');


            mqParams[12]=parseFloat(mqParams[12])+left;
            mqParams[13]=parseFloat(mqParams[13])+top;


            var query = '';
            for( var i = 0; i < mqParams.length; i++){
                query  = query + mqParams[i] + ',';
            }

            query = query.slice(0,query.length-1)

            return query;
        },

        getMatrixQuery: function(){
            //may be position
            transformed = false;
            quaternMatrix4.t0 = epsilon( eye.getX() );
            quaternMatrix4.t1 = epsilon( -eye.getY() );
            quaternMatrix4.t2 = epsilon( eye.getZ() );
            quaternMatrix4.t3 = 1.0;

            return matrixToQuery( quaternMatrix4 );
        },
        getRotateQuery: function(){
            quaternMatrix4.t0 = 0;
            quaternMatrix4.t1 = 0;
            quaternMatrix4.t2 = 0;
            quaternMatrix4.t3 = 1.0;
            return matrixToQuery( quaternMatrix4 );
        },
        lookFacade: function(q){
            mQuaternion = q;
            quaternMatrix4 = mQuaternion.getMatrix();
        },
        zoomFacade: function(vec, _time){
            var time = _time? _time : 400
            eye = vec;

            var world = $('#world');
            world.one( 'webkitTransitionEnd', function(e){
                $('#world').css({
                    transition: 'none'
                });
            });
            world.css({
                webkitTransform: 'matrix3d('+this.getMatrixQuery()+')',
                transition: 'all '+time+'ms ease-in-out'
            });
        },
        zoomResizeFacade: function(vec, _time){

            var time = _time? _time : 0
            eye = vec;

            var world = $('#world');
            world.one( 'webkitTransitionEnd', function(e){
                $('#world').css({
                    transition: 'none'
                });
            });
            if( time ){
                world.css({
                    webkitTransform: 'matrix3d('+this.getMatrixQuery()+')',
                    transition: 'all '+time+'ms ease-in-out'
                });
            }else{
                world.css({
                    webkitTransform: 'matrix3d('+this.getMatrixQuery()+')'
                });

            }
        },
        zoomOut: function(q, vec, _time){
            var time = _time? _time : 0
            eye = vec;
            mQuaternion = q;
            quaternMatrix4 = mQuaternion.getMatrix();

            var world = $('#world');
            world.one( 'webkitTransitionEnd', function(e){
                $('#world').css({
                    transition: 'none'
                });
            });
            if( time ){
                world.css({
                    webkitTransform: 'matrix3d('+this.getMatrixQuery()+')',
                    transition: 'all '+time+'ms ease-in-out'
                });
            }else{
                world.css({
                    webkitTransform: 'matrix3d('+this.getMatrixQuery()+')'
                });

            }
        },
        shot: function(){
            console.debug( 'shot', eye.getZ() );
            eye.setZ( eye.getZ()-1 );
            $('#world').css( {
                webkitTransform: 'matrix3d('+this.getMatrixQuery()+')'
            });
            eye.setZ( eye.getZ()+1 );
            transformed = true;
        },
        //move camera
        moveUp: function(){
            eye.setY( eye.getY() + speed );
            transformed = true;
        },
        moveDown: function(){
            eye.setY( eye.getY() - speed );
            transformed = true;
        },
        moveRight: function(){
            eye.setX( eye.getX() + speed );
            transformed = true;
        },
        moveLeft: function(){
            eye.setX( eye.getX() - speed );
            transformed = true;
        },
        moveFor: function(){
            eye.setZ( eye.getZ() - speed );
            transformed = true;
        },
        moveBack: function(){
            eye.setZ( eye.getZ() + speed );
            transformed = true;
        },
        setCenterPosition : function( v ){
            var w = $('#workSpace').width();
            var h = $('#workSpace').height();
            initialize();
            eye.set( w/2, -h/2, 0 );
            if( v ){
                $('#world').css({
                    webkitTransform: 'matrix3d('+this.getMatrixQuery()+')',
                    transition: 'all '+v+'ms ease-in-out'
                });
                $('#world').one( 'webkitTransitionEnd', function(e){
                    $('#world').css({
                        transition: 'none'
                    });
                });
            }else{
                $('#world').css({
                    webkitTransform: 'matrix3d('+this.getMatrixQuery()+')'
                });
            }
        },
        translateX : function( v ){
            console.debug( 'translateX camera', v)
            eye.setX( eye.getX() + v );
            transformed = true;
        },
        translateY : function( v ){
            eye.setY( eye.getY() + v );
            transformed = true;
        },
        setPosition: function(dx, dy, dz){
            var dm = vector3( -dx, -dy, -dz);
            eye = eye.add( eye, dm );
            transformed = true;
            console.debug( eye.getZ(),  $('#workSpace').css('-webkit-perspective')  )
        },
        zoom: function(dx, dy, dz){
            var dm = vector3( -dx, -dy, -dz);
            eye = eye.add( eye, dm );
        },

        //rotate camera
        rotateX: function( dx ){
            var xq = quaternion().fromAxisAngle( vector3(1, 0, 0), dx );
            mQuaternion = mQuaternion.crossBy( xq );
            quaternMatrix4 = mQuaternion.getMatrix();
            transformed = true;
        },
        rotateY: function( dy ){
            var yq = quaternion().fromAxisAngle( vector3(0, 1, 0), dy );
            mQuaternion = yq.crossBy( mQuaternion );
            quaternMatrix4 = mQuaternion.getMatrix();
            transformed = true;
        },
        rotateZ: function( dz ){
            var zq = quaternion().fromAxisAngle( vector3(0, 0, 1), dz );
            mQuaternion = zq.crossBy( mQuaternion );
            quaternMatrix4 = mQuaternion.getMatrix();
            transformed = true;
        },

        //etc
        getQuaternion: function(){
            return mQuaternion;
        },
        getQuaternionObject : function(){
            var result = {};

            result.x = mQuaternion.getX();
            result.y = mQuaternion.getY();
            result.z = mQuaternion.getZ();
            result.w = mQuaternion.getW();

            return result;
        },

        setQuaternionObject : function(param){
            mQuaternion.setX(param.x);
            mQuaternion.setY(param.y);
            mQuaternion.setZ(param.z);
            mQuaternion.setW(param.w);
        },

        getZoomObject : function()
        {
            var result = {};

            result.x = eye.getX();
            result.y = eye.getY();
            result.z = eye.getZ();

            return result;
        },


        setQuaternion: function( q ){
            mQuaternion = q;
            quaternMatrix4 = mQuaternion.getMatrix();
            transformed = true;
        },
        getLocation: function(){
            return eye;
        },
        setSpeed: function(s){
            speed = s;
        },
        isTransformed: function(){
            return transformed;
        },
        getFov : function(){
            //return degree
            console.debug( Math.atan( 0.5/600*(parseInt($('#workSpace').css('height')))) *180 /Math.PI*2 );
            var height = parseInt($('#workSpace').css('height'));
            var perspective = parseInt( $('#workSpace').css('-webkit-perspective') );
            console.debug( height, perspective );
            var fov = Math.atan( (height*0.5)/perspective ) *180 /Math.PI*2;
            var radian = (fov*0.5)/180*Math.PI;
            var height = parseInt($('#workSpace').css('height'));
            var perspective = (height*0.5)/Math.tan(radian);

            console.debug( 'pers##', perspective );

            return fov;
        },
        setFov : function( fov ){    //degree
            var radian = (fov*0.5)/180*Math.PI;
            var height = parseInt($('#workSpace').css('height'));
            var perspective = (height*0.5)/Math.tan(radian);
            console.debug( 'newP', fov, radian, height, perspective )
            $('#workSpace').css({
                webkitPerspective : perspective
            });
        }
    }
}
