
goog.provide('goog.ui.Container'); 
goog.provide('goog.ui.Container.EventType'); 
goog.provide('goog.ui.Container.Orientation'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.events.KeyHandler.EventType'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.Error'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ContainerRenderer'); 
goog.ui.Container = function(opt_orientation, opt_renderer, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.renderer_ = opt_renderer || goog.ui.ContainerRenderer.getInstance(); 
  this.orientation_ = opt_orientation || this.renderer_.getDefaultOrientation(); 
}; 
goog.inherits(goog.ui.Container, goog.ui.Component); 
goog.ui.Container.EventType = { 
  AFTER_SHOW: 'aftershow', 
  AFTER_HIDE: 'afterhide' 
}; 
goog.ui.Container.Orientation = { 
  HORIZONTAL: 'horizontal', 
  VERTICAL: 'vertical' 
}; 
goog.ui.Container.prototype.keyEventTarget_ = null; 
goog.ui.Container.prototype.keyHandler_ = null; 
goog.ui.Container.prototype.renderer_ = null; 
goog.ui.Container.prototype.orientation_ = null; 
goog.ui.Container.prototype.visible_ = true; 
goog.ui.Container.prototype.enabled_ = true; 
goog.ui.Container.prototype.focusable_ = true; 
goog.ui.Container.prototype.highlightedIndex_ = - 1; 
goog.ui.Container.prototype.openItem_ = null; 
goog.ui.Container.prototype.mouseButtonPressed_ = false; 
goog.ui.Container.prototype.allowFocusableChildren_ = false; 
goog.ui.Container.prototype.openFollowsHighlight_ = true; 
goog.ui.Container.prototype.childElementIdMap_ = null; 
goog.ui.Container.prototype.getKeyEventTarget = function() { 
  return this.keyEventTarget_ || this.renderer_.getKeyEventTarget(this); 
}; 
goog.ui.Container.prototype.setKeyEventTarget = function(element) { 
  if(this.focusable_) { 
    var oldTarget = this.getKeyEventTarget(); 
    var inDocument = this.isInDocument(); 
    this.keyEventTarget_ = element; 
    var newTarget = this.getKeyEventTarget(); 
    if(inDocument) { 
      this.keyEventTarget_ = oldTarget; 
      this.enableFocusHandling_(false); 
      this.keyEventTarget_ = element; 
      this.getKeyHandler().attach(newTarget); 
      this.enableFocusHandling_(true); 
    } 
  } else { 
    throw Error('Can\'t set key event target for container ' + 'that doesn\'t support keyboard focus!'); 
  } 
}; 
goog.ui.Container.prototype.getKeyHandler = function() { 
  return this.keyHandler_ ||(this.keyHandler_ = new goog.events.KeyHandler(this.getKeyEventTarget())); 
}; 
goog.ui.Container.prototype.getRenderer = function() { 
  return this.renderer_; 
}; 
goog.ui.Container.prototype.setRenderer = function(renderer) { 
  if(this.getElement()) { 
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
  } 
  this.renderer_ = renderer; 
}; 
goog.ui.Container.prototype.createDom = function() { 
  this.setElementInternal(this.renderer_.createDom(this)); 
}; 
goog.ui.Container.prototype.getContentElement = function() { 
  return this.renderer_.getContentElement(this.getElement()); 
}; 
goog.ui.Container.prototype.canDecorate = function(element) { 
  return this.renderer_.canDecorate(element); 
}; 
goog.ui.Container.prototype.decorateInternal = function(element) { 
  this.setElementInternal(this.renderer_.decorate(this, element)); 
  if(element.style.display == 'none') { 
    this.visible_ = false; 
  } 
}; 
goog.ui.Container.prototype.enterDocument = function() { 
  goog.ui.Container.superClass_.enterDocument.call(this); 
  this.forEachChild(function(child) { 
    if(child.isInDocument()) { 
      this.registerChildId_(child); 
    } 
  }, this); 
  var elem = this.getElement(); 
  this.renderer_.initializeDom(this); 
  this.setVisible(this.visible_, true); 
  this.getHandler().listen(this, goog.ui.Component.EventType.ENTER, this.handleEnterItem).listen(this, goog.ui.Component.EventType.HIGHLIGHT, this.handleHighlightItem).listen(this, goog.ui.Component.EventType.UNHIGHLIGHT, this.handleUnHighlightItem).listen(this, goog.ui.Component.EventType.OPEN, this.handleOpenItem).listen(this, goog.ui.Component.EventType.CLOSE, this.handleCloseItem).listen(elem, goog.events.EventType.MOUSEDOWN, this.handleMouseDown).listen(goog.dom.getOwnerDocument(elem), goog.events.EventType.MOUSEUP, this.handleDocumentMouseUp).listen(elem,[goog.events.EventType.MOUSEDOWN, goog.events.EventType.MOUSEUP, goog.events.EventType.MOUSEOVER, goog.events.EventType.MOUSEOUT], this.handleChildMouseEvents); 
  if(this.isFocusable()) { 
    this.enableFocusHandling_(true); 
  } 
}; 
goog.ui.Container.prototype.enableFocusHandling_ = function(enable) { 
  var handler = this.getHandler(); 
  var keyTarget = this.getKeyEventTarget(); 
  if(enable) { 
    handler.listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur).listen(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent); 
  } else { 
    handler.unlisten(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).unlisten(keyTarget, goog.events.EventType.BLUR, this.handleBlur).unlisten(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent); 
  } 
}; 
goog.ui.Container.prototype.exitDocument = function() { 
  this.setHighlightedIndex(- 1); 
  if(this.openItem_) { 
    this.openItem_.setOpen(false); 
  } 
  this.mouseButtonPressed_ = false; 
  goog.ui.Container.superClass_.exitDocument.call(this); 
}; 
goog.ui.Container.prototype.disposeInternal = function() { 
  goog.ui.Container.superClass_.disposeInternal.call(this); 
  if(this.keyHandler_) { 
    this.keyHandler_.dispose(); 
    this.keyHandler_ = null; 
  } 
  this.childElementIdMap_ = null; 
  this.openItem_ = null; 
  this.renderer_ = null; 
}; 
goog.ui.Container.prototype.handleEnterItem = function(e) { 
  return true; 
}; 
goog.ui.Container.prototype.handleHighlightItem = function(e) { 
  var index = this.indexOfChild((e.target)); 
  if(index > - 1 && index != this.highlightedIndex_) { 
    var item = this.getHighlighted(); 
    if(item) { 
      item.setHighlighted(false); 
    } 
    this.highlightedIndex_ = index; 
    item = this.getHighlighted(); 
    if(this.isMouseButtonPressed()) { 
      item.setActive(true); 
    } 
    if(this.openFollowsHighlight_ && this.openItem_ && item != this.openItem_) { 
      if(item.isSupportedState(goog.ui.Component.State.OPENED)) { 
        item.setOpen(true); 
      } else { 
        this.openItem_.setOpen(false); 
      } 
    } 
  } 
  goog.dom.a11y.setState(this.getElement(), goog.dom.a11y.State.ACTIVEDESCENDANT, e.target.getElement().id); 
}; 
goog.ui.Container.prototype.handleUnHighlightItem = function(e) { 
  if(e.target == this.getHighlighted()) { 
    this.highlightedIndex_ = - 1; 
  } 
  goog.dom.a11y.setState(this.getElement(), goog.dom.a11y.State.ACTIVEDESCENDANT, ''); 
}; 
goog.ui.Container.prototype.handleOpenItem = function(e) { 
  var item =(e.target); 
  if(item && item != this.openItem_ && item.getParent() == this) { 
    if(this.openItem_) { 
      this.openItem_.setOpen(false); 
    } 
    this.openItem_ = item; 
  } 
}; 
goog.ui.Container.prototype.handleCloseItem = function(e) { 
  if(e.target == this.openItem_) { 
    this.openItem_ = null; 
  } 
}; 
goog.ui.Container.prototype.handleMouseDown = function(e) { 
  if(this.enabled_) { 
    this.setMouseButtonPressed(true); 
  } 
  var keyTarget = this.getKeyEventTarget(); 
  if(keyTarget && goog.dom.isFocusableTabIndex(keyTarget)) { 
    keyTarget.focus(); 
  } else { 
    e.preventDefault(); 
  } 
}; 
goog.ui.Container.prototype.handleDocumentMouseUp = function(e) { 
  this.setMouseButtonPressed(false); 
}; 
goog.ui.Container.prototype.handleChildMouseEvents = function(e) { 
  var control = this.getOwnerControl((e.target)); 
  if(control) { 
    switch(e.type) { 
      case goog.events.EventType.MOUSEDOWN: 
        control.handleMouseDown(e); 
        break; 

      case goog.events.EventType.MOUSEUP: 
        control.handleMouseUp(e); 
        break; 

      case goog.events.EventType.MOUSEOVER: 
        control.handleMouseOver(e); 
        break; 

      case goog.events.EventType.MOUSEOUT: 
        control.handleMouseOut(e); 
        break; 

    } 
  } 
}; 
goog.ui.Container.prototype.getOwnerControl = function(node) { 
  if(this.childElementIdMap_) { 
    var elem = this.getElement(); 
    while(node && node !== elem) { 
      var id = node.id; 
      if(id in this.childElementIdMap_) { 
        return this.childElementIdMap_[id]; 
      } 
      node = node.parentNode; 
    } 
  } 
  return null; 
}; 
goog.ui.Container.prototype.handleFocus = function(e) { }; 
goog.ui.Container.prototype.handleBlur = function(e) { 
  this.setHighlightedIndex(- 1); 
  this.setMouseButtonPressed(false); 
  if(this.openItem_) { 
    this.openItem_.setOpen(false); 
  } 
}; 
goog.ui.Container.prototype.handleKeyEvent = function(e) { 
  if(this.isEnabled() && this.isVisible() &&(this.getChildCount() != 0 || this.keyEventTarget_) && this.handleKeyEventInternal(e)) { 
    e.preventDefault(); 
    e.stopPropagation(); 
    return true; 
  } 
  return false; 
}; 
goog.ui.Container.prototype.handleKeyEventInternal = function(e) { 
  var highlighted = this.getHighlighted(); 
  if(highlighted && typeof highlighted.handleKeyEvent == 'function' && highlighted.handleKeyEvent(e)) { 
    return true; 
  } 
  if(this.openItem_ && this.openItem_ != highlighted && typeof this.openItem_.handleKeyEvent == 'function' && this.openItem_.handleKeyEvent(e)) { 
    return true; 
  } 
  if(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) { 
    return false; 
  } 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.ESC: 
      if(this.isFocusable()) { 
        this.getKeyEventTarget().blur(); 
      } else { 
        return false; 
      } 
      break; 

    case goog.events.KeyCodes.HOME: 
      this.highlightFirst(); 
      break; 

    case goog.events.KeyCodes.END: 
      this.highlightLast(); 
      break; 

    case goog.events.KeyCodes.UP: 
      if(this.orientation_ == goog.ui.Container.Orientation.VERTICAL) { 
        this.highlightPrevious(); 
      } else { 
        return false; 
      } 
      break; 

    case goog.events.KeyCodes.LEFT: 
      if(this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) { 
        if(this.isRightToLeft()) { 
          this.highlightNext(); 
        } else { 
          this.highlightPrevious(); 
        } 
      } else { 
        return false; 
      } 
      break; 

    case goog.events.KeyCodes.DOWN: 
      if(this.orientation_ == goog.ui.Container.Orientation.VERTICAL) { 
        this.highlightNext(); 
      } else { 
        return false; 
      } 
      break; 

    case goog.events.KeyCodes.RIGHT: 
      if(this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) { 
        if(this.isRightToLeft()) { 
          this.highlightPrevious(); 
        } else { 
          this.highlightNext(); 
        } 
      } else { 
        return false; 
      } 
      break; 

    default: 
      return false; 

  } 
  return true; 
}; 
goog.ui.Container.prototype.registerChildId_ = function(child) { 
  var childElem = child.getElement(); 
  var id = childElem.id ||(childElem.id = child.getId()); 
  if(! this.childElementIdMap_) { 
    this.childElementIdMap_ = { }; 
  } 
  this.childElementIdMap_[id]= child; 
}; 
goog.ui.Container.prototype.addChild = function(child, opt_render) { 
  goog.ui.Container.superClass_.addChild.call(this, child, opt_render); 
}; 
goog.ui.Container.prototype.getChild; 
goog.ui.Container.prototype.getChildAt; 
goog.ui.Container.prototype.addChildAt = function(control, index, opt_render) { 
  control.setDispatchTransitionEvents(goog.ui.Component.State.HOVER, true); 
  control.setDispatchTransitionEvents(goog.ui.Component.State.OPENED, true); 
  if(this.isFocusable() || ! this.isFocusableChildrenAllowed()) { 
    control.setSupportedState(goog.ui.Component.State.FOCUSED, false); 
  } 
  control.setHandleMouseEvents(false); 
  goog.ui.Container.superClass_.addChildAt.call(this, control, index, opt_render); 
  if(opt_render && this.isInDocument()) { 
    this.registerChildId_(control); 
  } 
  if(index <= this.highlightedIndex_) { 
    this.highlightedIndex_ ++; 
  } 
}; 
goog.ui.Container.prototype.removeChild = function(control, opt_unrender) { 
  control = goog.isString(control) ? this.getChild(control): control; 
  if(control) { 
    var index = this.indexOfChild(control); 
    if(index != - 1) { 
      if(index == this.highlightedIndex_) { 
        control.setHighlighted(false); 
      } else if(index < this.highlightedIndex_) { 
        this.highlightedIndex_ --; 
      } 
    } 
    var childElem = control.getElement(); 
    if(childElem && childElem.id) { 
      goog.object.remove(this.childElementIdMap_, childElem.id); 
    } 
  } 
  control =(goog.ui.Container.superClass_.removeChild.call(this, control, opt_unrender)); 
  control.setHandleMouseEvents(true); 
  return control; 
}; 
goog.ui.Container.prototype.getOrientation = function() { 
  return this.orientation_; 
}; 
goog.ui.Container.prototype.setOrientation = function(orientation) { 
  if(this.getElement()) { 
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
  } 
  this.orientation_ = orientation; 
}; 
goog.ui.Container.prototype.isVisible = function() { 
  return this.visible_; 
}; 
goog.ui.Container.prototype.setVisible = function(visible, opt_force) { 
  if(opt_force ||(this.visible_ != visible && this.dispatchEvent(visible ? goog.ui.Component.EventType.SHOW: goog.ui.Component.EventType.HIDE))) { 
    this.visible_ = visible; 
    var elem = this.getElement(); 
    if(elem) { 
      goog.style.showElement(elem, visible); 
      if(this.isFocusable()) { 
        this.renderer_.enableTabIndex(this.getKeyEventTarget(), this.enabled_ && this.visible_); 
      } 
      if(! opt_force) { 
        this.dispatchEvent(this.visible_ ? goog.ui.Container.EventType.AFTER_SHOW: goog.ui.Container.EventType.AFTER_HIDE); 
      } 
    } 
    return true; 
  } 
  return false; 
}; 
goog.ui.Container.prototype.isEnabled = function() { 
  return this.enabled_; 
}; 
goog.ui.Container.prototype.setEnabled = function(enable) { 
  if(this.enabled_ != enable && this.dispatchEvent(enable ? goog.ui.Component.EventType.ENABLE: goog.ui.Component.EventType.DISABLE)) { 
    if(enable) { 
      this.enabled_ = true; 
      this.forEachChild(function(child) { 
        if(child.wasDisabled) { 
          delete child.wasDisabled; 
        } else { 
          child.setEnabled(true); 
        } 
      }); 
    } else { 
      this.forEachChild(function(child) { 
        if(child.isEnabled()) { 
          child.setEnabled(false); 
        } else { 
          child.wasDisabled = true; 
        } 
      }); 
      this.enabled_ = false; 
      this.setMouseButtonPressed(false); 
    } 
    if(this.isFocusable()) { 
      this.renderer_.enableTabIndex(this.getKeyEventTarget(), enable && this.visible_); 
    } 
  } 
}; 
goog.ui.Container.prototype.isFocusable = function() { 
  return this.focusable_; 
}; 
goog.ui.Container.prototype.setFocusable = function(focusable) { 
  if(focusable != this.focusable_ && this.isInDocument()) { 
    this.enableFocusHandling_(focusable); 
  } 
  this.focusable_ = focusable; 
  if(this.enabled_ && this.visible_) { 
    this.renderer_.enableTabIndex(this.getKeyEventTarget(), focusable); 
  } 
}; 
goog.ui.Container.prototype.isFocusableChildrenAllowed = function() { 
  return this.allowFocusableChildren_; 
}; 
goog.ui.Container.prototype.setFocusableChildrenAllowed = function(focusable) { 
  this.allowFocusableChildren_ = focusable; 
}; 
goog.ui.Container.prototype.isOpenFollowsHighlight = function() { 
  return this.openFollowsHighlight_; 
}; 
goog.ui.Container.prototype.setOpenFollowsHighlight = function(follow) { 
  this.openFollowsHighlight_ = follow; 
}; 
goog.ui.Container.prototype.getHighlightedIndex = function() { 
  return this.highlightedIndex_; 
}; 
goog.ui.Container.prototype.setHighlightedIndex = function(index) { 
  var child = this.getChildAt(index); 
  if(child) { 
    child.setHighlighted(true); 
  } else if(this.highlightedIndex_ > - 1) { 
    this.getHighlighted().setHighlighted(false); 
  } 
}; 
goog.ui.Container.prototype.setHighlighted = function(item) { 
  this.setHighlightedIndex(this.indexOfChild(item)); 
}; 
goog.ui.Container.prototype.getHighlighted = function() { 
  return this.getChildAt(this.highlightedIndex_); 
}; 
goog.ui.Container.prototype.highlightFirst = function() { 
  this.highlightHelper(function(index, max) { 
    return(index + 1) % max; 
  }, this.getChildCount() - 1); 
}; 
goog.ui.Container.prototype.highlightLast = function() { 
  this.highlightHelper(function(index, max) { 
    index --; 
    return index < 0 ? max - 1: index; 
  }, 0); 
}; 
goog.ui.Container.prototype.highlightNext = function() { 
  this.highlightHelper(function(index, max) { 
    return(index + 1) % max; 
  }, this.highlightedIndex_); 
}; 
goog.ui.Container.prototype.highlightPrevious = function() { 
  this.highlightHelper(function(index, max) { 
    index --; 
    return index < 0 ? max - 1: index; 
  }, this.highlightedIndex_); 
}; 
goog.ui.Container.prototype.highlightHelper = function(fn, startIndex) { 
  var curIndex = startIndex < 0 ? this.indexOfChild(this.openItem_): startIndex; 
  var numItems = this.getChildCount(); 
  curIndex = fn.call(this, curIndex, numItems); 
  var visited = 0; 
  while(visited <= numItems) { 
    var control = this.getChildAt(curIndex); 
    if(control && this.canHighlightItem(control)) { 
      this.setHighlightedIndexFromKeyEvent(curIndex); 
      return true; 
    } 
    visited ++; 
    curIndex = fn.call(this, curIndex, numItems); 
  } 
  return false; 
}; 
goog.ui.Container.prototype.canHighlightItem = function(item) { 
  return item.isVisible() && item.isEnabled() && item.isSupportedState(goog.ui.Component.State.HOVER); 
}; 
goog.ui.Container.prototype.setHighlightedIndexFromKeyEvent = function(index) { 
  this.setHighlightedIndex(index); 
}; 
goog.ui.Container.prototype.getOpenItem = function() { 
  return this.openItem_; 
}; 
goog.ui.Container.prototype.isMouseButtonPressed = function() { 
  return this.mouseButtonPressed_; 
}; 
goog.ui.Container.prototype.setMouseButtonPressed = function(pressed) { 
  this.mouseButtonPressed_ = pressed; 
}; 
