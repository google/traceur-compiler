
goog.provide('goog.fx.DragListDirection'); 
goog.provide('goog.fx.DragListGroup'); 
goog.provide('goog.fx.DragListGroup.EventType'); 
goog.provide('goog.fx.DragListGroupEvent'); 
goog.require('goog.asserts'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.fx.Dragger'); 
goog.require('goog.fx.Dragger.EventType'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.style'); 
goog.fx.DragListGroup = function() { 
  goog.events.EventTarget.call(this); 
  this.dragLists_ =[]; 
  this.dragItems_ =[]; 
  this.dragItemForHandle_ = { }; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.isInitialized_ = false; 
  this.isCurrDragItemAlwaysDisplayed_ = false; 
  this.updateWhileDragging_ = true; 
}; 
goog.inherits(goog.fx.DragListGroup, goog.events.EventTarget); 
goog.fx.DragListDirection = { 
  DOWN: 0, 
  RIGHT: 2, 
  LEFT: 3, 
  RIGHT_2D: 4, 
  LEFT_2D: 5 
}; 
goog.fx.DragListGroup.EventType = { 
  BEFOREDRAGSTART: 'beforedragstart', 
  DRAGSTART: 'dragstart', 
  BEFOREDRAGMOVE: 'beforedragmove', 
  DRAGMOVE: 'dragmove', 
  BEFOREDRAGEND: 'beforedragend', 
  DRAGEND: 'dragend' 
}; 
goog.fx.DragListGroup.prototype.dragItemHoverClasses_; 
goog.fx.DragListGroup.prototype.dragItemHandleHoverClasses_; 
goog.fx.DragListGroup.prototype.currDragItemClasses_; 
goog.fx.DragListGroup.prototype.draggerElClass_; 
goog.fx.DragListGroup.prototype.currDragItem_; 
goog.fx.DragListGroup.prototype.currHoverList_; 
goog.fx.DragListGroup.prototype.origList_; 
goog.fx.DragListGroup.prototype.origNextItem_; 
goog.fx.DragListGroup.prototype.currHoverItem_; 
goog.fx.DragListGroup.prototype.draggerEl_; 
goog.fx.DragListGroup.prototype.dragger_; 
goog.fx.DragListGroup.prototype.setIsCurrDragItemAlwaysDisplayed = function() { 
  this.isCurrDragItemAlwaysDisplayed_ = true; 
}; 
goog.fx.DragListGroup.prototype.setNoUpdateWhileDragging = function() { 
  this.updateWhileDragging_ = false; 
}; 
goog.fx.DragListGroup.prototype.addDragList = function(dragListElement, growthDirection, opt_unused, opt_dragHoverClass) { 
  goog.asserts.assert(! this.isInitialized_); 
  dragListElement.dlgGrowthDirection_ = growthDirection; 
  dragListElement.dlgDragHoverClass_ = opt_dragHoverClass; 
  this.dragLists_.push(dragListElement); 
}; 
goog.fx.DragListGroup.prototype.setFunctionToGetHandleForDragItem = function(getHandleForDragItemFn) { 
  goog.asserts.assert(! this.isInitialized_); 
  this.getHandleForDragItem_ = getHandleForDragItemFn; 
}; 
goog.fx.DragListGroup.prototype.setDragItemHoverClass = function(var_args) { 
  goog.asserts.assert(! this.isInitialized_); 
  this.dragItemHoverClasses_ = goog.array.slice(arguments, 0); 
}; 
goog.fx.DragListGroup.prototype.setDragItemHandleHoverClass = function(var_args) { 
  goog.asserts.assert(! this.isInitialized_); 
  this.dragItemHandleHoverClasses_ = goog.array.slice(arguments, 0); 
}; 
goog.fx.DragListGroup.prototype.setCurrDragItemClass = function(var_args) { 
  goog.asserts.assert(! this.isInitialized_); 
  this.currDragItemClasses_ = goog.array.slice(arguments, 0); 
}; 
goog.fx.DragListGroup.prototype.setDraggerElClass = function(draggerElClass) { 
  goog.asserts.assert(! this.isInitialized_); 
  this.draggerElClass_ = draggerElClass; 
}; 
goog.fx.DragListGroup.prototype.init = function() { 
  if(this.isInitialized_) { 
    return; 
  } 
  for(var i = 0, numLists = this.dragLists_.length; i < numLists; i ++) { 
    var dragList = this.dragLists_[i]; 
    var dragItems = goog.dom.getChildren(dragList); 
    for(var j = 0, numItems = dragItems.length; j < numItems; ++ j) { 
      var dragItem = dragItems[j]; 
      var dragItemHandle = this.getHandleForDragItem_(dragItem); 
      var uid = goog.getUid(dragItemHandle); 
      this.dragItemForHandle_[uid]= dragItem; 
      if(this.dragItemHoverClasses_) { 
        this.eventHandler_.listen(dragItem, goog.events.EventType.MOUSEOVER, this.handleDragItemMouseover_); 
        this.eventHandler_.listen(dragItem, goog.events.EventType.MOUSEOUT, this.handleDragItemMouseout_); 
      } 
      if(this.dragItemHandleHoverClasses_) { 
        this.eventHandler_.listen(dragItemHandle, goog.events.EventType.MOUSEOVER, this.handleDragItemHandleMouseover_); 
        this.eventHandler_.listen(dragItemHandle, goog.events.EventType.MOUSEOUT, this.handleDragItemHandleMouseout_); 
      } 
      this.dragItems_.push(dragItem); 
      this.eventHandler_.listen(dragItemHandle, goog.events.EventType.MOUSEDOWN, this.handleDragStart_); 
    } 
  } 
  this.isInitialized_ = true; 
}; 
goog.fx.DragListGroup.prototype.disposeInternal = function() { 
  this.eventHandler_.dispose(); 
  for(var i = 0, n = this.dragLists_.length; i < n; i ++) { 
    var dragList = this.dragLists_[i]; 
    dragList.dlgGrowthDirection_ = undefined; 
    dragList.dlgDragHoverClass_ = undefined; 
  } 
  this.dragLists_.length = 0; 
  this.dragItems_.length = 0; 
  this.dragItemForHandle_ = null; 
  this.cleanupDragDom_(); 
  goog.fx.DragListGroup.superClass_.disposeInternal.call(this); 
}; 
goog.fx.DragListGroup.prototype.recacheListAndItemBounds_ = function(currDragItem) { 
  for(var i = 0, n = this.dragLists_.length; i < n; i ++) { 
    var dragList = this.dragLists_[i]; 
    dragList.dlgBounds_ = goog.style.getBounds(dragList); 
  } 
  for(var i = 0, n = this.dragItems_.length; i < n; i ++) { 
    var dragItem = this.dragItems_[i]; 
    if(dragItem != currDragItem) { 
      dragItem.dlgBounds_ = goog.style.getBounds(dragItem); 
    } 
  } 
}; 
goog.fx.DragListGroup.prototype.handleDragStart_ = function(e) { 
  if(! e.isMouseActionButton()) { 
    e.preventDefault(); 
    return; 
  } 
  var uid = goog.getUid((e.currentTarget)); 
  var currDragItem =(this.dragItemForHandle_[uid]); 
  var rv = this.dispatchEvent(new goog.fx.DragListGroupEvent(goog.fx.DragListGroup.EventType.BEFOREDRAGSTART, this, e, currDragItem, null, null)); 
  if(! rv) { 
    e.preventDefault(); 
    return; 
  } 
  this.currDragItem_ = currDragItem; 
  this.origList_ =(currDragItem.parentNode); 
  this.origNextItem_ = goog.dom.getNextElementSibling(currDragItem); 
  this.currHoverItem_ = this.origNextItem_; 
  this.currHoverList_ = this.origList_; 
  var draggerEl = this.cloneNode_(currDragItem); 
  this.draggerEl_ = draggerEl; 
  if(this.currDragItemClasses_) { 
    goog.dom.classes.add.apply(null, goog.array.concat(currDragItem, this.currDragItemClasses_)); 
  } else { 
    currDragItem.style.visibility = 'hidden'; 
  } 
  if(this.draggerElClass_) { 
    goog.dom.classes.add(draggerEl, this.draggerElClass_); 
  } 
  draggerEl.style.margin = '0px'; 
  draggerEl.style.position = 'absolute'; 
  goog.dom.getOwnerDocument(currDragItem).body.appendChild(draggerEl); 
  var currDragItemPos = goog.style.getPageOffset(currDragItem); 
  goog.style.setPageOffset(draggerEl, currDragItemPos); 
  var draggerElSize = goog.style.getSize(draggerEl); 
  draggerEl.halfWidth = draggerElSize.width / 2; 
  draggerEl.halfHeight = draggerElSize.height / 2; 
  if(this.updateWhileDragging_) { 
    currDragItem.style.display = 'none'; 
  } 
  this.recacheListAndItemBounds_(currDragItem); 
  currDragItem.style.display = ''; 
  this.dragger_ = new goog.fx.Dragger(draggerEl); 
  this.eventHandler_.listen(this.dragger_, goog.fx.Dragger.EventType.DRAG, this.handleDragMove_); 
  this.eventHandler_.listen(this.dragger_, goog.fx.Dragger.EventType.END, this.handleDragEnd_); 
  this.dragger_.startDrag(e); 
  this.dispatchEvent(new goog.fx.DragListGroupEvent(goog.fx.DragListGroup.EventType.DRAGSTART, this, e, currDragItem, draggerEl, this.dragger_)); 
}; 
goog.fx.DragListGroup.prototype.handleDragMove_ = function(dragEvent) { 
  var draggerElPos = goog.style.getPageOffset(this.draggerEl_); 
  var draggerElCenter = new goog.math.Coordinate(draggerElPos.x + this.draggerEl_.halfWidth, draggerElPos.y + this.draggerEl_.halfHeight); 
  var hoverList = this.getHoverDragList_(draggerElCenter); 
  var hoverNextItem = hoverList ? this.getHoverNextItem_(hoverList, draggerElCenter): null; 
  var rv = this.dispatchEvent(new goog.fx.DragListGroupEvent(goog.fx.DragListGroup.EventType.BEFOREDRAGMOVE, this, dragEvent, this.currDragItem_, this.draggerEl_, this.dragger_, draggerElCenter, hoverList, hoverNextItem)); 
  if(! rv) { 
    return false; 
  } 
  if(hoverList) { 
    if(this.updateWhileDragging_) { 
      this.insertCurrDragItem_(hoverList, hoverNextItem); 
    } else { 
      this.updateCurrHoverItem(hoverNextItem, draggerElCenter); 
    } 
    this.currDragItem_.style.display = ''; 
    if(hoverList.dlgDragHoverClass_) { 
      goog.dom.classes.add(hoverList, hoverList.dlgDragHoverClass_); 
    } 
  } else { 
    if(! this.isCurrDragItemAlwaysDisplayed_) { 
      this.currDragItem_.style.display = 'none'; 
    } 
    for(var i = 0, n = this.dragLists_.length; i < n; i ++) { 
      var dragList = this.dragLists_[i]; 
      if(dragList.dlgDragHoverClass_) { 
        goog.dom.classes.remove(dragList, dragList.dlgDragHoverClass_); 
      } 
    } 
  } 
  if(hoverList != this.currHoverList_) { 
    this.currHoverList_ = hoverList; 
    this.recacheListAndItemBounds_(this.currDragItem_); 
  } 
  this.dispatchEvent(new goog.fx.DragListGroupEvent(goog.fx.DragListGroup.EventType.DRAGMOVE, this, dragEvent,(this.currDragItem_), this.draggerEl_, this.dragger_, draggerElCenter, hoverList, hoverNextItem)); 
  return false; 
}; 
goog.fx.DragListGroup.prototype.handleDragEnd_ = function(dragEvent) { 
  var rv = this.dispatchEvent(new goog.fx.DragListGroupEvent(goog.fx.DragListGroup.EventType.BEFOREDRAGEND, this, dragEvent,(this.currDragItem_), this.draggerEl_, this.dragger_)); 
  if(! rv) { 
    return false; 
  } 
  if(! this.updateWhileDragging_) { 
    this.insertCurrHoverItem(); 
  } 
  this.cleanupDragDom_(); 
  this.dispatchEvent(new goog.fx.DragListGroupEvent(goog.fx.DragListGroup.EventType.DRAGEND, this, dragEvent, this.currDragItem_, this.draggerEl_, this.dragger_)); 
  this.currDragItem_ = null; 
  this.currHoverList_ = null; 
  this.origList_ = null; 
  this.origNextItem_ = null; 
  this.draggerEl_ = null; 
  this.dragger_ = null; 
  for(var i = 0, n = this.dragLists_.length; i < n; i ++) { 
    this.dragLists_[i].dlgBounds_ = null; 
  } 
  for(var i = 0, n = this.dragItems_.length; i < n; i ++) { 
    this.dragItems_[i].dlgBounds_ = null; 
  } 
  return true; 
}; 
goog.fx.DragListGroup.prototype.cleanupDragDom_ = function() { 
  goog.dispose(this.dragger_); 
  if(this.draggerEl_) { 
    goog.dom.removeNode(this.draggerEl_); 
  } 
  if(this.currDragItem_ && this.currDragItem_.style.display == 'none') { 
    this.origList_.insertBefore(this.currDragItem_, this.origNextItem_); 
    this.currDragItem_.style.display = ''; 
  } 
  if(this.currDragItemClasses_ && this.currDragItem_) { 
    goog.dom.classes.remove.apply(null, goog.array.concat(this.currDragItem_, this.currDragItemClasses_)); 
  } else if(this.currDragItem_) { 
    this.currDragItem_.style.visibility = 'visible'; 
  } 
  for(var i = 0, n = this.dragLists_.length; i < n; i ++) { 
    var dragList = this.dragLists_[i]; 
    if(dragList.dlgDragHoverClass_) { 
      goog.dom.classes.remove(dragList, dragList.dlgDragHoverClass_); 
    } 
  } 
}; 
goog.fx.DragListGroup.prototype.getHandleForDragItem_ = function(dragItem) { 
  return dragItem; 
}; 
goog.fx.DragListGroup.prototype.handleDragItemMouseover_ = function(e) { 
  goog.dom.classes.add.apply(null, goog.array.concat((e.currentTarget), this.dragItemHoverClasses_)); 
}; 
goog.fx.DragListGroup.prototype.handleDragItemMouseout_ = function(e) { 
  goog.dom.classes.remove.apply(null, goog.array.concat((e.currentTarget), this.dragItemHoverClasses_)); 
}; 
goog.fx.DragListGroup.prototype.handleDragItemHandleMouseover_ = function(e) { 
  goog.dom.classes.add.apply(null, goog.array.concat((e.currentTarget), this.dragItemHandleHoverClasses_)); 
}; 
goog.fx.DragListGroup.prototype.handleDragItemHandleMouseout_ = function(e) { 
  goog.dom.classes.remove.apply(null, goog.array.concat((e.currentTarget), this.dragItemHandleHoverClasses_)); 
}; 
goog.fx.DragListGroup.prototype.getHoverDragList_ = function(draggerElCenter) { 
  var prevHoverList = null; 
  if(this.currDragItem_.style.display != 'none') { 
    prevHoverList =(this.currDragItem_.parentNode); 
    var prevHoverListBounds = goog.style.getBounds(prevHoverList); 
    if(this.isInRect_(draggerElCenter, prevHoverListBounds)) { 
      return prevHoverList; 
    } 
  } 
  for(var i = 0, n = this.dragLists_.length; i < n; i ++) { 
    var dragList = this.dragLists_[i]; 
    if(dragList == prevHoverList) { 
      continue; 
    } 
    if(this.isInRect_(draggerElCenter, dragList.dlgBounds_)) { 
      return dragList; 
    } 
  } 
  return null; 
}; 
goog.fx.DragListGroup.prototype.isInRect_ = function(pos, rect) { 
  return pos.x > rect.left && pos.x < rect.left + rect.width && pos.y > rect.top && pos.y < rect.top + rect.height; 
}; 
goog.fx.DragListGroup.prototype.updateCurrHoverItem = function(hoverNextItem, opt_draggerElCenter) { 
  if(goog.isDefAndNotNull(hoverNextItem)) { 
    this.currHoverItem_ = hoverNextItem; 
  } 
}; 
goog.fx.DragListGroup.prototype.insertCurrHoverItem = function() { 
  this.origList_.insertBefore(this.currDragItem_, this.currHoverItem_); 
}; 
goog.fx.DragListGroup.prototype.getHoverNextItem_ = function(hoverList, draggerElCenter) { 
  if(hoverList == null) { 
    throw Error('getHoverNextItem_ called with null hoverList.'); 
  } 
  var relevantCoord; 
  var getRelevantBoundFn; 
  var isBeforeFn; 
  var pickClosestRow = false; 
  var distanceToClosestRow = undefined; 
  switch(hoverList.dlgGrowthDirection_) { 
    case goog.fx.DragListDirection.DOWN: 
      relevantCoord = draggerElCenter.y; 
      getRelevantBoundFn = goog.fx.DragListGroup.getBottomBound_; 
      isBeforeFn = goog.fx.DragListGroup.isLessThan_; 
      break; 

    case goog.fx.DragListDirection.RIGHT_2D: 
      pickClosestRow = true; 

    case goog.fx.DragListDirection.RIGHT: 
      relevantCoord = draggerElCenter.x; 
      getRelevantBoundFn = goog.fx.DragListGroup.getRightBound_; 
      isBeforeFn = goog.fx.DragListGroup.isLessThan_; 
      break; 

    case goog.fx.DragListDirection.LEFT_2D: 
      pickClosestRow = true; 

    case goog.fx.DragListDirection.LEFT: 
      relevantCoord = draggerElCenter.x; 
      getRelevantBoundFn = goog.fx.DragListGroup.getLeftBound_; 
      isBeforeFn = goog.fx.DragListGroup.isGreaterThan_; 
      break; 

  } 
  var earliestAfterItem = null; 
  var earliestAfterItemRelevantBound; 
  var hoverListItems = goog.dom.getChildren(hoverList); 
  for(var i = 0, n = hoverListItems.length; i < n; i ++) { 
    var item = hoverListItems[i]; 
    if(item == this.currDragItem_) { 
      continue; 
    } 
    var relevantBound = getRelevantBoundFn(item.dlgBounds_); 
    if(pickClosestRow) { 
      var distanceToRow = goog.fx.DragListGroup.verticalDistanceFromItem_(item, draggerElCenter); 
      if(! goog.isDef(distanceToClosestRow)) { 
        distanceToClosestRow = distanceToRow; 
      } 
      if(isBeforeFn(relevantCoord, relevantBound) &&(earliestAfterItemRelevantBound == undefined ||(distanceToRow < distanceToClosestRow) ||((distanceToRow == distanceToClosestRow) &&(isBeforeFn(relevantBound, earliestAfterItemRelevantBound) || relevantBound == earliestAfterItemRelevantBound)))) { 
        earliestAfterItem = item; 
        earliestAfterItemRelevantBound = relevantBound; 
      } 
      if(distanceToRow < distanceToClosestRow) { 
        distanceToClosestRow = distanceToRow; 
      } 
    } else if(isBeforeFn(relevantCoord, relevantBound) &&(earliestAfterItemRelevantBound == undefined || isBeforeFn(relevantBound, earliestAfterItemRelevantBound))) { 
      earliestAfterItem = item; 
      earliestAfterItemRelevantBound = relevantBound; 
    } 
  } 
  if(! goog.isNull(earliestAfterItem) && goog.fx.DragListGroup.verticalDistanceFromItem_(earliestAfterItem, draggerElCenter) > distanceToClosestRow) { 
    return null; 
  } else { 
    return earliestAfterItem; 
  } 
}; 
goog.fx.DragListGroup.verticalDistanceFromItem_ = function(item, target) { 
  var itemBounds = item.dlgBounds_; 
  var itemCenterY = itemBounds.top +(itemBounds.height - 1) / 2; 
  return Math.abs(target.y - itemCenterY); 
}; 
goog.fx.DragListGroup.getBottomBound_ = function(itemBounds) { 
  return itemBounds.top + itemBounds.height - 1; 
}; 
goog.fx.DragListGroup.getRightBound_ = function(itemBounds) { 
  return itemBounds.left + itemBounds.width - 1; 
}; 
goog.fx.DragListGroup.getLeftBound_ = function(itemBounds) { 
  return itemBounds.left || 0; 
}; 
goog.fx.DragListGroup.isLessThan_ = function(a, b) { 
  return a < b; 
}; 
goog.fx.DragListGroup.isGreaterThan_ = function(a, b) { 
  return a > b; 
}; 
goog.fx.DragListGroup.prototype.insertCurrDragItem_ = function(hoverList, hoverNextItem) { 
  if(this.currDragItem_.parentNode != hoverList || goog.dom.getNextElementSibling(this.currDragItem_) != hoverNextItem) { 
    hoverList.insertBefore(this.currDragItem_, hoverNextItem); 
  } 
}; 
goog.fx.DragListGroup.prototype.cloneNode_ = function(sourceEl) { 
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
goog.fx.DragListGroupEvent = function(type, dragListGroup, event, currDragItem, draggerEl, dragger, opt_draggerElCenter, opt_hoverList, opt_hoverNextItem) { 
  goog.events.Event.call(this, type); 
  this.dragListGroup = dragListGroup; 
  this.event = event; 
  this.currDragItem = currDragItem; 
  this.draggerEl = draggerEl; 
  this.dragger = dragger; 
  this.draggerElCenter = opt_draggerElCenter; 
  this.hoverList = opt_hoverList; 
  this.hoverNextItem = opt_hoverNextItem; 
}; 
goog.inherits(goog.fx.DragListGroupEvent, goog.events.Event); 
