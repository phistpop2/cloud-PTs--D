(function($){

    $.fn.enableEdit = function(options)
    {
        return this.each(function(){

            var currentCaretPosition;
            var queque = 0;
            var isHankey = false;
            var workEl = this;

            var spaceKey = 32, enterKey = 13, ctrlKey = 17;
            var this_ = this;

            $(this).bind('refresh',function(){
                allEventRefresh(this);
            });

            $(this).attr('contenteditable',true);

            $(this).bind('keydown',function(e){
                $(this).trigger('textInput');

            });

            $(this).bind('keyup',function(e){


                if(e.keyCode==spaceKey)
                {
                    allEventRefresh(this);
                }
                else if(e.keyCode==ctrlKey)
                {
                    selectRange();
                }
            });

            $(this).bind('click',function(e){

                $(this).attr('contenteditable',true);
            });

            function selectRange(){
                var sel = window.getSelection();

                var startWordNode = sel.anchorNode.parentNode;
                var startWordIdx = $(startWordNode).index();
                var startSentenceNode = startWordNode.parentNode;
                var startSentenceIdx = $(startSentenceNode).index();

                var endWordNode = sel.focusNode.parentNode;
                var endWordIdx = $(endWordNode).index();

                var endSentenceNode = endWordNode.parentNode;
                var endSentenceIdx = $(endSentenceNode).index();

                var editBox = startSentenceNode.parentNode;



                if(startSentenceIdx > endSentenceIdx)
                {
                    startWordNode = sel.focusNode.parentNode;
                    startWordIdx = $(startWordNode).index();
                    startSentenceNode = startWordNode.parentNode;
                    startSentenceIdx = $(startSentenceNode).index();

                    endWordNode = sel.anchorNode.parentNode;
                    endWordIdx = $(endWordNode).index();
                    endSentenceNode = endWordNode.parentNode;
                    endSentenceIdx = $(endSentenceNode).index();


                }
                else if(startSentenceIdx == endSentenceIdx)
                {
                    if(startWordIdx > endWordIdx)
                    {
                        startWordNode = sel.focusNode.parentNode;
                        startWordIdx = $(startWordNode).index();
                        startSentenceNode = startWordNode.parentNode;
                        startSentenceIdx = $(startSentenceNode).index();

                        endWordNode = sel.anchorNode.parentNode;
                        endWordIdx = $(endWordNode).index();
                        endSentenceNode = endWordNode.parentNode;
                        endSentenceIdx = $(endSentenceNode).index();

                    }
                }

                var selectedSentence = [];
                if(startSentenceIdx == endSentenceIdx)
                {

                    var gtVal = startWordIdx;
                    var ltVal = (endWordIdx - gtVal);
                    selectedSentence = $(startSentenceNode).find('.lcWord:gt('+gtVal+'):lt('+ltVal+'), .lcWord:eq('+gtVal+')');
                }
                else
                {

                    var gtVal = startWordIdx;
                    var ltVal = endWordIdx;
                    for(var i = startSentenceIdx ; i <= endSentenceIdx ; i++)
                    {
                        var addSentence=[];

                        if(i==startSentenceIdx)
                        {
                            addSentence = $(editBox).find('.clSentence:eq('+i+')').find('.lcWord:gt('+gtVal+'), .lcWord:eq('+gtVal+')');
                        }
                        else if(i==endSentenceIdx)
                        {
                            addSentence = $(editBox).find('.clSentence:eq('+i+')').find('.lcWord:lt('+ltVal+'), .lcWord:eq('+ltVal+')');
                        }
                        else
                        {
                            addSentence = $(editBox).find('.clSentence:eq('+i+')').find('.lcWord');
                        }

                        selectedSentence.push(addSentence);
                    }

                }




            }

            function allEventRefresh(el,evt)
            {
                       console.log('allEventRefresh');
                parseToWord(el);
            }



            function parseToWord(el)
            {
                var box = $(el);

                var contents = box.contents();

                for(var i =0 ; i < contents.length ; i++)
                {
                    var content = contents[i];

                    if(content.nodeType==1)         //element
                    {
                        parseToWord(content);
                    }
                    else if(content.nodeType==3)
                    {
                        var nextElement = content.nextSibling;
                        var previousElement = content.previousSibling;
                        var parentElement =  content.parentNode;

                        var lcWords = '';

                        var contentCharacter = content.nodeValue;
                        if(contentCharacter.length>1)
                        {
                            for(var i = 0 ; i < contentCharacter.length ; i++)
                            {
                                lcWords += ('<span class=lcWord>' +contentCharacter[i]+'</span>');
                            }

                            if(previousElement)
                            {
                                $(lcWords).insertAfter(previousElement);
                            }
                            else
                            {
                                $(parentElement).prepend(lcWords);
                            }


                            if($(parentElement).hasClass('lcWord')&&($(parentElement)[0].firstChild) && ($(parentElement)[0].firstChild.nodeName!='#text'))
                            {
                                console.log("$(parentElement).children()",$(parentElement).children());
                                $(parentElement).children().insertAfter($(parentElement).prev());
                            }

                            content.remove();
                        }


                    }
                }
            }

            function findNotWordElement(lcWord)
            {
                if($(lcWord).hasClass('lcWord'))
                {
                    return findNotWordElement($(lcWord).parent())
                }
                else
                {
                    return lcWord;
                }
            }

            function getPureTextNode(el){
                $(el).ch
            }

            function setCaretPosition(ctrl, pos)
            {

                if(ctrl.setSelectionRange)
                {
                    ctrl.focus();
                    ctrl.setSelectionRange(pos,pos);
                }
                else if (ctrl.createTextRange) {
                    var range = ctrl.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            }
            function getCaretPosition(el)
            {

                var caretPos = 0, containerEl = null, sel, range;
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.rangeCount) {
                        range = sel.getRangeAt(0);

                        var container = range.commonAncestorContainer;

                        if(container)
                        {
                            while(container.nodeType!=1)
                            {
                                container =  container.parentNode;
                            }

                            if(container.nodeType==1)
                            {
                                if(container.tagName == 'DIV')
                                {
                                    caretPos = $(container).find('span').length;

                                }
                                else // tagName == 'SPAN'
                                {

                                    while(container.previousElementSibling)
                                    {
                                        container = container.previousElementSibling;

                                        caretPos++;
                                    }

                                    if(caretPos!=0){
                                        caretPos += 1;
                                    }
                                    else if(container.tagName=='SPAN')
                                    {
                                        caretPos=1;
                                    }
                                }
                            }



                        }


                    }


                }
                return caretPos;
            }
        });
    }


    $.fn.justtext = function() {
        return $(this).clone()
            .children()
            .remove()
            .end()
            .text();

    };

}(jQuery));