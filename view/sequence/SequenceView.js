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

            initialize : function()
            {
                this.model = this.options.model;

                this.cameraModule = this.options.cameraModule;
                this.contentsCollection = this.options.contentsCollection;
                this.sequenceCollection = this.options.sequenceCollection;
                this.eventBind();
            },


            events : {
                "mousedown" : "objectSelect",
                "remove" : "objectRemove"
            },

            eventBind : function()
            {
                var sequenceCollection = this.sequenceCollection;
                var this_ = this;

                $(this.el).dblclick(function(){
                    new SequenceDialogView({
                        'model' : this_.model,
                        'sequenceCollection' : sequenceCollection});
                });

                $(this.el).click(function(){
                    console.log("this_.model.get('quaternion')",this_.model.get('quaternion'));
                    this_.cameraModule.getCamera().lookFacade( this_.model.get('quaternion') );
                    this_.cameraModule.getCamera().zoomFacade( this_.model.get('zoom') );
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

            render : function()
            {
                var li = $("<li></li>");
                li.append($(this.el));

                $(this.el).append("<div class='sequence_view' data-id='"+this.model.cid+"'><div class='sequence_view_world'></div></div>");

                console.log('size',this.model.get('width'),this.model.get('height'));
                var scale = 0.18;


                $(this.el).css({

                    'padding' : '0px',
                    '-webkit-transform-origin' : '0% 0%',
                    '-webkit-transform': 'scale('+scale+')'

                });

                $('#sequenceArrayContainer').append(li);
                $(li).css('height','140px');

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

                var wrapWidth = parseFloat($(li).css('width'));
                var wrapHeight = parseFloat($(li).css('height'));

                var contentWidth = parseFloat(this.model.get('width'));
                var contentHeight = parseFloat(this.model.get('height'));

                var marginLeft = (wrapWidth-contentWidth*scale)/2;
                var marginTop = (wrapHeight-contentHeight*scale)/2;

                console.log('wrapSize',wrapWidth,wrapHeight);
                console.log('margin',marginLeft,marginTop)


                $(this.el).css({
                    'width' : contentWidth,
                    'height' : contentHeight,
                    'marginLeft' : marginLeft,
                    'marginTop' : marginTop
                });

                return this;
            }



    });

        return sequenceView;

});
