define(
    [
     'jquery',
     'underscore',
     'backbone',
      'session',

     'collection/ContentsCollection',
     'collection/SequenceCollection',

     'view/layout/WorkSpace',
     'view/layout/TopToolBar',
     'view/layout/LeftMenu',
     'view/dialog/WorkListView',

     'model/app/SettingModel',
     'model/contents/TextModel',
     'model/contents/ImageModel',


     'jquery_knob',
     'jquery_jlayout',
     'jquery_dim',
     'jquery_editable',
     'jquery_lightbox',
     'jquery_scrollbar',
     'jquery_sidr',
     'jquery_jmenu',
     'jquery_nested_accordion',
     'jquery_icheck',
     'jquery_farbtastic',
     'jquery_selectbox',
     'jquery_sidelayer',
     'jquery_sortable',
     'jquery_colorpicker',
     'jquery_bpopup',

      //camera
     'vector3',
     'angle3',
     'quaternion',

     'EditGround',
     'asyncRenderer',
     'ObjectController',
     'Camera',
     'eventRepeater',
        'groundListener',
        'RenderFPS'
    ],
    function($, _, Backbone,session,
             ContentsCollection,
             SequenceCollection,
             WorkSpace,TopToolBar,LeftMenu,WorkListView,
             SettingModel,TextModel,ImageModel){

    var MainView = Backbone.View.extend({

        contentsCollection : null,
        cameraModule : null,
        setting : null,
        session : null,

        initialize : function()
        {
            _.bindAll(this);

            this.eventBind();
            this.sessionCheck();
        },


        sessionCheck : function()
        {
            this.session = new PSession();
            this.session.authorization();
        },

        setupUserInfo : function()
        {
            this.session.setUserInformation();
        },

        getWorkList : function()
        {
            this.session.checkWorkFolder();
        },

        showWorkList : function(e)
        {
            if(!this.workListView)
            {
                this.workListView = new WorkListView({'session' : this.session});
            }

            if(e)
            {
                this.workListView.updateListData(e.workDatas);
            }

            this.workListView.show();
        },


        eventBind : function()
        {
            $(document).bind('accountSuccess',this.setupUserInfo);
            $(document).bind('completeUserInfo',this.getWorkList);
            $(document).bind('workList',this.showWorkList);
            $(document).bind('completeWorkLoad',this.setupWork);
        },

        setupWork : function(event)
        {
            this.cameraModule = new CameraModule({viewPort : $('#workSpace')});

            this.initSetting();
            this.initCollections();

            this.initTopToolBar();
            this.initWorkspace();
            this.initLeftMenu();

            this.shortKey();
        },

        initSetting : function()
        {
            this.setting = new SettingModel({
                'backgroundColor' : '#0da861'
            });
        },

        initLeftMenu : function()
        {
            this.leftMenu = new LeftMenu({
                "session" : this.session,
                "sequenceCollection" : this.sequenceCollection
            });
        },

        initCollections : function()
        {
            this.contentsCollection = new ContentsCollection();
            this.contentsCollection.setCameraModule(this.cameraModule);

            this.sequenceCollection = new SequenceCollection();
            this.sequenceCollection.setCameraModule(this.cameraModule);
            this.sequenceCollection.setContentsCollection(this.contentsCollection);

        },

        initWorkspace : function()
        {
            var workSpace = new WorkSpace({
                'setting' : this.setting,
                "contentsCollection" : this.contentsCollection,
                'cameraModule' : this.cameraModule
            });

        },

        initTopToolBar : function()
        {
            var topToolBar = new TopToolBar({
                "session" : this.session,
                "setting"  : this.setting,
                "contentsCollection" : this.contentsCollection,
                "sequenceCollection" : this.sequenceCollection,
                'cameraModule' : this.cameraModule
            });
        },

        shortKey : function()
        {
            var this_ = this;
            var ctrlDown = false;
            var shiftDown = false;
            var ctrlKey = 17,shiftKey = 16, zKey = 90, vKey = 86;

            $(document).keydown(function(e)
            {

                if (e.keyCode == ctrlKey) ctrlDown = true;
                if (e.keyCode == shiftKey) shiftDown = true;
            }).keyup(function(e)
                {
                    if (e.keyCode == ctrlKey) ctrlDown = false;
                    if (e.keyCode == shiftKey) shiftDown = false;
            });

            $(document).keydown(function(e)
            {
                if (ctrlDown && shiftDown && e.keyCode == zKey){
                    this_.contentsCollection.redo();
                    return false;
                }
                else if (ctrlDown && e.keyCode == zKey){
                    this_.contentsCollection.undo();
                    return false;
                }
                else if(ctrlDown && e.keyCode == vKey)
                {
                    var clipboard = localStorage.getItem('clipboard');

                    try{
                        clipboard = JSON.parse(clipboard);
                        if(clipboard.type == 'content')
                        {
                            var modelAttributes = clipboard.data;
                            var model = null;

                            if(modelAttributes.type=='text')
                            {
                                model = new TextModel(modelAttributes);
                            }
                            else if(modelAttributes.type=='image')
                            {
                                model = new ImageModel(modelAttributes);
                            }

                            this_.contentsCollection.add(model);
                        }
                    }
                    catch(e)
                    {

                    }



                    return false;
                }
            });


            $(document).bind('keyup',function(e)
            {
                if(ctrlDown)
                {

                    if ((e.keyCode==67) || (e.keyCode == 88))     //ctrl+c
                    {
                        var clipboard= {};
                        var model_ = this_.contentsCollection.getSelected();

                        if(model_)
                        {
                            clipboard.type = 'content';
                            console.log('model_.attributes',model_.attributes);
                            clipboard.data = this_.copyObject(model_.attributes);

                            localStorage.setItem('clipboard',JSON.stringify(clipboard));

                            if(e.keyCode == 88)      //ctrl+x
                            {
                                model_.selfRemove();
                            }
                        }


                    }

                }
                else if(e.keyCode == 46)    //delete
                {
                    model_.selfRemove();
                }

            });
        },

        copyObject : function(obj) {
            var newObj = {};
            for (var key in obj) {
                //copy all the fields
                if( Object.prototype.toString.call( obj[key] ) === '[object Array]' ) {
                    newObj[key] = obj[key].slice(0);
                }
                else
                {
                    newObj[key] = obj[key];
                }

            }

            return newObj;
        }
    });

    var initialize = function()
    {
        var mainView = new MainView;
    }

    return {
        initialize : initialize
    };
});
