define(['jquery','underscore','backbone'],function($,_,Backbone){

    var abstractCommandModel = Backbone.Model.extend({
        defaults:{
            type :'abstract',
            name : '',
            target : null,
            executeFunc : function(){},
            undoFunc : function(){}
        },

        execute : function(){
            this.get('executeFunc')();
            console.log('exectue ' + this.get('type'));
        },

        undo : function()
        {
            this.get('undoFunc')();
            console.log('undo ' + this.get('name'));
        }
    });

    return abstractCommandModel;
});