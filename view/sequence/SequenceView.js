define(['jquery','underscore','backbone',
        'view/sequence/SequenceDialogView',
        'view/contents/ObjectView',
        'view/contents/TextView',
        'view/contents/ImageView',
        'view/contents/VideoView',
        'view/contents/FrameView',
        'view/contents/FrameView',
        'ObjectController'],
    function($,_,Backbone,
             SequenceDialogView,
             ObjectView,TextView,ImageView,VideoView,FrameView){

        var sequenceView = Backbone.View.extend({

            cameraModule : null,
            contentsCollection : null,
            sequenceCollection : null,
            views : [],
            li : null,
            indexView : null,

            initialize : function()
            {
                this.model = this.options.model;

                this.cameraModule = this.options.cameraModule;
                this.contentsCollection = this.options.contentsCollection;
                this.sequenceCollection = this.options.sequenceCollection;
                this.model.bind('change',this.updateView,this);
            },

            events : {
                "mousedown" : "objectSelect",
                "remove" : "objectRemove"
            },

            eventBind : function()
            {


                var sequenceCollection = this.sequenceCollection;
                var this_ = this;

                $(this.li).dblclick(function(){
                    new SequenceDialogView({
                        'model' : this_.model,
                        'sequenceCollection' : sequenceCollection});

                }).mousedown(function(e){

                    if( !e.ctrlKey ){
                        var qo = this_.model.get('quaternion');
                        var zo = this_.model.get('zoom');
                        this_.cameraModule.getCamera().lookFacade( quaternion( qo.x, qo.y, qo.z, qo.w) );
                        this_.cameraModule.getCamera().zoomFacade( vector3( zo.x, zo.y, zo.z) );

                        //flush multi selected model
                        this_.sequenceCollection.setSelected( this_.model );
                    }

                });


                this.contentsCollection.bind('remove',function(model){

                    if(this_.views && this_.views[model.cid])
                    {
                        this_.views[model.cid].remove(model);
                        console.log('this_.views',this_.views,model.cid);

                        var contentsArray = this_.model.get('contents');
                        for(var i in contentsArray)
                        {
                            if(contentsArray[i] == model.cid)
                            {
                                contentsArray.splice(i,1);
                                console.log('contentsArray',contentsArray);
                            }
                        }
                        this_.model.set('contents',contentsArray);
                        this_.updateView();
                    }

                });
            },

            objectSelect : function(e)
            {

                if(e.ctrlKey)
                {
                    this.model.collection.addSelected(this.model);
                }
                else
                {
                    this.model.collection.setSelected(this.model);
                }
            },

            objectRemove : function()
            {
                $(this.el).parent().remove();
            },

            objectCapture : function(){
                var contents = this.model.get('contents');

                for(var i in this.model.collection.getContentsCollection().models)
                {
                    var model = this.model.collection.getContentsCollection().models[i];
                    if(model.isCurrentScreen())
                    {
                        console.log('currentScreen',model)
                        contents[model.cid]=model;
                    }
                }

                this.model.set('contents',contents);

                this.refresh();
            },


            refresh : function()
            {
                var this_ = this;
                var newViews = new Array();

                for(var i in this.views)
                {
                    $(this.views[i].el).remove();
                }

                this.views = newViews;


                var world = $(this.el).find('.sequence_view').find('.sequence_view_world');

                var contents = this.model.get('contents');

                for(var i in contents)
                {

                    var model = this.contentsCollection.getByCid(i);

                    if(!model)
                    {
                        return;
                    }

                    if(model.get('type') == 'text')
                    {
                        this.views[model.cid] = new TextView({model: model,id:'sequence_'+this.model.cid+'_view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world,'viewType' : 'sequence' }).render();

                        this.views[model.cid].model.bind('change',function(model,key){
                           console.log('key',key);
                           if(key.changes['content'])
                           {
                               this_.views[model.cid].contentRefresh();
                           }
                        });
                    }
                    else if(model.get('type') == 'image')
                    {
                        this.views[model.cid] = new ImageView({model: model,id:'sequence_'+this.model.cid+'_view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world,'viewType' : 'sequence' }).render();
                    }
                    else if(model.get('type') == 'frame')
                    {
                        this.views[model.cid] = new FrameView({model: model,id:'sequence_'+this.model.cid+'_view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world,'viewType' : 'sequence' }).render();
                    }
                    else
                    {
                        this.views[model.cid] = new ObjectView({model: model,id:'sequence_'+this.model.cid+'_view_'+model.cid, 'cameraModule' : this.cameraModule, 'world' : world,'viewType' : 'sequence'}).render();
                    }
                }
            },

            render : function()
            {
                var index = this.sequenceCollection .length;

                this.model.set({
                    'slideNumber': index
                });

                this.li = $("<li id = " +this.model.cid+ "></li>");
                var indexView = $("<div class='number_view'>"+index+"</div>");

                this.li.css({

                    padding: '0px',
                    margin: '2px',
                    background : 'rgba(255,255,255,0.1)',
                    webkitBorderRadius : '3px'
                })
                indexView.css({

                    top : '0px',
                    left : '0px',
                    color: '#ffffff'
                });


                this.li.append( indexView );
                this.li.append( $(this.el) );


                $(this.el).append("<div class='sequence_view' data-id='"+this.model.cid+"'><div class='sequence_view_world'></div></div>");


                $('#sequenceArrayContainer').append(this.li);
                $(this.li).css('height','150px');

                var world = $(this.el).find('.sequence_view').find('.sequence_view_world');



                this.refresh();

                var wrapWidth = 200;
                var wrapHeight = 150;

                console.log('wrapSize',wrapWidth,wrapHeight);

                var contentWidth = parseFloat(this.model.get('width'));
                var contentHeight = parseFloat(this.model.get('height'));

                var contentAspect = contentWidth / contentHeight;
                var wrapAspect = wrapWidth / wrapHeight;
                var newHeight = 0, newWidth = 0;

                console.log('aspacet',contentAspect,wrapAspect);



                if(contentAspect > wrapAspect)
                {
                    newWidth = contentWidth;
                    newHeight = contentWidth/wrapAspect;
                }
                else
                {
                    newWidth = contentHeight*wrapAspect;
                    newHeight = contentHeight
                }

                var scaleW = wrapWidth / newWidth;//parseInt($(this_.el).css('width'));
                var scaleH = wrapHeight / newHeight;//parseInt($(this_.el).css('height'));

                console.log('scale',scaleW,scaleH);

                var scale = scaleW;

                if(scaleH < scaleW)  {
                    scale = scaleH;
                }


                $(this.el).css({
                    'position' : 'relative',
                    'padding' : '0px',
                    'width' : newWidth,
                    'height' : newHeight,
                    'top' : '-16px',
                    '-webkit-transform-origin' : '0% 0%',
                    '-webkit-transform': 'scale('+scale+')'
                });

                var matrix3d = this.model.get('matrix3d');

                var left = parseFloat((contentWidth - newWidth )/2);
                var top = parseFloat((contentHeight - newHeight)/2);

                console.debug( 'left top', left, top)

                matrix3d = this.cameraModule.getCamera().getRevisedMatrixQuery(left,-top,matrix3d);

                world.css({
                    webkitTransform: 'matrix3d('+matrix3d+')'
                });


                this.updateView();
                this.eventBind();

                this.objectCapture();

                return this;
            },


            updateView : function()
            {

                var color = this.model.get('slideBackgroundColor');
                var rgb = this.hexToRgb(color);

                var r_ = Math.abs(rgb.r+57)%255;
                var g_ = Math.abs(rgb.g+57)%255;
                var b_ = Math.abs(rgb.b+57)%255;

                var secondColor = this.rgbToHex(r_,g_,b_);

                var background = '-webkit-radial-gradient(center, circle cover,'+secondColor+' 0%, '+color+' 100%)'

                $(this.el).find('.sequence_view').css({
                    'background' : background
                });


                if( this.li )
                    $(this.li).find('.number_view').text( this.model.get('slideNumber') );

                if( this.model.get('selected') ){
                    console.debug( this.model.get('activeColor'));
                    $(this.li).css({
                        background : this.model.get('activeColor')
                    });

                }else{
                    $(this.li).css({
                        background : this.model.get('inactiveColor')
                    });

                }

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




    });

        return sequenceView;

});
