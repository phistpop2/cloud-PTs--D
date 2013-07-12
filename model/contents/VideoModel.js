define(['jquery','underscore','backbone',
            'model/contents/ObjectModel']
    ,function($,_,Backbone,ObjectModel){

    var videoModel = ObjectModel.extend({
          initialize : function(option)
          {
              var videoType = 'mp4';
              var src = '';
              console.log(option);
              if(option)
              {
                  if(option.videoType)      //must define!!!
                  {
                        videoType = option.videoType;
                  }
                  if(option.src)
                  {
                      src = option.src;

                  }
              }

              ObjectModel.prototype.initialize.call(this);
              this.set('type','video');
              this.set('src',src);
              this.set('videoType',videoType);
          }

    });

    return videoModel;
});