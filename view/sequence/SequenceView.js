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
                this.eventBind();
            },

            eventBind : function()
            {
                var sequenceCollection = this.sequenceCollection;
                var this_ = this;

                $(this.el).dblclick(function(){
                    new SequenceDialogView({
                        'model' : this_.model,
                        'sequenceCollection' : sequenceCollection});
                }).mousedown(function(e){
                    console.debug( 'click',e );

                    if( !e.ctrlKey ){
                        this_.cameraModule.getCamera().lookFacade( this_.model.get('quaternion') );
                        this_.cameraModule.getCamera().zoomFacade( this_.model.get('zoom') );

                        //flush multi selected model
                        this_.sequenceCollection.setSelected( this_.model );
                    }
                });
            },

            render : function()
            {
                var index = this.sequenceCollection .length;
                this.model.set({
                    'slideNumber': index
                });

                this.li = $("<li id = " +this.model.cid+ "></li>");
                var indexView = $("<p class='number_view'>"+index+"</p>");
                console.debug( 'render', indexView )

                this.li.append( indexView );
                this.li.append( $(this.el) );


                this.li.css({
                    padding: '0px',
                    margin: '2px',
                    background : 'rgba(255,255,255,0.1)',
                    webkitBorderRadius : '3px'
                })
                indexView.css({
                    position: 'relative',
                    top : '8px',
                    left : '8px',
                    margin : '0px',
                    padding : '0px',
                    color: '#ffffff'
                });

                var sequenceView = $("<div class='sequence_view' data-id='"+this.model.cid+"'><div class='sequence_view_world'></div></div>");
                $(this.el).append(sequenceView);
                $(this.el).css({
                    position: 'relative',
                    top : '-14px',
                    margin : '6px',
                    marginLeft : '24px',
                    'padding' : '0px',
                    '-webkit-transform-origin' : '0% 0%',
                    '-webkit-transform': 'scale(0.15)'
                });

                $('#sequenceArrayContainer').append(this.li);
                $(this.li).css('height','128px');

                var world = $(this.el).find('.sequence_view').find('.sequence_view_world');
                var models = this.contentsCollection.models;
                var modelIdArray = this.model.get('models');

                world.css({
                    webkitTransform: 'matrix3d('+this.model.get('matrix3d')+')'
                });

                for(var i = 0 ; i < models.length ; i++)
                {
                    var model = models[i];

                    if(model.get('type') == 'text')
                    {
                        this.views[model.cid] = new TextView({model: model,id:'sequence_'+this.model.cid+'_view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world,'viewType' : 'sequence' }).render();
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

                    modelIdArray.push(model.cid);
                }

                this.model.set('models',modelIdArray);

                return this;
            },
            updateView : function(){
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
            }



    });

        return sequenceView;

});
