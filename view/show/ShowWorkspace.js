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
                    world.css({
                        webkitTransform: 'matrix3d('+matrix3d+')',
                        transitionDuration:  moveDuration+"ms",
                        '-webkit-animation-timing-function' : 'linear'
                    });

                }
                else        //fixed style
                {
                    $('#showWorkspace').hide();
                    $('.fixWorkspace').each(function(){
                        $(this).remove();
                    });

                    var prevWorkspace = $("<div class='fixInnerWorkspace'></div>").append(world.clone());
                    prevWorkspace.css('transitionDuration',moveDuration+"ms");

                    world.css({
                        webkitTransform: 'matrix3d('+matrix3d+')',
                        transitionDuration:  "0ms",
                        '-webkit-animation-timing-function' : 'linear'
                    });

                    var currentWorkspace = $("<div class='fixInnerWorkspace'></div>").append(world.clone());
                    currentWorkspace.addClass('future');
                    currentWorkspace.css('transitionDuration',moveDuration+"ms");

                    var fixWorkspace = $('<div class=fixWorkspace></div>').append("<div class='fixWorld "+slideChangeStyle+"'></div>");
                    fixWorkspace.find('.fixWorld').append(prevWorkspace);
                    fixWorkspace.find('.fixWorld').append(currentWorkspace);

                    $(fixWorkspace).insertBefore('#showWorkspace');
                    $('#showWorkspace').hide();

                    prevWorkspace.addClass('past');
                    currentWorkspace.removeClass('future');


                    $(currentWorkspace).bind('webkitTransitionEnd',function(){

                        $('.fixWorkspace').each(function(){
                            $(this).remove();
                        });
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
                var this_ = this;
                var scaleW = window.innerWidth / parseInt($(this_.el).css('width'));
                var scaleH = window.innerHeight / parseInt($(this_.el).css('height'));

                var scale = scaleW;

                if(scaleH < scaleW)  {
                    scale = scaleH;
                }

                $(this_.el).css({
                    '-webkit-transform' : 'scale('+scale+')',
                    '-webkit-transform-origin' : '0% 0%'
                });



            },

            render : function()
            {
                this.resize();
            }
        }) ;



        return showWorkspace;
    }) ;