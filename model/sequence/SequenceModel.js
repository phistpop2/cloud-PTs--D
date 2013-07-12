define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var ObjectModel = Backbone.Model.extend({

        defaults:{
            matrix3d :''
        },

        controller : null,

        initialize : function()
        {
            _.bindAll(this);
        }


    });

    return ObjectModel;
});