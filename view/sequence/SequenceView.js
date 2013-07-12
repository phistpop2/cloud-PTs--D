define(['jquery','underscore','backbone',
        'view/contents/ObjectView',
        'view/contents/TextView',
        'view/contents/ImageView',
        'view/contents/VideoView',
        'view/contents/FrameView',
        'ObjectController'],
    function($,_,Backbone,
             ObjectView,TextView,ImageView,VideoView,FrameView){
        var sequenceView = Backbone.View.extend({

            cameraModule : null,
            contentsCollection : null,
            views : [],

            initialize : function()
            {
                this.model.bind('change',this.updateView,this);
                this.cameraModule = this.options.cameraModule;
                this.contentsCollection = this.options.contentsCollection;

            },

            render : function()
            {
                var li = $("<li></li>");
                li.append($(this.el));

                $(this.el).append("<div class='sequence_view'><div class='sequence_view_world'></div></div>");
                $(this.el).css({
                    'margin' : '0px',
                    'padding' : '0px',
                    '-webkit-transform-origin' : '0% 0%',
                    '-webkit-transform': 'scale(0.18)'
                });

                $('#sequenceArrayContainer').append(li);
                $(li).css('height','140px');

                var world = $(this.el).find('.sequence_view').find('.sequence_view_world');
                var models = this.contentsCollection.models;


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
                }

                return this;
            }



    });

        return sequenceView;

});
