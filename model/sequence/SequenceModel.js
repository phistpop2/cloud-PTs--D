define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var ObjectModel = Backbone.Model.extend({

        defaults:{
            matrix3d :'',
            moveAction : '',
            moveDuration : 700
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