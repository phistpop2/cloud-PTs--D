define(['jquery','underscore','backbone',
         'model/command/AbstractCommandModel'
        ],function($,_,Backbone,AbstractCommandModel){

    var contentsTransformCommandModel = AbstractCommandModel.extend({
        defaults:{
            name :'transform'
        },

        execute : function()
        {
            if(this.keyPressCode == 'R')
            {
                this.model.set('rotateY',this.rotateY);
                this.model.set('rotateX',this.rotateX);
            }
            else
            {
                this.model.set('translateX',this.translateX);
                this.model.set('translateY',this.translateY);
            }
        },

        undo : function()
        {
            this.model.set('rotateY',this.initRotateY);
            this.model.set('rotateX',this.initRotateX);
            this.model.set('rotateX',this.initRotateX);
            this.model.set('translateX',this.initTranslateX);
            this.model.set('translateY',this.initTranslateY);
            this.model.set('translateZ',this.initTranslateZ);
        }

    });

    return contentsTransformCommandModel;
});