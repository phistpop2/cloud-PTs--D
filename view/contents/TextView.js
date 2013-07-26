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
                var this_ = this;
                var vKey = 86;
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

                }).click(function(){
                        $(this).attr('contenteditable',true);

                }).focusout(function(){
                        $(this).attr('contenteditable',false);

                }).mousemove(function(e){
                        var contenteditable = $(this).attr('contenteditable');

                        if(contenteditable=='true')
                        {
                            return false;
                        }
                })



                $(this.el).find(".textEditBox").bind('paste',function(e)
                {
                    e = e.originalEvent;
                    var pastedText = undefined;
                    if (e.clipboardData && e.clipboardData.getData) {
                        pastedText = e.clipboardData.getData('text/plain');
                    }



                    var targetEl = null;

                    if(window.getSelection())
                    {
                        targetEl = window.getSelection().anchorNode.parentElement
                    }

                    if(targetEl)
                    {
                        $(targetEl).append(pastedText);
                        ($(this_.el).find(".textEditBox")).trigger('refresh');
                    }

                    console.log("pastedText",pastedText);

                    return false;
                });
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
                    var copyData = this.model.get('copyData');

                    if(copyData)
                    {
                        editbox = $(copyData);
                        $(this.el).find('.objectWrap').html(editbox);
                    }
                    else
                    {
                        editbox = $("<div class='textEditBox' >");
                        objectWrap.append(editbox);
                        this.editor = $(this.el).find('.objectWrap').find('.textEditBox').enableEdit();
                        editbox.html(this_.model.get('content'));

                        (editbox).trigger('refresh');

                        $(this.el).find('.objectWrap').append(editbox);
                        $(this.el).find('.lcWord').each(function(){
                            $(this).css({
                                'fontSize' : '40px'
                            })
                        });
                    }



                    editbox.bind('allEventRefresh',function()
                    {
                        var content = $(this_.el).html();
                        this_.model.set('content',content);
                    });

                    this.eventBind();

                    var content = $(this.el).find('.objectWrap').html();
                    this.model.attributes.content = content;

                    this.initPosition();
                }
                else
                {
                    editbox = this.model.get('content');
                    editbox = $(editbox).attr('contentEditable',false);
                    editbox.removeClass('textEditBox');
                    objectWrap.html(editbox);


                }






                this.updateView();

                return this;
            },

            setCaretPosition :function(ctrl, pos)
            {

                if(ctrl.setSelectionRange)
                {
                    ctrl.focus();
                    ctrl.setSelectionRange(pos,pos);
                }
                else if (ctrl.createTextRange) {
                    var range = ctrl.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            }


        });

        return textView;
    });