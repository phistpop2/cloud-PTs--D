define(['jquery','underscore','backbone',
         'model/command/AbstractCommandModel'
        ],function($,_,Backbone,AbstractCommandModel){

    var cutCommandModel = AbstractCommandModel.extend({
        defaults:{
            type :'cut',
            target : null
        }
    });

    return cutCommandModel;
});