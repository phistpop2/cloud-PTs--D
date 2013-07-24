define(
    [
     'jquery',
     'underscore',
     'backbone',
      'session',

     'collection/ContentsCollection',
     'collection/SequenceCollection',

     'controller/SelectController',

     'view/layout/WorkSpace',
     'view/layout/TopToolBar',
     'view/layout/LeftMenu',
     'view/dialog/WorkListView',

     'model/app/SettingModel',
     'model/contents/TextModel',
     'model/contents/ImageModel',
     'model/contents/FrameModel',
     'model/sequence/SequenceModel',

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
             ContentsCollection,SequenceCollection,
             SelectController,
             WorkSpace,TopToolBar,LeftMenu,WorkListView,
             SettingModel,TextModel,ImageModel,FrameModel,SequenceModel){

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
            this.selectorController = new SelectController();

            this.initSetting();
            this.initCollections();

            this.initTopToolBar();
            this.initWorkspace();
            this.initLeftMenu();

            this.shortKey();


            window.getSelectRange = this.getSelectRange;
            window.getSelectMergeRange = this.getSelectMergeRange;
            window.selectRangeBackwards = this.selectRangeBackwards;
            window.saveSelectRange = this.saveSelectRange;;

        },

        initSetting : function()
        {
            this.setting = new SettingModel({
                'backgroundColor' : '#1c1e20'
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
            this.contentsCollection.setSelectController(this.selectorController);

            this.sequenceCollection = new SequenceCollection();
            this.sequenceCollection.setCameraModule(this.cameraModule);
            this.sequenceCollection.setContentsCollection(this.contentsCollection);
            this.sequenceCollection.setSelectController(this.selectorController);

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

            $(document).keydown(function(e){
                if(e.keyCode==8){   //backspace
                    e.preventDefault();
                }
            }).keypress(function(e){
                    if(e.keyCode==8){   //backspace
                        e.preventDefault();
                    }
            }).keyup(function(e){
                if(e.keyCode==8){   //backspace
                    e.preventDefault();
                }
            });



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
                else if(ctrlDown && e.keyCode == vKey)    //ctrl+v
                {
                    var clipboard = localStorage.getItem('clipboard');

                    try{
                        clipboard = JSON.parse(clipboard);

                        for(var i in clipboard)
                        {
                            var modelAttributes = clipboard[i].data;
                            var model = null;

                            if(clipboard[i].type == 'content')
                            {

                                if(modelAttributes.type=='text')
                                {
                                    model = new TextModel(modelAttributes);
                                }
                                else if(modelAttributes.type=='image')
                                {
                                    model = new ImageModel(modelAttributes);
                                }
                                else if(modelAttributes.type=='frame')
                                {
                                    model = new FrameModel(modelAttributes);
                                }

                                this_.contentsCollection.add(model);
                            }
                            else if(clipboard[i].type == 'sequence')
                            {
                                model = new SequenceModel(modelAttributes);
                                this_.sequenceCollection.add(model);
                            }
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
                        var clipboard= [];
                        var selectedObjects = this_.selectorController.getSelectedObjects();
                        console.log('ctrl+c',selectedObjects);

                        for(var i in selectedObjects)
                        {
                           var selectedObject = selectedObjects[i];
                           if(selectedObject.type=='content')
                           {
                               var model_ = this_.contentsCollection.getByCid(selectedObject.data);

                               if(model_)
                               {
                                   var clipData = {};
                                   clipData.type = 'content';
                                   clipData.data = this_.copyObject(model_.attributes);

                                   clipboard.push(clipData);

                                   if(e.keyCode == 88)      //ctrl+x
                                   {
                                       model_.selfRemove();
                                   }
                               }
                           }
                           else if(selectedObject.type=='sequence')
                           {
                               var model_ = this_.sequenceCollection.getByCid(selectedObject.data);
                               if(model_)
                               {
                                   var clipData = {};
                                   clipData.type = 'sequence';
                                   clipData.data = this_.copyObject(model_.attributes);

                                   clipboard.push(clipData);

                                   if(e.keyCode == 88)      //ctrl+x
                                   {
                                       model_.selfRemove();
                                   }
                               }
                           }
                           localStorage.setItem('clipboard',JSON.stringify(clipboard));
                        }
                    }

                }
                else if(e.keyCode == 46)    //delete
                {
                    var selectedObjects = this_.selectorController.getSelectedObjects();

                    for(var i in selectedObjects)
                    {
                        var selectedObject = selectedObjects[i];

                        var model_ = null;
                        if(selectedObject.type=='content')
                        {
                            model_ = this_.contentsCollection.getByCid(selectedObject.data);
                        }
                        else if(selectedObject.type=='sequence')
                        {
                            model_ = this_.sequenceCollection.getByCid(selectedObject.data);
                        }

                        if(model_)
                        {
                            model_.selfRemove();
                        }
                    }

                }

            });
        },

        copyObject : function(obj) {
            var newObj = {};
            for (var key in obj) {
                //copy all the fields
                if( Object.prototype.toString.call( obj[key] ) === '[object Array]' )
                {
                    newObj[key] = obj[key].slice(0);
                }
                else
                {
                    newObj[key] = obj[key];
                }

            }

            return newObj;
        },

        saveSelectRange : function()
        {


            var selectedObject = this.contentsCollection.getSelectedLastObject();

            if(selectedObject)
            {
                if(selectedObject.get('type')=='text')
                {
                    if(window.getSelection().rangeCount > 0)
                    {
                        var selection = window.getSelection().getRangeAt(0) ;

                        var className = selection.commonAncestorContainer.className;

                        if((className=='clSentence')||
                            (className=='textEditBox'))
                        {
                            window.selection = selection;
                            window.selection.view =  selection.commonAncestorContainer;
                        }
                    }
                    else
                    {
                        window.selection = null;
                    }
                }
                else
                {
                     window.selection = null;
                }
            }



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
        },

        getSelectMergeRange : function()
        {
            var rawSelectRange = window.getSelectRange();
            var mergeRange = [];

            if(rawSelectRange)
            {
                _.each(rawSelectRange,function(c){

                    if(Object.prototype.toString.call( c ) === '[object Object]'){
                        for(var i = 0 ; i < c.length ; i++)
                        {
                            mergeRange.push(c[i]);
                        }
                    }
                    else{

                        mergeRange.push(c)
                    }
                });
            }

            return mergeRange;
        },

        selectRangeBackwards : function(range) {
            var savedRange = window.selection;

            if ( savedRange != null ) {
                if (window.getSelection)
                {
                    var selectionView = window.selection.view;
                    console.log('selectionView',selectionView);
                    $(selectionView).focus();
                    var s = window.getSelection();
                    if (s.rangeCount > 0)
                        s.removeAllRanges();
                    s.addRange(savedRange);
                }
            }

            console.log('selectRangeBackwards');

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
