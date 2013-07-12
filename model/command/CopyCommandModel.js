define(['jquery','underscore','backbone',
         'model/command/AbstractCommandModel'
        ],function($,_,Backbone,AbstractCommandModel){

    var copyCommandModel = AbstractCommandModel.extend({
        defaults:{
            type :'copy',
            target : null
        }
    });

    return copyCommandModel;
});