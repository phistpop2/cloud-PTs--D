define(['jquery','underscore','backbone',
          'view/contents/ObjectView'],
    function($,_,Backbone,ObjectView){

        var frameView = ObjectView.extend({

            initialize : function(){
                ObjectView.prototype.initialize.call(this);
            },

            render : function()
            {

                if(ObjectView.prototype.render.call(this))
                {

                    var model = this.model;
                    var width = model.get('width');
                    var height = model.get('height');

                    var translateX = parseFloat(model.get('translateX'));
                    var translateY = parseFloat(model.get('translateY'));
                    var translateZ = parseFloat(model.get('translateZ'));

                    var objectWrap = $(this.el).find('.objectWrap');

                    objectWrap.css({
                        'width': width,
                        'height':  height,
                        'padding' : '0px',
                        'margin' : '0px'
                    });

                    this.updateView();

                }

                return this;
            }

        });

        return frameView;
    });