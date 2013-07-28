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
        //    this.setupWork();
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
            this.selectorController.addCollection('app',this);
            this.bind('changeSelect',function(){
               window.selection = null;
            });

            var workData = JSON.parse(event.workData);
            this.workDataSetup(workData);

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
            this.cameraModule.getCamera().setCenterPosition()

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

            $(document).keyup(function(e){
                if(e.keyCode==8){   //backspace
                    return false;
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
                }else if( shiftDown ){
                    return true;
                }
                else if(ctrlDown && e.keyCode == vKey)    //ctrl+v
                {

                    var clipboard = localStorage.getItem('clipboard');

                    console.log("clipboard",clipboard);

                        clipboard = JSON.parse(clipboard);
                            console.log('clipboard',clipboard);

                        for(var i=0 ; i < clipboard.length ; i++)
                        {
                            var modelAttributes = clipboard[i].data;
                            var model = null;
                                                 console.log('modelAttributes',modelAttributes);
                            if(clipboard[i].type == 'content')
                            {

                                modelAttributes.rotateX = 0;
                                modelAttributes.rotateY = 0;
                                modelAttributes.rotateZ = 0;

                                modelAttributes.translateX = 0;
                                modelAttributes.translateY = 0;
                                modelAttributes.translateZ = 0;


                                if(modelAttributes.type=='text')
                                {
                                    modelAttributes.copyData = modelAttributes.content;

                                    model = new TextModel(modelAttributes);
                                    console.log('asdhono');
                                }
                                else if(modelAttributes.type=='image')
                                {
                                    modelAttributes.copyData = true;
                                    model = new ImageModel(modelAttributes);
                                }
                                else if(modelAttributes.type=='frame')
                                {
                                    modelAttributes.copyData = true;
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

                                   var srcVector = vector3(clipData.data.translateX, clipData.data.translateY, clipData.data.translateZ);

                                   model_.controller.getAbsoluteXY(srcVector,clipData.data.width,clipData.data.height);
                                   var angle = model_.controller.getRotateQuatToCurrentWorld();
                                   var pos = model_.controller.getTranslateBiasToCurrentWorld(srcVector, clipData.data.width,clipData.data.height);
                                   model_.controller.getCenterPosition(clipData.data.width,clipData.data.height);

                                   clipData.data.rotateXBias = angle.x;
                                   clipData.data.rotateYBias = angle.y;
                                   clipData.data.rotateZBias = angle.z;
                                   clipData.data.rotateWBias = angle.w;

                                   clipData.data.translateXBias = pos.x;
                                   clipData.data.translateYBias = pos.y;
                                   clipData.data.translateZBias = pos.z;

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

            console.log('selectedObject',selectedObject);

            if(selectedObject)
            {
                if(selectedObject.get('type')=='text')
                {
                    if(window.getSelection().rangeCount > 0)
                    {
                        var selection = window.getSelection().getRangeAt(0) ;

                        window.selection = selection.cloneRange();
                        window.selection.view =  selection.commonAncestorContainer;
                    }
                    else
                    {
                        var range = document.createRange();
                        var startNode = $('#view_'+selectedObject.cid+' .textEditBox').find('.lcWord:first-child');
                        var endNode = $('#view_'+selectedObject.cid+' .textEditBox').find('.lcWord:last-child');

                        range.setStart(startNode[0],0);
                        range.setEnd(endNode[0],endNode.text().length);

                        window.selection = range;

                        window.selection.view =  range.commonAncestorContainer;


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

        upperToTextEditBox : function(el)
        {
            if($(el).hasClass('textEditBox'))
            {
                return el;
            }
            else
            {
                return this.upperToTextEditBox($(el).parent());
            }
        },


        getSelectMergeRange : function()
        {
            var targetElement = new Array();
            if(window.getSelection())
            {
                var range = window.getSelection().getRangeAt(0);

                if(range.startOffset == range.endOffset)
                {
                    return false;
                }

                var startNode = range.startContainer.parentNode;
                var endNode = range.endContainer.parentNode;



                if(($(startNode).hasClass('lcWord')&&$(endNode).hasClass('lcWord')))
                {
                    var box =  this.upperToTextEditBox(startNode);

                    var startIdx =$($(box).find('.lcWord')).index(startNode);
                    var endIdx = $($(box).find('.lcWord')).index(endNode);

                    if(startIdx > endIdx)
                    {
                        var tmp = startIdx;
                        startIdx = endIdx;
                        endIdx = tmp;
                    }




                    endIdx-=startIdx;




                    var lcWords = $(box).find('.lcWord:eq('+startIdx+')');
                    console.log(lcWords);
                    if(lcWords)
                    {
                        lcWords=lcWords.add($(box).find('.lcWord:gt('+startIdx+'):lt('+endIdx+')'));

                    }
                    else
                    {
                        lcWords = $(box).find('.lcWord:gt('+startIdx+'):lt('+endIdx+')');

                    }
                    console.log(lcWords);



                    _.each(lcWords,function(lcWord){
                    if(($(lcWord)[0].firstChild) && $(lcWord)[0].firstChild.nodeName=='#text')
                    {
                        targetElement.push(lcWord);
                    }

                });
                }
            }

            console.log('targetElement',targetElement);
            return targetElement;

        },

        selectRangeBackwards : function(range) {
            var savedRange = window.selection;

            if ( savedRange != null ) {
                if (window.getSelection)
                {
//                    var selectionView = window.selection.view;
//                    $(selectionView).focus();
                    var s = window.getSelection();
                    s.removeAllRanges();
                    s.addRange(savedRange);
                    console.log('savedRange',savedRange);

                }
            }


        },

        workDataSetup : function(workData)
        {
            var contentDatas = workData.contentDatas;
            var sequenceDatas = workData.sequenceDatas;

            if(!contentDatas)
            {
                contentDatas = {};
            }
            if(!sequenceDatas)
            {
                sequenceDatas = {};
            }


            var fresh = true;

            for(var i in contentDatas)
            {
                var contentData = contentDatas[i];
                contentData.load = true;

                var model = null;

               if(contentData.type=='text')
                {
                    model = new TextModel(contentData);
                    model.cid = contentData.cid;
                }
                else if(contentData.type=='image')
               {
                   model = new ImageModel(contentData);
                   model.cid = contentData.cid;
               }
                else if(contentData.type=='frame')
               {
                   model = new FrameModel(contentData);
                   model.cid = contentData.cid;
               }

                this.contentsCollection.add(model);
                fresh = false;
            }
            for(var i=0 ; i< sequenceDatas.length ; i++)
            {
                var sequenceData = sequenceDatas[i];

                console.log('sequenceData',sequenceData);

                var contents = new Array();
                for(var j = 0 ; j < sequenceData.contents.length ; j++)
                {
                    contents.push(sequenceData.contents[j]);
                }

                sequenceData.contents =contents;

                console.log('sequenceData_',sequenceData);

                var model = new SequenceModel(sequenceData)
                model.cid = sequenceData.cid;
                model.set('load',true);
                console.log('sequcenModel',model);

                this.sequenceCollection.add(model);
                fresh = false;
            }
            if( fresh ){
                this.insertIntroBox();

            }
        },
        insertIntroBox : function(){
            var mainTitle = new TextModel({
                width : 700,
                height : 100,

                translateX:0,
                translateY:0,
                translateZ:0,

                rotateX:0,
                rotateY:0,
                rotateZ:0,
                mainTitle:true,

                content : 'Cloud Presentation'
            });
            var subTitle = new TextModel({
                width : 200,
                height : 80,

                translateX:0,
                translateY:0,
                translateZ:0,

                rotateX:0,
                rotateY:0,
                rotateZ:0,
                subTitle:true,

                content : 'ssm'
            });
            this.contentsCollection.add( subTitle );
            this.contentsCollection.add( mainTitle );
            var height = parseInt( $('#workSpace').height() );
            subTitle.set({
                translateY : height * -0.2
            });
            mainTitle.set({
                translateY : height * 0.2
            });
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
