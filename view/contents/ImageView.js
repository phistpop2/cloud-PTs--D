define(['jquery','underscore','backbone',
          'view/contents/ObjectView'],
    function($,_,Backbone,ObjectView){
        var imageView = ObjectView.extend({

            initialize : function(){
                ObjectView.prototype.initialize.call(this);
            },

            render : function()
            {
                ObjectView.prototype.render.call(this);

                var this_ = this;
                var img = new Image();

                var url = this.model.get('src');
                var objectWrap = $(this.el).find('.objectWrap');

                var model = this.model;

                img.onload = function(){
                    var item = $('<div>');

                    var width = this.width;
                    var height = this.height;

                    var backgroundImageProp = "url("+url+")";


                    if(this_.viewType=='workspace')
                    {
                        var workspaceWidth = parseInt($('#workSpace').css('width'));
                        workspaceWidth = parseFloat(workspaceWidth/3);

                        var workspaceHeight = parseInt($('#workSpace').css('height'));
                        workspaceHeight = parseFloat(workspaceHeight/3);

                        if( (width > workspaceWidth) || (height > workspaceHeight) )
                        {
                            width = workspaceWidth;
                            height = workspaceHeight;
                        }

                        console.log('size',workspaceHeight,workspaceWidth,height,width);

                        model.attributes.width = width;
                        model.attributes.height = height;
                    }
                    else
                    {
                        width = model.get('width');
                        height = model.get('height');
                    }

                    objectWrap.css({
                        'width': width,
                        'height':  height
                    });

                    item.css({
                        'position' : 'absolute',
                        'background' : 'transparent',
                        'background-image': backgroundImageProp,
                        'background-size' : '100% 100%',
                        'height': '100%',
                        'width': '100%'
                    });

                    objectWrap.append(item);


                    this_.initPosition();
                    this_.updateView();


                }

                img.src = url;

                return this;
            }

        });

        return imageView;
    });