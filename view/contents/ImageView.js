define(['jquery','underscore','backbone',
          'view/contents/ObjectView'],
    function($,_,Backbone,ObjectView){
        var imageView = ObjectView.extend({

            initialize : function(){
                ObjectView.prototype.initialize.call(this);
            },

            render : function()
            {
                if(ObjectView.prototype.render.call(this)){
                    var img = new Image();

                    var url = this.model.get('src');
                    var objectWrap = $(this.el).find('.objectWrap');

                    var model = this.model;

                    img.onload = function(){
                        var item = $('<div>');
                        var width = this.width;
                        var height = this.height;

                        var backgroundImageProp = "url("+url+")";

                        item.css({
                            'position' : 'absolute',
                            'background' : 'transparent',
                            'background-image': backgroundImageProp,
                            'background-size' : '100% 100%',
                            'height': '100%',
                            'width': '100%'
                        });

                        objectWrap.css({
                            'width': width,
                            'height':  height
                        });

                        model.set('width',width);
                        model.set('height',height);

                        objectWrap.append(item);
                    }

                    img.src = url;
                }

                return this;
            }

        });

        return imageView;
    });