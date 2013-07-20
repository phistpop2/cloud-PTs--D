/* ===================================================
 *  jquery-sortable.js v0.9.10
 *  http://johnny.github.com/jquery-sortable/
 * ===================================================
 *  Copyright (c) 2012 Jonas von Andrian
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 *  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ========================================================== */


!function ( $, window, undefined){
    var eventNames,
        pluginName = 'sortable',
        containerDefaults = {
            // If true, items can be dragged from this container
            drag: true,
            // If true, items can be droped onto this container
            drop: true,
            // Exclude items from being draggable, if the
            // selector matches the item
            exclude: "",
            // If true, search for nested containers within an item
            nested: true,
            // If true, the items are assumed to be arranged vertically
            vertical: true
        }, // end container defaults
        groupDefaults = {
            // This is executed after the placeholder has been moved.
            afterMove: function ($placeholder, container) {
            },
            // The css selector of the containers
            containerSelector: "ol, ul",
            // Distance the mouse has to travel to start dragging
            distance: 0,
            // The css selector of the drag handle
            handle: "",
            // The css selector of the items
            itemSelector: "li",
            // Check if the dragged item may be inside the container.
            // Use with care, since the search for a valid container entails a depth first search
            // and may be quite expensive.
            isValidTarget: function ($item, container) {
                return true
            },
            // Executed before onDrop if placeholder is detached.
            // This happens if pullPlaceholder is set to false and the drop occurs outside a container.
            onCancel: function ($item, container, _super) {
            },
            // Executed at the beginning of a mouse move event.
            // The Placeholder has not been moved yet.
            onDrag: function ($item, position, _super) {

                $item.css(position)
            },
            // Called after the drag has been started,
            // that is the mouse button is beeing held down and
            // the mouse is moving.
            // The container is the closest initialized container.
            // Therefore it might not be the container, that actually contains the item.
            onDragStart: function ($item, container, _super) {
                $item.css({
                    height: $item.height(),
                    width: $item.width()
                })
                $item.addClass("dragged")
                $("body").addClass("dragging")
            },
            // Called when the mouse button is beeing released
            onDrop: function ($item, container, _super) {

                $item.removeClass("dragged").removeAttr("style")
                $("body").removeClass("dragging")
            },
            // Called on mousedown.
            onMousedown: function($item, event, _super) {
                event.preventDefault()
            },
            // Template for the placeholder. Can be any valid jQuery input
            // e.g. a string, a DOM element
            placeholder: '<li class="placeholder"/>',
            // If true, the position of the placeholder is calculated on every mousemove.
            // If false, it is only calculated when the mouse is above a container.
            pullPlaceholder: true,
            // Specifies serialization of the container group.
            // The pair $parent/$children is either container/items or item/subcontainers.
            // Note that this default method only works, if every item only has one subcontainer
            serialize: function ($parent, $children, parentIsContainer) {
                var result = $.extend({}, $parent.data())

                if(parentIsContainer)
                    return $children
                else if ($children[0]){
                    result.children = $children
                    delete result.subContainer
                }

                delete result.sortable

                return result
            },
            // Set tolerance while dragging. Positive values will decrease sensitivity.
            tolerance: 0
        }, // end group defaults
        containerGroups = {},
        groupCounter = 0

    if('ontouchstart' in window){
        eventNames = {
            start: "touchstart.sortable",
            end: "touchend.sortable touchcancel.sortable",
            move: "touchmove.sortable"
        }
    } else {
        eventNames = {
            start: "mousedown.sortable",
            end: "mouseup.sortable",
            move: "mousemove.sortable"
        }
    }

    /*
     * a is Array [left, right, top, bottom]
     * b is array [left, top]
     */
    function d(a,b) {
        var x = Math.max(0, a[0] - b[0], b[0] - a[1]),
            y = Math.max(0, a[2] - b[1], b[1] - a[3])
        return x+y;
    }

    function remove(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    }

    function setDimensions(array, dimensions, useOffset) {
        var i = array.length,
            offsetMethod = useOffset ? "offset" : "position"
        while(i--){
            var el = array[i].el ? array[i].el : $(array[i]),
            // use fitting method
                pos = el[offsetMethod]()
            dimensions[i] = [
                pos.left,
                pos.left + el.outerWidth(true),
                pos.top,
                pos.top + el.outerHeight(true)
            ]
        }
    }

    function getRelativePosition(pointer, element) {
        var offset = element.offset()
        return {
            left: pointer.left - offset.left,
            top: pointer.top - offset.top
        }
    }

    function sortByDistanceDesc(dimensions, pointer, lastPointer) {
        pointer = [pointer.left, pointer.top]
        lastPointer = lastPointer && [lastPointer.left, lastPointer.top]

        var dim,
            i = dimensions.length,
            distances = []

        while(i--){
            dim = dimensions[i]
            distances[i] = [i,d(dim,pointer), lastPointer && d(dim, lastPointer)]
        }
        distances = distances.sort(function  (a,b) {
            return b[1] - a[1] || b[2] - a[2] || b[0] - a[0]
        })

        // last entry is the closest
        return distances
    }

    function processChildContainers(item, containerSelector, method, ignoreChildren) {
        var childContainers = item.find(containerSelector),
            i = childContainers.length

        while(i--){
            var container = childContainers.eq(i).data(pluginName)
            if(container)
                container[method](ignoreChildren)
        }

    }


    function ContainerGroup(options) {
        this.options = $.extend({}, groupDefaults, options)
        this.containers = []
        this.childGroups = []
        this.scrolledProxy = $.proxy(this.scrolled, this)
        this.dragProxy = $.proxy(this.drag, this)
        this.dropProxy = $.proxy(this.drop, this)

        if(this.options.parentGroup)
            this.options.parentGroup.childGroups.push(this)
        else {
            this.placeholder = $(this.options.placeholder)
            if(!options.isValidTarget)
                this.options.isValidTarget = undefined
        }
    }

    ContainerGroup.get = function  (options) {
        if( !containerGroups[options.group]) {
            if(!options.group)
                options.group = groupCounter ++
            containerGroups[options.group] = new ContainerGroup(options)
        }
        return containerGroups[options.group]
    }

    ContainerGroup.prototype = {
        dragInit: function  (e, itemContainer) {
            this.$document = $(itemContainer.el[0].ownerDocument)

            this.toggleListeners('on')

            // get item to drag
            this.item = $(e.target).closest(this.options.itemSelector)
            this.itemContainer = itemContainer

            this.setPointer(e)

            this.options.onMousedown(this.item, e, groupDefaults.onMousedown)
        },
        drag: function  (e) {
            if(!this.dragging){
                if(!this.distanceMet(e))
                    return

                processChildContainers(this.item, this.options.containerSelector, "disable", true)

                this.options.onDragStart(this.item, this.itemContainer, groupDefaults.onDragStart)
                this.item.before(this.placeholder)
                this.dragging = true
            }

            this.setPointer(e)
            // place item under the cursor
            this.options.onDrag(this.item,
                getRelativePosition(this.pointer, this.item.offsetParent()),
                groupDefaults.onDrag)

            var x = e.pageX,
                y = e.pageY,
                box = this.sameResultBox,
                t = this.options.tolerance

            if(!box || box.top - t > y || box.bottom + t < y || box.left - t > x || box.right + t < x)
                if(!this.searchValidTarget())
                    this.placeholder.detach()
        },
        drop: function  (e) {
            console.log('aaaa');
            this.toggleListeners('off')

            if(this.dragging){
                // processing Drop, check if placeholder is detached
                if(this.placeholder.closest("html")[0])
                    this.placeholder.before(this.item).detach()
                else
                    this.options.onCancel(this.item, this.itemContainer, groupDefaults.onCancel)

                this.options.onDrop(this.item, this.getContainer(this.item), groupDefaults.onDrop)
                processChildContainers(this.item, this.options.containerSelector, "enable", true)

                // cleanup
                this.clearDimensions()
                this.clearOffsetParent()
                this.lastAppendedItem = this.sameResultBox = undefined
                this.dragging = false
            }

            this.item = undefined
        },
        searchValidTarget: function  (pointer, lastPointer) {
            if(!pointer){
                pointer = this.relativePointer || this.pointer
                lastPointer = this.lastRelativePointer || this.lastPointer
            }

            var distances = sortByDistanceDesc(this.getContainerDimensions(),
                    pointer,
                    lastPointer),
                i = distances.length

            while(i--){
                var index = distances[i][0],
                    distance = distances[i][1]

                if(!distance || this.options.pullPlaceholder){
                    var container = this.containers[index]
                    if(!this.$getOffsetParent()){
                        var offsetParent = container.getItemOffsetParent()
                        pointer = getRelativePosition(pointer, offsetParent)
                        lastPointer = getRelativePosition(lastPointer, offsetParent)
                    }
                    if(container.searchValidTarget(pointer, lastPointer))
                        return true
                }
            }

        },
        movePlaceholder: function  (container, item, method, sameResultBox) {
            var lastAppendedItem = this.lastAppendedItem
            if(!sameResultBox && lastAppendedItem && lastAppendedItem[0] === item[0])
                return;

            item[method](this.placeholder)
            this.lastAppendedItem = item
            this.sameResultBox = sameResultBox
            this.options.afterMove(this.placeholder, container)
        },
        getContainerDimensions: function  () {
            if(!this.containerDimensions)
                setDimensions(this.containers, this.containerDimensions = [], !this.$getOffsetParent())
            return this.containerDimensions
        },
        getContainer: function  (element) {
            return element.closest(this.options.containerSelector).data(pluginName)
        },
        $getOffsetParent: function  () {
            if(this.offsetParent === undefined){
                var i = this.containers.length - 1,
                    offsetParent = this.containers[i].getItemOffsetParent()

                if(!this.options.parentGroup){
                    while(i--){
                        if(offsetParent[0] != this.containers[i].getItemOffsetParent()[0]){
                            // If every container has the same offset parent,
                            // use position() which is relative to this parent,
                            // otherwise use offset()
                            // compare #setDimensions
                            offsetParent = false
                            break;
                        }
                    }
                }

                this.offsetParent = offsetParent
            }
            return this.offsetParent
        },
        clearOffsetParent: function () {
            this.offsetParent = undefined
        },
        setPointer: function (e) {
            var pointer = {
                left: e.pageX,
                top: e.pageY
            }

            if(this.$getOffsetParent()){
                var relativePointer = getRelativePosition(pointer, this.$getOffsetParent())
                this.lastRelativePointer = this.relativePointer
                this.relativePointer = relativePointer
            }

            this.lastPointer = this.pointer
            this.pointer = pointer
        },
        distanceMet: function (e) {
            return (Math.max(
                Math.abs(this.pointer.left - e.pageX),
                Math.abs(this.pointer.top - e.pageY)
            ) >= this.options.distance)
        },
        addContainer: function  (container) {
            this.containers.push(container);
        },
        removeContainer: function (container) {
            var i = $.inArray(container,this.containers);
            i!==-1 && remove(this.containers, i);
        },
        scrolled: function  (e) {
            this.clearDimensions()
            this.clearOffsetParent()
        },
        toggleListeners: function (method) {
            this.$document[method](eventNames.move, this.dragProxy)
                [method](eventNames.end, this.dropProxy)
                [method]("scroll.sortable", this.scrolledProxy)
        },
        // Recursively clear container and item dimensions
        clearDimensions: function  () {
            this.containerDimensions = undefined
            var i = this.containers.length
            while(i--){
                this.containers[i].itemDimensions = undefined
            }
            i = this.childGroups.length
            while(i--){
                this.childGroups[i].clearDimensions()
            }
        }
    }

    function Container(element, options) {
        this.el = element
        this.childGroups = []
        this.floatRight = false
        this.dragInitProxy = $.proxy(this.dragInit, this)
        this.options = $.extend( {}, containerDefaults, options)

        this.group = ContainerGroup.get(this.options)
        this.rootGroup = this.options.rootGroup = this.options.rootGroup || this.group
        this.parentGroup = this.options.parentGroup = this.options.parentGroup || this.group
        this.handle = this.rootGroup.options.handle || this.rootGroup.options.itemSelector

        this.enable(true)
    }

    Container.prototype = {
        dragInit: function  (e) {
            var rootGroup = this.rootGroup

            if( !rootGroup.item &&
                e.which === 1 &&
                this.options.drag &&
                !$(e.target).is(this.options.exclude))
                rootGroup.dragInit(e, this)
        },
        searchValidTarget: function  (pointer, lastPointer) {
            var distances = sortByDistanceDesc(this.getItemDimensions(),
                    pointer,
                    lastPointer),
                i = distances.length,
                rootGroup = this.rootGroup,
                validTarget = !rootGroup.options.isValidTarget ||
                    rootGroup.options.isValidTarget(rootGroup.item, this)

            if(!i && validTarget){
                rootGroup.movePlaceholder(this, this.el, "append")
                return true
            } else
                while(i--){
                    var index = distances[i][0],
                        distance = distances[i][1]
                    if(!distance && this.options.nested && this.getContainerGroup(index)){
                        var found = this.getContainerGroup(index).searchValidTarget(pointer, lastPointer)
                        if(found)
                            return true
                    }
                    else if(validTarget){
                        this.movePlaceholder(index, pointer)
                        return true
                    }
                }
        },
        movePlaceholder: function  (index, pointer) {
            var item = $(this.items[index]),
                dim = this.itemDimensions[index],
                method = "after",
                width = item.outerWidth(),
                height = item.outerHeight(),
                offset = item.offset(),
                sameResultBox = {
                    left: offset.left,
                    right: offset.left + width,
                    top: offset.top,
                    bottom: offset.top + height
                }
            if(this.options.vertical){
                var yCenter = (dim[2] + dim[3]) / 2,
                    inUpperHalf = pointer.top <= yCenter
                if(inUpperHalf){
                    method = "before"
                    sameResultBox.bottom -= height / 2
                } else
                    sameResultBox.top += height / 2
            } else {
                var xCenter = (dim[0] + dim[1]) / 2,
                    inLeftHalf = pointer.left <= xCenter
                if(inLeftHalf != this.floatRight){
                    method = "before"
                    sameResultBox.right -= width / 2
                } else
                    sameResultBox.left += width / 2
            }
            this.rootGroup.movePlaceholder(this, item, method, sameResultBox)
        },
        getItemDimensions: function  () {
            if(!this.itemDimensions){
                this.items = this.$getChildren(this.el, "item").filter(":not(.dragged)").get()
                setDimensions(this.items, this.itemDimensions = [])
            }
            return this.itemDimensions
        },
        getItemOffsetParent: function  () {
            var offsetParent,
                el = this.el
            // Since el might be empty we have to check el itself and
            // can not do something like el.children().first().offsetParent()
            if(el.css("position") === "relative" || el.css("position") === "absolute"  || el.css("position") === "fixed")
                offsetParent = el
            else
                offsetParent = el.offsetParent()
            return offsetParent
        },
        getContainerGroup: function  (index) {
            var childGroup = $.data(this.items[index], "subContainer")
            if( childGroup === undefined){
                var childContainers = this.$getChildren(this.items[index], "container")
                childGroup = false

                if(childContainers[0]){
                    var options = $.extend({}, this.options, {
                        parentGroup: this.group,
                        group: groupCounter ++
                    })
                    childGroup = childContainers[pluginName](options).data(pluginName).group
                }
                $.data(this.items[index], "subContainer", childGroup)
            }
            return childGroup
        },
        $getChildren: function (parent, type) {
            return $(parent).children(this.rootGroup.options[type + "Selector"])
        },
        _serialize: function (parent, isContainer) {
            var that = this,
                childType = isContainer ? "item" : "container",

                children = this.$getChildren(parent, childType).not(this.options.exclude).map(function () {
                    return that._serialize($(this), !isContainer)
                }).get()

            return this.rootGroup.options.serialize(parent, children, isContainer)
        }
    }

    var API = {
        enable: function  (ignoreChildren) {
            if(this.options.drop)
                this.group.addContainer(this)
            if(!ignoreChildren)
                processChildContainers(this.el, this.options.containerSelector, "enable", true)

            this.el.on(eventNames.start, this.handle, this.dragInitProxy)
        },
        disable: function  (ignoreChildren) {
            if(this.options.drop)
                this.group.removeContainer(this)
            if(!ignoreChildren)
                processChildContainers(this.el, this.options.containerSelector, "disable", true)

            this.el.off(eventNames.start)
        },
        serialize: function () {
            return this._serialize(this.el, true)
        }
    }

    $.extend(Container.prototype, API)

    /**
     * jQuery API
     *
     * Parameters are
     *   either options on init
     *   or a method name followed by arguments to pass to the method
     */
    $.fn[pluginName] = function(methodOrOptions) {
        var args = Array.prototype.slice.call(arguments, 1)


        return this.map(function(){
            var $t = $(this),
                object = $t.data(pluginName)

            if(object && API[methodOrOptions])
                return API[methodOrOptions].apply(object, args) || this
            else if(!object && (methodOrOptions === undefined ||
                typeof methodOrOptions === "object"))
                $t.data(pluginName, new Container($t, methodOrOptions))

            return this
        });
    };

}(jQuery, window)
;

