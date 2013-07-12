(function($){
    var w = {};

    w.isFocus = false;
    w.focusObj = null;
    w.prevX;
    w.prevY;
    w.slides = [];
    w.selectedKey = 0;
    w.mode = 'T';

    w.viewport = function(){
        this.o = null;
        this.el = null;
        this.world = null;
        this.cong = {};
        this.mode = 'T';

        this.setupViewport = function()
        {
            var option = this.o;

            if(!option)
            {
                option = {};
            }

            this.el.css({
                'position' : (option.position) ? option.position : 'absolute',
                'bottom' :  (option.bottom) ? option.bottom : 0,
                'left' : (option.left) ? option.left : 0,
                'right' :  (option.right) ? option.right : 0,
                'top' : (option.top) ? option.top : 0,
                'overflow' : 'overflow',
                '-webkit-perspective':  (option.perspective) ? option.perspective : '400'
        });

            var world_ = $("<div class='workWorld'/>");

            this.cong = {
                'position': 'absolute',
                'width' : '100%',
                'height' : '100%',
                'top' : 0,
                'left' : 0,
                'bottom' : 0,
                'right' : 0,
                '-webkit-transform-style' : 'preserve-3d',
                'background': 'transparent'
            };

            $(world_).css(this.cong);


            this.el.append(world_);
            this.world = world_;

        }

        this.addObject = function(cong){
            obj1 = $("<div>" +
                "<div style='position:absolute;top:0px;width:4px;height:4px;background:#000000;'></div>" +
                "<div style='position:absolute;top:0px;width:4px;right:0px;height:4px;background:#000000;'></div>" +
                "<div style='position:absolute;bottom:0px;width:4px;height:4px;background:#000000;'></div>" +
                "<div style='position:absolute;bottom:0px; right:0px;width:4px;height:4px;background:#000000;'></div>" +
                "</div>");
            this.world.append(obj1);
            obj1.setupObject(cong);



            return obj1;
        }

        return this;
    };


    /*view port setup*/
    $.fn.setupViewport = function(option)
    {
        var t = w.viewport();
        t.o = option;
        t.el = $(this);
        t.setupViewport();

        return t; //kickout viewport
    };


    /* object setup */
    w.slideObj = function(){
        this.obj = this;
        this.el = null;
        this.cong = null;
        this.mode = null;

        this.listen = function()
        {
            (function(el,obj){

                el.bind('mousedown',function(e){
                    w.isFocus = true;
                    w.focusObj = obj;
                    w.focusObj.mode = w.mode;

                    w.prevX = e.clientX;
                    w.prevY = e.clientY;

                    e.stopPropagation();

                });

                el.find('div').bind('mousedown',function(e){
                    w.isFocus = true;
                    w.focusObj = obj;
                    w.focusObj.mode = 'S';

                    w.prevX = e.clientX;
                    w.prevY = e.clientY;

                    e.stopPropagation();
                });


            })(this.el,this);


        }


        this.draw = function()
        {

            var translateXYZ = 'translateX('+(this.cong.translateX)+'px) ' +
                'translateY('+(this.cong.translateY)+'px) ' +
                'translateZ('+(this.cong.translateZ)+'px) '

            var rotateXYZ = 'rotateX('+(this.cong.rotateX)+'deg) ' +
                'rotateY('+(this.cong.rotateY)+'deg) ' +
                'rotateZ('+(this.cong.rotateZ)+'deg) '

            var scaleXYZ = 'scaleX('+(this.cong.scaleX)+') ' +
                'scaleY('+(this.cong.scaleY)+') ' +
                'scaleZ('+(this.cong.scaleZ)+') ';

            (this.cong.background) = (this.cong.background) ? (this.cong.background) : 'hsla(0,100%,60%,0.7)';

            this.el.css({
                position: 'absolute',
                width : (this.cong.width) ? this.cong.width+"px" : "0px",
                height : (this.cong.height) ? this.cong.height+"px" : "0px",
                webkitTransformStyle : 'preserve-3d',
                webkitTransform : translateXYZ + rotateXYZ + scaleXYZ,
                background: this.cong.background
            });

        }

        this.run = function(){

            if(this.el)
            {

                (this.cong.type) = (this.cong.type!=undefined) ? this.cong.type :  'frame';

                (this.cong.width) = (this.cong.width!=undefined) ? (this.cong.width) : 50;
                (this.cong.height) = (this.cong.height!=undefined) ? (this.cong.height) : 50;


                (this.cong.rotateX) = (this.cong.rotateX) ? (this.cong.rotateX) : 0;
                (this.cong.rotateY) = (this.cong.rotateY) ? (this.cong.rotateY) : 0;
                (this.cong.rotateZ) = (this.cong.rotateZ) ? (this.cong.rotateZ) : 0;

                (this.cong.translateX) = (this.cong.translateX) ? (this.cong.translateX) : 0;
                (this.cong.translateY) = (this.cong.translateY) ? (this.cong.translateY) : 0;
                (this.cong.translateZ) = (this.cong.translateZ) ? (this.cong.translateZ) : 0;

                (this.cong.scaleX) = (this.cong.scaleX) ? (this.cong.scaleX) : 1;
                (this.cong.scaleY) = (this.cong.scaleY) ? (this.cong.scaleY) : 1;
                (this.cong.scaleZ) = (this.cong.scaleZ) ? (this.cong.scaleZ) : 1;

                this.draw();
                this.listen();
            }
        }

        return this;
    }

    w.exportSlideToShowJsonData = function(){
        var resultJson =  [];

        for(i in this.slides)
        {
            var slide = this.slides[i].cong;
            var slideJson = {};
            slideJson.id = 'slide_'+i;
            slideJson.slideStyle = {};


            $.each(slide,function(key,value){
                slideJson.slideStyle[key] = value;
            });

            resultJson.push(slideJson);
        }


        console.log(resultJson);
        return resultJson;
    }

    /* object */
    $.fn.setupObject = function(cong){
        var newObj = new w.slideObj();
        newObj.el = $(this);
        newObj.cong = cong;
        newObj.run();

        w.slides.push(newObj);
    }


})(jQuery);