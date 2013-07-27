define(['jquery','underscore','backbone',

    'CameraModule'],
    function($,_,Backbone,
             ObjectModel,
             TextModel){
        var showWorkspace = Backbone.View.extend({
            el : $('#workspaceWrap'),

            showCollection : null,
            cameraModule : null,

            currentShowPage : 0,

            fixWorkspace : null,

            prevWorkspace : null,
            prevWorld : null,

            currentWorkspace : null,
            currentWorld : null,


            initialize : function()
            {
                _.bindAll(this);
                this.showCollection = this.options.showCollection;
                this.cameraModule = this.options.cameraModule;
                this.camera = this.cameraModule.getCamera();


                this.render();


                this.eventBind();
                this.show(this.currentShowPage);
            },

            eventBind : function()
            {
                var this_ = this;
                var pageKeyNumber = '';

                $(window).resize(this.resize);

                $(window).click(function(){
                    this_.nextPage();
                });

                $(window).mousewheel(function(e,delta){
                   if(delta>0)
                   {
                        this_.nextPage();
                   }
                   else
                   {
                       this_.prevPage();
                   }
                });

                $(window).keydown(function(e){
                    var rightKey = 39, leftKey = 37

                    if(e.keyCode == rightKey)
                    {

                        this_.nextPage();
                    }
                    else if(e.keyCode == leftKey)
                    {
                        this_.prevPage();
                    }

                }).keyup(function(e){

                        if( (e.keyCode >= 48) && (e.keyCode <= 57) ){
                            pageKeyNumber += ((e.keyCode - 48)+'');
                        }
                        else if(e.keyCode == 13)        //wnrwe
                        {
                            pageKeyNumber = parseInt(pageKeyNumber);

                            if((pageKeyNumber+'') != 'NaN')
                            {
                                var pageSize = this_.showCollection.models.length;
                                pageKeyNumber--;
                                if(pageKeyNumber < 0)
                                {
                                    pageKeyNumber = 0;
                                }
                                this_.currentShowPage = pageKeyNumber%pageSize;
                                this_.show(this_.currentShowPage);
                                pageKeyNumber = '';
                            }
                        }

                    });
            },

            nextPage : function()
            {
                var pageSize = this.showCollection.models.length;

                this.currentShowPage++;

                if(this.currentShowPage > pageSize-1)
                {
                    this.currentShowPage = 0;
                }

                this.show(this.currentShowPage);

            },

            prevPage : function()
            {
                var pageSize = this.showCollection.models.length;

                this.currentShowPage--;
                if(this.currentShowPage < 0)
                {
                    this.currentShowPage = pageSize-1;
                }

                this.show(this.currentShowPage);
            },

            contentVisibility : function(page)
            {

                var showModel = this.showCollection.models[page];
                var slideContents = showModel.get('contents')
                var moveDuration = showModel.get('moveDuration');

                for(var cid in this.showCollection.contentViews)
                {
                    var view = this.showCollection.contentViews[cid];

                    $(view.el).css({
                        transitionDuration:  moveDuration+"ms"
                    });

                    $(view.el).removeClass('visible');
                    $(view.el).addClass('gone');
                }

                for(var i  in slideContents)
                {
                    var cid = slideContents[i];

                    var view = this.showCollection.contentViews[cid];

                    if(view)
                    {
                        $(view.el).removeClass('gone');
                        $(view.el).addClass('visible');
                    }
                }


            },

            show : function(page)
            {
                this.contentVisibility(page);

                var cameraModule = this.cameraModule;
                var showModel = this.showCollection.models[page];
                var matrix3d = showModel.get('matrix3d');
                var slideWidth = parseFloat(showModel.get('width'));
                var slideHeight = parseFloat(showModel.get('height'));


                var background = showModel.get('slideBackgroundColor');

                var color = background;
                var rgb = this.hexToRgb(color);

                var r_ = Math.abs(rgb.r+57)%255;
                var g_ = Math.abs(rgb.g+57)%255;
                var b_ = Math.abs(rgb.b+57)%255;

                var secondColor = this.rgbToHex(r_,g_,b_);

                var background = '-webkit-radial-gradient(center, circle cover,'+secondColor+' 0%, '+color+' 100%)'


                var slideChangeStyle = showModel.get('slideChangeStyle');

                var moveDuration = showModel.get('moveDuration');
                var backgroundDuration = 0;
                var slideBackgroundAction = showModel.get('slideBackgroundAction');
                var world = $('#showWorkspace').find('#world');

                var left = parseFloat((window.innerWidth - slideWidth)/2);
                var top = parseFloat((window.innerHeight - slideHeight)/2);



                if(slideChangeStyle=='default')
                {
                    this.fixWorkspace.hide();

                    matrix3d = cameraModule.getCamera().getRevisedMatrixQuery(left,top,matrix3d);

                    world.css({
                        webkitTransform: 'matrix3d('+matrix3d+')',
                        transitionDuration:  moveDuration+"ms",
                        '-webkit-animation-timing-function' : 'linear'
                    });

                   this.resize();


                }
                else        //fixed style
                {
                    var this_ = this;
                    $('#showWorkspace').fadeTo(0, 0.1);
                    this.fixWorkspace.fadeTo(0, 1.0);

                    this.fixWorkspace.addClass(slideChangeStyle);
                    this.prevWorkspace.css('transitionDuration',moveDuration+"ms");

                    this.prevWorld.css('webkitTransform',world[0].style['-webkit-transform']);

                    cameraModule.getCamera().getRevisedMatrixQuery(left,top,matrix3d);

                    world.css({
                        webkitTransform: 'matrix3d('+matrix3d+')',
                        transitionDuration:  "0ms",
                        '-webkit-animation-timing-function' : 'linear'
                    });

                    console.log("-webkit-transform",$(world).css('-webkit-transform'));
                    this.currentWorld.css('webkitTransform',world[0].style['-webkit-transform']);

                    this.currentWorkspace.css('transitionDuration',moveDuration+"ms");

                    this.prevWorkspace.addClass('past');
                    this.currentWorkspace.removeClass('future');

                    $(this.currentWorkspace).bind('webkitTransitionEnd',function(){

                        this_.prevWorkspace.css('transitionDuration','');
                        this_.currentWorkspace.css('transitionDuration','');

                        this_.fixWorkspace.removeClass(slideChangeStyle);
                        this_.prevWorkspace.removeClass('past');
                        this_.prevWorkspace.removeClass('future');
                        this_.currentWorkspace.removeClass('past');
                        this_.currentWorkspace.addClass('future');

                        this_.fixWorkspace.fadeTo(0, 0.1);
                        $('#showWorkspace').fadeTo(0, 1.0);
                    });

                }


                //background setting
                if(slideBackgroundAction!='none')
                {
                    backgroundDuration = moveDuration;
                }

                var backgroundAnimateDiv =$('#mainLayout').find('.backgroundAnimateDiv');


                if(backgroundAnimateDiv.length!=0)
                {
                    var transformAction = '';

                    if(slideBackgroundAction=='card_left')
                    {
                        transformAction = 'translate(100%, 0)';
                    }
                    else if(slideBackgroundAction=='card_right')
                    {
                        transformAction = 'translate(-100%, 0)';
                    }
                    else if(slideBackgroundAction=='card_up')
                    {
                        transformAction = 'translate(0, 100%)';
                    }
                    else if(slideBackgroundAction=='card_down')
                    {
                        transformAction = 'translate(0, -100%)';
                    }
                    else        //may be 'fade
                    {
                        transformAction = 'translate(0, 0)';
                    }

                    if((slideBackgroundAction!='none')&&
                        (slideBackgroundAction!='fade'))
                    {
                        backgroundAnimateDiv.css({
                            webkitTransform: transformAction,
                            transitionDuration:  backgroundDuration+"ms"
                        });
                    }
                    else
                    {

                        backgroundAnimateDiv.css({
                            background : background,
                            transitionDuration:  backgroundDuration+"ms"
                        });
                    }

                    $('#mainLayout').css({
                        background : background


                    });


                    backgroundAnimateDiv.bind('webkitTransitionEnd',function(){

                        $('#mainLayout').find('.backgroundAnimateDiv').each(function(){
                            $(this).remove();
                        });


                        var newDiv = $("<div class='backgroundAnimateDiv'></div>");
                        newDiv.css({
                            width : "100%",
                            height : "100%",
                            background : background,
                            transitionDuration:  backgroundDuration+"ms"
                        });
                        newDiv.insertBefore('#showWorkspace');
                    });
                }
                else
                {

                    var newDiv = $("<div class='backgroundAnimateDiv'></div>");
                    newDiv.css({
                        width : "100%",
                        height : "100%",
                        background : background,
                        transitionDuration:  backgroundDuration+"ms"
                    });
                    newDiv.insertBefore('#showWorkspace');

                    $('#mainLayout').css('background',background);

                }


            },

            resize : function()
            {
                console.log('resize');
                var this_ = this;
                var showModel = this.showCollection.models[this.currentShowPage];
                var slideWidth = parseFloat(showModel.get('width'));
                var slideHeight = parseFloat(showModel.get('height'));

                var originAspect = slideWidth/slideHeight;
                var currentAspect = window.innerWidth / window.innerHeight;
                var newHeight = 0, newWidth = 0;

                console.log('aspacet',originAspect,currentAspect);
                if(originAspect > currentAspect)
                {
                    newWidth = slideWidth;
                    newHeight = slideWidth/currentAspect;
                }
                else
                {
                    newWidth = slideHeight*currentAspect;
                    newHeight = slideHeight
                }

                $('#showWorkspace').css({
                    'width' : newWidth,
                    'height' : newHeight
                });

                var scaleW = window.innerWidth / newWidth;//parseInt($(this_.el).css('width'));
                var scaleH = window.innerHeight / newHeight;//parseInt($(this_.el).css('height'));


                console.log('new',newWidth,newHeight);
                var scale = scaleW;

                if(scaleH < scaleW)  {
                    scale = scaleH;
                }


                $('#showWorkspace').css({
                    '-webkit-transform' : 'scale('+scale+')',
                    '-webkit-transform-origin' : '0% 0%'
                });


                var workspaceWidth = slideWidth*scale;
                var workspaceHeight = slideHeight*scale;

                var cameraModule = this.cameraModule;

                var matrix3d = showModel.get('matrix3d');

                var left = parseFloat((window.innerWidth - slideWidth)/2);
                var top = parseFloat((window.innerHeight - slideHeight)/2);

                console.log('matrix3d',matrix3d);
                matrix3d = cameraModule.getCamera().getRevisedMatrixQuery(left,top,matrix3d);
                console.log('matrix3d',matrix3d);
                console.log('left top',left,top);

                var world = $('#showWorkspace').find('#world');
                world.css({
                    webkitTransform: 'matrix3d('+matrix3d+')'

                });

            },

            getCurrentMatrix : function()
            {
                console.log('resize');
                var this_ = this;
                var showModel = this.showCollection.models[this.currentShowPage];
                var slideWidth = parseFloat(showModel.get('width'));
                var slideHeight = parseFloat(showModel.get('height'));

                var originAspect = slideWidth/slideHeight;
                var currentAspect = window.innerWidth / window.innerHeight;
                var newHeight = 0, newWidth = 0;

                console.log('aspacet',originAspect,currentAspect);
                if(originAspect > currentAspect)
                {
                    newWidth = slideWidth;
                    newHeight = slideWidth/currentAspect;
                }
                else
                {
                    newWidth = slideHeight*currentAspect;
                    newHeight = slideHeight
                }

                $(' #showWorkspace, .fixInnerWorkspace').css({
                    'width' : newWidth,
                    'height' : newHeight
                });

                var scaleW = window.innerWidth / newWidth;//parseInt($(this_.el).css('width'));
                var scaleH = window.innerHeight / newHeight;//parseInt($(this_.el).css('height'));


                console.log('new',newWidth,newHeight);
                var scale = scaleW;

                if(scaleH < scaleW)  {
                    scale = scaleH;
                }


                $('#showWorkspace, .fixInnerWorkspace').css({
                    '-webkit-transform' : 'scale('+scale+')',
                    '-webkit-transform-origin' : '0% 0%'
                });


                var workspaceWidth = slideWidth*scale;
                var workspaceHeight = slideHeight*scale;

                var cameraModule = this.cameraModule;


                var matrix3d = showModel.get('matrix3d');


                var left = parseFloat((window.innerWidth - slideWidth)/2);
                var top = parseFloat((window.innerHeight - slideHeight)/2);

                matrix3d = cameraModule.getCamera().getRevisedMatrixQuery(left,top,matrix3d);

                return matrix3d;
            },

            render : function()
            {
                var world = $('#showWorkspace').find('#world');

                this.prevWorkspace = $("<div class='fixInnerWorkspace'></div>").append(world.clone());
                this.prevWorld = $(this.prevWorkspace).find('#world');

                this.currentWorkspace = $("<div class='fixInnerWorkspace'></div>").append(world.clone());
                this.currentWorkspace.addClass('future');
                this.currentWorld = $(this.currentWorkspace).find('#world');

                this.fixWorkspace =  $('<div class=fixWorkspace></div>').append("<div class='fixWorld'></div>");
                this.fixWorkspace.find('.fixWorld').append(this.prevWorkspace);
                this.fixWorkspace.find('.fixWorld').append(this.currentWorkspace);

                $(this.fixWorkspace).insertBefore('#showWorkspace');
                this.resize();
            },

            componentToHex : function(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            },

            rgbToHex : function(r, g, b) {
                return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
            },

            hexToRgb : function(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }
        }) ;



        return showWorkspace;
    }) ;