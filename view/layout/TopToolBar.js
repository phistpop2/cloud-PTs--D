define(['jquery','underscore','backbone',
    'text!template/layout/TopToolBar.html',
    'view/dialog/StyleView',

    'model/contents/TextModel',
    'model/contents/ImageModel',
    'model/contents/FrameModel',
    'model/sequence/SequenceModel',

    'text!template/dialog/ImageInsertDialog.html',
    'jquery_knob'],
    function($,_,Backbone,
             TopToolBarTemplate,
             StyleView,

             TextModel,
             ImageModel,
             FrameModel,
             SequenceModel,

             ImageInsertDialogTemplate){

        var topToolBar = Backbone.View.extend({
            template : TopToolBarTemplate,

            session : null,
            styleView : null,
            contentsCollection : null,
            sequenceCollection : null,
            cameraModule : null,
            setting : null,
            isObjectSelected : false,

            initialize : function()
            {
                _.bindAll(this);

                this.session  = this.options.session;
                this.setting = this.options.setting;
                this.contentsCollection = this.options.contentsCollection;
                this.sequenceCollection = this.options.sequenceCollection;
                this.cameraModule = this.options.cameraModule;

                this.render();
                this.bindEvents();
                this.initInsertButtons();
            },

            bindEvents : function()
            {
                var this_= this;
                this.contentsCollection.bind("unSelected",function()
                {

                    this_.unActiveMenuSelection();
                });

                this.contentsCollection.bind("selected",function(){

                    this_.activeMenuSelection();
                });
            },

            initInsertButtons : function()
            {
                var this_ = this;
                $('#textInsertButton').click(function(){
                    this_.contentsCollection.add(new TextModel({
                            width : 0,
                            height : 0,

                            translateX:0,
                            translateY:0,
                            translateZ:0,

                            rotateX:0,
                            rotateY:0,
                            rotateZ:0
                        }
                    ));
                });

                $('#frameInsertButton').click(function(){
                    this_.contentsCollection.add(new FrameModel({
                        'borderWidth' : '2',
                        'borderStyle' : 'dotted',
                        'width' :  '520px',
                        'height' : '400px'
                    }));
                });

                $('#sequenceInsertButton').click(function()
                {
                    this_.sequenceCollection.add(new SequenceModel({
                        'slideBackgroundColor' : this_.setting.get('backgroundColor'),
                        'matrix3d' : this_.cameraModule.getCamera().getMatrixQuery(),
                        'quaternion' : this_.cameraModule.getCamera().getQuaternion().clone(),
                        'zoom': this_.cameraModule.getCamera().getLocation().clone()
                    }));
                });


                this.initImageInsertButton();


            },

            initImageInsertButton : function()
            {
                $('#TopToolBar').append(ImageInsertDialogTemplate);

                $('#TopToolBar').find('#imageInsertButton').click(function(e){

                    $('#ImageInsertDialog').lightbox_me({
                        centered: true
                    });

                    e.preventDefault();
                });
                $('#TopToolBar').find('#doImageInsert').click(this.addImage);

                $('#ImageInsertDialog').find('#closeImageDlgBtn').click(this.closeDialog);


                $('#ImageInsertDialog').find('#imageFile').bind('change', this.handleFileSelect);
            },

            closeDialog : function()
            {
                $('.topToolDialog').trigger('close');
            },

            addImage : function()
            {
                var this_ = this;

                if(this.enc)
                {
                    this.session.uploadFile(this.enc,this.fileType,function(data){
                        var src = data.file.webContentLink;
                        console.log("src",src);
                        this_.contentsCollection.add(new ImageModel({'src' : src}));
                        $('#imageUrl').val('');
                        this_.closeDialog();
                        this_.enc = null;
                    });


                }
                var src =   $('#imageUrl').val();
                this.contentsCollection.add(new ImageModel({'src' : src}));
                $('#imageUrl').val('');



            },

            handleFileSelect : function(evt)
            {
                var files = evt.target.files; // FileList object

                var file = files[0];
                var reader = new FileReader();

                var this_ = this;
                reader.onloadend = function(s)
                {
                    this_.enc = btoa(reader.result);

                    this_.fileType = file.type;
                    console.log("readed");
                }

                reader.readAsBinaryString(file);
            },


            activeFontFamilySelection : function ()
            {
                var this_ = this;

                $('#fontFamilyButton .selected').mouseover(function()
                {
                    this_.hideAllToolTip();
                    $(this).parent().find('.fontFamilySelectOptions').css('display','block');
                });


                $('#fontFamilyButton .selected').mouseout(function()
                {
                    $(this).parent().find('.fontFamilySelectOptions').css('display','none');
                });

                $('.fontFamilySelectOptions').mouseover(function()
                {
                    this_.hideAllToolTip();
                    $(this).css('display','block');
                });

                $('.fontFamilySelectOptions').mouseout(function()
                {
                    $(this).css('display','none');
                });

                $('#fontFamilyButton').find('input.selected').bind('change',function(){
                    var val = $(this).val();

                    $(this).val(val+'px');
                });

                $('.fontFamilySelectOptions').find('.selectOption').click(function(){
                    $(this).parent().parent().css('display','none');

                    $('#fontFamilyButton').find('span.selected').html($(this).html());
                });
            },

            activeFontSizeSelection : function ()
            {
                var this_ = this;
                var val = 8;
                $('#fontSizeButton').find('input.selected').val('10px');

                for(var i = 0 ; i < 10 ; i++)
                {
                    var selectOption = $("<li  class='selectOption' value='"+val+"px'>"+val+"px</li>");
                    val+=4;
                    $('#fontSizeButton').find('ul.topVerticalList').append(selectOption);
                }
/////

                $('#fontSizeButton .selected').mouseover(function()
                {
                    this_.hideAllToolTip();
                    $(this).parent().find('.fontSizeSelectOptions').css('display','block');
                });


                $('#fontSizeButton .selected').mouseout(function()
                {
                    $(this).parent().find('.fontSizeSelectOptions').css('display','none');
                });

                $('.fontSizeSelectOptions').mouseover(function()
                {
                    this_.hideAllToolTip();
                    $(this).css('display','block');
                });

                $('.fontSizeSelectOptions').mouseout(function()
                {
                    $(this).css('display','none');
                });

                $('#fontSizeButton').find('input.selected').bind('change',function(){
                   var val = parseInt($(this).val());

                    if(!val)
                    {
                        val = 0;
                    }

                    $(this).val(val+'px');
                });

                $('.fontSizeSelectOptions').find('.selectOption').click(function(){
                    $(this).parent().parent().css('display','none');
                    console.log($(this).html());
                    $('#fontSizeButton').find('input.selected').val($(this).html());

                });
////
            },

            activeSentenceSortSelection : function()
            {
                var this_ = this;
                $('#sentenceSortButton').each(function(){
                    $(this).children('div.selected').html($(this).children('div.selectOptions').children('span.selectOption:first').html());
                    $(this).attr('value',$(this).children('div.selectOptions').children('span.selectOption:first').attr('value'));

                    $(this).children('div.selected').click(function(){
                        if($(this).parent().children('div.selectOptions').css('display') == 'none'){
                            this_.hideAllToolTip();
                            $(this).parent().children('div.selectOptions').css('display','block');

                        }
                        else
                        {
                            $(this).parent().children('div.selectOptions').css('display','none');
                        }
                    });

                    $(this).find('div.selectOption').click(function(){
                        $(this).parent().css('display','none');
                        $(this).closest('div.sentenceSortButton').attr('value',$(this).attr('value'));
                        $(this).parent().siblings('div.selected').html($(this).html());
                    });
                });
            },

            activeSentenceSortSelection : function()
            {
                var this_ = this;

                $('#sentenceSortButton').each(function(){
                    $(this).children('div.selected').click(function(){
                        if($(this).parent().children('div.sentenceSortToolTip').css('display') == 'none'){
                            this_.hideAllToolTip();
                            $(this).parent().children('div.sentenceSortToolTip').css('display','block');
                        }
                        else
                        {
                            $(this).parent().children('div.sentenceSortToolTip').css('display','none');
                        }
                    });

                    $(this).children('div.selected').mouseover(function(){
                        this_.hideAllToolTip();
                        $(this).parent().find('div.sentenceSortToolTip').css('display','block');
                    });

                    $(this).children('div.selected').mouseout(function(){
                        $(this).parent().find('div.sentenceSortToolTip').css('display','none');
                    });

                    $(this).find('div.sentenceSortToolTip').mouseover(function(){
                        $(this).css('display','block');
                    });


                    $(this).find('div.sentenceSortToolTip').mouseout(function(){
                        $(this).css('display','none');
                    });
                });
            },

            activeColorSelection : function()
            {
              var this_ = this;

              $('#colorButton .icon').click(function()
              {

                  if(this_.isObjectSelected)
                  {
                      if($(this).parent().find('div.colorButtonToolTip').css('display') == 'none'){
                          this_.hideAllToolTip();
                          $(this).parent().find('div.colorButtonToolTip').css('display','block');
                      }
                      else
                      {
                          $(this).parent().find('div.colorButtonToolTip').css('display','none');
                      }
                  }
              });
            },


            doDataColorSelection : function ()
            {
                var model = this.contentsCollection.getSelected();
                var this_ = this;
                if(model)
                {
                    var value = model.get('color');

                    if(!value)
                    {
                        value = '#000000';
                    }

                    $('.colorButtonToolTip').ColorPicker({
                        flat : true,
                        color : value,
                        onChange :  function (hsb, hex, rgb) {
                            var model = this_.contentsCollection.getSelected();

                            if(model)
                            {
                                model.set('color','#'+hex);
                            }
                        }
                    });

                    $('.colorButtonToolTip').ColorPickerSetColor(value);
                }
            },

            activeObjectBackgroundColorSelection : function()
            {
                var this_ = this;


                $('#objectBackgroundColorButton .icon').click(function()
                {
                    if(this_.isObjectSelected)
                    {
                        if($(this).parent().find('div.objectBackgroundColorButtonToolTip').css('display') == 'none'){
                            this_.hideAllToolTip();
                            $(this).parent().find('div.objectBackgroundColorButtonToolTip').css('display','block');
                            $(this).parent().find('div.objectBackgroundColorButtonToolTip').ColorPicker({flat : true});
                        }
                        else
                        {
                            $(this).parent().find('div.objectBackgroundColorButtonToolTip').css('display','none');
                        }
                    }
                });
            },

            doDataBackgroundColorSelection : function ()
            {
                var model = this.contentsCollection.getSelected();
                var this_ = this;
                if(model)
                {
                    var value = model.get('background');

                    if(!value)
                    {
                        value = 'transparent';
                    }

                    $('.objectBackgroundColorButtonToolTip').ColorPicker({
                        flat : true,
                        color : value,
                        onSubmit :  function (hsb, hex, rgb) {
                            var model = this_.contentsCollection.getSelected();

                            if(model)
                            {
                                model.commitToCollection('background','#'+hex);
                            }
                        }
                    });


                    $('.objectBackgroundColorButtonToolTip').ColorPickerSetColor(value);
                }
            },

            hideStyleDialog : function()
            {
                $('#styleDialog').css('display','none');
            },

            hideAllToolTip : function()
            {
                var toolTips = ['.sentenceSortToolTip',
                                '.selectOptions',
                                '.colorButtonToolTip',
                                '.objectBackgroundColorButtonToolTip',
                                '.layoutButtonToolTip'
                                ];


                for(var i = 0 ; i < toolTips.length ; i++)
                {
                    $(toolTips[i]).each(function()
                    {
                        $(this).hide();

                    })
                }

            },

            activeLayoutSelection : function()
            {
                var this_ = this;

                $('.layoutButtonToolTip').find('.default_input').each(function(){

                    $(this).change(function(){
                        var key = $(this).data('key');
                        var model = this_.contentsCollection.getSelected();
                        var value = parseInt($(this).val());

                        if((value+'')=='NaN')
                        {
                            value = 0;
                        }


                        model.commitToCollection(key,value);
                        return true;
                    });
                });

                $(".layoutButtonToolTip").find('.knob_input').each(function(){
                    var key = $(this).data('key');
                    var knob = this;

                    $(this).change(function(e){
                        var model = this_.contentsCollection.getSelected();
                        if(model)
                        {
                            var value = parseInt($(this).val());

                            if((value+'')=='NaN')
                            {
                                value = 0;
                            }

                            if(e.isCommit)
                            {
                                model.commitToCollection(key,value);
                            }
                            else
                            {

                                model.set(key,value);
                            }
                        }
                    });

                    $(this).keydown(function(e) {
                        if (e.which == 13) {/* 13 == enter key@ascii */
                            var model = this_.contentsCollection.getSelected();
                            if(model)
                            {
                                var value = parseInt($(this).val());

                                model.commitToCollection(key,value);
                            }
                        }
                    });

                    $(this).knob({
                        'release' : function(v){
                            var event = $.Event('change');
                            event.isCommit = true;
                            $(knob).trigger(event);
                        },
                        'change' : function (v) {
                            var event = $.Event('change');
                            event.isCommit = false;
                            $(knob).trigger(event);
                        }
                    });
                });

                $('#layoutButton div.icon').click(function()
                {
                    if(this_.isObjectSelected)
                    {
                        if($(this).parent().children('div.layoutButtonToolTip').css('display') == 'none'){
                            this_.hideAllToolTip();
                            $(this).parent().children('div.layoutButtonToolTip').css('display','block');
                            this_.doDataLayoutSelection();
                        }
                        else
                        {
                            $(this).parent().children('div.layoutButtonToolTip').css('display','none');
                        }
                    }
               });
            },

            doDataLayoutSelection : function()
            {

                var model = this.contentsCollection.getSelected();
                var this_ = this;
                if(model)
                {
                    var params = {
                        'width' : model.get('width'),
                        'height' : model.get('height'),
                        'translateX' : model.get('translateX'),
                        'translateY' : model.get('translateY'),
                        'translateZ' : model.get('translateZ'),
                        'rotateX' : model.get('rotateX'),
                        'rotateY' : model.get('rotateY'),
                        'rotateZ' : model.get('rotateZ')
                    }


                    $('#TopToolBarWrap').find('.default_input').each(function(){
                       var key = $(this).data('key');
                       $(this).val(params[key]);

                    });

                    $('#TopToolBarWrap').find('.knob_input').each(function(){
                        var key = $(this).data('key');
                        $(this).val(params[key]);

                        $(this).val(params[key])
                            .trigger('change');
                    });

                }
            },

            activeStyleDialogSelection : function()
            {
                var this_ = this;

                this.styleView = new StyleView({
                    "contentsCollection" : this.contentsCollection
                });

                var styleView_ = this.styleView;

                $('#TopToolBar').find('#styleButton').find('.icon').css('opacity','1.0');
                $('#TopToolBar').find('#styleButton').click(function(){

                    if(this_.isObjectSelected)
                    {
                        if(styleView_.isOpen())
                        {
                            styleView_.close();
                        }
                        else
                        {
                            styleView_.open();
                        }
                    }
                });
            },

            activeMenuSelection : function()
            {
                this.isObjectSelected = true;

                $('#TopToolBar').find('#styleButton').find('.icon').css('opacity','1.0');

                $('#TopToolBar').find('#layoutButton').find('.icon').css('opacity','1.0');
                this.doDataLayoutSelection();

                $('#TopToolBar').find('#colorButton').find('.icon').css('opacity','1.0');
                this.doDataColorSelection();

                $('#TopToolBar').find('#objectBackgroundColorButton').find('.icon').css('opacity','1.0');
                this.doDataBackgroundColorSelection();
            },

            unActiveMenuSelection : function()
            {
                this.isObjectSelected = false;
                $('#TopToolBar').find('#styleButton').find('.icon').css('opacity','0.3');
                $('#TopToolBar').find('#layoutButton').find('.icon').css('opacity','0.3');
                $('#TopToolBar').find('#colorButton').find('.icon').css('opacity','0.3');
                $('#TopToolBar').find('#objectBackgroundColorButton').find('.icon').css('opacity','0.3');
                this.hideAllToolTip();
                this.hideStyleDialog();
            },

            render : function()
            {
                $('#workSpace').parent().append(this.template);
                this.activeSentenceSortSelection();
                this.activeFontFamilySelection();
                this.activeFontSizeSelection();
                this.activeColorSelection();
                this.activeObjectBackgroundColorSelection();
                this.activeLayoutSelection();
                this.activeStyleDialogSelection();

                this.unActiveMenuSelection()
            }
         }) ;

        return topToolBar;
    }) ;