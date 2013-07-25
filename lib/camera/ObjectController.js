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
    function getRotateVector( base, _q ){
        var vn = vector3( base.getX(), base.getY(), base.getZ()).normalize();
        if( vn.length() === 0 )
            return vn;

        if( _q )
            var q = _q;
        else
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

        getRotateBiasToCurrentWorld : function(){
            var q = parent.getQuaternion().getInverse();
            var angle = q.getEuler3();
            var result = {
                x : angle.getX(),
                y : angle.getY(),
                z : angle.getZ()
            }
            return result;
        },
        getTranslateBiasToCurrentWorld : function(w,h){
            var revisedX = getRotateVector( vector3(1, 0, 0) );
            var revisedY = getRotateVector( vector3(0, -1, 0) );
            var revisedZ = getRotateVector( vector3(0, 0, 1) );

            revisedX.scalar( parseInt($('#workSpace').css('width'))/2 - parent.getLocation().getX()  );
            revisedY.scalar( -parseInt($('#workSpace').css('height'))/2 - parent.getLocation().getY() );
            revisedZ.scalar( -parent.getLocation().getZ() );
            eye.sum( revisedX ).sum( revisedY ).sum( revisedZ );
            return result;
        },



        getFacadeQuery: function(){
            var q = mQuaternion.getInverse();
            quaternMatrix4 = q.getMatrix();


            return matrixToQuery( quaternMatrix4 );
        },
        getFacadeAngle: function(){
            return parent.getQuaternion().getInverse().getEuler3();
        },
        getFacadeQuaternion : function( w, h ){
            var q1 = parent.getQuaternion().getInverse();
            var q2 = mQuaternion.getInverse();
            var qm = quaternion().cross( q1, q2).getMatrix();
            qm.t0 = w;
            qm.t1 = h;
            qm.t2 = 0;
            qm.t3 = 1;


            return matrixToQuery( qm );
        },
        getFacadePosition: function(){
            var revisedX = getRotateVector( vector3(1, 0, 0) );
            var revisedY = getRotateVector( vector3(0, -1, 0) );
            var revisedZ = getRotateVector( vector3(0, 0, 1) );

            revisedX.scalar( parseInt($('#workSpace').css('width'))/2 - parent.getLocation().getX()  );
            revisedY.scalar( -parseInt($('#workSpace').css('height'))/2 - parent.getLocation().getY() );
            revisedZ.scalar( -parent.getLocation().getZ() );
            eye.sum( revisedX ).sum( revisedY ).sum( revisedZ );

            return eye;
        },
        setFacadePosition: function(w,h, x, y){
            var revisedX = getRotateVector( vector3(1, 0, 0) );
            var revisedY = getRotateVector( vector3(0, -1, 0) );
            var revisedZ = getRotateVector( vector3(0, 0, 1) );

            revisedX.scalar( - parent.getLocation().getX() + w/2 +x );
            revisedY.scalar( - parent.getLocation().getY() - h/2 +y);
            revisedZ.scalar( -parent.getLocation().getZ() );
            eye.sum( revisedX ).sum( revisedY ).sum( revisedZ );
            eye.setX( eye.getX() - w/2 );
            eye.setY( eye.getY() + h/2 );

            return eye;
        },
        lookFacade: function(){
            parent.lookFacade( mQuaternion.getInverse() );
        },
        zoomFacade: function(width,height){
            var dx = getInverseVector( vector3( 1, 0, 0 ) ).scalar( -eye.getX()-width/2 );
            var dy = getInverseVector( vector3( 0, -1, 0 ) ).scalar( -eye.getY()+height/2 );
            var dz = getInverseVector( vector3( 0, 0, 1 ) ).scalar( -eye.getZ() );

            var bias = vector3( (parseInt($('#workSpace').css('width') ) ) /2, -(parseInt($('#workSpace').css('height')))/2, 0 );

            parent.zoomFacade( dx.sum(dy).sum(dz).sum( bias ) );
        },
        zoomResizeFacade: function(width,height, srcX, srcY, gap, type, time){
            var dx = getInverseVector( vector3( 1, 0, 0 ) ).scalar( -eye.getX()-width/2 );
            var dy = getInverseVector( vector3( 0, -1, 0 ) ).scalar( -eye.getY()+height/2 );
            var dz = getInverseVector( vector3( 0, 0, 1 ) ).scalar( -eye.getZ() );

            var bias = vector3();
            switch( type ){
                case 0:
                    bias = vector3( srcX-200, -height/2-srcY-gap, 0 );
                    break;
                case 1:
                    bias = vector3( srcX-200, height/2-srcY+gap, 0 );
                    break;
                case 2:
                    bias = vector3( srcX-200 + width/2+gap, -srcY, 0 );
                    break;
                case 3:
                    bias = vector3( srcX-200 - width/2-gap, -srcY, 0 );
                    break;
                case 4:
                    bias = vector3( srcX-200 + width/2+gap, -height/2-srcY-gap, 0 );
                    break;
                case 5:
                    bias = vector3( srcX-200 - width/2-gap, -height/2-srcY-gap, 0 );
                    break;
                case 6:
                    bias = vector3( srcX-200 + width/2+gap, height/2-srcY+gap, 0 );
                    break;
                case 7:
                    bias = vector3( srcX-200 - width/2-gap, height/2-srcY+gap, 0 );
                    break;
            }

            var vec = dx.sum(dy).sum(dz).sum(bias);

            parent.zoomResizeFacade( vec, time );
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
        setRotatePosition : function(x, y, z){
            eye = vector3(0,0,0);
            this.translateX( x );
            this.translateY( y );
            this.translateZ( z );
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

            return vector3().add( eye, vector3().add( revisedX.scalar(dx*bias), revisedY.scalar(dy*bias) ) );
        },
        getResizePosition: function( origin, dx, dy ){
            var revisedX = getRotateVector( vector3(1, 0, 0) );
            var revisedY = getRotateVector( vector3(0, 1, 0) );

            var rdx = getInverseVector( vector3( 1, 0, 0 ) ).scalar( -eye.getX()-200/2 );
            var rdy = getInverseVector( vector3( 0, -1, 0 ) ).scalar( -eye.getY()+100/2 );
            var rdz = getInverseVector( vector3( 0, 0, 1 ) ).scalar( -eye.getZ() );

            rdx.sum(rdy).sum(rdz);
            var p = parseInt( $('#workSpace').css('-webkit-perspective') );
            var bias = Math.abs( p + rdx.getZ()-parent.getLocation().getZ() )/p;

            return vector3().add( origin, vector3().add( revisedX.scalar(dx*bias), revisedY.scalar(dy*bias) ) );
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
            mQuaternion = xq.crossBy( mQuaternion );
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
        rotateRevisedX : function( dx ){
            var q = quaternion().fromAxisAngle( getRotateVector( vector3(1, 0, 0), mQuaternion ), dx );
            mQuaternion = q.crossBy( mQuaternion );
            quaternMatrix4 = mQuaternion.getMatrix();
            //alert('aa');
        },
        rotateRevisedY : function( dy ){
            var q = quaternion().fromAxisAngle( getRotateVector( vector3(0, 1, 0), mQuaternion ), dy );
            mQuaternion = q.crossBy( mQuaternion );
            quaternMatrix4 = mQuaternion.getMatrix();
        },
        rotateRevisedZ : function( dz ){
            var q = quaternion().fromAxisAngle( getRotateVector( vector3(0, 0, 1), mQuaternion ), dz );
            mQuaternion = q.crossBy( mQuaternion );
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
        getAngle: function(){
            return angle;
        },

        getRotatedSize: function( width, height ){

            var dx = getInverseVector( vector3( 1, 0, 0 ) ).scalar( -eye.getX()-width/2 );
            var dy = getInverseVector( vector3( 0, -1, 0 ) ).scalar( -eye.getY()+height/2 );
            var dz = getInverseVector( vector3( 0, 0, 1 ) ).scalar( -eye.getZ() );

            var bias = vector3( (parseInt($('#workSpace').css('width') ) ) /2, -(parseInt($('#workSpace').css('height')))/2, 0 );

            parent.zoomFacade( dx.sum(dy).sum(dz).sum( bias ) );
            //rotate object & world
            var vn = vector3( 1, 0, 0);

            var q = mQuaternion.getInverse();
            var quatern = quaternion(q.getX(), q.getY(), q.getZ(), q.getW() );

            var vecQuat = quaternion( vn.getX(), vn.getY(), vn.getZ(), 0.0 );
            var resQuat = quaternion().cross( vecQuat, quatern.getConjugate() );
            var endQuat = quaternion().cross( quatern, resQuat );

            var wVec = vector3( endQuat.getX(), -endQuat.getY(), endQuat.getZ()).scalar( width );
            //var rotateWidth = getInverseVector( vector3(1, 0, 0) ).scalar( width );

            vn = vector3( 0, 1, 0);

            q = mQuaternion.getInverse();
            quatern = quaternion(q.getX(), q.getY(), q.getZ(), q.getW() );

            vecQuat = quaternion( vn.getX(), vn.getY(), vn.getZ(), 0.0 );
            resQuat = quaternion().cross( vecQuat, quatern.getConjugate() );
            endQuat = quaternion().cross( quatern, resQuat );

            var hVec = vector3( endQuat.getX(), -endQuat.getY(), endQuat.getZ()).scalar( height );
            //var rotateHeight = getInverseVector( vector3(1, 0, 0)).scalar( height );


            return {
                wVec : wVec,
                hVec : hVec
            }
        },
        setRotation: function(x, y, z ){
            var dx = (x-angle.getX()+360)%360;
            var dy = (y-angle.getY()+360)%360;
            var dz = (z-angle.getZ()+360)%360;

            angle.set( x, y, z );

            this.rotateX( dx );
            this.rotateY( dy );
            this.rotateZ( dz );
        },

        resetAngle: function(){
            angle = angle3(0,0,0);
        },
        resetPosition: function(){
            eye = vector3(0,0,0);
        },
        getParent : function(){
            return parent;
        }

    }
}

