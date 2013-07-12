define(['jquery','underscore','backbone',
    'text!template/dialog/WorkListDialog.html',
    'jquery_knob'],
    function($,_,Backbone,WorkListDialog){

        var workListView = Backbone.View.extend({

            el : $("#mainLayout"),

            template : _.template(WorkListDialog),

            listData : null,

            session : null,

            initialize : function(){
                _.bindAll(this);
                this.session = this.options.session;

                $(this.el).append(this.template);
            },

            init : function()
            {

            },

            show : function()
            {
                $('#workListDialog').lightbox_me({
                    centered: true,
                    closeClick : false
                });

                $('#newWorkBtn').click(this.createNewWork);


                $('#workListWrap').html('');

                var this_ = this;
                for(var i = 0 ; i < this.listData.length ; i++)
                {
                    var title = this.listData[i].title;
                    var url = this.listData[i].downloadUrl;
                    var workItem = $("<li data-url="+url+"><a>"+title+"</a></li>");
                    $('#workListWrap').append(workItem);

                    (function(workItem,fileData){

                        workItem.click({'fileData':fileData},this_.selectWork);
                    })(workItem,this.listData[i]);
                }
            },

            createNewWork : function()
            {
                var subject = $('#newWorkSubject').val();

                var this_ = this;
                if(subject && subject.length>1)
                {
                    this.session.createNewWorkFile(subject,function(result)
                    {
                        var fileData = result;
                        this_.selectWork(fileData);
                    });
                }
            },


            selectWork : function(e)
            {
                var fileData = null;

                if(e.data)
                {
                    fileData = e.data.fileData;
                }
                else
                {
                    fileData = e;
                }

                this.session.openWorkFile(fileData,this.completeWorkLoad);
            },


            completeWorkLoad : function(workData)
            {
                var event = $.Event('completeWorkLoad');
                event.workData = workData;

                $(document).trigger(event);

                this.close();
            },

            close : function()
            {
                $('#workListDialog').trigger('close');
            },

            updateListData : function(listData)
            {

                this.listData = listData.items;
            }

        });

        return workListView;
    });