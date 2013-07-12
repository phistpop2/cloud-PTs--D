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

    function initilize(){
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
    initilize();


    return {
        getMatrixQuery: function(){
            //may be position
            transformed = false;
            quaternMatrix4.t0 = epsilon( eye.getX() );
            quaternMatrix4.t1 = epsilon( -eye.getY() );
            quaternMatrix4.t2 = epsilon( eye.getZ() );
            quaternMatrix4.t3 = 1.0;

            return matrixToQuery( quaternMatrix4 );
        },
        lookFacade: function(q){
            mQuaternion = q;
        },
        zoomFacade: function(vec){
            eye = vec;
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
        setPosition: function(dx, dy, dz){
            var dm = vector3( -dx, -dy, -dz);
            eye = eye.add( eye, dm );
            transformed = true;
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
        }
    }
}
