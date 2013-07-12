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
             ObjectView,TextView,ImageView,VideoView,FrameView,SequenceView){

        var sequenceColletion = Backbone.Collection.extend({

            model:SequenceModel,

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

           setContentsCollection : function(contentsCollection_)
           {
               this.contentsCollection = contentsCollection_;
           },

           setSelected : function(model){

           },

           getSelected : function()
           {

           },

           addFunc : function(model)
           {
                this.views[model.cid] = new SequenceView({model: model,
                                                            id:'view_'+model.cid,
                                                            'contentsCollection' : this.contentsCollection,
                                                            'cameraModule' : this.cameraModule}).render();


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

        return sequenceColletion;

    }
);