
goog.provide('goog.ui.MenuButton'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.events.KeyHandler.EventType'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Rect'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.positioning.MenuAnchoredPosition'); 
goog.require('goog.style'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.MenuButton = function(content, opt_menu, opt_renderer, opt_domHelper) { 
  goog.ui.Button.call(this, content, opt_renderer || goog.ui.MenuButtonRenderer.getInstance(), opt_domHelper); 
  this.setSupportedState(goog.ui.Component.State.OPENED, true); 
  if(opt_menu) { 
    this.setMenu(opt_menu); 
  } 
  this.timer_ = new goog.Timer(500); 
}; 
goog.inherits(goog.ui.MenuButton, goog.ui.Button); 
goog.ui.MenuButton.prototype.menu_; 
goog.ui.MenuButton.prototype.positionElement_; 
goog.ui.MenuButton.prototype.alignToStart_ = true; 
goog.ui.MenuButton.prototype.scrollOnOverflow_ = false; 
goog.ui.MenuButton.prototype.isFocusablePopupMenu_ = false; 
goog.ui.MenuButton.prototype.timer_; 
goog.ui.MenuButton.prototype.buttonRect_; 
goog.ui.MenuButton.prototype.viewportBox_; 
goog.ui.MenuButton.prototype.originalSize_; 
goog.ui.MenuButton.prototype.renderMenuAsSibling_ = false; 
goog.ui.MenuButton.prototype.enterDocument = function() { 
  goog.ui.MenuButton.superClass_.enterDocument.call(this); 
  if(this.menu_) { 
    this.attachMenuEventListeners_(this.menu_, true); 
  } 
  goog.dom.a11y.setState(this.getElement(), goog.dom.a11y.State.HASPOPUP, 'true'); 
}; 
goog.ui.MenuButton.prototype.exitDocument = function() { 
  goog.ui.MenuButton.superClass_.exitDocument.call(this); 
  if(this.menu_) { 
    this.setOpen(false); 
    this.menu_.exitDocument(); 
    this.attachMenuEventListeners_(this.menu_, false); 
    var menuElement = this.menu_.getElement(); 
    if(menuElement) { 
      goog.dom.removeNode(menuElement); 
    } 
  } 
}; 
goog.ui.MenuButton.prototype.disposeInternal = function() { 
  goog.ui.MenuButton.superClass_.disposeInternal.call(this); 
  if(this.menu_) { 
    this.menu_.dispose(); 
    delete this.menu_; 
  } 
  delete this.positionElement_; 
  this.timer_.dispose(); 
}; 
goog.ui.MenuButton.prototype.handleMouseDown = function(e) { 
  goog.ui.MenuButton.superClass_.handleMouseDown.call(this, e); 
  if(this.isActive()) { 
    this.setOpen(! this.isOpen(), e); 
    if(this.menu_) { 
      this.menu_.setMouseButtonPressed(this.isOpen()); 
    } 
  } 
}; 
goog.ui.MenuButton.prototype.handleMouseUp = function(e) { 
  goog.ui.MenuButton.superClass_.handleMouseUp.call(this, e); 
  if(this.menu_ && ! this.isActive()) { 
    this.menu_.setMouseButtonPressed(false); 
  } 
}; 
goog.ui.MenuButton.prototype.performActionInternal = function(e) { 
  this.setActive(false); 
  return true; 
}; 
goog.ui.MenuButton.prototype.handleDocumentMouseDown = function(e) { 
  if(this.menu_ && this.menu_.isVisible() && ! this.containsElement((e.target))) { 
    this.setOpen(false); 
  } 
}; 
goog.ui.MenuButton.prototype.containsElement = function(element) { 
  return element && goog.dom.contains(this.getElement(), element) || this.menu_ && this.menu_.containsElement(element) || false; 
}; 
goog.ui.MenuButton.prototype.handleKeyEventInternal = function(e) { 
  if(e.keyCode == goog.events.KeyCodes.SPACE) { 
    e.preventDefault(); 
    if(e.type != goog.events.EventType.KEYUP) { 
      return false; 
    } 
  } else if(e.type != goog.events.KeyHandler.EventType.KEY) { 
    return false; 
  } 
  if(this.menu_ && this.menu_.isVisible()) { 
    var handledByMenu = this.menu_.handleKeyEvent(e); 
    if(e.keyCode == goog.events.KeyCodes.ESC) { 
      this.setOpen(false); 
      return true; 
    } 
    return handledByMenu; 
  } 
  if(e.keyCode == goog.events.KeyCodes.DOWN || e.keyCode == goog.events.KeyCodes.UP || e.keyCode == goog.events.KeyCodes.SPACE) { 
    this.setOpen(true); 
    return true; 
  } 
  return false; 
}; 
goog.ui.MenuButton.prototype.handleMenuAction = function(e) { 
  this.setOpen(false); 
}; 
goog.ui.MenuButton.prototype.handleMenuBlur = function(e) { 
  if(! this.isActive()) { 
    this.setOpen(false); 
  } 
}; 
goog.ui.MenuButton.prototype.handleBlur = function(e) { 
  if(! this.isFocusablePopupMenu()) { 
    this.setOpen(false); 
  } 
  goog.ui.MenuButton.superClass_.handleBlur.call(this, e); 
}; 
goog.ui.MenuButton.prototype.getMenu = function() { 
  if(! this.menu_) { 
    this.setMenu(new goog.ui.Menu(this.getDomHelper())); 
  } 
  return this.menu_ || null; 
}; 
goog.ui.MenuButton.prototype.setMenu = function(menu) { 
  var oldMenu = this.menu_; 
  if(menu != oldMenu) { 
    if(oldMenu) { 
      this.setOpen(false); 
      if(this.isInDocument()) { 
        this.attachMenuEventListeners_(oldMenu, false); 
      } 
      delete this.menu_; 
    } 
    if(menu) { 
      this.menu_ = menu; 
      menu.setParent(this); 
      menu.setVisible(false); 
      menu.setAllowAutoFocus(this.isFocusablePopupMenu()); 
      if(this.isInDocument()) { 
        this.attachMenuEventListeners_(menu, true); 
      } 
    } 
  } 
  return oldMenu; 
}; 
goog.ui.MenuButton.prototype.setPositionElement = function(positionElement) { 
  this.positionElement_ = positionElement; 
  this.positionMenu(); 
}; 
goog.ui.MenuButton.prototype.addItem = function(item) { 
  this.getMenu().addChild(item, true); 
}; 
goog.ui.MenuButton.prototype.addItemAt = function(item, index) { 
  this.getMenu().addChildAt(item, index, true); 
}; 
goog.ui.MenuButton.prototype.removeItem = function(item) { 
  var child = this.getMenu().removeChild(item, true); 
  if(child) { 
    child.dispose(); 
  } 
}; 
goog.ui.MenuButton.prototype.removeItemAt = function(index) { 
  var child = this.getMenu().removeChildAt(index, true); 
  if(child) { 
    child.dispose(); 
  } 
}; 
goog.ui.MenuButton.prototype.getItemAt = function(index) { 
  return this.menu_ ?(this.menu_.getChildAt(index)): null; 
}; 
goog.ui.MenuButton.prototype.getItemCount = function() { 
  return this.menu_ ? this.menu_.getChildCount(): 0; 
}; 
goog.ui.MenuButton.prototype.setVisible = function(visible, opt_force) { 
  var visibilityChanged = goog.ui.MenuButton.superClass_.setVisible.call(this, visible, opt_force); 
  if(visibilityChanged && ! this.isVisible()) { 
    this.setOpen(false); 
  } 
  return visibilityChanged; 
}; 
goog.ui.MenuButton.prototype.setEnabled = function(enable) { 
  goog.ui.MenuButton.superClass_.setEnabled.call(this, enable); 
  if(! this.isEnabled()) { 
    this.setOpen(false); 
  } 
}; 
goog.ui.MenuButton.prototype.isAlignMenuToStart = function() { 
  return this.alignToStart_; 
}; 
goog.ui.MenuButton.prototype.setAlignMenuToStart = function(alignToStart) { 
  this.alignToStart_ = alignToStart; 
}; 
goog.ui.MenuButton.prototype.setScrollOnOverflow = function(scrollOnOverflow) { 
  this.scrollOnOverflow_ = scrollOnOverflow; 
}; 
goog.ui.MenuButton.prototype.isScrollOnOverflow = function() { 
  return this.scrollOnOverflow_; 
}; 
goog.ui.MenuButton.prototype.isFocusablePopupMenu = function() { 
  return this.isFocusablePopupMenu_; 
}; 
goog.ui.MenuButton.prototype.setFocusablePopupMenu = function(focusable) { 
  this.isFocusablePopupMenu_ = focusable; 
}; 
goog.ui.MenuButton.prototype.setRenderMenuAsSibling = function(renderMenuAsSibling) { 
  this.renderMenuAsSibling_ = renderMenuAsSibling; 
}; 
goog.ui.MenuButton.prototype.showMenu = function() { 
  this.setOpen(true); 
}; 
goog.ui.MenuButton.prototype.hideMenu = function() { 
  this.setOpen(false); 
}; 
goog.ui.MenuButton.prototype.setOpen = function(open, opt_e) { 
  goog.ui.MenuButton.superClass_.setOpen.call(this, open); 
  if(this.menu_ && this.hasState(goog.ui.Component.State.OPENED) == open) { 
    if(open) { 
      if(! this.menu_.isInDocument()) { 
        if(this.renderMenuAsSibling_) { 
          this.menu_.render((this.getElement().parentNode)); 
        } else { 
          this.menu_.render(); 
        } 
      } 
      this.viewportBox_ = goog.style.getVisibleRectForElement(this.getElement()); 
      this.buttonRect_ = goog.style.getBounds(this.getElement()); 
      this.positionMenu(); 
      this.menu_.setHighlightedIndex(- 1); 
    } else { 
      this.setActive(false); 
      this.menu_.setMouseButtonPressed(false); 
      if(this.getElement()) { 
        goog.dom.a11y.setState(this.getElement(), goog.dom.a11y.State.ACTIVEDESCENDANT, ''); 
      } 
      if(goog.isDefAndNotNull(this.originalSize_)) { 
        this.originalSize_ = undefined; 
        var elem = this.menu_.getElement(); 
        if(elem) { 
          goog.style.setSize(elem, '', ''); 
        } 
      } 
    } 
    this.menu_.setVisible(open, false, opt_e); 
    this.attachPopupListeners_(open); 
  } 
}; 
goog.ui.MenuButton.prototype.positionMenu = function() { 
  if(! this.menu_.isInDocument()) { 
    return; 
  } 
  var positionElement = this.positionElement_ || this.getElement(); 
  var anchorCorner = this.isAlignMenuToStart() ? goog.positioning.Corner.BOTTOM_START: goog.positioning.Corner.BOTTOM_END; 
  var position = new goog.positioning.MenuAnchoredPosition(positionElement, anchorCorner, ! this.scrollOnOverflow_, this.scrollOnOverflow_); 
  var elem = this.menu_.getElement(); 
  if(! this.menu_.isVisible()) { 
    elem.style.visibility = 'hidden'; 
    goog.style.showElement(elem, true); 
  } 
  if(! this.originalSize_ && this.scrollOnOverflow_) { 
    this.originalSize_ = goog.style.getSize(elem); 
  } 
  var popupCorner = this.isAlignMenuToStart() ? goog.positioning.Corner.TOP_START: goog.positioning.Corner.TOP_END; 
  position.reposition(elem, popupCorner, null, this.originalSize_); 
  if(! this.menu_.isVisible()) { 
    goog.style.showElement(elem, false); 
    elem.style.visibility = 'visible'; 
  } 
}; 
goog.ui.MenuButton.prototype.onTick_ = function(e) { 
  var currentButtonRect = goog.style.getBounds(this.getElement()); 
  var currentViewport = goog.style.getVisibleRectForElement(this.getElement()); 
  if(! goog.math.Rect.equals(this.buttonRect_, currentButtonRect) || ! goog.math.Box.equals(this.viewportBox_, currentViewport)) { 
    this.buttonRect_ = currentButtonRect; 
    this.viewportBox_ = currentViewport; 
    this.positionMenu(); 
  } 
}; 
goog.ui.MenuButton.prototype.attachMenuEventListeners_ = function(menu, attach) { 
  var handler = this.getHandler(); 
  var method = attach ? handler.listen: handler.unlisten; 
  method.call(handler, menu, goog.ui.Component.EventType.ACTION, this.handleMenuAction); 
  method.call(handler, menu, goog.ui.Component.EventType.HIGHLIGHT, this.handleHighlightItem); 
  method.call(handler, menu, goog.ui.Component.EventType.UNHIGHLIGHT, this.handleUnHighlightItem); 
}; 
goog.ui.MenuButton.prototype.handleHighlightItem = function(e) { 
  goog.dom.a11y.setState(this.getElement(), goog.dom.a11y.State.ACTIVEDESCENDANT, e.target.getElement().id); 
}; 
goog.ui.MenuButton.prototype.handleUnHighlightItem = function(e) { 
  if(! this.menu_.getHighlighted()) { 
    goog.dom.a11y.setState(this.getElement(), goog.dom.a11y.State.ACTIVEDESCENDANT, ''); 
  } 
}; 
goog.ui.MenuButton.prototype.attachPopupListeners_ = function(attach) { 
  var handler = this.getHandler(); 
  var method = attach ? handler.listen: handler.unlisten; 
  method.call(handler, this.getDomHelper().getDocument(), goog.events.EventType.MOUSEDOWN, this.handleDocumentMouseDown, true); 
  if(this.isFocusablePopupMenu()) { 
    method.call(handler,(this.menu_), goog.ui.Component.EventType.BLUR, this.handleMenuBlur); 
  } 
  method.call(handler, this.timer_, goog.Timer.TICK, this.onTick_); 
  if(attach) { 
    this.timer_.start(); 
  } else { 
    this.timer_.stop(); 
  } 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.MenuButton(null); 
}); 
