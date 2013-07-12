var show = (function($){
    var s={};

    s.slideIdx = 0;
    s.prevSlideIdx = 0;
    s.slides = [];

    s.start = function(slides)
    {
        this.slides =  slides;
        var world = document.getElementById('world');

        for(i in this.slides)
        {
            var slideEl = document.createElement('div');

            slideEl.setAttribute('id',this.slides[i].id);
            slideEl.style['background'] = this.slides[i].slideStyle.background;
            console.log(this.slides[i].slideStyle.translateX);

            var translateX = this.slides[i].slideStyle.translateX;
            var translateY = this.slides[i].slideStyle.translateY;
            var translateZ = this.slides[i].slideStyle.translateZ;

            var rotateX = this.slides[i].slideStyle.rotateX;
            var rotateY = this.slides[i].slideStyle.rotateY;
            var rotateZ = this.slides[i].slideStyle.rotateZ;


            slideEl.style['margin'] = '0px';
            slideEl.style['padding'] = '0px';

            slideEl.style['display'] = 'inline-block';
            slideEl.style['position'] = 'absolute';

            slideEl.style['WebkitTransform'] =
                "translate(-50%, -50%) "+
                    "translate3d("+translateX+"px, "+translateY+"px, "+translateZ+"px) "+
                    "rotateX("+rotateX+"deg) "+
                    "rotateY("+rotateY+"deg) "+
                    "rotateZ("+rotateZ+"deg) ";


            var contents = this.slides[i].contents;

            if(contents)
            {
                $(slideEl).append($(contents));
                $(slideEl).addClass('slide');
            }

            world.appendChild(slideEl);

            this.slides[i].slideStyle.width = parseInt($(slideEl).css('width'));
            this.slides[i].slideStyle.height = parseInt($(slideEl).css('height'));
        }

        this.slideIdx = 0;
        this.action();

        $(window).bind('keydown',function(e){
            if ( e.keyCode === 9 || ( e.keyCode >= 32 && e.keyCode <= 34 ) || (e.keyCode >= 37 && e.keyCode <= 40) ) {
                e.preventDefault();
            }
        });

        $(window).bind('keyup',function(e){

            if ( e.keyCode === 9 || ( e.keyCode >= 32 && e.keyCode <= 34 ) || (e.keyCode >= 37 && e.keyCode <= 40) ) {
                switch( e.keyCode ) {
                    case 33: // pg up
                    case 37: // left
                    case 38: // up
                        s.prev();
                        break;
                    case 34: // pg down
                    case 39: // right
                    case 40: // down
                        s.next();
                        break;
                }

                e.preventDefault();
            }
        });

        $(window).bind('resize',function(e){
            var config = s.slides[s.slideIdx].slideStyle;
            var type = s.slides[s.slideIdx].slideStyle.type;

            if(type == 'frame')
            {
                config.maxScale = 3.0;
            }
            else
            {
                config.maxScale = 1.0;
            }

            s.resizeFocusScale(config);
        });
    }


    var computeWindowScale = function ( config ) {
        console.log("width : " + config.width);

        var hScale = window.innerHeight / config.height,
            wScale = window.innerWidth / config.width,
            scale = hScale > wScale ? wScale : hScale;

        if (1 && scale > config.maxScale) {
            scale = config.maxScale;
        }

        if (0 && scale < config.minScale) {
            scale = 0;
        }

        return scale;
    };

    s.resizeFocusScale = function(config){
        var config = s.slides[s.slideIdx].slideStyle;
        var type = s.slides[s.slideIdx].slideStyle.type;

        if(type == 'frame')
        {
            config.maxScale = 3.0;
        }
        else
        {
            config.maxScale = 1.0;
        }

        $('#root').css({
            WebkitTransitionDuration : '0.5s',
            webkitTransform : 'scale('+computeWindowScale(config)+')'
        }) ;
    }

    s.action = function()
    {
        var translateX = -1*this.slides[this.slideIdx].slideStyle.translateX;
        var translateY = -1*this.slides[this.slideIdx].slideStyle.translateY;
        var translateZ = -1*this.slides[this.slideIdx].slideStyle.translateZ;

        var rotateX = -1*this.slides[this.slideIdx].slideStyle.rotateX;
        var rotateY = -1*this.slides[this.slideIdx].slideStyle.rotateY;
        var rotateZ = -1*this.slides[this.slideIdx].slideStyle.rotateZ;



        world.style['WebkitTransform'] =
            "rotateZ("+rotateZ+"deg) "+
                "rotateY("+rotateY+"deg) "+
                "rotateX("+rotateX+"deg) "+
                "translate3d("+translateX+"px, "+translateY+"px, "+translateZ+"px) ";

        world.style['WebkitTransitionDuration'] = '1s';



        var prevContains = this.slides[this.prevSlideIdx].contain;

        console.log('prev : ' + this.slides[this.prevSlideIdx].id );

        for(var i = 0; i < prevContains.length ; i++)
        {
            $('#'+prevContains[i]).removeClass('active');
            console.log('prev');
        }
        $('#'+this.slides[this.prevSlideIdx].id).removeClass('active');

        console.log('curr : ' + this.slides[this.slideIdx].id );

        var currContains = this.slides[this.slideIdx].contain;
        for(var i = 0; i < currContains.length ; i++)
        {
            $('#'+currContains[i]).addClass('active');

        }
        $('#'+this.slides[this.slideIdx].id).addClass('active');

        s.resizeFocusScale();
    };



    s.next = function()
    {
        this.prevSlideIdx = this.slideIdx;
        this.slideIdx = (this.slideIdx+1)>(this.slides.length-1) ? 0 : this.slideIdx+1;
        this.action();
    };

    s.prev = function()
    {
        this.prevSlideIdx = this.slideIdx;
        this.slideIdx = (this.slideIdx-1)<0 ? (this.slides.length-1) : this.slideIdx-1;
        this.action();
    };

    return s;
}(jQuery));