define(['underscore','backbone',

    'model/contents/ObjectModel',
    'model/sequence/SequenceModel',

    'view/contents/ObjectView',
    'view/contents/TextView',
    'view/contents/ImageView',
    'view/contents/VideoView',
    'view/contents/FrameView',
    'view/sequence/SequenceView',

    'model/contents/TextModel',
    'model/contents/ImageModel',
    'model/contents/VideoModel',
    'model/contents/FrameModel',

    'model/command/RemoveCommandModel'],
    function(_,Backbone,
             ObjectModel,SequenceModel,
             ObjectView,TextView,ImageView,VideoView,FrameView,SequenceView,
             TextModel,ImageModel){

        var showCollection = Backbone.Collection.extend({

            contentViews : [],

            selected : null,

           initialize : function()
           {
               _.bindAll(this);

           },

           setShowData : function(showData)
           {
               this.showData = showData;
               this.createAllObjectView();

           },

           getShowData : function()
           {
                return this.showData;
           },

           createAllObjectView : function()
           {
               var world = $('#showWorkspace').find('#world');
               var this_ = this;


               _.each(this.showData.sequenceDatas,function(sequence){

                   this_.add(new SequenceModel(sequence));
               });

               _.each(this.showData.contentDatas,function(content){
                    var model = null;

                    if(content.type=='text')
                    {
                        model = new TextModel(content);

                    }
                    else if(content.type == 'image')
                    {
                        model = new ImageModel(content);
                    }
                   model.cid = model.cid;

                   if(model.get('type') == 'text')
                   {
                       this_.contentViews[model.cid] = new TextView({model: model,id:'view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world, 'viewType' : 'show' }).render();
                   }
                   else if(model.get('type') == 'image')
                   {
                       this_.contentViews[model.cid] = new ImageView({model: model,id:'view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world, 'viewType' : 'show' }).render();
                   }
                   else if(model.get('type') == 'video')
                   {
                       this_.contentViews[model.cid] = new VideoView({model: model,id:'view_'+model.cid, 'world' : world, 'viewType' : 'show' }).render();
                   }
                   else if(model.get('type') == 'frame')
                   {
                       this_.contentViews[model.cid] = new FrameView({model: model,id:'view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world, 'viewType' : 'show' }).render();
                   }
                   else
                   {
                       this_.contentViews[model.cid] = new ObjectView({model: model,id:'view_'+model.cid, 'cameraModule' : this.cameraModule, 'world' : world, 'viewType' : 'show'}).render();
                   }
               });


           }

        });

        return showCollection;

    }
);