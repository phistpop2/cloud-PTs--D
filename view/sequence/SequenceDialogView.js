define(['jquery','underscore','backbone',
          'text!template/dialog/SequenceDialog.html',
        'view/contents/ObjectView',
        'view/contents/TextView',
        'view/contents/ImageView',
        'view/contents/VideoView',
        'view/contents/FrameView',

        'ObjectController'],
    function($,_,Backbone,
                SequenceDialogTemplate){
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
                var model_ = this.model;
                $('#slide_style_control').html($(SequenceDialogTemplate).find('.dialog_content'));
                var this_ = this;

                $('#slide_style_control').bPopup({
                    easing: 'easeOutBack',
                    speed: 300,
                    transition: 'slideDown'
                });

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

                return this;
            }





    });

        return sequenceDialogView;

});
