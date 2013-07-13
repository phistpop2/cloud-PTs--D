define(['jquery','underscore','backbone',
    'text!template/layout/leftMenuBar.html',
    'text!template/layout/StyleTemplate.html'],
    function($,_,Backbone,LeftMenuBar,StyleTemplate){
        var leftMenu = Backbone.View.extend({
            el : $('#mainLeftLayout'),

            commonControlView : null,
            mode : null,
            prevModeValue : 'normal',
            template : LeftMenuBar,
            session : null,

            sequenceCollection : null,

            initialize : function()
            {
                _.bindAll(this);
                this.mode = this.options.mode;
                this.session = this.options.session;
                this.sequenceCollection = this.options.sequenceCollection;

                this.render();
                this.eventBind();
            },

            eventBind : function()
            {

                $(window).resize(function()
                {
                    var height = parseInt($('#lmListButtonWrap').css('height'));
                    var sequenceArrayContainerHeight = (height - (parseInt($('#lmSettingButton').css('height'))))-230
                    $('#sequenceArrayContainer').css('height',sequenceArrayContainerHeight+'px');
                })
            },

            render : function(){
                $(this.el).html(this.template);

                var height = parseInt($('#lmListButtonWrap').css('height'));
                var sequenceArrayContainerHeight = (height - (parseInt($('#lmSettingButton').css('height'))))-230
                $('#sequenceArrayContainer').css('height',sequenceArrayContainerHeight+'px');

                $('#sequenceArrayContainer').sortable();

                $('#lmSaveButton').click(this.saveCurrentWork);
                $('#lmSaveButton').bind('mousedown',function(e){e.preventDefault();})

                $('#lmStyleButton').click(this.stylePanelToggle);
                $('#lmStyleButton').bind('mousedown',function(e){e.preventDefault();})

                $('#lmSequenceButton').click(this.sequencePanelToggle);
                $('#lmSequenceButton').bind('mousedown',function(e){e.preventDefault();})

                $('#lmShowButton').bind('click',this.presentationShow);

            },

            sequencePanelToggle : function(e)
            {
                if($('#mainRightLayout').css('display')=='none' || this.mode.value != 'sequence')
                {
                    if(this.prevModeValue!='sequence')
                    {
                        this.prevModeValue = this.mode.value;
                    }

                    this.mode.value = 'sequence';
                    $('#mainRightLayout').trigger('sequenceShow');
                    $('#mainRightLayout').css('display','inline-block');
                }
                else
                {
                    $('#mainRightLayout').css('display','none');
                    this.mode.value = this.prevModeValue;
                }
            },

            saveCurrentWork : function(e)
            {

                var saveDatas = this.collection.extractCurrentWorkToJSON();
                this.session.saveToGoogleDrive(saveDatas);
            },

            stylePanelToggle : function(e)
            {

                if(this.mode.value =='normal' || this.mode.value =='contain')
                {
                    if($('#mainRightLayout').css('display')=='none' && this.collection.selected)
                    {
                        $('#mainRightLayout').trigger('show');
                        $('#mainRightLayout').css('display','inline-block');

                    }
                    else
                    {
                        $('#mainRightLayout').css('display','none');
                    }
                }


            },

            presentationShow : function()
            {
                var presentationJson =  [];
                var this_ = this;

                var params = [
                    'height='+screen.height,
                    'width='+screen.width,
                    'fullscreen=yes'
                ].join(',');

                var showData = this.sequenceCollection.extractCollectionToJson();

                var showDataJson = JSON.stringify(showData);
                localStorage.setItem('showData',showDataJson);


                var popup = window.open('/show.html', 'popup_window', params);
                popup.moveTo(0,0);
            },

            startPresentation : function(data)
            {
                var presentationUrl = data.shortUrl;
                console.log(presentationUrl);

                window.open(presentationUrl);
            },

            isNotExceptAttribute : function(key)
            {
                var exceptKey = ['contain','contents'];
                var res = true;

                for(var i = 0 ; i < exceptKey.length ; i++)
                {
                    if(exceptKey[i] == key)
                    {
                        res = false;
                        break;
                    }
                }

                return res;
            },


            getFrameContents : function(contents)
            {
                var contents = $(contents).find('.frame').removeClass('frame');
                return contents[0].parentNode.outerHTML;
            }
        }) ;



        return leftMenu;
    }) ;