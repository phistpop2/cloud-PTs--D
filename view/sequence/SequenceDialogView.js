define(['jquery','underscore','backbone',
          'text!template/dialog/SequenceDialog.html',
        'text!template/dialog/SlideStylePanel.html',
        'text!template/dialog/SlideContentsPanel.html',
        'view/contents/ObjectView',
        'view/contents/TextView',
        'view/contents/ImageView',
        'view/contents/VideoView',
        'view/contents/FrameView',

        'ObjectController'],
    function($,_,Backbone,
                SequenceDialogTemplate,SlideStylePanel,SlideContentsPanel){
        var sequenceDialogView = Backbone.View.extend({

            sequenceCollection : null,

            initialize : function()
            {
                this.model = this.options.model;

                this.sequenceCollection = this.options.sequenceCollection;
                this.render();
            },

            close : function()
            {

                $('#slide_style_control').bPopup().close();
            },


            render : function()
            {

                var this_ = this;


                $('#slide_style_control #style_selector').bind('change',function(){
                    this_.activePanel()
                });

                this.activePanel();
                return this;
            },

            activePanel : function()
            {
                var this_ = this;
                var value = $('#slide_style_control #style_selector').val();
                        console.log('value',value);
                if(value=='slide_style')
                {
                    this_.activeSlideStylePanel();

                }
                else if(value=='slide_contents')
                {
                    this_.activeSlideContentsPanel();
                }

                $('#slide_style_control').bPopup({
                    easing: 'easeOutBack',
                    speed: 300,
                    transition: 'slideDown'
                });

                $('#slide_style_control').trigger('resize');
            },

            activeSlideStylePanel : function()
            {
                 $('#slide_style_control .dialog_content').css({
                     'width' : 300
                 });

                $('#slide_style_control #styleControlPanel').html(SlideStylePanel);

                var model_ = this.model;
                var this_ = this;

                $('#slide_style_control').find('.style_slider').each(function()
                {
                    var min = $(this).data('min');
                    var key = $(this).data('key');
                    var val = this_.model.get(key);
                    var max = $(this).data('max');
                    var input = $(this).prev().find('input');
                    var slider = $(this);



                    $(this).slider({
                        'max' : max,
                        'min' : min,
                        slide : function(e,ui)
                        {
                            var val = ui.value;

                            var event = $.Event('change');
                            event.value = val;
                            input.trigger(event);

                        }
                    });

                    $(this).on('slidestop',function(){
                        var key = $(this).data('key');
                        var value = parseFloat($(this).prev().find('input').val());

                        if(key)
                        {
                            model_.set(key,value);
                        }
                    });

                    $(input).bind('change',function(e){
                        var val = $(this).val();
                        var key = $(this).data('key');

                        if(e.value)
                        {
                            val = e.value;
                        }

                        val = parseFloat(val);

                        if(val+'' == 'NaN')
                        {
                            val = 0;
                        }
                        else if(val < min)
                        {
                            val = min;
                        }
                        else if(val > max)
                        {
                            val = max;
                        }

                        if(key)
                        {
                            model_.set(key,val);
                        }

                        $(this).val(val);
                        slider.slider("option","value",val);
                    });

                    $(input).bind('keydown',function(e){
                        var val = $(this).val();

                        if(key)
                        {
                            if(e.keyCode == 13)
                            {
                                model_.set(key,val);
                            }
                        }
                    });



                    var event = $.Event('change');
                    event.value = val;
                    input.trigger(event);

                });




                var slideBackgroundActionValue = model_.get('slideBackgroundAction');
                if(slideBackgroundActionValue)
                {
                    $('#slideBackgroundActionStyle').val(slideBackgroundActionValue);
                }
                $("#slideBackgroundActionStyle").change(function() {
                    var styleValue = $(this).val();
                    model_.set('slideBackgroundAction',styleValue);
                });



                var slideChangeStyleValue = model_.get('slideChangeStyle');
                if(slideChangeStyleValue)
                {
                    $('#slideChangeStyle').val(slideChangeStyleValue);
                }
                $("#slideChangeStyle").change(function() {
                    var styleValue = $(this).val();
                    model_.set('slideChangeStyle',styleValue);
                });



                $('#slideBackgroundColor').ColorPicker({
                    color : model_.get('slideBackgroundColor'),

                    onChange: function (hsb, hex, rgb) {
                        $('#slideBackgroundColor').parent().parent().find('.color_thumb').css('backgroundColor', '#' + hex);
                        $('#slideBackgroundColor').val('#' + hex);
                        model_.set('slideBackgroundColor','#'+hex);
                    }
                });

                $('#slideBackgroundColor').parent().parent().find('.color_thumb').css('backgroundColor', model_.get('slideBackgroundColor'));
                $('#slideBackgroundColor').val(model_.get('slideBackgroundColor'));

                $('#slide_style_control').find('#styleCancelBtn').click(function()
                {
                    this_.close();
                });

            },

            activeSlideContentsPanel : function()
            {
                var this_ = this;
                $('#slide_style_control #styleControlPanel').html(SlideContentsPanel);



                $('#slide_style_control .dialog_content').css({
                    'width' : 760,
                    'height' : 500
                });

                var previewWorldWrap = $('.world_preview_wrap #previewWorldWrap');
                var width = $('.world_preview_wrap').width();
                var height = $('.world_preview_wrap').height();

                $('.world_preview_wrap').css({
                    'width' : width,
                    'height' : height
                })

                var world = $('#workSpace #world').clone();

                console.log('world',world);
                previewWorldWrap.html(world);

                var scale = 1.0;

                var slideWidth = parseFloat(this.model.get('width'));
                var slideHeight = parseFloat(this.model.get('height'));

                var scaleW = parseFloat(width/slideWidth);
                var scaleH = parseFloat(height/slideHeight);

                scale = scaleW;

                if(scaleH < scaleW)
                {
                    scale = scaleH;
                }


                var color = this.model.get('slideBackgroundColor');
                var rgb = this.hexToRgb(color);

                var r_ = Math.abs(rgb.r+57)%255;
                var g_ = Math.abs(rgb.g+57)%255;
                var b_ = Math.abs(rgb.b+57)%255;

                var secondColor = this.rgbToHex(r_,g_,b_);

                var background = '-webkit-radial-gradient(center, circle cover,'+secondColor+' 0%, '+color+' 100%)';

                console.log('scale',scale);

                $(world).css({
                    '-webkit-transform': 'scale('+scale+') matrix3d('+this.model.get('matrix3d')+')'

                });


                $(previewWorldWrap).css({
                    'padding' : '0px',
                    '-webkit-transform-origin' : '0% 0%',

                    'background':  background
                });


                $(world).find('.textEditBox').each(function(){
                    $(this).css({
                       'webkitUserSelect' : 'none',
                       '-webkit-user-modify' : 'none'
                    });
                });

                ///contents list

                var contentsList = $('#styleControlPanel #contentsList');
                contentsList.html('');

                var contentModels = this.sequenceCollection.getContentsCollection().models;

                for(var i = 0 ; i < contentModels.length ; i++)
                {
                    var contentModel = contentModels[i];
                    var item = $("<li id='list_item_"+contentModel.cid+"' data-cid="+contentModel.cid+">"+"<span class='visible_content_icon'></span>"+"<span class='visible_content_name'>"+contentModel.get('type')+"</span>"+"</li>");

                    $(item).bind('mouseover',function(){

                        var cid = $(this).data('cid');
                        var contentView = this_.getContentViewElement(cid);


                        $(contentView).css({
                           'boxShadow' : '0px 0px 30px #3cdfdf'
                        });

                    }).bind('mouseout',function(){
                            var cid = $(this).data('cid');
                            var contentView = this_.getContentViewElement(cid);


                            $(contentView).css({
                                'boxShadow' : '0px 0px 0px'
                            });
                    }).click(function(){
                        var item = $(this);
                        var cid = item.data('cid');
                        var contents = this_.model.get('contents');
                        var doContain = true;

                            console.log(contents);

                        for(var i = 0  ; i < contents.length ; i++)
                        {

                            if(contents[i] == cid)
                            {
                                this_.doInactiveContent(cid);
                                contents.splice(i,1);
                                doContain = false;
                                break;
                            }
                        }

                        if(doContain)
                        {
                            contents.push(cid);
                            this_.doActiveContent(cid);
                        }

                        this_.model.set('contents',contents);

                    });

                    contentsList.append(item);

                    this_.doInactiveContent(contentModel.cid);
                }

                $('#previewWorldWrap div[id^="view"]').each(function(){

                    $(this).css({
                        transitionDuration:  "400ms"
                    });

                    $(this).bind('mouseover',function(){
                        $(this).css({
                            'boxShadow' : '0px 0px 30px #3cdfdf'
                        });
                    }).bind('mouseout',function(){
                        $(this).css({
                            'boxShadow' : '0px 0px 0px'
                        });
                    }).click(function(){
                        var cid = $(this).attr('id').replace('view_','');
                        var contents = this_.model.get('contents');
                        var doContain = true;

                        for(var i = 0  ; i < contents.length ; i++)
                        {

                            if(contents[i] == cid)
                            {
                                this_.doInactiveContent(cid);
                                contents.splice(i,1);
                                doContain = false;
                                break;
                            }
                        }

                        if(doContain)
                        {
                            contents.push(cid);
                            this_.doActiveContent(cid);
                        }

                        this_.model.set('contents',contents);
                    });
                })

                this.refreshContentList();
            },

            refreshContentList : function()
            {
                var contents = this.model.get('contents');

                for(var i = 0  ; i < contents.length ; i++)
                {
                        this.doActiveContent(contents[i]);
                }
            },


            doActiveContent : function(cid)
            {
                var contentsList = $('#styleControlPanel #contentsList');
                var item = contentsList.find('#list_item_'+cid);
                item.removeClass('inactive').addClass('active');

                var contentView = this.getContentViewElement(cid);
                contentView.removeClass('inactive').addClass('active');
            },

            doInactiveContent : function(cid)
            {
                var contentsList = $('#styleControlPanel #contentsList');
                var item = contentsList.find('#list_item_'+cid);
                item.removeClass('active').addClass('inactive');

                var contentView = this.getContentViewElement(cid);
                contentView.removeClass('active').addClass('inactive');
            },

            getContentViewElement : function(cid)
            {
                var contentView = this.sequenceCollection.getContentsCollection().views[cid];

                var viewId = $(contentView).attr('id');

                var prevWorld = $('#previewWorldWrap #world');
                var prevContentView = prevWorld.find("#"+viewId);

                return prevContentView;
            },

            componentToHex : function(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            },

            rgbToHex : function(r, g, b) {
                return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
            },

            hexToRgb : function(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }



    });

        return sequenceDialogView;

});
