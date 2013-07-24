define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var ObjectModel = Backbone.Model.extend({

        defaults:{
            matrix3d :'',
            width : '',
            height : '',
            quaternion:'',
            zoom:'',

            slideBackgroundColor : '',
            slideBackgroundAction : 'none',

            moveDuration : 400,
            slideChangeStyle : 'default'
        },

        controller : null,

        initialize : function()
        {
            _.bindAll(this);
            if(!this.get('models'))
            {
                this.set('models',new Array());
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