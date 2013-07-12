define(['jquery','underscore','backbone',
            'model/contents/ObjectModel']
    ,function($,_,Backbone,ObjectModel){

    var imageModel = ObjectModel.extend({
          initialize : function(option)
          {
              ObjectModel.prototype.initialize.call(this);
              this.set('type','image');
              var src = 'aaa.jpg'

              if(option)
              {
                  if(option.src){
                      src = this.get('src');
                  }
              }

              this.set('src',src);


          }

    });

    return imageModel;
});