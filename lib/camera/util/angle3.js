/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 5
 * Time: 오후 7:47
 * To change this template use File | Settings | File Templates.
 */

angle3 = function(_x,_y,_z){
    var x = (_x+360)%360, y = (_y+360)%360, z = (_z+360)%360;


    return{
        set: function( _x, _y, _z ){
            x = (_x+360)%360;
            y = (_y+360)%360;
            z = (_z+360)%360;
        },
        //x
        rotateX: function( _x ){
            x += _x
            x %= 360;
            x += 360;
        },
        setX: function( _x ){
            x = _x;
        },
        getX: function(){
            return x;
        },

        //y
        rotateY: function( _y ){
            y += _y;
            y %= 360;
            y += 360;
        },
        setY: function( _y ){
            y = _y;
        },
        getY: function(){
            return y;
        },

        //z
        rotateZ: function( _z ){
            z += _z;
            z %= 360;
            z += 360;
        },
        setZ: function( _z ){
            z = _z;
        },
        getZ: function(){
            return z;
        }, add: function( v1, v2 ){
            x = v1.getX() + v2.getX();
            y = v1.getY() + v2.getY();
            z = v1.getZ() + v2.getZ();

            return this;
        },
        clone: function(){
            return vector3(x, y, z);
        }

    }
}
