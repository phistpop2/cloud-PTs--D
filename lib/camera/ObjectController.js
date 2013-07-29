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
    var mControlBox = null;
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
        var vn = vector3( base.getX(), base.getY(), base.getZ());
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
    function findOffset(element) {
        var pos = new Object();
        pos.left = pos.top = 0;
        if (element.offsetParent)
        {
            do
            {
                pos.left += element.offsetLeft;
                pos.top += element.offsetTop;
            } while (element = element.offsetParent);
        }
        return pos;
    }

    function epsilon( value ) {
        return Math.abs( value ) < 0.000001 ? 0 : value;
    }

    initilize();

    return {
        genControlBox : function( model ){
            mControlBox = ControlBox( model );
            return mControlBox;
        },
        receiveRemoteControl : function( data ){
            mControlBox.remoteModify( data );
        },
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
        getAbsoluteXY : function(src, w, h){
            var perspective = parseInt( $('#workSpace').css('-webkit-perspective') );
            var height = parseInt( $('#workSpace').height() );
            var width = parseInt( $('#workSpace').width() );

            var ov = this.getTranslateBiasToCurrentWorld( src.clone(), w, h );

            var center = vector3( ov.x, ov.y, ov.z );





            var z = -ov.z;






            var newH = height*(perspective+z)/(perspective);
            var newW = width*(perspective+z)/(perspective);

            var newY = ((newH)/2+ov.y)*(height/newH);
            var newX = ((newW)/2+ov.x)*(width/newW);

            console.debug( src.getX(), src.getY(), src.getZ() )
            console.debug( 'center', ov.x, ov.y, ov.z );
            console.debug( '!!!!!!!!', newX, newY  );
            for( var i = 0; i < 0; i++ ){
                var newH = height*(perspective-edge[i].getZ())/(perspective);
                var newW = width*(perspective-edge[i].getZ())/(perspective);

                var newY = ((newH-h)/2+edge[i].getY())*(height/newH);
                var newX = ((newW-w)/2+edge[i].getX())*(width/newW);
                console.debug( 'edge['+i+']', parseInt( newX ), parseInt( newY ) );
            }
        },
        getCenterPosition : function(w, h){
            var perspective = parseInt( $('#workSpace').css('-webkit-perspective') );
            var height = parseInt( $('#workSpace').height() );
            var width = parseInt( $('#workSpace').width() );

            var ov = this.getTranslateBiasToCurrentWorld( eye.clone(), w, h );
            var center = vector3( ov.x, ov.y, ov.z );
            console.debug( w, h, ov.z)
            var edge = this.getAbsoluteEdges( center, w, h );
            var result = [];


            var z = -ov.z;
            var newH = height*(perspective+z)/(perspective);
            var newW = width*(perspective+z)/(perspective);

            var newY = ((newH)/2+ov.y)*(height/newH);
            var newX = ((newW)/2+ov.x)*(width/newW);


            result[0] = {};
            result[0].x = newX;
            result[0].y = newY;

            for( var i = 0; i < 4; i++ ){
                newH = height*(perspective-edge[i].getZ())/(perspective);
                newW = width*(perspective-edge[i].getZ())/(perspective);

                newY = ((newH)/2-edge[i].getY())*(height/newH);
                newX = ((newW)/2-edge[i].getX())*(width/newW);

                result[i+1] = {}
                result[i+1].x = newX;
                result[i+1].y = newY;
            }
            return result;
        },
        isCurrentScreen : function( w, h ){
            var points = this.getCenterPosition( w, h );
            var bottom = parseInt( $('#workSpace').height() );
            var right = parseInt( $('#workSpace').width() );

            for( var i = 0; i < points.length; i++ ){
                if( points[i].x > 0 && points[i].x < bottom && points[i].y > 0 && points[i].y < right ){
                    return true;
                }
            }
            return false;
        },
        getRotateQuatToCurrentWorld : function(){
            var q = parent.getQuaternion().getInverse().crossBy( mQuaternion.getInverse() );
            var angle = q.getEuler3();
            var result = {
                x : q.getX(),
                y : q.getY(),
                z : q.getZ(),
                w : q.getW()
            }
            return result;
        },
        rotateBias : function( q ){
            mQuaternion = q.getInverse().crossBy( mQuaternion);
            return mQuaternion.getEuler3();
        },

        getAbsoluteEdges : function(src, w,h){
            var perspective = parseInt( $('#workSpace').css('-webkit-perspective') );
            var dw = w * perspective/(perspective-src.getZ());
            var dh = h * perspective/(perspective-src.getZ());

            //get edges
            var edge = [];
            edge[0] = vector3(0,0,0)
            edge[1] = vector3(0,0,0);
            edge[2] = vector3(0,0,0);
            edge[3] = vector3(0,0,0);

            var q =  quaternion().cross( mQuaternion, parent.getQuaternion() );
            var xBias = q.getEuler3().getX();
            var xq = quaternion().fromAxisAngle( vector3(1, 0, 0), -xBias*2 );
            q = xq.crossBy( q );

            var revisedX = getRotateVector( vector3(1, 0, 0), q );
            var revisedY = getRotateVector( vector3(0, -1, 0), q );
            var revisedZ = getRotateVector( vector3(0, 0, 1), q );


            //nw
            var rx = revisedX.getScalar( dw/2  );
            var ry = revisedY.getScalar( dh/2 );
            var rz = revisedZ.getScalar( 0 );
            edge[0].sum( rx ).sum( ry ).sum( rz );

            //ne
            rx = revisedX.getScalar( -dw/2  );
            ry = revisedY.getScalar( dh/2 );
            rz = revisedZ.getScalar( 0 );
            edge[1].sum( rx ).sum( ry ).sum( rz );



            //sw
            rx = revisedX.getScalar( dw/2  );
            ry = revisedY.getScalar( -dh/2 );
            rz = revisedZ.getScalar( 0 );
            edge[2].sum( rx ).sum( ry ).sum( rz );

            //se
            rx = revisedX.getScalar( -dw/2  );
            ry = revisedY.getScalar( -dh/2 );
            rz = revisedZ.getScalar( 0 );
            edge[3].sum( rx ).sum( ry ).sum( rz );


            for( var i = 0; i < 4 ; i++ ){
                edge[i].sub(src);
            }
            return edge;
        },
        getTranslateBiasToCurrentWorld : function(src,w,h){
            var ov = this.getFacadePosition(  parseInt( $('#workSpace').width() )/2, -parseInt( $('#workSpace').height())/2, w, h );
            src.sub( ov );

            var pos = vector3(0,0,0);
            var revisedVector = getInverseVector( vector3(1, 0, 0) );
            revisedVector.scalar( src.getX() );
            pos.sum( revisedVector );

            revisedVector = getInverseVector( vector3(0, -1, 0) );
            revisedVector.scalar(src.getY());
            pos.sum( revisedVector );

            revisedVector = getInverseVector( vector3(0, 0, 1) );
            revisedVector.scalar(src.getZ());
            pos.sum( revisedVector );

            var result = {};

            result.x = pos.getX();
            result.y = -pos.getY();
            result.z = pos.getZ();

            return result;
        },
        translateBias : function( x, y, z ){
            var revisedVector = getRotateVector( vector3(1, 0, 0) );
            revisedVector.scalar( x );
            eye.sum( revisedVector );

            revisedVector = getRotateVector( vector3(0, 1, 0) );
            revisedVector.scalar( y );
            eye.sum( revisedVector );

            revisedVector = getRotateVector( vector3(0, 0, 1) );
            revisedVector.scalar( z );
            eye.sum( revisedVector );

            return eye;
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
        getFacadePosition: function(x, y, w, h, self ){
            var revisedX = getRotateVector( vector3(1, 0, 0) );
            var revisedY = getRotateVector( vector3(0, -1, 0) );
            var revisedZ = getRotateVector( vector3(0, 0, 1) );
            revisedX.scalar( x - parent.getLocation().getX() );
            revisedY.scalar( y - parent.getLocation().getY() );
            revisedZ.scalar( -parent.getLocation().getZ() );

            if( self ){
                self.sum( revisedX ).sum( revisedY ).sum( revisedZ );
                self.setX( self.getX() - w/2 );
                self.setY( self.getY() + h/2 );
            }else{
                var pos = vector3(0,0,0);
                pos.sum( revisedX ).sum( revisedY ).sum( revisedZ );
                pos.setX( pos.getX() - w/2 );
                pos.setY( pos.getY() + h/2 );
            }

            return pos;
        },
        setFacadePosition: function(x, y, w, h){
            var revisedX = getRotateVector( vector3(1, 0, 0) );
            var revisedY = getRotateVector( vector3(0, -1, 0) );
            var revisedZ = getRotateVector( vector3(0, 0, 1) );

            revisedX.scalar( x - parent.getLocation().getX() );
            revisedY.scalar( y - parent.getLocation().getY() );
            revisedZ.scalar( -parent.getLocation().getZ() );
            eye.sum( revisedX ).sum( revisedY ).sum( revisedZ );
            eye.setX( eye.getX() - w/2 );
            eye.setY( eye.getY() + h/2 );

            return eye;
        },
        lookFacade: function(){
            var q = parent.getQuaternion().clone();
            parent.lookFacade( mQuaternion.getInverse() );
            return q;
        },
        zoomFacade: function(width,height){
            var dx = getInverseVector( vector3( 1, 0, 0 ) ).scalar( -eye.getX()-width/2 );
            var dy = getInverseVector( vector3( 0, -1, 0 ) ).scalar( -eye.getY()+height/2 );
            var dz = getInverseVector( vector3( 0, 0, 1 ) ).scalar( -eye.getZ() );

            var bias = vector3( 0, 0, 0 );

            parent.zoomFacade( dx.sum(dy).sum(dz).sum( bias ) );
        },
        zoomResizeFacade: function(width,height, srcX, srcY, gap, type, time){
            var dx = getInverseVector( vector3( 1, 0, 0 ) ).scalar( -eye.getX()-width/2 );
            var dy = getInverseVector( vector3( 0, -1, 0 ) ).scalar( -eye.getY()+height/2 );
            var dz = getInverseVector( vector3( 0, 0, 1 ) ).scalar( -eye.getZ() );

            var bias = vector3();
            var wBias = 200;
            var x = parseInt( $('#workSpace').width()/2 );
            var y = parseInt( $('#workSpace').height()/2 );
            console.debug( y, srcY);
            switch( type ){
                case 0:
                    bias = vector3( srcX-wBias, -height/2-srcY-gap, 0 );
                    break;
                case 1:
                    bias = vector3( srcX-wBias, height/2-srcY+gap, 0 );
                    break;
                case 2:
                    bias = vector3( srcX-wBias+ width/2+gap, -srcY, 0 );
                    break;
                case 3:
                    bias = vector3( srcX-wBias- width/2-gap, -srcY, 0 );
                    break;
                case 4:
                    bias = vector3( srcX-wBias+ width/2+gap, -height/2-srcY-gap, 0 );
                    break;
                case 5:
                    bias = vector3( srcX-wBias- width/2-gap, -height/2-srcY-gap, 0 );
                    break;
                case 6:
                    bias = vector3( srcX-wBias+ width/2+gap, height/2-srcY+gap, 0 );
                    break;
                case 7:
                    bias = vector3( srcX-wBias- width/2-gap, height/2-srcY+gap, 0 );
                    break;
            }
            var vec = dx.sum(dy).sum(dz).sum(bias);

            parent.zoomResizeFacade( vec, time );
        },
        zoomOut : function( q, v ){
            parent.zoomOut( q,v, 200 );
        },

        //translation
        translateX : function(val){
            var revisedVector = getRotateVector( vector3(1, 0, 0) );
            revisedVector.scalar(val);
            eye = vector3().add( eye, revisedVector );
            return eye;
        },
        translateY : function(val){
            var revisedVector = getRotateVector( vector3(0, -1, 0) );
            revisedVector.scalar(val);
            eye = vector3().add( eye, revisedVector );
            return eye;
        },
        translateZ : function(val){
            var revisedVector = getRotateVector( vector3(0, 0, 1) );
            revisedVector.scalar(val);
            eye = vector3().add( eye, revisedVector );
            return eye;
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
            var bias = ( p + rdx.getZ()-parent.getLocation().getZ() )/p;

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
            angle = mQuaternion.getEuler3();
            transformed = true;
            return angle.clone();
        },
        rotateY: function( dy ){
            var yq = quaternion().fromAxisAngle( vector3(0, 1, 0), dy );
            mQuaternion = yq.crossBy( mQuaternion );
            quaternMatrix4 = mQuaternion.getMatrix();
            angle = mQuaternion.getEuler3();
            return angle.clone();
        },
        rotateZ: function( dz ){
            var zq = quaternion().fromAxisAngle( vector3(0, 0, 1), dz );
            mQuaternion = zq.crossBy( mQuaternion );
            quaternMatrix4 = mQuaternion.getMatrix();
            angle = mQuaternion.getEuler3();
            transformed = true;
            return angle.clone();
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
            if( transformed ){
                transformed = false;
                return;
            }

            var xq = quaternion().fromAxisAngle( vector3(1, 0, 0), x );
            var yq = quaternion().fromAxisAngle( vector3(0, 1, 0), y );
            var zq = quaternion().fromAxisAngle( vector3(0, 0, 1), z );
            angle.set( x, y, z );

            mQuaternion = xq;
            mQuaternion = yq.crossBy( mQuaternion );
            mQuaternion = zq.crossBy( mQuaternion );

            quaternMatrix4 = mQuaternion.getMatrix();
        },
        resetAngle: function(){
            angle = angle3(0,0,0);
        },
        resetPosition: function(){
            eye = vector3(0,0,0);
        },
        getParent : function(){
            return parent;
        },
        getScreenXY : function( div ){
            /*
            var pos = eye.clone();
            var vec = getInverseVector( pos );
            var vec2 = vec.clone();
            vec2.scalar( eye.length() );

            console.debug( vec2.getX(), vec2.getY(), vec2.getZ() );
            console.debug( parent.getLocation().getX(), parent.getLocation().getY(), parent.getLocation().getZ());


            var offset = findOffset(div);

            this.getProjectionMatrix(div);

            return { x: ( vec.getX() + 1 ) * parseInt($(div).css('width')) / 2 + offset.left,
                y: ( - vec.getY() + 1) * parseInt($(div).css('height'))/ 2 + offset.top };
              */
            //return findOffset( div );
        },
        getProjectionMatrix : function( div ){
            var fov = parent.getFov();
            var near = 0.1;
            var far = 2E3;
            var width = $('#workSpace').width();
            var height = $('workSpace').height();

            console.debug( this.makePerspective( fov, width/height, near, far ) );
            var pm = this.makePerspective( fov, width/height, near, far );
            var cm = parent.getQuaternion().getInverse().getMatrix();
            var mul = quaternion().mulMatrix4( pm, cm );
            console.debug( mul );
            var pos = eye.clone();
            pos.normalize();

            var vec = quaternion().vectorXmatrix( mul, pos );
            var vec2 = quaternion().vectorXmatrix( parent.getQuaternion().getInverse().getMatrix(), pos );
            var offset = findOffset(div);

            var data = { x: ( vec.getX() + 1 ) * parseInt($(div).css('width')) / 2 + offset.left,
                y: ( - vec.getY() + 1) * parseInt($(div).css('height'))/ 2 + offset.top }
            var  data2 = { x: ( vec2.getX() + 1 ) * parseInt($(div).css('width')) / 2 + offset.left,
                y: ( - vec2.getY() + 1) * parseInt($(div).css('height'))/ 2 + offset.top }
            console.debug( 'helg',data.x, data.y, data2 );


        },
        makePerspective: function (fov, aspect, near, far) {
            //var fov = near * Math.tan( (0.5 * fov)/180*Math.PI ),
                //e = -fov;
            //return this.makeFrustum(e * aspect, fov * aspect, e, fov, near, far)
            return this.makeProjectionMatrix( fov, aspect, near, far );
        },
        makeProjectionMatrix : function( fov, aspect, near, far ){
            var radian = (fov)/180*Math.PI;
            var fd = epsilon( Math.cos(radian/2)/Math.sin(radian/2) );
            var m = {};

            m.x0 = epsilon( fd/aspect );
            m.x1 = 0;
            m.x2 = 0;
            m.x3 = 0;

            m.y0 = 0;
            m.y1 = fd;
            m.y2 = 0;
            m.y3 = 0;

            m.z0 = 0;
            m.z1 = 0;
            m.z2 = epsilon(far/(far-near));
            m.z3 = 1;

            m.t0 = 0;
            m.t1 = 0;
            m.t2 = -epsilon(far*near/(far-near));
            m.t3 = 0;
            return m;

        },
        makeFrustum: function (a, b, c, d, e, f) {
            var g = [];
            g[0] = 2 * e / (b - a);
            g[4] = 0;
            g[8] = (b + a) / (b - a);
            g[12] = 0;
            g[1] = 0;
            g[5] = 2 * e / (d - c);
            g[9] = (d + c) / (d - c);
            g[13] = 0;
            g[2] = 0;
            g[6] = 0;
            g[10] = -(f + e) / (f - e);
            g[14] = -2 * f * e / (f - e);
            g[3] = 0;
            g[7] = 0;
            g[11] = -1;
            g[15] = 0;
            return g;
        }

    }
}

