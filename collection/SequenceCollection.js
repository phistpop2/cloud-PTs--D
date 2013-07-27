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
            model_indexes: [],

            selected : null,

            history : [],         //undo stack
            redoHistory : [],
            cameraModule : null,

           initialize : function()
           {
               _.bindAll(this);
               this.bind('add',this.addFunc);
               this.bind('remove',this.removeFunc);
               this.eventBind();
           },

            eventBind : function()
            {
                var this_ = this;
                this.bind('changeSelect',function(){

                    for(var i in this_.models)
                    {
                        var model = this_.models[i];
                        if(model.isSelected())
                        {
                            model.set('selected',false);
                        }
                    }

                    var selectedObjects = this_.selectorController.getSelectedObjects();
                    console.log('selectedObjects',selectedObjects);
                    for(var i in selectedObjects)
                    {
                        var selectedObject = selectedObjects[i];

                        if(selectedObject.type=='sequence')
                        {
                            var model = this_.getByCid(selectedObject.data);
                            model.set('selected',true);
                        }
                    }


                });

            },

            extractCurrentWorkToJSON : function(){
                var saveDatas = '';



                return saveDatas;
            },

            removeFunc : function(model)
            {
                this.views[model.cid].remove(model);

            },

            addSelected : function(model)
            {
                this.selected = model;

                var selectedObject = {
                    'type' : 'sequence',
                    'data' : this.selected.cid
                };

                this.selectorController.addSelectedObjects(selectedObject);
                this.trigger('selected');
            },

            setSelected : function(model){
                if( this.selected != null ){
                    this.selected.set({
                        selected : false
                    });
                    this.selected = null;
                }

                if(model)
                {
                    var selectedObjects = [];
                    var selectedObject = {
                        'type' : 'sequence',
                        'data' : model.cid
                    };
                    selectedObjects.push(selectedObject);

                    this.selectorController.setSelectedObjects(selectedObjects);
                }
                else
                {
                    this.selected = null;

                    this.selectorController.setSelectedObjects(null);

                }

                var selectedObjects = this.selectorController.getSelectedObjects();

                for(var i in this.models)
                {
                    var selected = false;
                    var model_ = this.models[i];
                    for(var j in selectedObjects)
                    {

                        if( (selectedObjects[j].type=='sequence')&&
                            (selectedObjects[j].data==model_.cid)){
                            selected = true;
                        }
                    }


                    model_.selected = selected;


                }
            },


            setSelectController : function(selectController)
           {
               this.selectorController = selectController;
               this.selectorController.addCollection('sequenceCollection',this);
           },

           setCameraModule : function(cameraModule_)
           {
               this.cameraModule = cameraModule_;
           },

           setContentsCollection : function(contentsCollection_)
           {
               this.contentsCollection = contentsCollection_;
           },

           getContentsCollection : function()
           {
                return this.contentsCollection;
           },

           addFunc : function(model)
           {
               this.model_indexes[model.cid] = this.models.length - 1;
               console.debug( this.models );
                this.views[model.cid] = new SequenceView({model: model,
                                                            id:'view_'+model.cid,
                                                            'contentsCollection' : this.contentsCollection,
                                                            'sequenceCollection' : this,
                                                            'cameraModule' : this.cameraModule}).render();

           },


           addToHistory : function(historyData)
           {
                this.history.push(historyData);
           },

           extractCollectionToJson : function()
           {
                var this_ = this;
                var results = {};

                var sequenceDatas = [];

                var sequenceViewEls = $('#sequenceArrayContainer').find('.sequence_view');
                var sequenceIdArray = [];


                _.each(sequenceViewEls, function(sequenceView){
                   var id = $(sequenceView).data('id');
                    sequenceIdArray.push(id);
                });

               _.each(sequenceIdArray,function(id){
                    var model = this_.getByCid(id);
                   console.log(model);
                    var properties = this_.copyObject(model.attributes);
                    var contentIds = new Array();
                    for(var contentId in model.attributes.contents)
                    {
                        contentIds.push(contentId);
                    }

                   console.log('contentIds',contentIds);

                    properties.contents = contentIds;
                    properties.cid = id;
                    sequenceDatas.push(properties);
                });

                var contentModels = this.contentsCollection.models;
                var contentDatas = [];

               _.each(contentModels,function(model){
                    var properties = this_.copyObject(model.attributes);
                    properties.cid = model.cid;
                    contentDatas.push(properties);
                });

                results.sequenceDatas = sequenceDatas;
                results.contentDatas = contentDatas;
                console.log(results);
                return results;
           },

            copyObject : function(obj) {
                var newObj = {};
                for (var key in obj) {
                    //copy all the fields
                    if( Object.prototype.toString.call( obj[key] ) === '[object Array]' ) {
                        newObj[key] = obj[key].slice(0);
                    }
                    else
                    {
                        newObj[key] = obj[key];
                    }

                }

                return newObj;
            }


        });

        return sequenceColletion;

    }
);