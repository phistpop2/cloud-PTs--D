define(['jquery','underscore','backbone',
    'text!template/dialog/StyleDialog.html',
    'text!template/dialog/BorderStylePanel.html',
    'text!template/dialog/BoxShadowStylePanel.html',
    'text!template/dialog/BackgroundStylePanel.html',
    'text!template/dialog/TextShadowStylePanel.html',

    'jquery_knob'],
    function($,_,Backbone,StyleDialog,
             BorderStylePanel,
             BoxShadowStylePanel,
             BackgroundStylePanel,
             TextShadowStylePanel){

        var styleView = Backbone.View.extend({

            el : $("#mainLayout"),

            template : _.template(StyleDialog),

            listData : null,

            session : null,

            contentsCollection : null,

            initialize : function(){
                _.bindAll(this);
                this.contentsCollection = this.options.contentsCollection;

                $(this.el).append(this.template);
                this.render();

                this.eventBind();
            },

            eventBind : function()
            {
                var this_ = this;
                this.contentsCollection.bind('selected',function()
                {
                    if(this_.isOpen())
                    {
                        var styleValue = $("#style_selector").val();
                        this_.activeStylePanel(styleValue,this.getSelected());
                    }
                });

                this.contentsCollection.bind('recoverEvent',function(param)
                {
                    var stylesKey={'borderWidth':true,'borderColor':true,'borderStyle':true,'borderTopLeftRadius':true,'borderTopRightRadius':true,'borderBottomLeftRadius':true,'borderBottomRightRadius':true,
                        'boxShadows':true};
                        var styleValue = $("#style_selector").val();
                        var model = param.model;
                        var key = param.key;
                        var doRefresh = false;

                        if(typeof(key)=='string')
                        {
                            model.commitBeforeData[key] = param.value;
                            doRefresh = true;
                        }
                        else
                        {
                            for(var i = 0 ; i < key.length; i++)
                            {

                                model.commitBeforeData[key[i]] = param.value[i];

                                if(stylesKey[key[i]])
                                {

                                    doRefresh = true;
                                }
                            }
                        }

                        if(doRefresh)
                        {
                            this_.activeStylePanel(styleValue,model);
                        }

                });

//                $('#style_selector').bind('mousedown',function(e){console.log(this); return false;})

            },

            render : function()
            {
                var this_ = this;

                $('#styleDialog').draggable();

                $("#style_selector").change(function() {
                    var styleValue = $(this).val();
                    var model = this_.contentsCollection.getSelected();
                    this_.activeStylePanel(styleValue,model);
                });


            },

            activeBackgroundStylePanel : function(model)
            {
                $('#styleControlPanel').html(BackgroundStylePanel);
            },

            activeBoxShadowStylePanel : function(model)
            {
                var model_ = model;
                var this_ = this;

                $('#styleControlPanel').html(BoxShadowStylePanel);

                $('.style_slider').each(function()
                {
                    var min = $(this).data('min');

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

                    $(input).bind('change',function(e){
                        var val = $(this).val();

                        if(e)
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

                        $(this).val(val);
                        slider.slider("option","value",val);
                    });

                });


                $('#shadowColor').ColorPicker({
                    onChange: function (hsb, hex, rgb) {
                        $('#shadowColor').parent().parent().find('.color_thumb').css('backgroundColor', '#' + hex);
                        $('#shadowColor').val('#' + hex);
                    },

                    onHide : function()
                    {
                        window.selectRangeBackwards();
                    }
                });


                $('#addBoxShadowButton').click(function(){
                    var horizontalLengthVal = $('#horizontalLength').val();
                    var verticalLengthVal = $('#verticalLength').val();
                    var blurRadiusVal = $('#blurRadius').val();
                    var spreadFieldVal = $('#spreadField').val();
                    var shadowColorVal = $('#shadowColor').val();

                    var boxShadow = horizontalLengthVal+"px "+verticalLengthVal+"px "+blurRadiusVal+"px "+spreadFieldVal+"px "+shadowColorVal;

                    var boxShadows = model_.get('boxShadows');
                    boxShadows.push(boxShadow);
                    model_.set('boxShadows',boxShadows);
                    this_.refreshStyleList(boxShadows,$('#boxShadowList'),model_,'boxShadows');

                    var view = this_.contentsCollection.views[model_.cid];
                    if(view)
                    {
                        console.log('updateView');
                        view.updateView();
                    }
                });

                var boxShadows = model_.get('boxShadows');
                this_.refreshStyleList(boxShadows,$('#boxShadowList'),model_,'boxShadows');

                $('#styleDialog input').each(function(){

                    $(this).bind('change',function(){
                        window.selectRangeBackwards();
                    });
                });


                $('.colorpicker input').each(function(){

                    $(this).unbind('mousedown');

                    $(this).bind('focusout',function(){
                        window.selectRangeBackwards();
                    });

                });

            },


            refreshStyleList : function(listItems,listEl,model,key){
                var this_ = this;
                var listItems_ = listItems;
                var listEl_ = listEl;
                var els="";

                var model_ = model;
                var key_ = key;

                for(var i = 0 ; i < listItems.length ; i++)
                {
                    var listItem = listItems[i];
                    var el = "<li>"+
                        "<span class='item_name'>"+listItem+"</span>"+
                        "<span class='delete_btn' data-idx="+i+">Χ</span>"+
                        "</li>";
                    els+=el;
                }

                listEl.html(els);
                listEl.find('.delete_btn').each(function (){
                    var targetIdx = $(this).data('idx');

                    $(this).click(function(){
                        listItems_.splice(targetIdx,1);
                        this_.refreshStyleList(listItems_,listEl_,model_,key_);

                        var view = this_.contentsCollection.views[model_.cid];
                        if(view)
                        {
                            console.log('updateView');
                            view.updateView();
                        }
                    })
                });
                listEl.sortable();
                model_.commitToCollection(key,listItems);
            },

            activeTextShadowStylePanel : function(model)
            {
                var this_ = this;
                var selectRange = [];
                var rawSelectRange = window.getSelectRange();


                if(rawSelectRange)
                {
                    _.each(rawSelectRange,function(c){
                        if(Object.prototype.toString.call( c ) === '[object Array]'){
                            _.each(c,function(t){selectRange.push(t)})}else{selectRange.push(c)
                        }
                    });
                }


                $('#styleControlPanel').html(TextShadowStylePanel);
                $('.style_slider').slider();
                $('#textShadowList').sortable();

                $('#shadowColor').ColorPicker({
                    onChange: function (hsb, hex, rgb) {
                        $('#shadowColor').parent().parent().find('.color_thumb').css('backgroundColor', '#' + hex);
                        $('#shadowColor').val('#' + hex);
                    },

                    onHide : function()
                    {
                        window.selectRangeBackwards();
                    }
                });



                $('.style_slider').each(function()
                {
                    var min = $(this).data('min');

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

                    $(input).bind('change',function(e){
                        var val = $(this).val();

                        if(e)
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

                        $(this).val(val);
                        slider.slider("option","value",val);
                    });

                });


                $('#shadowColor').ColorPicker({
                    onChange: function (hsb, hex, rgb) {
                        $('#shadowColor').parent().parent().find('.color_thumb').css('backgroundColor', '#' + hex);
                        $('#shadowColor').val('#' + hex);
                    },

                    onHide : function()
                    {
                        window.selectRangeBackwards();
                    }
                });


                $('#addTextShadowButton').click(function(){

                    var horizontalLengthVal = $('#horizontalLength').val();
                    var verticalLengthVal = $('#verticalLength').val();
                    var blurRadiusVal = $('#blurRadius').val();
                    var shadowColorVal = $('#shadowColor').val();

                    var textShadow = horizontalLengthVal+"px "+verticalLengthVal+"px "+blurRadiusVal+"px "+shadowColorVal;
                    var text = selectRange[0];

                    var textShadows = $(text).css('textShadow').replace('none','');

                    textShadows+=(', '+textShadow);

                    if(textShadows.indexOf(',')==0)
                    {
                        textShadows = textShadows.slice(1,textShadows.length);
                    }

                    console.log('textShadows : '+textShadows);
                    $(selectRange).css('textShadow',textShadows);


                    this_.refreshTextStyleList(textShadows,$('#textShadowList'),selectRange,'textShadow');

                });


                ///////////

                $('#shadowColor').each(function(){

                    $(this).bind('mousedown',function(){
                        window.selection = window.getSelection().getRangeAt(0);
                    });

                    $(this).bind('mouseup',function(){
                        window.selectRangeBackwards();
                    });
                });

                $('#styleDialog input').each(function(){

                    $(this).bind('change',function(){
                        window.selectRangeBackwards();
                    });
                });

                $('.colorpicker input').each(function(){

                    $(this).unbind('mousedown');

                    $(this).bind('focusout',function(){
                        window.selectRangeBackwards();
                    });

                });


            },


            refreshTextStyleList : function(listItems,listEl,targetEls,key){

                var this_ = this;

                listItems = listItems.replace(';','');
                listItems = listItems.replace(' ','');

                var listItems_ = listItems.split('px,');

                for(var i = 0 ; i < listItems_.length-1 ; i++)
                {
                    listItems_[i]+='px';
                }

                var listEl_ = listEl;
                var els="";

                var targetEls_ = targetEls;
                var key_ = key;

                console.log(listItems);
                console.log(listItems_)
                console.log(targetEls_);

                for(var i = 0 ; i < listItems_.length ; i++)
                {
                    var listItem = listItems_[i];
                    var el = "<li>"+
                        "<span class='item_name'>"+listItem+"</span>"+
                        "<span class='delete_btn' data-idx="+i+">Χ</span>"+
                        "</li>";
                    els+=el;
                }

                listEl.html(els);
                listEl.find('.delete_btn').each(function (){
                    var targetIdx = $(this).data('idx');

                    $(this).click(function(){
                        listItems_.splice(targetIdx,1);

                        var value = '';
                        _.each(listItems_,function(listItem_){value += listItem_+','})
                        if(value.length )
                        {
                            value = value.slice(0,value.length-1);
                        }

                        this_.refreshTextStyleList(value,listEl_,targetEls_,key_);

                        console.log('targetEls_',targetEls_);
                        console.log('value',value);
                        $(targetEls_).css(key_,value);

                    })
                });
                listEl.sortable();
//                model_.commitToCollection(key,listItems);
            },

            activeBorderStylePanel : function(model)
            {
                var model_ = model;

                var controllers = [];

                $('#styleControlPanel').html(BorderStylePanel);

                $('#borderStyle').change(function(){
                    var borderStyleValue = $(this).val();
                    model_.commitToCollection('borderStyle',borderStyleValue);
                });

                var borderStyleValue = model_.get('borderStyle');

                if(borderStyleValue)
                {
                    $('#borderStyle').val(borderStyleValue);
                }

                $('.style_slider').each(function()
                {
                    var min = $(this).data('min');
                    var max = $(this).data('max');
                    var key = $(this).data('key');
                    var input = $(this).prev().find('input');
                    var slider = $(this);

                    if(key)
                    {
                        input.setControlValue = function(val)
                        {
                            var e = $.Event('change');
                            e.value = val;
                            input.trigger(e);
                        }

                        controllers[key] = input;
                    }

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
                            model_.commitToCollection(key,value);
                        }
                    });

                    $(input).bind('change',function(e){
                        var val = $(this).val();

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
                                model_.commitToCollection(key,val);
                            }
                        }
                    });

                });


                $('#allCornersSlider').slider({
                    slide : function(e,ui)
                    {
                        var val = ui.value;

                        var event = $.Event('change');
                        event.value = val;

                        $(this).prev().find('input').trigger(event);

                        $('#topLeftCornerSlider').prev().find('input').trigger(event);

                        $('#topRightCornerSlider').prev().find('input').trigger(event);

                        $('#bottomLeftCornerSlider').prev().find('input').trigger(event);

                        $('#bottomRightCornerSlider').prev().find('input').trigger(event);



                    },

                    change: function(event, ui) {
                        var val = ui.value;

                        var event = $.Event('change');
                        event.value = val;

                        $('#topLeftCornerSlider').prev().find('input').trigger(event);

                        $('#topRightCornerSlider').prev().find('input').trigger(event);

                        $('#bottomLeftCornerSlider').prev().find('input').trigger(event);

                        $('#bottomRightCornerSlider').prev().find('input').trigger(event);

                        var keys = {
                            'borderTopLeftRadius' :val,
                            'borderTopRightRadius' :val,
                            'borderBottomLeftRadius' :val,
                            'borderBottomRightRadius' :val};


                        model_.commitToCollection(keys);


                    }
                });


                $('#borderColor').ColorPicker({
                    color : model_.get('borderColor'),

                    onChange: function (hsb, hex, rgb) {
                        $('#borderColor').parent().parent().find('.color_thumb').css('backgroundColor', '#' + hex);
                        $('#borderColor').val('#' + hex);
                        model_.set('borderColor','#'+hex);
                    },

                    onHide : function()
                    {
                        var value = $('#borderColor').val();
                        model_.commitToCollection('borderColor',value);
                    }
                });

                var hex = model_.get('borderColor');
                $('#borderColor').parent().parent().find('.color_thumb').css('backgroundColor', hex);
                $('#borderColor').val(hex);


                if(model_)
                {


                    for(var key in controllers)
                    {

                        var value = model_.get(key);

                        var controller = controllers[key] ;

                        if(controller && value!=undefined)
                        {

                            controller.setControlValue(value);
                        }

                    }

                    var tlVal = parseInt($('#topLeftCornerSlider').prev().find('input').val());
                    var trVal = parseInt($('#topRightCornerSlider').prev().find('input').val());
                    var blVal = parseInt($('#bottomLeftCornerSlider').prev().find('input').val());
                    var brVal = parseInt($('#bottomRightCornerSlider').prev().find('input').val());

                    if( (tlVal==trVal)&&
                        (tlVal==blVal)&&
                        (tlVal==brVal))
                    {
                        var e = $.Event('change');
                        e.value = tlVal;
                        $('#allCornersSlider').prev().find('input').trigger(e);
                    }
                }

                $('#styleDialog input').each(function(){

                    $(this).bind('change',function(){
                        window.selectRangeBackwards();
                    });
                });


                $('.colorpicker input').each(function(){

                    $(this).unbind('mousedown');

                    $(this).bind('focusout',function(){
                        window.selectRangeBackwards();
                    });

                });

            },

            isOpen : function()
            {
                var open = true;

                if($(this.el).find('#styleDialog').css('display')=='none')
                {
                    open = false;
                }

                return open;
            },

            open : function(){

                $(this.el).find('#styleDialog').css({
                                                        'display':'inline-block',
                                                        'top' : '80px;',
                                                        'left' : '50%'
                                                        });

                var styleValue = $('#style_selector').val();

                var model = this.contentsCollection.getSelected();

                this.activeStylePanel(styleValue,model);
            },

            close : function(){

                $(this.el).find('#styleDialog').css('display','none');
            },

            activeStylePanel : function(styleValue,model)
            {
                var this_ = this;


                if(styleValue=='border')
                {
                    this_.activeBorderStylePanel(model);
                }
                else if(styleValue =='box_shadow')
                {
                    this_.activeBoxShadowStylePanel(model);
                }
                else if(styleValue =='text_shadow')
                {
                    this_.activeTextShadowStylePanel(model);
                }

                $('#styleCancelBtn').click(function()
                {
                    this_.close();
                });
            }

        });

        return styleView;
    });