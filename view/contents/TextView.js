define(['jquery','underscore','backbone',
          'view/contents/ObjectView'],
    function($,_,Backbone,ObjectView){

        var textView = ObjectView.extend({

            editor : null,

            initialize : function(){
                ObjectView.prototype.initialize.call(this);

            },

            eventBind : function()
            {
                ObjectView.prototype.eventBind.call(this);

                $(this.el).find(".textEditBox").keydown(function(e){
                        var contenteditable = $(this).attr('contenteditable');

                        if(contenteditable=='true')
                        {
                            e.stopPropagation();
                        }
                }).keypress(function(e){
                        var contenteditable = $(this).attr('contenteditable');

                        if(contenteditable=='true')
                        {
                            e.stopPropagation();
                        }
                }).keyup(function(e){
                        var contenteditable = $(this).attr('contenteditable');

                        if(contenteditable=='true')
                        {
                            e.stopPropagation();
                        }
                }).mousemove(function(e){
                        var contenteditable = $(this).attr('contenteditable');

                        if(contenteditable=='true')
                        {
                            return false;
                        }
                })
            },

            render : function()
            {
                var this_ = this;

                if(ObjectView.prototype.render.call(this)){
                    var objectWrap = $(this.el).find('.objectWrap');

                    var editbox = $("<div class='textEditBox' >");
                    objectWrap.append(editbox);
                    editbox.html('messagehere');
                }

                this.editor = $(this.el).find('.objectWrap').find('.textEditBox').enableEdit();

                this.updateView();

                this.editor.bind('textInput',function()
                {
                    var width = $(this_.el).find('.textEditBox').css('width');
                    var height = $(this_.el).find('.textEditBox').css('height');

                    this_.model.set('width',width);
                    this_.model.set('height',height);

                });

                if(this.viewType == 'workspace')
                {
                    this.initPosition();
                }


                this.eventBind();
                return this;
            },

            updateView : function()
            {
                ObjectView.prototype.updateView.call(this);
                this.resize();
            },

            resize : function()
            {
                var width = $(this.el).find('.textEditBox').css('width');
                var height = $(this.el).find('.textEditBox').css('height');

                this.model.set('width',width);
                this.model.set('height',height);
            }

        });

        return textView;
    });