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
                            height = workspaceWidth * (height/width);
                            width = workspaceWidth;

                        }

                        console.log('size',width,height);


                        model.attributes.width = width;
                        model.attributes.height = height;

                        var load = this_.model.get('load');
                        console.log('load',load);
                        if(load)
                        {
                            this_.model.attributes.load=false;
                        }
                        else
                        {
                            this_.initPosition();
                        }
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





                    this_.updateView();


                }

                img.src = url;

                return this;
            }

        });

        return imageView;
    });