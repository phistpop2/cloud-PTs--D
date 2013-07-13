define(['jquery','underscore','backbone',

            'CameraModule'],
    function($,_,Backbone,
             ObjectModel,
             TextModel){
        var showWorkspace = Backbone.View.extend({
            el : $('#showWorkspace'),

            showCollection : null,
            cameraModule : null,

            currentShowPage : 0,

           initialize : function()
           {
                _.bindAll(this);
               this.showCollection = this.options.showCollection;
               this.cameraModule = this.options.cameraModule;
               this.camera = this.cameraModule.getCamera();

               this.render();


               this.eventBind();
               this.show(this.currentShowPage);
           },

           eventBind : function()
           {
                var this_ = this;
                $(window).resize(this.resize);

                $(window).keyup(function(e){
                   var rightKey = 39, leftKey = 37

                   if(e.keyCode == rightKey)
                   {
                       console.log('check');
                       this_.nextPage();
                   }
                   else if(e.keyCode == leftKey)
                   {
                        this_.prevPage();
                   }
                });
           },

           nextPage : function()
           {
                var pageSize = this.showCollection.models.length;
                console.log('pageSize',pageSize);

                this.currentShowPage++;

                if(this.currentShowPage > pageSize-1)
                {
                    this.currentShowPage = 0;
                }

                this.show(this.currentShowPage);

           },

           prevPage : function()
           {
               var pageSize = this.showCollection.models.length;

               this.currentShowPage--;
               if(this.currentShowPage < 0)
               {
                   this.currentShowPage = pageSize-1;
               }

               this.show(this.currentShowPage);
           },

           show : function(page)
           {
               var showModel = this.showCollection.models[page];
               var matrix3d = showModel.get('matrix3d');
               var moveDuration = showModel.get('moveDuration');
               var world = $('#showWorkspace').find('#world');

               world.css({
                   webkitTransform: 'matrix3d('+matrix3d+')',
                   transitionDuration:  moveDuration+"ms"
               });
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
                  '-webkit-transform' : 'scale('+scale+')',
                  '-webkit-transform-origin' : '0% 0%'
               });

           },

           render : function()
           {
               this.resize();
           }
        }) ;



        return showWorkspace;
    }) ;