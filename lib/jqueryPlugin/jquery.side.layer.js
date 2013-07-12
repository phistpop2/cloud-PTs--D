$.fn.sideTodoList = function() {

    var doc           = this,
        notification  = $(doc).find("#notice"),
        addButton     = $(doc).find("#add"),
        listWrapper   = $(doc).find("#list"),
        allItems      = $(doc).find("li"),
        allDelButtons	= $(listWrapper).find("button");

        this.addTask = function() {

            var taskItem	= $("<li></li>"),
                userInput	= $(doc).find("#task_input").val();

                taskItem.html(userInput + " <button class=\"delete\">Delete</button>");

                listWrapper.append( taskItem );

                $(doc).find("#task_input").val('');


                allItems = $(doc).find("li");
                allDelButtons	= $(listWrapper).find("button");


                doc.loadRemoveOptions();



                if (allItems.length) {
                    notification.addClass("hidden_layer");
                }else
                {
                    notification.removeClass("hidden_layer");
                }


        };

        this.loadRemoveOptions	= function() {

            for (var i = 0, l = allItems.length; i < l; i++) {
                //console.log(allDelButtons[i].length);
                //console.log(typeof allDelButtons[i]);
                allDelButtons[i].addEventListener("click",doc.removeTask, false);
            }

        };

        this.removeTask = function() {

            var taskToDelete = this.parentNode;

            /* codepen kills alerts so replaced with a simplified version
             if (confirmRemoval) {

             taskToDelete.outerHTML = "";

             if (!allItems.length) {
             notification.remove("hidden");
             }

             }
             */
            taskToDelete.outerHTML = "";

            if (!allItems.length) {
                notification.remove("hidden");
            }
        };


    this.loadRemoveOptions();


    console.log(addButton);
    addButton.click("click",doc.addTask, false);


}