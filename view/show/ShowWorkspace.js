define(['jquery','underscore','backbone',

            'CameraModule'],
    function($,_,Backbone,
             ObjectModel,
             TextModel){
        var showWorkspace = Backbone.View.extend({
            el : $('#showWorkspace'),

            contentsCollection : null,
            cameraModule : null,

           initialize : function()
           {
                _.bindAll(this);
               this.contentsCollection = this.options.contentsCollection;
               this.cameraModule = this.options.cameraModule;
               this.camera = this.cameraModule.getCamera();


               this.render();


               this.eventBind();
           },

           eventBind : function()
           {
                $(window).resize(this.resize);
           },


           resize : function()
           {
               var this_ = this;
               var scaleH = window.innerHeight / parseInt($(this_.el).css('height'));
               var scaleW = window.innerWidth / parseInt($(this_.el).css('width'));
               var scale = scaleW;

               if(scaleH < scaleW)  {
                   scale = scaleH;
               }

               console.log('scale : ' + scale);

               $(this_.el).css({
                  '-webkit-transform' : 'scale('+scale+')'
               });

           },

           render : function()
           {

               this.resize();
           }
        }) ;



        return showWorkspace;
    }) ;