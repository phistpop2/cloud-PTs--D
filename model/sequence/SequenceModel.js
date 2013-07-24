define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var ObjectModel = Backbone.Model.extend({

        defaults:{
            matrix3d :'',
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
            if(!this.get('models'))
            {
                this.set('models',new Array());
            }
            console.debug( this.models );
        },
        set : function(key,value)
        {
            Backbone.Model.prototype.set.apply(this,arguments);
        }

    });

    return ObjectModel;
});