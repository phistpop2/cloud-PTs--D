/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 5
 * Time: 오후 7:48
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 3
 * Time: 오후 11:21
 * To change this template use File | Settings | File Templates.
 */

vector3 = function(_x, _y, _z){
    var x =epsilon(_x), y = epsilon(_y), z=epsilon(_z), w=0;

    function epsilon( value ) {
        return Math.abs( value ) < 0.000001 ? 0 : value;
    };


    return {
        set: function(_x, _y, _z){
            x = _x;
            y = _y;
            z = _z;
        },
        getX: function(){
            return epsilon(x);
        },
        setX: function( _x ){
            x = _x;
            return this;
        },
        getY: function(){
            return epsilon(y);
        },
        setY: function( _y ){
            y = _y;
            return this;
        },
        getZ: function(){
            return epsilon(z);
        },
        setZ: function( _z ){
            z = _z;
            return this;
        },
        normalize: function(){
            var length = Math.sqrt( x*x + y*y + z*z );
            if( length == 0 )
                return this;

            x = x/length;
            y = y/length;
            z = z/length;

            return this;
        },
        subtract: function( v1, v2 ){
            x = v1.getX() - v2.getX();
            y = v1.getY() - v2.getY();
            z = v1.getZ() - v2.getZ();
            return this;
        },
        add: function( v1, v2 ){
            x = v1.getX() + v2.getX();
            y = v1.getY() + v2.getY();
            z = v1.getZ() + v2.getZ();

            return this;
        },
        sum: function( v ){
            x = x + v.getX();
            y = y + v.getY();
            z = z + v.getZ();
            return this;
        },
        cross: function( v1, v2 ){
            x = v1.getY()* v2.getZ() - v1.getZ()* v2.getY();
            y = v1.getZ()* v2.getX() - v1.getX()* v2.getZ();
            z = v1.getX()* v2.getY() - v1.getY()* v2.getX();

            return this;
        },
        scalar: function( v ){
            x = x*v;
            y = y*v;
            z = z*v;

            return this;
        },
        dot: function( v1, v2){
            var result = v1.getX()*v2.getX() + v1.getY()*v2.getY() + v1.getZ()*v2.getZ();
            return result;
        },
        dot: function( v ){
            var result = x* v.getX() + y* v.getY() + z* v.getZ();
            return result;
        },
        length: function(){
            return Math.sqrt( x*x + y*y + z*z );
        },
        getLength: function(){
            return Math.sqrt( x*x + y*y + z*z );
        },
        vectorXmatrix: function( m, v ){
            x = m.x0 * v.getX() + m.x1 * v.getY() + m.x2* v.getZ();
            y = m.y0 * v.getX() + m.y1 * v.getY() + m.y2* v.getZ();
            z = m.z0 * v.getX() + m.z1 * v.getY() + m.z2* v.getZ();
            w = m.t0 * v.getX() + m.t1 * v.getY() + m.t2* v.getZ();
            return this;
        },
        getInverse: function(){
            return vector3( -x, -y, -z);
        },
        clone: function(){
            return vector3(x, y, z);
        }



    };
}
