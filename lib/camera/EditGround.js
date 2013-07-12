/**
 * Created with JetBrains WebStorm.
 * User: imoo
 * Date: 13. 7. 5
 * Time: 오전 2:58
 * To change this template use File | Settings | File Templates.
 */

function drawAxisLine(){
    console.debug('draw axis');

    var axisX0 = $("<div id='axisX0'>+x</p></div>");
    axisX0.css({
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: '1px',
        background: '#ff0000',
        color: 'red',
        textAlign: 'right',
        fontWeight: 'bold',
        webkitUserSelect: 'none',
        outline: 'none'

    });
    var axisX1 = $("<div id='axisX1'>+x</p></div>");
    axisX1.css({
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: '1px',
        background: '#ff0000',
        color: 'red',
        textAlign: 'right',
        fontWeight: 'bold',
        webkitTransform: 'rotateX(90deg)',
        webkitUserSelect: 'none',
        outline: 'none'

    });
    var axisY0 = $("<div id='axisY0'>+y</p></div>");
    axisY0.css({
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: '1px',
        background: '#00ff00',
        color: '#00ff00',
        textAlign: 'right',
        fontWeight: 'bold',
        webkitTransform: 'rotateZ(-90deg)',
        webkitUserSelect: 'none',
        outline: 'none'

    });
    var axisY1 = $("<div id='axisY1'>+y</p></div>");
    axisY1.css({
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: '1px',
        background: '#00ff00',
        color: '#00ff00',
        textAlign: 'right',
        fontWeight: 'bold',
        webkitTransform: 'rotateZ(-90deg) rotateX(90deg)',
        webkitUserSelect: 'none',
        outline: 'none'
    });
    var axisZ0 = $("<div id='axisZ0'>+z</p></div>");
    axisZ0.css({
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: '1px',
        background: '#0000ff',
        color: '#0000ff',
        textAlign: 'left',
        fontWeight: 'bold',
        webkitTransform: 'rotateY(90deg)',
        webkitUserSelect: 'none',
        outline: 'none'
    });
    var axisZ1 = $("<div id='axisZ1'>+z</p></div>");
    axisZ1.css({
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: '1px',
        background: '#0000ff',
        color: '#0000ff',
        textAlign: 'left',
        fontWeight: 'bold',
        webkitTransform: 'rotateY(90deg) rotateX(90deg)',
        webkitUserSelect: 'none',
        outline: 'none'
    });
    $("#world").append( axisX0 );
    $("#world").append( axisX1 );
    $("#world").append( axisY0 );
    $("#world").append( axisY1 );
    $("#world").append( axisZ0 );
    $("#world").append( axisZ1 );
}
