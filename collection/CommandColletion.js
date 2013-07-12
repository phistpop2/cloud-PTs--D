define(['underscore','backbone',
    'model/command/AbstractCommandModel'],
    function(_,Backbone,AbstractCommandModel){

        var commandCollection = Backbone.Collection.extend({

           model:AbstractCommandModel,

           MAX_HISTORY_LENGTH : 50,

           historyList : [],
           redoList : [],

           initialize : function()
           {
                this.bind('command',this.executeCommand);
           },

           executeCommand : function(command)
           {
               console.log('executeCommand');
                if(command.get('type')=='redo'){
                    this.redo();
                    return;
                }
                if(command.get('type')=='undo'){
                    this.undo();
                   return;
                }
                if(command.get('type')=='execute'){
                    this.execute(command);
                   return;
                }
               else
                {
                   console.log('command error!!');
                }
           },

           redo : function()
           {
                if(this.redoList.length > 0)
                {
                    var redoCommand = this.redoList.pop();
                    redoCommand.execute();
                    this.historyList.push(redoCommand);
                }
           },

           undo : function()
           {
                console.log('this.historyList.length : ' + this.historyList.length);
                if(this.historyList.length > 0)
                {
                    var undoCommand = this.historyList.pop();
                    undoCommand.undo();
                    this.redoList.push(undoCommand);
                }
           },

           execute : function(command)
           {
               command.execute();
               this.historyList.push(command);
               console.log(this.historyList.length);
               if(this.historyList.length > this.MAX_HISTORY_LENGTH)
               {
                    this.historyList.shift();
               }
           }


        });

        return commandCollection;

    }
);