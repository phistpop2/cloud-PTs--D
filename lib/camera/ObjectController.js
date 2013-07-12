/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 5
 * Time: 오후 7:33
 * To change this template use File | Settings | File Templates.
 */

/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 3
 * Time: 오후 11:20
 * To change this template use File | Settings | File Templates.
 */

ObjectController = function(camera){
    var angle = angle3(0, 0, 0);
    var eye = vector3(0, 0, 1);
    var parent = camera;
    var mQuaternion = quaternion(0, 0, 0, 1);
    var quaternMatrix4 = {};
    var transformed = false;
    var speed = 3;


    function initilize(){
        quaternMatrix4 = mQuaternion.getMatrix();
    }
    function matrixToQuery(m){
        return    m.x0 +',' + m.x1 +','+ m.x2 +','+ m.x3 +','
            + m.y0 +',' + m.y1 +','+ m.y2 +','+ m.y3 +','
            + m.z0 +',' + m.z1 +','+ m.z2 +','+ m.z3 +','
            + m.t0 +',' + m.t1 +','+ m.t2 +','+ m.t3
    }
    function getRotateVector( base ){
        var vn = vector3( base.getX(), base.getY(), base.getZ()).normalize();
        if( vn.length() === 0 )
            return vn;

        var q = parent.getQuaternion();
        var quatern = quaternion(q.getX(), q.getY(), q.getZ(), q.getW() );

        var vecQuat = quaternion( vn.getX(), vn.getY(), vn.getZ(), 0.0 );
        var resQuat = quaternion().cross( vecQuat, quatern.getConjugate() );
        var endQuat = quaternion().cross( quatern, resQuat );

        return vector3( endQuat.getX(), -endQuat.getY(), endQuat.getZ() );
    }
    function getInverseVector( base ){
        var vn = vector3( base.getX(), base.getY(), base.getZ()).normalize();
        if( vn.length() === 0 )
            return vn;

        var q = parent.getQuaternion().getInverse();
        var quatern = quaternion(q.getX(), q.getY(), q.getZ(), q.getW() );

        var vecQuat = quaternion( vn.getX(), vn.getY(), vn.getZ(), 0.0 );
        var resQuat = quaternion().cross( vecQuat, quatern.getConjugate() );
        var endQuat = quaternion().cross( quatern, resQuat );

        return vector3( endQuat.getX(), -endQuat.getY(), endQuat.getZ() );

    }

    initilize();

    return {
        getMatrixQuery: function(){
            //may be position
            transformed = false;
            quaternMatrix4.t0 = eye.getX();
            quaternMatrix4.t1 = -eye.getY();
            quaternMatrix4.t2 = eye.getZ();
            quaternMatrix4.t3 = 1.0;

            return matrixToQuery( quaternMatrix4 );

        },
        showFacade: function(){
            mQuaternion = parent.getQuaternion().getInverse();
            quaternMatrix4 = mQuaternion.getMatrix();
        },
        getFacadeAngle: function(){
            return parent.getQuaternion().getInverse().getEuler3();
        },
        getFacadePosition: function(w, h){
            var revisedX = getRotateVector( vector3(1, 0, 0) );
            var revisedY = getRotateVector( vector3(0, -1, 0) );
            var revisedZ = getRotateVector( vector3(0, 0, 1) );

            revisedX.scalar( parseInt($('#workSpace').css('width'))/2 - parent.getLocation().getX()  );
            revisedY.scalar( -parseInt($('#workSpace').css('height'))/2 - parent.getLocation().getY() );
            revisedZ.scalar( -parent.getLocation().getZ() );

            return eye.sum( revisedX ).sum( revisedY ).sum( revisedZ );
        },
        lookFacade: function(){
            parent.setQuaternion( mQuaternion.getInverse() );
        },
        zoomFacade: function(width,height){
            var dx = getInverseVector( vector3( 1, 0, 0 ) ).scalar( -eye.getX()-width/2 );
            var dy = getInverseVector( vector3( 0, -1, 0 ) ).scalar( -eye.getY()+height/2 );
            var dz = getInverseVector( vector3( 0, 0, 1 ) ).scalar( -eye.getZ() );

            var bias = vector3( (parseInt($('#workSpace').css('width') ) ) /2, -(parseInt($('#workSpace').css('height')))/2, 0 );

            parent.zoomFacade( dx.sum(dy).sum(dz).sum( bias ) );
        },

        //translation
        translateX : function(val){
            var revisedVector = getRotateVector( vector3(1, 0, 0) );
            revisedVector.scalar(val);
            eye = vector3().add( eye, revisedVector );


        },
        translateY : function(val){
            var revisedVector = getRotateVector( vector3(0, -1, 0) );
            revisedVector.scalar(val);
            eye = vector3().add( eye, revisedVector );
        },
        translateZ : function(val){
            var revisedVector = getRotateVector( vector3(0, 0, 1) );
            revisedVector.scalar(val);
            eye = vector3().add( eye, revisedVector );
        },
        getPosition: function( dx, dy ){
            var revisedX = getRotateVector( vector3(1, 0, 0) );
            var revisedY = getRotateVector( vector3(0, 1, 0) );

            var rdx = getInverseVector( vector3( 1, 0, 0 ) ).scalar( -eye.getX()-200/2 );
            var rdy = getInverseVector( vector3( 0, -1, 0 ) ).scalar( -eye.getY()+100/2 );
            var rdz = getInverseVector( vector3( 0, 0, 1 ) ).scalar( -eye.getZ() );

            rdx.sum(rdy).sum(rdz);
            var p = parseInt( $('#workSpace').css('-webkit-perspective') );
            var bias = Math.abs( p + rdx.getZ()-parent.getLocation().getZ() )/p;

            return vector3().add( eye, vector3().add( revisedX.scalar(dx*bias), revisedY.scalar(dy*bias), 0 ) );
        },
        getDepth: function( dz ){
            var revisedVector = getRotateVector( vector3(0, 0, 1) );
            return vector3().add(eye, revisedVector.scalar(dz));
        },
        setPosition: function( x, y, z){
            eye.setX( x );
            eye.setY( y );
            eye.setZ( z );
        },
        getLocation: function(){
            return eye;
        },


        //rotation
        rotateX: function( dx ){
            var xq = quaternion().fromAxisAngle( vector3(1, 0, 0), dx );
            mQuaternion = mQuaternion.crossBy( xq );
            quaternMatrix4 = mQuaternion.getMatrix();
        },
        rotateY: function( dy ){
            var yq = quaternion().fromAxisAngle( vector3(0, 1, 0), dy );
            mQuaternion = yq.crossBy( mQuaternion );
            quaternMatrix4 = mQuaternion.getMatrix();
        },
        rotateZ: function( dz ){
            var zq = quaternion().fromAxisAngle( vector3(0, 0, 1), dz );
            mQuaternion = zq.crossBy( mQuaternion );
            quaternMatrix4 = mQuaternion.getMatrix();
        },
        getRotation: function(dx, dy, dz){
            if(!dz)
            {
                dz = 0;
            }
            var rotation = angle3( dy, -dx, -dz );
            return angle3().add( angle, rotation);
        },
        setRotation: function(x, y, z ){
            var xq = quaternion().fromAxisAngle( vector3(1, 0, 0), x );
            var yq = quaternion().fromAxisAngle( vector3(0, 1, 0), y );
            var zq = quaternion().fromAxisAngle( vector3(0, 0, 1), z );
            angle.set( x, y, z );

            mQuaternion = xq;
            mQuaternion = yq.crossBy( mQuaternion );
            mQuaternion = zq.crossBy( mQuaternion );

            quaternMatrix4 = mQuaternion.getMatrix();

        }

    }
}

