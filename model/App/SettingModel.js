define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var settingModel = Backbone.Model.extend({

        defaults:{
            backgroundColor : ''
        },

        controller : null,

        initialize : function()
        {
            _.bindAll(this);

        }


    });

    return settingModel;
});