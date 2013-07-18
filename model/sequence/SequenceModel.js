define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var ObjectModel = Backbone.Model.extend({

        defaults:{
            matrix3d :'',
            quaternion:'',
            zoom:'',

            slideBackgroundColor : '',
            slideBackgroundAction : 'none',


            moveDuration : 400,
            slideChangeStyle : 'linear'
        },

        controller : null,

        initialize : function()
        {
            _.bindAll(this);
            if(!this.get('models'))
            {
                this.set('models',new Array());
            }
        }


    });

    return ObjectModel;
});