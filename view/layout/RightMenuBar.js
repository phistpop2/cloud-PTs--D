define(['jquery','underscore','backbone',
    'model/contents/TextModel',
    'model/contents/FrameModel',
    'text!template/layout/rightMenuBar.html',
    'text!template/layout/StyleTemplate.html',
    'text!template/layout/SequenceTemplate.html'],
    function($,_,Backbone,
             TextModel,
             FrameMode,
             RightMenuBar,

             StyleTemplate,
             SequenceTemplate
        ){
        var rightMenuBar = Backbone.View.extend({
            el : $('#mainRightLayout'),

            commonControlView : null,

            template : RightMenuBar,

            mode : null,

            initialize : function()
            {
                _.bindAll(this);
                this.collection.bind('objselected',this.settingStyleValue);
                this.mode = this.options.mode;
                this.render();
            },

            events : {
                'show' : 'settingStylePanel',
                'sequenceShow' : 'settingSequencePanel',
                'refreshContainStyle' : 'settingContainStyle',
                'refreshSequence' : 'refreshSequence'
            },

            settingStyleValue : function()
            {
                this.model = this.collection.selected;

                $(this.el).find("#style_panel_wrap").children("li").hide();
                $(this.el).find('#defaultStyleSelection').show();



                if(this.model instanceof TextModel){
                    this.settingTextStyle();
                }

                if(this.model instanceof FrameMode){
                    this.settingContainStyle();
                }


            },

            settingTextStyle  : function(){
                this.refreshCommonBorderColor(this.model.cid);
                $('#textStyleSection').show();
            },

            settingContainStyle : function()
            {

                if(this.mode.value=='contain')
                {
                    $('#contain_mode_toggle').iCheck('check');
                }
                else
                {
                    $('#contain_mode_toggle').iCheck('uncheck');
                }

                this.refreshCommonBorderColor(this.model.cid);
                $('#containStyleSection').show();

                $('#contain_mode_toggle').on('ifChecked',this.doContainMode);
                $('#contain_mode_toggle').on('ifUnchecked',this.undoContainMode);

                var contain = this.model.get('contain');
                $('#contain_list').html('');

                var this_ = this;
                for(var i = 0 ; i < contain.length ; i++){
                    var containObj = contain[i];
                    var obj =$("<li id='contain_id_"+containObj.cid+"'>" + containObj.get('type') +"</li>");

                    obj.click({'model':containObj},this_.removeContainObject);
                    obj.on('mouseover',{'model':containObj},this_.onFocusObj);
                    obj.on('mouseout',{'model':containObj},this_.unFocusObj);

                    $('#contain_list').append(obj);
                }
            },

            onFocusObj : function (e)
            {
                var model = e.data.model;
                var view = this.collection.views[model.cid];
                view.presentOnFocus();
            },

            unFocusObj : function (e)
            {
                var model = e.data.model;
                var view = this.collection.views[model.cid];
                view.presentUnFocus();
            },

            removeContainObject : function(e)
            {
                this.model.removeContain(e.data.model);
                this.settingContainStyle();
            },

            removeSequenceObject : function(e)
            {
                var idx = e.data.idx;
                var view = e.data.view;

                this.collection.removeSequence(idx);
                $(view.el).trigger('mouseout');
            },

            settingSequencePanel : function()
            {
                $('#rmSlider').html(SequenceTemplate);

                $('#rmSlider').mCustomScrollbar('update');

                $("#sequence_panel_wrap").sortable();
                $("#sequence_panel_wrap").bind('sortupdate',this.sequenceOnDrop);
                this.refreshSequence();
            },

            sequenceOnDrop : function (item, targetContainer, _super)
            {
                var items = $('#sequence_panel_wrap').children('li');

                this.collection.sequence = [];
                for(var i = 0 ; i < items.length ; i++)
                {
                    if($(items[i]).context.dataset.cid)
                    {
                        this.collection.sequence.push($(items[i]).context.dataset.cid);
                    }
                }
            },

            refreshSequence : function()
            {
                $('#sequence_panel_wrap').html('');

                for(var i in this.collection.sequence)
                {
                    var cid = this.collection.sequence[i];
                    var model = this.collection.getByCid(cid);
                    var view = this.collection.getViewByCid(cid);
                    var type = model.get('type');

                    var li = $("<li data-cid="+cid+"></li>");

                    (function(li,view,thiz,idx)
                    {
/*
                            var el = $(view.el).find('.objectWrap').clone();

                            $(el).css({
                                'left' : '-40px',
                                'margin ' : '0px',
                                'padding ' : '0px',
                                '-webkit-transform': 'translate(0px) rotate(0deg) scale(0.2)'
                            });
*/
                        var el = $('<span>'+type+'</span>');
                        var li_ = li;
                        var view_ = view;
                        var this_ = thiz;

                        li_.append($(el));


                        $(li_).bind('click',{'idx':idx,'view':view_},this_.removeSequenceObject);

                        $(li_).bind('mouseover',function()
                        {
                           $(view_.el).trigger('mouseover');
                        });

                        $(li_).bind('mouseout',function()
                        {
                            $(view_.el).trigger('mouseout');
                        });

                    })(li,view,this,i);


                    $('#sequence_panel_wrap').append(li);
                }

            },

            settingStylePanel : function()
            {
                $('#rmSlider').html(StyleTemplate);


                $("#style_panel_wrap").accordion({
                    el: ".h",
                    head: ".level1, .level2, .level3",
                    next: "div",
                    container : false,
                    showSpeed : 200,
                    hideSpeed : 250,
                    scrollSpeed : 100,
                    standardExpansible : true,
                    clickFunc : function(){
                        $('#rmSlider').mCustomScrollbar('update');
                    }
                });

                $( "#common_border_color_r_slider,"+
                    "#common_border_color_g_slider,"+
                    "#common_border_color_b_slider" ).slider({
                        orientation: "horizontal",
                        max: 255,
                        value: 0,
                        slide : this.refreshCommonBorderColor,
                        change : this.refreshCommonBorderColor
                    });

                $('#common_border_opacity').slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 100
                });


                $('#common_border_width_slider').slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 0,
                    slide : this.refreshCommonBorderWidth,
                    change : this.refreshCommonBorderWidth
                });


                $('#common_border_radius_wrap .control_slider').slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 0,
                    slide : this.refreshSliderValue,
                    change : this.refreshSliderValue
                });

                $('#common_border_opacity').slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 100,
                    slide : this.refreshSliderValue,
                    change : this.refreshSliderValue
                });

                $('.iCheckTarget').iCheck({
                    checkboxClass: 'icheckbox_flat-green',
                    radioClass: 'iradio_flat-green',
                    increaseArea: '20%' // optional
                });

                $('.iCheckTarget').on('ifChecked',this.iCheckChange);



                $( "#common_background_color_r_slider,"+
                    "#common_background_color_g_slider,"+
                    "#common_background_color_b_slider" ).slider({
                        orientation: "horizontal",
                        max: 255,
                        value: 0
                    });


                $('#common_shadow_h, ' +
                    '#common_shadow_v, ' +
                    '#common_shadow_blur, '+
                    '#common_shadow_spreed ').slider({
                        orientation: "horizontal",
                        max: 100,
                        min : -100,
                        value: 0,
                        slide : this.refreshBoxShadow,
                        change : this.refreshBoxShadow
                    });


                $( "#common_shadow_color_r_slider,"+
                    "#common_shadow_color_g_slider,"+
                    "#common_shadow_color_b_slider" ).slider({
                        orientation: "horizontal",
                        max: 255,
                        value: 0,
                        slide : this.refreshBoxShadow,
                        change : this.refreshBoxShadow
                    });

                $('#common_shadow_inset_check').on('ifChanged',this.refreshBoxShadow);



                $( "#common_background_color_r_slider,"+
                    "#common_background_color_g_slider,"+
                    "#common_background_color_b_slider" ).slider({
                        orientation: "horizontal",
                        max: 255,
                        value: 0,
                        slide : this.refreshBackgroundColor,
                        change : this.refreshBackgroundColor
                    });


                $( "#common_background_opacity_slider" ).slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 100,
                    slide : this.refreshBackgroundColor,
                    change : this.refreshBackgroundColor
                });


                $('#common_background_transparent_check').on('ifChanged',this.refreshBackgroundColor);




                $('#text_spacing_line').slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 0
                });
                $('#text_spacing_word').slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 0
                });
                $('#text_spacing_letter').slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 0
                });


                $('#text_font_color_picker').farbtastic(function(value){
                    $('#text_font_color_value').val(value);
                    $('#text_font_color_value').trigger('change');
                });

                $('#text_font_color_value').change(this.refreshTextColor);

                $('#text_font_opacity').slider({
                    orientation: "horizontal",
                    max: 100,
                    min : 0,
                    value: 100,
                    change : this.refreshTextColor,
                    slide : this.refreshTextColor
                });


                $('#text_font_bold').slider({
                    orientation: "horizontal",
                    max: 1000,
                    min : 100,
                    step : 100,
                    value: 100,
                    change : this.refreshSliderValueToTextRange,
                    slide : this.refreshSliderValueToTextRange
                });

                $('#text_font_size').slider({
                    orientation: "horizontal",
                    max: 500,
                    value: 0,
                    change : this.refreshSliderValueToTextRange,
                    slide : this.refreshSliderValueToTextRange
                });




                $( '#font_selectbox' ).selectbox();



                $('#text_shadow_h, '+
                    '#text_shadow_v, '+
                    '#text_shadow_blur').slider({
                        orientation: "horizontal",
                        max: 100,
                        min: -100,
                        value: 0
                    });


                $('#text_shadow_color_picker').farbtastic(function(value){
                    $('#text_shadow_color_value').val(value);
                    $('#text_shadow_color_value').trigger('change');
                });
                //         $('#text_shadow_color_value').change(this.refreshTextShadow);

                $('#text_shadow_opacity').slider({
                    orientation: "horizontal",
                    max: 100,
                    value: 100
                });

                $('#addTextShadowLayerBtn').click(this.refreshTextShadow);

                $('#rmSlider > *').bind('mousedown',function(e){ e.preventDefault();})


                this.settingStyleValue();
            },

            refreshTextColor : function(e)
            {

                var hexColor = $('#text_font_color_value').val();
                var opacity = $('#text_font_opacity').slider('value');
                $($('#text_font_opacity').prev('div')).find('input').val(opacity);

                var applyTag = this.getSelectRange();

                var rgb = this.rgbFromHex(hexColor);

                var color = "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+(opacity*0.01)+")";



                for(var i = 0 ; i < applyTag.length ; i++)
                {
                    $(applyTag[i]).css('color',color);

                }
            },

            refreshTextShadow : function(e)
            {
                var applyTag = this.getSelectRange();

                var shadowH = $('#text_shadow_h').slider('value');
                $($('#text_shadow_h').prev('div')).find('input').val(shadowH);

                var shadowV = $('#text_shadow_v').slider('value');
                $($('#text_shadow_v').prev('div')).find('input').val(shadowV);

                var shadowBlur = $('#text_shadow_blur').slider('value');
                $($('#text_shadow_blur').prev('div')).find('input').val(shadowBlur);

                var hexColor = $('#text_shadow_color_value').val();

                var key = 'text-shadow'
                var value =  shadowH+'px '+shadowV+'px '+shadowBlur+'px '+hexColor;


                for(var i = 0 ; i < applyTag.length ; i++)
                {
                    $(applyTag[i]).css(key,value);

                }


            },

            refreshCommonBorderColor : function(cid)
            {
                if(typeof(cid)=='string')
                {
                    var hexColor = this.collection.getViewByCid(this.model.cid).getCss('border-color');

                    var red,green,blue = 0;


                    if(this.rgbParse(hexColor) != null)
                    {
                        red = this.rgbParse(hexColor)[1];
                        green = this.rgbParse(hexColor)[2];
                        blue = this.rgbParse(hexColor)[3];
                    }

                    $( "#common_border_color_r_slider" ).slider( "value" ,red);
                    $( "#common_border_color_g_slider" ).slider( "value" ,green);
                    $( "#common_border_color_b_slider" ).slider( "value" ,blue);


                    $( "#common_border_color_preview" ).css( "background-color", hexColor );
                }
                else
                {
                    var red = $( "#common_border_color_r_slider" ).slider( "value" ),
                        green = $( "#common_border_color_g_slider" ).slider( "value" ),
                        blue = $( "#common_border_color_b_slider" ).slider( "value" )

                    hexColor = "rgb("+red+","+green+","+blue+")";

                    $( "#common_border_color_preview" ).css( "background-color", hexColor );

                    this.collection.getSelectedView().setCss('border-color',hexColor);
                }
            },

            refreshBoxShadow : function(e)
            {
                var shadowH = $('#common_shadow_h').slider('value');
                $($('#common_shadow_h').prev('div')).find('input').val(shadowH);

                var shadowV = $('#common_shadow_v').slider('value');
                $($('#common_shadow_v').prev('div')).find('input').val(shadowV);

                var shadowBlur = $('#common_shadow_blur').slider('value');
                $($('#common_shadow_blur').prev('div')).find('input').val(shadowBlur);

                var shadowSpread = $('#common_shadow_spreed').slider('value');
                $($('#common_shadow_spreed').prev('div')).find('input').val(shadowSpread);

                var colorR = $('#common_shadow_color_r_slider').slider('value');
                var colorG = $('#common_shadow_color_g_slider').slider('value');
                var colorB = $('#common_shadow_color_b_slider').slider('value');


                var hexColor = "rgb("+colorR+","+colorG+","+colorB+")";

                $( "#common_shadow_color_preview" ).css( "background-color", hexColor );

                var key = 'box-shadow'
                var value =  shadowH+'px '+shadowV+'px '+shadowBlur+'px '+shadowSpread+'px '+hexColor;

                if($('#common_shadow_inset_check').attr('checked')=='checked')
                {
                    value+=' inset';
                }
                else
                {
                    value=value.replace(' inset','');
                }

                this.collection.getSelectedView().setCss(key,value);
            },

            refreshBackgroundColor :function()
            {
                var colorR = $('#common_background_color_r_slider').slider('value') ;
                var colorG = $('#common_background_color_g_slider').slider('value') ;
                var colorB = $('#common_background_color_b_slider').slider('value') ;
                var opacity = $('#common_background_opacity_slider').slider('value') * 0.01 ;

                var key = 'background-color';
                var value = 'rgba('+colorR+','+colorG+','+colorB+','+opacity+')';

                $( "#common_background_color_preview" ).css( "background-color", value );

                if($('#common_background_transparent_check').attr('checked')=='checked')
                {
                    value ='transparent';
                }

                this.collection.getSelectedView().setCss(key,value);
            },

            refreshSliderValueToTextRange : function(e)
            {
                var applyTag = this.getSelectRange();
                var obj =  $('#'+e.target.id);

                if(e.target.id.length == 0)
                {
                    obj = $('#'+e.target.offsetParent.id);
                }

                var key = obj.data('key');
                var value =  obj.slider( "value" );
                $(obj.prev('div')).find('input').val(value);

                for(var i = 0 ; i < applyTag.length ; i++)
                {
                    $(applyTag[i]).css(key,value);

                }

            },

            refreshSliderValue : function(e)
            {
                var obj =  $('#'+e.target.id);

                if(e.target.id.length == 0)
                {
                    obj = $('#'+e.target.offsetParent.id);
                }

                var key = obj.data('key');
                var value =  obj.slider( "value" );
                $(obj.prev('div')).find('input').val(value);
                this.collection.getSelectedView().setCss(key,value);
            },

            refreshCommonBorderWidth : function()
            {
                var width = $( "#common_border_width_slider" ).slider( "value" );
                $('#common_border_width_value').val(width);
                this.collection.getSelectedView().setCss('border-width',width);
            },


            doContainMode : function(event)
            {
                $('#workSpace').trigger({'type' : 'modeChange','mode' : 'contain' });
            },

            undoContainMode : function(event)
            {
                $('#workSpace').trigger({'type' : 'modeChange','mode' : 'normal' });
            },

            iCheckChange : function(event)
            {
                if(event.target.type == "radio")
                {
                    var name = event.target.name;
                    var label = $('#'+event.target.id).parent().next('label');

                    var key = label.data('key');
                    var value = label.text();

                    this.collection.getSelectedView().setCss(key,value);
                }

            },

            rgbParse : function(color){
                var matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
                var match = matchColors.exec(color);
                return match;
            },

            rgbFromHex : function(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            },

            hexFromRGB : function(r, g, b) {
                var hex = [
                    r.toString( 16 ),
                    g.toString( 16 ),
                    b.toString( 16 )
                ];
                $.each( hex, function( nr, val ) {
                    if ( val.length === 1 ) {
                        hex[ nr ] = "0" + val;
                    }
                });
                return hex.join( "" ).toUpperCase();
            },

            render : function(){
                $(this.el).html(this.template);


                if(this.mode == 'sequence')
                {
                    this.settingSequencePanel();
                }
                else
                {
                    this.settingStylePanel();
                }


                $('#rmSlider').mCustomScrollbar({
                    scrollButtons:{
                        enable:true,
                        scrollAmount: 1000
                    },
                    theme:"light-thin"
                });
            },

            getSelectRange : function(){
                var sel = window.getSelection();

                var startWordNode = sel.anchorNode.parentNode;
                var startWordIdx = $(startWordNode).index();
                var startSentenceNode = startWordNode.parentNode;
                var startSentenceIdx = $(startSentenceNode).index();

                var endWordNode = sel.focusNode.parentNode;
                var endWordIdx = $(endWordNode).index();

                var endSentenceNode = endWordNode.parentNode;
                var endSentenceIdx = $(endSentenceNode).index();

                var editBox = startSentenceNode.parentNode;



                if(startSentenceIdx > endSentenceIdx)
                {
                    startWordNode = sel.focusNode.parentNode;
                    startWordIdx = $(startWordNode).index();
                    startSentenceNode = startWordNode.parentNode;
                    startSentenceIdx = $(startSentenceNode).index();

                    endWordNode = sel.anchorNode.parentNode;
                    endWordIdx = $(endWordNode).index();
                    endSentenceNode = endWordNode.parentNode;
                    endSentenceIdx = $(endSentenceNode).index();


                }
                else if(startSentenceIdx == endSentenceIdx)
                {
                    if(startWordIdx > endWordIdx)
                    {
                        startWordNode = sel.focusNode.parentNode;
                        startWordIdx = $(startWordNode).index();
                        startSentenceNode = startWordNode.parentNode;
                        startSentenceIdx = $(startSentenceNode).index();

                        endWordNode = sel.anchorNode.parentNode;
                        endWordIdx = $(endWordNode).index();
                        endSentenceNode = endWordNode.parentNode;
                        endSentenceIdx = $(endSentenceNode).index();

                    }
                }

                var selectedSentence = [];
                if(startSentenceIdx == endSentenceIdx)
                {

                    var gtVal = startWordIdx;
                    var ltVal = (endWordIdx - gtVal);
                    selectedSentence = $(startSentenceNode).find('.lcWord:gt('+gtVal+'):lt('+ltVal+'), .lcWord:eq('+gtVal+')');
                }
                else
                {

                    var gtVal = startWordIdx;
                    var ltVal = endWordIdx;
                    for(var i = startSentenceIdx ; i <= endSentenceIdx ; i++)
                    {
                        var addSentence=[];

                        if(i==startSentenceIdx)
                        {
                            addSentence = $(editBox).find('.clSentence:eq('+i+')').find('.lcWord:gt('+gtVal+'), .lcWord:eq('+gtVal+')');
                        }
                        else if(i==endSentenceIdx)
                        {
                            addSentence = $(editBox).find('.clSentence:eq('+i+')').find('.lcWord:lt('+ltVal+'), .lcWord:eq('+ltVal+')');
                        }
                        else
                        {
                            addSentence = $(editBox).find('.clSentence:eq('+i+')').find('.lcWord');
                        }

                        selectedSentence.push(addSentence);
                    }

                }




                return selectedSentence;
            }


        }) ;



        return rightMenuBar;
    }) ;