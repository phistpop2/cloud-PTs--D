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
                        ($(this_.el).find(".textEditBox")).trigger('refresh');
                        $(this).attr('contenteditable',false);

                }).mousemove(function(e){
                        var contenteditable = $(this).attr('contenteditable');

                        if(contenteditable=='true')
                        {
                            return false;
                        }
                })


                $(this.el).find(".textEditBox").bind('DOMSubtreeModified',function(){
                    var content = $(this_.el).find(".textEditBox").html();
                    this_.model.set('content',content);
                });

                $(this.el).find(".textEditBox .lcWord").bind('style',function(){
                    var content = $(this_.el).find(".textEditBox").html();
                    this_.model.set('content',content);
                });


                $(this.el).find(".textEditBox").bind('paste',function(e)
                {
                    e = e.originalEvent;
                    var pastedText = undefined;
                    if (e.clipboardData && e.clipboardData.getData) {
                        pastedText = e.clipboardData.getData('text/plain');
                    }



                    var targetEl = null;
                    var targetOffset = 0;

                    if(window.getSelection())
                    {
                        console.log(window.getSelection());
                        if( (window.getSelection().anchorNode))
                        {
                            if($(window.getSelection().anchorNode).hasClass('textEditBox'))
                            {
                                targetEl = window.getSelection().anchorNode;
                            }
                            else if($(window.getSelection().anchorNode.parentNode).hasClass('lcWord'))
                            {

                                targetEl = window.getSelection().anchorNode.parentNode;
                            }

                        }
                    }

                    if(targetEl)
                    {
                        if($(targetEl).hasClass('lcWord') && ($(targetEl).next().length>0))
                        {
                            $(targetEl).next().prepend(pastedText);
                        }
                        else if($(targetEl).hasClass('lcWord'))
                        {
                            $(targetEl).parent().append(pastedText);

                        }
                        else
                        {
                            console.log('herle');
                            $(targetEl).prepend(pastedText);
                        }


                    }
                    ($(this_.el).find(".textEditBox")).trigger('refresh');

                    return false;
                });
            },

            contentRefresh : function()
            {

                if(this.viewType!='workspace')
                {
                    var content = this.model.get('content');

                    $(this.el).find('.textEditBox').html(content);
                }

            },

            render : function()
            {

                var this_ = this;

                ObjectView.prototype.render.call(this)
                var objectWrap = $(this.el).find('.objectWrap');
                var editbox = null;





                if(this.viewType == 'workspace')
                {
                    var copyData = this.model.get('copyData');
                    var load = this.model.get('load');

                    if(load)
                    {
                        editbox = $("<div class='textEditBox' >");
                        objectWrap.append(editbox);
                        this.editor = $(this.el).find('.objectWrap').find('.textEditBox').enableEdit();
                        editbox.html(this_.model.get('content'));
                        objectWrap.html(editbox);



                        this.eventBind();
                        this.model.attributes.load = false;
                    }
                    else if(copyData)
                    {
                        editbox = $(copyData);
                        $(this.el).find('.objectWrap').html(editbox);

                        this.eventBind();

                        var content = $(this.el).find('.objectWrap').html();
                        this.model.attributes.content = content;

                        this.initPosition();
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

                        this.eventBind();

                        var content = $(this.el).find('.objectWrap').html();
                        this.model.attributes.content = content;

                        this.initPosition();
                    }
                    editbox.focus();


                    editbox.bind('allEventRefresh',function()
                    {
                        var content = $(this_.el).html();
                        this_.model.set('content',content);

                    });

                }
                else
                {
                    editbox = this.model.get('content');
                    editbox = $(editbox).attr('contentEditable',false);
                 //   editbox.removeClass('textEditBox');
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