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
                $(window).resize(this.resize);

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

            show : function(page)
            {
                var cameraModule = this.cameraModule;
                var showModel = this.showCollection.models[page];
                var matrix3d = showModel.get('matrix3d');
                var background = showModel.get('slideBackgroundColor');
                var slideChangeStyle = showModel.get('slideChangeStyle');

                var moveDuration = showModel.get('moveDuration');
                var backgroundDuration = 0;
                var slideBackgroundAction = showModel.get('slideBackgroundAction');
                var world = $('#showWorkspace').find('#world');

                if(slideChangeStyle=='default')
                {
                    this.fixWorkspace.hide();
                    var left = parseFloat((parseInt($('#showWorkspace').css('width')) - 1024)/2);
                    var top = parseFloat((parseInt($('#showWorkspace').css('height')) - 768)/2);

                    console.log('matrix3d',matrix3d);
                    matrix3d = cameraModule.getCamera().getRevisedMatrixQuery(left,top,matrix3d);
                   console.log('matrix3d',matrix3d);


                    world.css({
                        webkitTransform: 'matrix3d('+matrix3d+')',
                        transitionDuration:  moveDuration+"ms",
                        '-webkit-animation-timing-function' : 'linear'
                    });





                }
                else        //fixed style
                {
                    var this_ = this;
                    $('#showWorkspace').hide();
                    this.fixWorkspace.show();

                    this.fixWorkspace.addClass(slideChangeStyle);
                    this.prevWorkspace.css('transitionDuration',moveDuration+"ms");

                    this.prevWorld.css('webkitTransform',world[0].style['-webkit-transform']);

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



                        this_.fixWorkspace.hide();
                        $('#showWorkspace').show();
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

                    $('#mainLayout').css({
                        background : background
                    });
                }


            },

            resize : function()
            {
                console.log('resize');
                var this_ = this;
                var scaleW = window.innerWidth / 1024;//parseInt($(this_.el).css('width'));
                var scaleH = window.innerHeight / 768;//parseInt($(this_.el).css('height'));

                var scale = scaleW;

                if(scaleH < scaleW)  {
                    scale = scaleH;
                }

                var originAspect = 1024/768;
                var currentAspect = window.innerWidth / window.innerHeight;
                var newHeight = 0, newWidth = 0;

                console.log('aspacet',originAspect,currentAspect);
                if(originAspect > currentAspect)
                {
                    newWidth = 1024;
                    newHeight = 1024/currentAspect;
                }
                else
                {
                    newWidth = 768*currentAspect;
                    newHeight = 768
                }

                $('#showWorkspace').css({
                   'width' : newWidth,
                    'height' : newHeight
                });


                $('#showWorkspace').css({
                    '-webkit-transform' : 'scale('+scale+')',
                    '-webkit-transform-origin' : '0% 0%'
                });


                var workspaceWidth = parseFloat($('#showWorkspace').css('width'))*scale;
                var workspaceHeight = parseFloat($('#showWorkspace').css('height'))*scale;
                var marginLeft =   parseFloat((window.innerWidth-workspaceWidth)/2);
                var marginTop =   parseFloat((window.innerHeight-workspaceHeight)/2);

                var cameraModule = this.cameraModule;

                var showModel = this.showCollection.models[this.currentShowPage];
                var matrix3d = showModel.get('matrix3d');


                var left = parseFloat((parseInt($('#showWorkspace').css('width')) - 1024)/2);
                var top = parseFloat((parseInt($('#showWorkspace').css('height')) - 768)/2);



                console.log('matrix3d',matrix3d);
                matrix3d = cameraModule.getCamera().getRevisedMatrixQuery(left,top,matrix3d);
                console.log('matrix3d',matrix3d);

                var world = $('#showWorkspace').find('#world');
                world.css({
                    webkitTransform: 'matrix3d('+matrix3d+')',
                    transitionDuration: '200ms',
                    '-webkit-animation-timing-function' : 'linear'
                });

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
            }
        }) ;



        return showWorkspace;
    }) ;