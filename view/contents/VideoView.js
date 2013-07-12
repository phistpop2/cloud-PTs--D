define(['jquery','underscore','backbone',
          'view/contents/ObjectView'],
    function($,_,Backbone,ObjectView){
        var videoView = ObjectView.extend({
            initialize : function(){
                ObjectView.prototype.initialize.call(this);
            },

            render : function()
            {
                if(ObjectView.prototype.render.call(this))
                {
                    var videoType = this.model.get('videoType');
                    var src = this.model.get('src');

                    var item = $("<video controls>");
                    if(videoType =='web')
                    {
                        item = $("<iframe type='text/html' style='background : transparent'>");
                        item.attr('src',src);
                    }

                    item.css({
                        'padding' : '10px',
                        'height': '100%',
                        'width': '100%'
                    });

                    $(this.el).find('.objectWrap').append(item);



                    this.updateView();
                }

                return this;
            }
        });

        return videoView;
    });