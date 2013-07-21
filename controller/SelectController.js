define(['jquery','underscore','backbone',
    'collection/ContentsCollection',
    'collection/SequenceCollection'],

    function($,_,Backbone){
        var selectController = Backbone.Router.extend({

            listeners :  [],
            selectedObjects : null,

            initialize : function()
            {
                _.bindAll(this);
                this.listeners = new Array();
            },

            addCollection:function(key,listener)
            {
                this.listeners[key] = listener;
            },

            getSelectedObjects : function()
            {
                return this.selectedObjects;
            },

            setSelectedObjects : function(selectedObjects)
            {
                this.selectedObjects = selectedObjects;

                this.broadcastSelectChange();


            },

            addSelectedObjects : function(selectedObject)
            {
                var push = true;
                if(!this.selectedObjects)
                {
                    this.selectedObjects = new Array();
                }

                for(var i in this.selectedObjects)
                {
                    var prevSelectedObject = this.selectedObjects[i];
                    if( (prevSelectedObject.type == selectedObject.type) &&
                        (prevSelectedObject.data == selectedObject.data) )
                    {
                        push = false;
                        this.selectedObjects.splice(i,1);
                    }
                }

                if(push)
                {
                    this.selectedObjects.push(selectedObject);

                }

                console.log('selectedObejcts',this.selectedObjects)
                this.broadcastSelectChange();
            },

            broadcastSelectChange : function()
            {
                for(var i in this.listeners)
                {
                    var listener = this.listeners[i];
                    listener.trigger('changeSelect');
                }
            }
        });

        return selectController;


    });


