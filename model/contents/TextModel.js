define(['jquery','underscore','backbone',
            'model/contents/ObjectModel']
    ,function($,_,Backbone,ObjectModel){

    var textModel = ObjectModel.extend({
          initialize : function(option)
          {
              ObjectModel.prototype.initialize.call(this);
              this.set('type','text');
          }

    });

    return textModel;
});