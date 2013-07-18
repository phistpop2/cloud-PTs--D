define(['underscore','backbone',
    'model/contents/ObjectModel',
    'view/contents/ObjectView',
    'view/contents/TextView',
    'view/contents/ImageView',
    'view/contents/VideoView',
    'view/contents/FrameView',

    'model/contents/TextModel',
    'model/contents/ImageModel',
    'model/contents/VideoModel',
    'model/contents/FrameModel',

    'model/command/RemoveCommandModel'],
    function(_,Backbone,ObjectModel,
             ObjectView,TextView,ImageView,VideoView,FrameView){

        var ContentsColletion = Backbone.Collection.extend({

            model:ObjectModel,

            views : [],

            selected : null,

            history : [],         //undo stack
            redoHistory : [],
            cameraModule : null,

           initialize : function()
           {
               _.bindAll(this);
               this.bind('add',this.addFunc);

           },

           setCameraModule : function(cameraModule_)
           {
               this.cameraModule = cameraModule_;
           },

           setSelected : function(model){
               if(model)
               {
                   this.selected = model;
                   this.trigger('selected');
               }
               else
               {
                   this.selected = null;
                   this.trigger('unSelected');
               }
           },

           getSelected : function()
           {
                return this.selected;
           },

           addFunc : function(model)
           {

               var world = $('#workSpace').find('#world');
               model.initController(this.cameraModule.getCamera());

               if(model.get('type') == 'text')
               {
                   this.views[model.cid] = new TextView({model: model,id:'view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world }).render();
               }
               else if(model.get('type') == 'image')
               {
                    this.views[model.cid] = new ImageView({model: model,id:'view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world }).render();
               }
               else if(model.get('type') == 'video')
               {
                   this.views[model.cid] = new VideoView({model: model,id:'view_'+model.cid, 'world' : world }).render();
               }
               else if(model.get('type') == 'frame')
               {
                   this.views[model.cid] = new FrameView({model: model,id:'view_'+model.cid,'cameraModule' : this.cameraModule, 'world' : world }).render();
               }
               else
               {
                   this.views[model.cid] = new ObjectView({model: model,id:'view_'+model.cid, 'cameraModule' : this.cameraModule, 'world' : world}).render();
               }


           },

           addToHistory : function(historyData)
           {
                this.history.push(historyData);
           },

           redo : function()
           {
               var historyItem = this.redoHistory.pop();

               if(historyItem)
               {
                   this.history.push(historyItem);
                   var type = historyItem.type;

                   if(type=='add')
                   {

                   }else if(type=='remove')
                   {

                   }else if(type=='obj')
                   {
                       var model = historyItem.model;
                       var key = historyItem.key;
                       var value = historyItem.value;

                       if(typeof(key)=='string')
                       {
                           model.set(key,value);
                       }
                       else
                       {
                           var setData ={}
                           if(typeof(value)=='object')
                           {
                               for(var i = 0 ; i < key.length ; i++)
                               {
                                   setData[key[i]] = value[i];

                               }
                           }
                           else
                           {
                               for(var i = 0 ; i < key.length ; i++)
                               {
                                   setData[key[i]] = value;
                               }
                           }

                           model.set(setData);
                       }



                       this.trigger('recoverEvent',{
                           'model' : model,
                           'key' : key,
                           'value' : value
                       });
                   }
               }
           },

           undo : function()
           {
                var historyItem = this.history.pop();

                if(historyItem)
                {
                    this.redoHistory.push(historyItem);
                    var type = historyItem.type;

                    if(type=='add')
                    {

                    }else if(type=='remove')
                    {

                    }else if(type=='obj')
                    {

                        var model = historyItem.model;
                        var key = historyItem.key;
                        var value = historyItem.prevValue;

                        if(typeof(key)=='string')
                        {
                            model.set(key,value);
                        }
                        else
                        {
                            var setData ={}

                            if(typeof(value)=='object')
                            {
                                for(var i = 0 ; i < key.length ; i++)
                                {
                                    setData[key[i]] = value[i];

                                }
                            }
                            else
                            {
                                for(var i = 0 ; i < key.length ; i++)
                                {
                                    setData[key[i]] = value;
                                }
                            }

                            model.set(setData);
                        }

                        this.trigger('recoverEvent',{
                            'model' : model,
                            'key' : key,
                            'value' : value
                        });
                    }

                }
           }
        });

        return ContentsColletion;

    }
);