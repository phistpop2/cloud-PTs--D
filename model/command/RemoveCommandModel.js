define(['jquery','underscore','backbone',
         'model/command/AbstractCommandModel'
        ],function($,_,Backbone,AbstractCommandModel){

    var removeCommandModel = AbstractCommandModel.extend({
        defaults:{
            type :'remove'
        },

        execute : function()
        {
            console.log(this.contentsCollection.views);
            this.contentsCollection.views[this.newObj.cid].remove(this.newObj);

        },

        undo : function()
        {
            this.contentsCollection.add(this.newObj);
        }
    });

    return removeCommandModel;
});