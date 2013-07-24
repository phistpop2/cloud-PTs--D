define(['jquery','underscore','backbone',
            'model/contents/ObjectModel']
    ,function($,_,Backbone,ObjectModel){

    var textModel = ObjectModel.extend({
          initialize : function(option)
          {
              ObjectModel.prototype.initialize.call(this);
              this.set('type','text');
          },

          set : function()
          {
              ObjectModel.prototype.set.apply(this,arguments);
              if(this.collection && this.collection.views[this.cid])
              {
                  var content = $((this.collection.views[this.cid]).el).find('.objectWrap').html();
                  this.attributes.content = content;
              }
          }

    });

    return textModel;
});