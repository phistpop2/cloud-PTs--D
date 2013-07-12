define(['jquery','underscore','backbone',
            'model/contents/ObjectModel']
    ,function($,_,Backbone,ObjectModel){

    var frameModel = ObjectModel.extend({
          initialize : function(option)
          {

              ObjectModel.prototype.initialize.call(this);
              this.set('type','frame');

          }





    });

    return frameModel;
});