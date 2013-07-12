define(['jquery','underscore','backbone'],
    function($,_,Backbone){

    var ObjectModel = Backbone.Model.extend({
        defaults:{
            type :'object',
            width : '100%',
            height : '100%',
            background : '#ffffff',
            translateX : 0,
            translateY : 0,
            translateZ : 0,
            rotateX : 0,
            rotateY : 0,
            rotateZ : 0,
            scaleX : 1,
            scaleY : 1,
            scaleZ : 1,
            matrix3d : null,

            //style
            borderWidth : 0,
            borderTopLeftRadius : 0,
            borderTopRightRadius : 0,
            borderBottomLeftRadius : 0,
            borderBottomRightRadius : 0


        },

        doCommited : true,
        commitBeforeData : {},
        controller : null,

        initialize : function()
        {
            _.bindAll(this);
            if( !this.get('boxShadows') ){
                this.set({boxShadows: new Array()});
            }

        },

        initController : function(camera)
        {
            if(!this.controller)
            {
                this.controller = new ObjectController(camera);
                this.controller.showFacade();
                var angle = this.controller.getRotation(0,0,0);

                this.set('rotateX',angle.getX());
                this.set('rotateY',angle.getY());
                this.set('rotateZ',angle.getZ());



            }
        },

        set : function(key,value)
        {
            Backbone.Model.prototype.set.apply(this,arguments);

            if(this.doCommited)
            {
                this.commitBeforeData = this.copyObject(this.attributes);
                this.doCommited = false;
            }
        },

        isSelected : function()
        {
            var selected = false;
            if(this.collection.getSelected()==this)
            {
                selected=true;
            }
            return selected;
        },

        commitToCollection : function(key,value)
        {

            var prevValue = this.commitBeforeData[key];

            if(typeof(key)!='string')
            {
                prevValue = this.commitBeforeData[key[0]];
            }
            if(Object.prototype.toString.call(value)==='[object Array]')
            {
                if(prevValue)
                {
                    prevValue =  prevValue.slice(0);
                }
                else
                {
                    prevValue = new Array();
                }
            }
            else if(typeof(key)=='object')
            {
                var obj = key;
                var keys = [];
                var values = [];
                var prevValues = [];

                for(var keyName in obj)
                {
                    keys.push(keyName);
                    values.push(obj[keyName]);
                    prevValues.push(this.commitBeforeData[keyName]);
                }

                key = keys;
                value = values;
                prevValue = prevValues;

            }


            var historyData = {
                    'model' : this,
                    'type' : 'obj',           //add, remove, obj
                    'key' : key,
                    'value' : value,
                    'prevValue' : prevValue
                };


            var isChanged = false;

            if(typeof(value)=='object')
            {

                if(value.length == prevValue.length)
                {
                    for(var i = 0 ; i < value.length ; i++)
                    {

                        if(value[i] != prevValue[i])
                        {

                            isChanged = true;
                            break;
                        }
                    }
                }
                else
                {
                    isChanged = true;
                }
            }
            else if(historyData.value != historyData.prevValue)
            {
                console.log('chnaged data',historyData.value,historyData.prevValue)
                isChanged = true;
            }


            if(isChanged)
            {


                this.doCommited = true;
                this.commitBeforeData = 0;

                if(typeof(key)=='string')
                {
                    this.set(key,value);
                }
                else
                {
                    var setData = {};

                    if(value.length > 1)
                    {
                        for(var i = 0;  i < key.length ; i++)
                        {
                            setData[key[i]] = value[i];

                        }
                    }
                    else
                    {
                        for(var i = 0;  i < key.length ; i++)
                        {
                            setData[key[i]] = value;
                        }
                    }


                    console.log('setData',setData);
                    this.set(setData);
                }

                console.log(historyData);
                this.collection.addToHistory(historyData);
            }
        },

        setSelected : function() {
            this.collection.setSelected(this);
        },

        copyObject : function(obj) {
            var newObj = {};
            for (var key in obj) {
                //copy all the fields
                if( Object.prototype.toString.call( obj[key] ) === '[object Array]' ) {
                    newObj[key] = obj[key].slice(0);
                }
                else
                {
                    newObj[key] = obj[key];
                }

            }

            return newObj;
        }

    });

    return ObjectModel;
});