define(['jquery','underscore','backbone',
         'text!template/layout/StyleTemplate.html',
          'jquery_knob'],
    function($,_,Backbone,StyleTemplate){

        var conmmonControlView = Backbone.View.extend({

            template : _.template(StyleTemplate),

            initialize : function(){
                _.bindAll(this);
            },

            setModel : function(m)
            {
                this.model = m;
                this.model.bind('change',this.changeModel,this);
            },

            changeModel : function(m)
            {
                $("#commonLayoutMenu > li > div").click(function(){

                    if(false == $(this).next().is(':visible')) {
                        $('#commonLayoutMenu ul').slideUp(300);
                    }
                    $(this).next().slideToggle(300);
                });


                this.knobSetting($('#xTransKnob'),m,['translateX']);
                this.knobSetting($('#yTransKnob'),m,['translateY']);
                this.knobSetting($('#zTransKnob'),m,['translateZ']);

                this.knobSetting($('#xRotKnob'),m,['rotateX']);
                this.knobSetting($('#yRotKnob'),m,['rotateY']);

                this.knobSetting($('#scaleKnob'),m,['scaleX','scaleY','scaleZ'],function(val){
                    return val/100;
                });

            },

            knobSetting : function(knobObj,model,properties,func){

              knobObj.knob({
                  change : function(val)
                  {
                    var tmp = {};
                    if(func)
                    {
                        val = func(val);
                    }

                    for(var i  = 0 ; i <  properties.length ; i ++)
                    {
                        var prop = properties[i];
                        tmp[prop] = val;
                    }

                    model.set(tmp );
                  }
              });

                for(var i  = 0 ; i <  properties.length ; i ++)
              {
                  knobObj.val(model.get(properties[i])).trigger('change');
              }


            },

            render : function(m)
            {
                this.model = m;
                $(this.el).remove('#commonLayoutMenu');
                $(this.el).html(this.template());



            }
         });

        return conmmonControlView;
    });