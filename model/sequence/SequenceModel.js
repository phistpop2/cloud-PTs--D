define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var ObjectModel = Backbone.Model.extend({

        defaults:{
            matrix3d :'',
            translateX :'',
            translateY :'',
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