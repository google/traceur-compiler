
goog.provide('goog.fx.AbstractDragDrop'); 
goog.provide('goog.fx.AbstractDragDrop.EventType'); 
goog.provide('goog.fx.DragDropEvent'); 
goog.provide('goog.fx.DragDropItem'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.fx.Dragger'); 
goog.require('goog.fx.Dragger.EventType'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.style'); 
goog.fx.AbstractDragDrop = function() { 
  this.items_ =[]; 
  this.targets_ =[]; 
  this.scrollableContainers_ =[]; 
}; 
goog.inherits(goog.fx.AbstractDragDrop, goog.events.EventTarget); 
goog.fx.AbstractDragDrop.DUMMY_TARGET_MIN_SIZE_ = 10; 
goog.fx.AbstractDragDrop.prototype.isSource_ = false; 
goog.fx.AbstractDragDrop.prototype.isTarget_ = false; 
goog.fx.AbstractDragDrop.prototype.subtargetFunction_; 
goog.fx.AbstractDragDrop.prototype.activeSubtarget_; 
goog.fx.AbstractDragDrop.prototype.dragClass_; 
goog.fx.AbstractDragDrop.prototype.sourceClass_; 
goog.fx.AbstractDragDrop.prototype.targetClass_; 
goog.fx.AbstractDragDrop.prototype.scrollTarget_; 
goog.fx.AbstractDragDrop.prototype.dummyTarget_; 
goog.fx.AbstractDragDrop.prototype.initialized_ = false; 
goog.fx.AbstractDragDrop.EventType = { 
  DRAGOVER: 'dragover', 
  DRAGOUT: 'dragout', 
  DRAG: 'drag', 
  DROP: 'drop', 
  DRAGSTART: 'dragstart', 
  DRAGEND: 'dragend' 
}; 
goog.fx.AbstractDragDrop.initDragDistanceThreshold = 5; 
goog.fx.AbstractDragDrop.prototype.setDragClass = function(className) { 
  this.dragClass_ = className; 
}; 
goog.fx.AbstractDragDrop.prototype.setSourceClass = function(className) { 
  this.sourceClass_ = className; 
}; 
goog.fx.AbstractDragDrop.prototype.setTargetClass = function(className) { 
  this.targetClass_ = className; 
}; 
goog.fx.AbstractDragDrop.prototype.isInitialized = function() { 
  return this.initialized_; 
}; 
goog.fx.AbstractDragDrop.prototype.addItem = function(item) { 
  throw Error('Call to pure virtual method'); 
}; 
goog.fx.AbstractDragDrop.prototype.addTarget = function(target) { 
  this.targets_.push(target); 
  target.isTarget_ = true; 
  this.isSource_ = true; 
}; 
goog.fx.AbstractDragDrop.prototype.setScrollTarget = function(scrollTarget) { 
  this.scrollTarget_ = scrollTarget; 
}; 
goog.fx.AbstractDragDrop.prototype.init = function() { 
  if(this.initialized_) { 
    return; 
  } 
  for(var item, i = 0; item = this.items_[i]; i ++) { 
    this.initItem(item); 
  } 
  this.initialized_ = true; 
}; 
goog.fx.AbstractDragDrop.prototype.initItem = function(item) { 
  if(this.isSource_) { 
    goog.events.listen(item.element, goog.events.EventType.MOUSEDOWN, item.mouseDown_, false, item); 
    if(this.sourceClass_) { 
      goog.dom.classes.add(item.element, this.sourceClass_); 
    } 
  } 
  if(this.isTarget_ && this.targetClass_) { 
    goog.dom.classes.add(item.element, this.targetClass_); 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.disposeItem = function(item) { 
  if(this.isSource_) { 
    goog.events.unlisten(item.element, goog.events.EventType.MOUSEDOWN, item.mouseDown_, false, item); 
    if(this.sourceClass_) { 
      goog.dom.classes.remove(item.element, this.sourceClass_); 
    } 
  } 
  if(this.isTarget_ && this.targetClass_) { 
    goog.dom.classes.remove(item.element, this.targetClass_); 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.removeItems = function() { 
  for(var item, i = 0; item = this.items_[i]; i ++) { 
    this.disposeItem(item); 
  } 
  this.items_.length = 0; 
}; 
goog.fx.AbstractDragDrop.prototype.maybeStartDrag = function(event, item) { 
  item.maybeStartDrag_(event, item.element); 
}; 
goog.fx.AbstractDragDrop.prototype.startDrag = function(event, item) { 
  if(this.dragItem_) { 
    return; 
  } 
  this.dragItem_ = item; 
  var dragStartEvent = new goog.fx.DragDropEvent(goog.fx.AbstractDragDrop.EventType.DRAGSTART, this, this.dragItem_); 
  if(this.dispatchEvent(dragStartEvent) == false) { 
    dragStartEvent.dispose(); 
    this.dragItem_ = null; 
    return; 
  } 
  dragStartEvent.dispose(); 
  var el = item.getCurrentDragElement(); 
  this.dragEl_ = this.createDragElement(el); 
  var doc = goog.dom.getOwnerDocument(el); 
  doc.body.appendChild(this.dragEl_); 
  this.dragger_ = this.createDraggerFor(el, this.dragEl_, event); 
  this.dragger_.setScrollTarget(this.scrollTarget_); 
  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.DRAG, this.moveDrag_, false, this); 
  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.END, this.endDrag, false, this); 
  goog.events.listen(doc.body, goog.events.EventType.SELECTSTART, this.suppressSelect_); 
  this.recalculateDragTargets(); 
  this.activeTarget_ = null; 
  this.initScrollableContainers_(); 
  this.dragger_.startDrag(event); 
  event.preventDefault(); 
}; 
goog.fx.AbstractDragDrop.prototype.recalculateDragTargets = function() { 
  this.targetList_ =[]; 
  for(var target, i = 0; target = this.targets_[i]; i ++) { 
    for(var itm, j = 0; itm = target.items_[j]; j ++) { 
      this.addDragTarget_(target, itm); 
    } 
  } 
  if(! this.targetBox_) { 
    this.targetBox_ = new goog.math.Box(0, 0, 0, 0); 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.createDraggerFor = function(sourceEl, el, event) { 
  var pos = this.getDragElementPosition(sourceEl, el, event); 
  el.style.position = 'absolute'; 
  el.style.left = pos.x + 'px'; 
  el.style.top = pos.y + 'px'; 
  return new goog.fx.Dragger(el); 
}; 
goog.fx.AbstractDragDrop.prototype.endDrag = function(event) { 
  var activeTarget = event.dragCanceled ? null: this.activeTarget_; 
  if(activeTarget && activeTarget.target_) { 
    var clientX = event.clientX; 
    var clientY = event.clientY; 
    var scroll = this.getScrollPos(); 
    var x = clientX + scroll.x; 
    var y = clientY + scroll.y; 
    var subtarget; 
    if(this.subtargetFunction_) { 
      subtarget = this.subtargetFunction_(activeTarget.item_, activeTarget.box_, x, y); 
    } 
    var dragEvent = new goog.fx.DragDropEvent(goog.fx.AbstractDragDrop.EventType.DRAG, this, this.dragItem_, activeTarget.target_, activeTarget.item_, activeTarget.element_, clientX, clientY, x, y); 
    this.dispatchEvent(dragEvent); 
    dragEvent.dispose(); 
    var dropEvent = new goog.fx.DragDropEvent(goog.fx.AbstractDragDrop.EventType.DROP, this, this.dragItem_, activeTarget.target_, activeTarget.item_, activeTarget.element_, clientX, clientY, x, y, subtarget); 
    activeTarget.target_.dispatchEvent(dropEvent); 
    dropEvent.dispose(); 
  } 
  var dragEndEvent = new goog.fx.DragDropEvent(goog.fx.AbstractDragDrop.EventType.DRAGEND, this, this.dragItem_); 
  this.dispatchEvent(dragEndEvent); 
  dragEndEvent.dispose(); 
  goog.events.unlisten(this.dragger_, goog.fx.Dragger.EventType.DRAG, this.moveDrag_, false, this); 
  goog.events.unlisten(this.dragger_, goog.fx.Dragger.EventType.END, this.endDrag, false, this); 
  var doc = goog.dom.getOwnerDocument(this.dragItem_.getCurrentDragElement()); 
  goog.events.unlisten(doc.body, goog.events.EventType.SELECTSTART, this.suppressSelect_); 
  this.afterEndDrag(this.activeTarget_ ? this.activeTarget_.item_: null); 
}; 
goog.fx.AbstractDragDrop.prototype.afterEndDrag = function(opt_dropTarget) { 
  this.disposeDrag(); 
}; 
goog.fx.AbstractDragDrop.prototype.disposeDrag = function() { 
  this.disposeScrollableContainerListeners_(); 
  this.dragger_.dispose(); 
  goog.dom.removeNode(this.dragEl_); 
  delete this.dragItem_; 
  delete this.dragEl_; 
  delete this.dragger_; 
  delete this.targetList_; 
  delete this.activeTarget_; 
}; 
goog.fx.AbstractDragDrop.prototype.moveDrag_ = function(event) { 
  var x = event.clientX; 
  var y = event.clientY; 
  var scroll = this.getScrollPos(); 
  x += scroll.x; 
  y += scroll.y; 
  var activeTarget = this.activeTarget_; 
  var subtarget; 
  if(activeTarget) { 
    if(this.subtargetFunction_ && activeTarget.target_) { 
      subtarget = this.subtargetFunction_(activeTarget.item_, activeTarget.box_, x, y); 
    } 
    if(this.isInside_(x, y, activeTarget.box_) && subtarget == this.activeSubtarget_) { 
      return; 
    } 
    if(activeTarget.target_) { 
      var sourceDragOutEvent = new goog.fx.DragDropEvent(goog.fx.AbstractDragDrop.EventType.DRAGOUT, this, this.dragItem_, activeTarget.target_, activeTarget.item_, activeTarget.element_); 
      this.dispatchEvent(sourceDragOutEvent); 
      sourceDragOutEvent.dispose(); 
      var targetDragOutEvent = new goog.fx.DragDropEvent(goog.fx.AbstractDragDrop.EventType.DRAGOUT, this, this.dragItem_, activeTarget.target_, activeTarget.item_, activeTarget.element_, undefined, undefined, undefined, undefined, this.activeSubtarget_); 
      activeTarget.target_.dispatchEvent(targetDragOutEvent); 
      targetDragOutEvent.dispose(); 
    } 
    this.activeSubtarget_ = subtarget; 
    this.activeTarget_ = null; 
  } 
  if(this.isInside_(x, y, this.targetBox_)) { 
    activeTarget = this.activeTarget_ = this.getTargetFromPosition_(x, y); 
    if(activeTarget && activeTarget.target_) { 
      if(this.subtargetFunction_) { 
        subtarget = this.subtargetFunction_(activeTarget.item_, activeTarget.box_, x, y); 
      } 
      var sourceDragOverEvent = new goog.fx.DragDropEvent(goog.fx.AbstractDragDrop.EventType.DRAGOVER, this, this.dragItem_, activeTarget.target_, activeTarget.item_, activeTarget.element_); 
      sourceDragOverEvent.subtarget = subtarget; 
      this.dispatchEvent(sourceDragOverEvent); 
      sourceDragOverEvent.dispose(); 
      var targetDragOverEvent = new goog.fx.DragDropEvent(goog.fx.AbstractDragDrop.EventType.DRAGOVER, this, this.dragItem_, activeTarget.target_, activeTarget.item_, activeTarget.element_, event.clientX, event.clientY, undefined, undefined, subtarget); 
      activeTarget.target_.dispatchEvent(targetDragOverEvent); 
      targetDragOverEvent.dispose(); 
    } else if(! activeTarget) { 
      this.activeTarget_ = this.maybeCreateDummyTargetForPosition_(x, y); 
    } 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.suppressSelect_ = function(event) { 
  return false; 
}; 
goog.fx.AbstractDragDrop.prototype.initScrollableContainers_ = function() { 
  var container, i, j, target; 
  for(i = 0; container = this.scrollableContainers_[i]; i ++) { 
    goog.events.listen(container.element_, goog.events.EventType.SCROLL, this.containerScrollHandler_, false, this); 
    container.containedTargets_ =[]; 
    container.savedScrollLeft_ = container.element_.scrollLeft; 
    container.savedScrollTop_ = container.element_.scrollTop; 
    var pos = goog.style.getPageOffset(container.element_); 
    var size = goog.style.getSize(container.element_); 
    container.box_ = new goog.math.Box(pos.y, pos.x + size.width, pos.y + size.height, pos.x); 
  } 
  for(i = 0; target = this.targetList_[i]; i ++) { 
    for(j = 0; container = this.scrollableContainers_[j]; j ++) { 
      if(goog.dom.contains(container.element_, target.element_)) { 
        container.containedTargets_.push(target); 
        target.scrollableContainer_ = container; 
      } 
    } 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.disposeScrollableContainerListeners_ = function() { 
  for(var i = 0, container; container = this.scrollableContainers_[i]; i ++) { 
    goog.events.unlisten(container.element_, 'scroll', this.containerScrollHandler_, false, this); 
    container.containedTargets_ =[]; 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.addScrollableContainer = function(element) { 
  this.scrollableContainers_.push(new goog.fx.ScrollableContainer_(element)); 
}; 
goog.fx.AbstractDragDrop.prototype.containerScrollHandler_ = function(e) { 
  for(var i = 0, container; container = this.scrollableContainers_[i]; i ++) { 
    if(e.target == container.element_) { 
      var deltaTop = container.savedScrollTop_ - container.element_.scrollTop; 
      var deltaLeft = container.savedScrollLeft_ - container.element_.scrollLeft; 
      container.savedScrollTop_ = container.element_.scrollTop; 
      container.savedScrollLeft_ = container.element_.scrollLeft; 
      for(var j = 0, target; target = container.containedTargets_[j]; j ++) { 
        var box = target.box_; 
        box.top += deltaTop; 
        box.left += deltaLeft; 
        box.bottom += deltaTop; 
        box.right += deltaLeft; 
        this.calculateTargetBox_(box); 
      } 
    } 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.setSubtargetFunction = function(f) { 
  this.subtargetFunction_ = f; 
}; 
goog.fx.AbstractDragDrop.prototype.createDragElement = function(sourceEl) { 
  var dragEl = this.cloneNode_(sourceEl); 
  if(this.dragClass_) { 
    goog.dom.classes.add(dragEl, this.dragClass_); 
  } 
  return dragEl; 
}; 
goog.fx.AbstractDragDrop.prototype.getDragElementPosition = function(el, dragEl, event) { 
  var pos = goog.style.getPageOffset(el); 
  var marginBox = goog.style.getMarginBox(el); 
  pos.x +=(marginBox.left || 0) * 2; 
  pos.y +=(marginBox.top || 0) * 2; 
  return pos; 
}; 
goog.fx.AbstractDragDrop.prototype.getDragger = function() { 
  return this.dragger_; 
}; 
goog.fx.AbstractDragDrop.prototype.cloneNode_ = function(sourceEl) { 
  var clonedEl =(sourceEl.cloneNode(true)); 
  switch(sourceEl.tagName.toLowerCase()) { 
    case 'tr': 
      return goog.dom.createDom('table', null, goog.dom.createDom('tbody', null, clonedEl)); 

    case 'td': 
    case 'th': 
      return goog.dom.createDom('table', null, goog.dom.createDom('tbody', null, goog.dom.createDom('tr', null, clonedEl))); 

    default: 
      return clonedEl; 

  } 
}; 
goog.fx.AbstractDragDrop.prototype.addDragTarget_ = function(target, item) { 
  var draggableElements = item.getDraggableElements(); 
  var targetList = this.targetList_; 
  for(var i = 0; i < draggableElements.length; i ++) { 
    var draggableElement = draggableElements[i]; 
    var pos = goog.style.getPageOffset(draggableElement); 
    var size = goog.style.getSize(draggableElement); 
    var box = new goog.math.Box(pos.y, pos.x + size.width, pos.y + size.height, pos.x); 
    targetList.push(new goog.fx.ActiveDropTarget_(box, target, item, draggableElement)); 
    this.calculateTargetBox_(box); 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.calculateTargetBox_ = function(box) { 
  if(this.targetList_.length == 1) { 
    this.targetBox_ = new goog.math.Box(box.top, box.right, box.bottom, box.left); 
  } else { 
    var tb = this.targetBox_; 
    tb.left = Math.min(box.left, tb.left); 
    tb.right = Math.max(box.right, tb.right); 
    tb.top = Math.min(box.top, tb.top); 
    tb.bottom = Math.max(box.bottom, tb.bottom); 
  } 
}; 
goog.fx.AbstractDragDrop.prototype.maybeCreateDummyTargetForPosition_ = function(x, y) { 
  if(! this.dummyTarget_) { 
    this.dummyTarget_ = new goog.fx.ActiveDropTarget_(this.targetBox_.clone()); 
  } 
  var fakeTargetBox = this.dummyTarget_.box_; 
  fakeTargetBox.top = this.targetBox_.top; 
  fakeTargetBox.right = this.targetBox_.right; 
  fakeTargetBox.bottom = this.targetBox_.bottom; 
  fakeTargetBox.left = this.targetBox_.left; 
  for(var i = 0, target; target = this.targetList_[i]; i ++) { 
    var box = target.box_; 
    var horizontalClip = - 1; 
    if(x >= box.right) { 
      horizontalClip = box.right > fakeTargetBox.left ? box.right: fakeTargetBox.left; 
    } else if(x < box.left) { 
      horizontalClip = box.left < fakeTargetBox.right ? box.left: fakeTargetBox.right; 
    } 
    var verticalClip = - 1; 
    if(y >= box.bottom) { 
      verticalClip = box.bottom > fakeTargetBox.top ? box.bottom: fakeTargetBox.top; 
    } else if(y < box.top) { 
      verticalClip = box.top < fakeTargetBox.bottom ? box.top: fakeTargetBox.bottom; 
    } 
    if(horizontalClip >= 0 && verticalClip >= 0) { 
      if(Math.abs(horizontalClip - x) > Math.abs(verticalClip - y)) { 
        verticalClip = - 1; 
      } else { 
        horizontalClip = - 1; 
      } 
    } 
    if(horizontalClip >= 0) { 
      if(horizontalClip <= x) { 
        fakeTargetBox.left = horizontalClip; 
      } else { 
        fakeTargetBox.right = horizontalClip; 
      } 
    } else if(verticalClip >= 0) { 
      if(verticalClip <= y) { 
        fakeTargetBox.top = verticalClip; 
      } else { 
        fakeTargetBox.bottom = verticalClip; 
      } 
    } 
  } 
  return(fakeTargetBox.right - fakeTargetBox.left) *(fakeTargetBox.bottom - fakeTargetBox.top) >= goog.fx.AbstractDragDrop.DUMMY_TARGET_MIN_SIZE_ ? this.dummyTarget_: null; 
}; 
goog.fx.AbstractDragDrop.prototype.getTargetFromPosition_ = function(x, y) { 
  for(var target, i = 0; target = this.targetList_[i]; i ++) { 
    if(this.isInside_(x, y, target.box_)) { 
      if(target.scrollableContainer_) { 
        var box = target.scrollableContainer_.box_; 
        if(this.isInside_(x, y, box)) { 
          return target; 
        } 
      } else { 
        return target; 
      } 
    } 
  } 
  return null; 
}; 
goog.fx.AbstractDragDrop.prototype.isInside_ = function(x, y, box) { 
  return x >= box.left && x < box.right && y >= box.top && y < box.bottom; 
}; 
goog.fx.AbstractDragDrop.prototype.getScrollPos = function() { 
  return goog.dom.getDomHelper(this.dragEl_).getDocumentScroll(); 
}; 
goog.fx.AbstractDragDrop.prototype.disposeInternal = function() { 
  goog.fx.AbstractDragDrop.superClass_.disposeInternal.call(this); 
  this.removeItems(); 
}; 
goog.fx.DragDropEvent = function(type, source, sourceItem, opt_target, opt_targetItem, opt_targetElement, opt_clientX, opt_clientY, opt_x, opt_y, opt_subtarget) { 
  goog.events.Event.call(this, type); 
  this.dragSource = source; 
  this.dragSourceItem = sourceItem; 
  this.dropTarget = opt_target; 
  this.dropTargetItem = opt_targetItem; 
  this.dropTargetElement = opt_targetElement; 
  this.clientX = opt_clientX; 
  this.clientY = opt_clientY; 
  this.viewportX = opt_x; 
  this.viewportY = opt_y; 
  this.subtarget = opt_subtarget; 
}; 
goog.inherits(goog.fx.DragDropEvent, goog.events.Event); 
goog.fx.DragDropEvent.prototype.disposeInternal = function() { 
  goog.fx.DragDropEvent.superClass_.disposeInternal.call(this); 
  delete this.dragSource; 
  delete this.dragSourceItem; 
  delete this.dropTarget; 
  delete this.dropTargetItem; 
  delete this.dropTargetElement; 
}; 
goog.fx.DragDropItem = function(element, opt_data) { 
  this.element = goog.dom.getElement(element); 
  this.data = opt_data; 
  this.parent_ = null; 
  if(! this.element) { 
    throw Error('Invalid argument'); 
  } 
}; 
goog.inherits(goog.fx.DragDropItem, goog.events.EventTarget); 
goog.fx.DragDropItem.prototype.currentDragElement_ = null; 
goog.fx.DragDropItem.prototype.getData = function() { 
  return this.data; 
}; 
goog.fx.DragDropItem.prototype.getDraggableElement = function(target) { 
  return target; 
}; 
goog.fx.DragDropItem.prototype.getCurrentDragElement = function() { 
  return this.currentDragElement_; 
}; 
goog.fx.DragDropItem.prototype.getDraggableElements = function() { 
  return[this.element]; 
}; 
goog.fx.DragDropItem.prototype.mouseDown_ = function(event) { 
  var element = this.getDraggableElement((event.target)); 
  if(element) { 
    this.maybeStartDrag_(event, element); 
  } 
}; 
goog.fx.DragDropItem.prototype.setParent = function(parent) { 
  this.parent_ = parent; 
}; 
goog.fx.DragDropItem.prototype.maybeStartDrag_ = function(event, element) { 
  goog.events.listen(element, goog.events.EventType.MOUSEMOVE, this.mouseMove_, false, this); 
  goog.events.listen(element, goog.events.EventType.MOUSEOUT, this.mouseMove_, false, this); 
  goog.events.listen(element, goog.events.EventType.MOUSEUP, this.mouseUp_, false, this); 
  this.currentDragElement_ = element; 
  this.startPosition_ = new goog.math.Coordinate(event.clientX, event.clientY); 
  event.preventDefault(); 
}; 
goog.fx.DragDropItem.prototype.mouseMove_ = function(event) { 
  var distance = Math.abs(event.clientX - this.startPosition_.x) + Math.abs(event.clientY - this.startPosition_.y); 
  if(distance > goog.fx.AbstractDragDrop.initDragDistanceThreshold) { 
    var currentDragElement = this.currentDragElement_; 
    goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEMOVE, this.mouseMove_, false, this); 
    goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEOUT, this.mouseMove_, false, this); 
    goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEUP, this.mouseUp_, false, this); 
    this.parent_.startDrag(event, this); 
  } 
}; 
goog.fx.DragDropItem.prototype.mouseUp_ = function(event) { 
  var currentDragElement = this.currentDragElement_; 
  goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEMOVE, this.mouseMove_, false, this); 
  goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEOUT, this.mouseMove_, false, this); 
  goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEUP, this.mouseUp_, false, this); 
  delete this.startPosition_; 
  this.currentDragElement_ = null; 
}; 
goog.fx.ActiveDropTarget_ = function(box, opt_target, opt_item, opt_element) { 
  this.box_ = box; 
  this.target_ = opt_target; 
  this.item_ = opt_item; 
  this.element_ = opt_element; 
}; 
goog.fx.ActiveDropTarget_.prototype.scrollableContainer_ = null; 
goog.fx.ScrollableContainer_ = function(element) { 
  this.containedTargets_ =[]; 
  this.element_ = element; 
  this.savedScrollLeft_ = 0; 
  this.savedScrollTop_ = 0; 
  this.box_ = null; 
}; 
