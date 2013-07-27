define(
    [
     'jquery',
     'underscore',
     'backbone',


     'collection/ShowCollection',

     'view/show/ShowWorkspace',

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

      //camera
     'vector3',
     'angle3',
     'quaternion',

     'EditGround',
     'asyncRenderer',
     'ObjectController',
     'ObjectController',
     'Camera',
     'eventRepeater',
        'groundListener',
        'RenderFPS'
    ],
    function($, _, Backbone,
             ShowCollection,
             ShowWorkspace){

    var MainView = Backbone.View.extend({

        showCollection : null,
        cameraModule : null,
        showData : null,

        initialize : function()
        {
            _.bindAll(this);

            this.setupWork();
        },

        setupWork : function(event)
        {
            this.cameraModule = new CameraModule({viewPort : $('#showWorkspace')});
            this.initCollections();
            this.initShowWorkspace();

            var shortUrl = localStorage.getItem('presentationUrl');

            $('#showUrlWrap').html(shortUrl);
        },


        initCollections : function()
        {

            this.showData = JSON.parse(localStorage.getItem('showData'));

            this.showCollection = new ShowCollection();
            this.showCollection.setCameraModule(this.cameraModule);
            this.showCollection.setShowData(this.showData);

        },

        initShowWorkspace : function()
        {
            var showWorkspace = new ShowWorkspace({
                "showCollection" : this.showCollection,
                'cameraModule' : this.cameraModule
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
