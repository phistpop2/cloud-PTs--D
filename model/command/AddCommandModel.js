define(['jquery','underscore','backbone',
         'model/command/AbstractCommandModel'
        ],function($,_,Backbone,AbstractCommandModel){

    var addCommandModel = AbstractCommandModel.extend({
        defaults:{
            type :'add',
            target : null
        }
    });

    return addCommandModel;
});