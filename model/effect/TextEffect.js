define(['jquery','underscore','backbone'],function($,_,Backbone){

    var TextEffect = Backbone.Model.extend({
        defaults:{
            r : '',
            g : '',
            b : '',
            color : '',
            direction : '',
            letterSpacing : '',
            lineHeight : '',
            textAlign : '',
            textDecoration : '',
            textIndent : '',
            textShadow : '',
            textTransform : '',
            verticalAlign : '',
            whiteSpace : '',
            wordSpacing : ''
        },

        setSelected : function() {
            this.collection.setSelected(this);
        }

    });

    return TextEffect;
});