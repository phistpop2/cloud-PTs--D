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

                ObjectView.prototype.render.call(this)
                var objectWrap = $(this.el).find('.objectWrap');
                var editbox = null;

                console.log('this.viewType',this.viewType);

                if(this.viewType == 'workspace')
                {

                    editbox = $("<div class='textEditBox' >");
                    objectWrap.append(editbox);
                    this.editor = $(this.el).find('.objectWrap').find('.textEditBox').enableEdit();
                    editbox.html(this_.model.get('content'));

                    this.initPosition();
                    (editbox).trigger('refresh');


                    editbox.bind('allEventRefresh',function()
                    {
                        var content = $(this_.el).html();
                        this_.model.set('content',content);
                    });

                    this.eventBind();

                }
                else
                {
                    editbox = this.model.get('content');
                    editbox = $(editbox).attr('contentEditable',false);
                    editbox.removeClass('textEditBox');
                    $(this.el).find('.objectWrap').append(editbox);


                }







                this.updateView();

                return this;
            },

            updateView : function()
            {
                ObjectView.prototype.updateView.call(this);

            }



        });

        return textView;
    });