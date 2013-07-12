define(['jquery','underscore','backbone',
    'view/control/CommonControlView',
    'jquery_knob'],
    function($,_,Backbone,CommonControlView){
        var propertyControlMenu = Backbone.View.extend({
            el : $('#mainLeftLayout'),
            commonControlView : null,

            initialize : function()
            {
                _.bindAll(this);

                this.commonControlView = new CommonControlView();
                this.collection.bind('change:selected',this.selectChange,this);
            },

            selectChange : function(m)
            {
                this.commonControlView.render(m);
                this.commonControlView.setModel(m);
                $(this.el).append(this.commonControlView.el);
            }
        }) ;



        return propertyControlMenu;
    }) ;