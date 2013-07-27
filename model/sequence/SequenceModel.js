define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var ObjectModel = Backbone.Model.extend({

        defaults:{
            matrix3d :'',
            width : '',
            height : '',
            quaternion:'',
            zoom:'',

            slideNumber: '',
            slideBackgroundColor : '',
            slideBackgroundAction : 'none',

            moveDuration : 400,
            slideChangeStyle : 'default',

            selected: false,
            activeColor : 'rgba(204,255,204,0.8)',
            inactiveColor : 'rgba(255,255,255,0.1)'
        },


        controller : null,

        initialize : function()
        {
            _.bindAll(this);
            if(!this.get('contents'))
            {
                this.set('contents',new Array());
            }

        },

        set : function()
        {
            Backbone.Model.prototype.set.apply(this,arguments);
            if(this.collection && this.collection.views[this.cid])
            {
                var view =this.collection.views[this.cid];
                view.updateView();
            }
        },

        setSelected : function()
        {
            this.set('selected',true);
            this.collection.setSelected(this);
        },

        setUnSelected : function()
        {
            this.set('selected',false);
        },

        addSelectedToCollection : function()
        {
            this.set('selected',true);
            this.collection.addSelected(this);
        },

        isSelected : function()
        {
            return this.get('selected');
        },


        selfRemove : function()
        {
            if(this.collection)
            {
                this.collection.remove(this);
            }
        }

    });

    return ObjectModel;
});