(function($) {

    $.widget("ui.multisortable", $.extend({}, $.ui.sortable.prototype, {

        _mouseCapture: function(event, overrideHandle) {

            if (this.reverting) {
                return false;
            }

            if(this.options.disabled || this.options.type == 'static') return false;

            //We have to refresh the items data once first
            this._refreshItems(event);

            //Find out if the clicked node (or one of its parents) is a actual item in this.items
            var currentItem = null, self = this, nodes = $(event.target).parents().each(function() {
                if($.data(this, 'sortable-item') == self) {
                    currentItem = $(this);
                    return false;
                }
            });
            if($.data(event.target, 'sortable-item') == self) currentItem = $(event.target);

            if(!currentItem) return false;
            if(this.options.handle && !overrideHandle) {
                var validHandle = false;

                $(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
                if(!validHandle) return false;
            }

            if (event.ctrlKey) {
                // Class for marking a multidraggable as being part of the group
                $(currentItem).toggleClass('ui-multisort-grouped');
            }

            this.currentItem = currentItem;
            this._removeCurrentsFromItems();
            return true;

        },

        _mouseStart: function(event, overrideHandle, noActivation) {

            var o = this.options, self = this;
            this.currentContainer = this;

            //We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
            this.refreshPositions();

            //Create and append the visible helper
            this.helper = this._createHelper(event);

            $("#target").text(this.helper.length);

            //Cache the helper size
            this._cacheHelperProportions();

            /*
             * - Position generation -
             * This block generates everything position related - it's the core of draggables.
             */

            //Cache the margins of the original element
            this._cacheMargins();

            //Get the next scrolling parent
            this.scrollParent = this.helper.scrollParent();

            //The element's absolute position on the page minus margins
            this.offset = this.currentItem.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };

            // Only after we got the offset, we can change the helper's position to absolute
            // TODO: Still need to figure out a way to make relative sorting possible
            this.helper.css("position", "absolute");
            this.cssPosition = this.helper.css("position");

            $.extend(this.offset, {
                click: { //Where the click happened, relative to the element
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
            });

            //Generate the original position
            this.originalPosition = this._generatePosition(event);
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;

            //Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
            if(o.cursorAt)
                this._adjustOffsetFromHelper(o.cursorAt);

            //Cache the former DOM position
            this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

            //If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
            if(this.helper[0] != this.currentItem[0]) {
                this.currentItem.hide();
            }

            //Create the placeholder
            this._createPlaceholder();

            //Set a containment if given in the options
            if(o.containment)
                this._setContainment();

            if(o.cursor) { // cursor option
                if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
                $('body').css("cursor", o.cursor);
            }

            if(o.opacity) { // opacity option
                if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
                this.helper.css("opacity", o.opacity);
            }

            if(o.zIndex) { // zIndex option
                if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
                this.helper.css("zIndex", o.zIndex);
            }

            //Prepare scrolling
            if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
                this.overflowOffset = this.scrollParent.offset();

            //Call callbacks
            this._trigger("start", event, this._uiHash());

            //Recache the helper size
            if(!this._preserveHelperProportions)
                this._cacheHelperProportions();


            //Post 'activate' events to possible containers
            if(!noActivation) {
                for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, self._uiHash(this)); }
            }

            //Prepare possible droppables
            if($.ui.ddmanager)
                $.ui.ddmanager.current = this;

            if ($.ui.ddmanager && !o.dropBehaviour)
                $.ui.ddmanager.prepareOffsets(this, event);

            this.dragging = true;

            this.helper.addClass("ui-sortable-helper");
            this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
            return true;

        },

        _mouseDrag: function(event) {

            //Compute the helpers position
            this.position = this._generatePosition(event);
            this.positionAbs = this._convertPositionTo("absolute");

            if (!this.lastPositionAbs) {
                this.lastPositionAbs = this.positionAbs;
            }

            //Do scrolling
            if(this.options.scroll) {
                var o = this.options, scrolled = false;
                if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

                    if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
                    else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

                    if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
                    else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

                } else {

                    if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
                        scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
                    else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
                        scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

                    if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
                        scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
                    else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
                        scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

                }

                if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
                    $.ui.ddmanager.prepareOffsets(this, event);
            }

            //Regenerate the absolute position used for position checks
            this.positionAbs = this._convertPositionTo("absolute");

            //Set the helper position
            if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
            if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

            var options_axis = this.options.axis;

            var pos_left = this.position.left;
            var pos_top = this.position.top;

            this.helper.each(function(i) {
                if(!options_axis || options_axis != "y") this.style.left = pos_left + 'px';
                if(!options_axis || options_axis != "x") this.style.top = pos_top+ ($(this).outerHeight() * i) + 'px';
            });

            //Rearrange
            for (var i = this.items.length - 1; i >= 0; i--) {

                //Cache variables and intersection, continue if no intersection
                var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
                if (!intersection) continue;

                if(itemElement != this.currentItem[0] //cannot intersect with itself
                    &&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
                    &&	!$.ui.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
                    && (this.options.type == 'semi-dynamic' ? !$.ui.contains(this.element[0], itemElement) : true)
                    ) {

                    this.direction = intersection == 1 ? "down" : "up";

                    if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
                        this._rearrange(event, item);
                    } else {
                        break;
                    }

                    this._trigger("change", event, this._uiHash());
                    break;
                }
            }

            //Post events to containers
            this._contactContainers(event);

            //Interconnect with droppables
            if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

            //Call callbacks
            this._trigger('sort', event, this._uiHash());

            this.lastPositionAbs = this.positionAbs;
            return false;

        },

        _createHelper: function(event) {

            var o = this.options;

            if (this.currentItem.hasClass('ui-multisort-grouped')) {
                var helper = $(this.currentItem).add($(this.currentItem).siblings('.ui-multisort-grouped')).clone();
                $(this.currentItem).siblings('.ui-multisort-grouped').hide();

                if(!helper.parents('body').length) {
                    //Add the helper to the DOM if that didn't happen already
                    var parentNode = $(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0];

                    $(helper).each(function(i) {
                        parentNode.appendChild(helper[i]);
                    });
                }
            } else {
                var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

                if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
                    $(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
            }



            if(helper[0] == this.currentItem[0])
                this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

            if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
            if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

            return helper;

        },

        _clear: function(event, noPropagation) {

            this.reverting = false;
            // We delay all events that have to be triggered to after the point where the placeholder has been removed and
            // everything else normalized again
            var delayedTriggers = [], self = this;

            // We first have to update the dom position of the actual currentItem
            // Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
            if(!this._noFinalSort && this.currentItem[0].parentNode) this.placeholder.before(this.currentItem);
            this._noFinalSort = null;

            if(this.helper[0] == this.currentItem[0]) {
                for(var i in this._storedCSS) {
                    if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
                }
                this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
            } else {
                if ($(this.currentItem).parent().children().size() > 0) {
                    $(this.currentItem).siblings('.ui-multisort-grouped').show();
                }
                this.currentItem.show();
            }

            if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
            if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
            if(!$.ui.contains(this.element[0], this.currentItem[0])) { //Node was moved out of the current element
                if(!noPropagation) delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
                for (var i = this.containers.length - 1; i >= 0; i--){
                    if($.ui.contains(this.containers[i].element[0], this.currentItem[0]) && !noPropagation) {
                        delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
                        delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.containers[i]));
                    }
                };
            };

            //Post events to containers
            for (var i = this.containers.length - 1; i >= 0; i--){
                if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
                if(this.containers[i].containerCache.over) {
                    delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
                    this.containers[i].containerCache.over = 0;
                }
            }

            //Do what was originally in plugins
            if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
            if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset cursor
            if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

            this.dragging = false;
            if(this.cancelHelperRemoval) {
                if(!noPropagation) {
                    this._trigger("beforeStop", event, this._uiHash());
                    for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
                    this._trigger("stop", event, this._uiHash());
                }
                return false;
            }

            if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

            //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
            if (this.placeholder[0].parentNode) {
                this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
            }

            if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

            if(!noPropagation) {
                for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
                this._trigger("stop", event, this._uiHash());
            }

            this.fromOutside = false;
            return true;

        },

    }));

    $.extend($.ui.multisortable, {
        getter: "serialize toArray",
        version: "1.7.2",
        eventPrefix: "sort",
        defaults: {
            appendTo: "parent",
            axis: false,
            cancel: ":input,option",
            connectWith: false,
            containment: false,
            cursor: 'auto',
            cursorAt: false,
            delay: 0,
            distance: 1,
            dropOnEmpty: true,
            forcePlaceholderSize: false,
            forceHelperSize: false,
            grid: false,
            handle: false,
            helper: "original",
            items: '> *',
            opacity: false,
            placeholder: false,
            revert: false,
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            scope: "default",
            tolerance: "intersect",
            zIndex: 1000
        }
    });

})(jQuery);