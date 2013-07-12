define(['jquery','underscore','backbone',
         'model/command/AbstractCommandModel'
        ],function($,_,Backbone,AbstractCommandModel){

    var pasteCommandModel = AbstractCommandModel.extend({
        defaults:{
            name :'paste'
        },

        execute : function()
        {
            this.contentsCollection.add(this.newObj);
        },

        undo : function()
        {
            this.contentsCollection.remove(this.newObj);
        }

    });

    return pasteCommandModel;
});