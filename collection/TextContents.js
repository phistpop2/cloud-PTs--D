define(['underscore','backbone','model/effect/TextEffect'],
    function(_,Backbone,TextEffect){

        var TextContents = Backbone.Collection.extend({
               model:TextEffect,

               initialize : function(model)
               {
                    this.selected = model;
               },

               setSelected : function(model)
               {
                   if(this.selected){
                       this.selected.set({selected:false});
                   }
                   model.set({selected : true});
                   this.selected = model;
               }
        });



        return TextContents;

    }
);