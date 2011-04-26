
goog.provide('goog.ui.SubMenu'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.positioning.AnchoredViewportPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.SubMenuRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.SubMenu = function(content, opt_model, opt_domHelper, opt_renderer) { 
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper, opt_renderer || goog.ui.SubMenuRenderer.getInstance()); 
}; 
goog.inherits(goog.ui.SubMenu, goog.ui.MenuItem); 
goog.ui.SubMenu.MENU_DELAY_MS = 350; 
goog.ui.SubMenu.prototype.dismissTimer_ = null; 
goog.ui.SubMenu.prototype.showTimer_ = null; 
goog.ui.SubMenu.prototype.hasKeyboardControl_ = false; 
goog.ui.SubMenu.prototype.subMenu_ = null; 
goog.ui.SubMenu.prototype.externalSubMenu_ = false; 
goog.ui.SubMenu.prototype.alignToEnd_ = true; 
goog.ui.SubMenu.prototype.isPositionAdjustable_ = false; 
goog.ui.SubMenu.prototype.enterDocument = function() { 
  goog.ui.SubMenu.superClass_.enterDocument.call(this); 
  this.getHandler().listen(this.getParent(), goog.ui.Component.EventType.HIDE, this.onParentHidden_); 
  if(this.subMenu_) { 
    this.setMenuListenersEnabled_(this.subMenu_, true); 
  } 
}; 
goog.ui.SubMenu.prototype.exitDocument = function() { 
  this.getHandler().unlisten(this.getParent(), goog.ui.Component.EventType.HIDE, this.onParentHidden_); 
  if(this.subMenu_) { 
    this.setMenuListenersEnabled_(this.subMenu_, false); 
    if(! this.externalSubMenu_) { 
      this.subMenu_.exitDocument(); 
      goog.dom.removeNode(this.subMenu_.getElement()); 
    } 
  } 
  goog.ui.SubMenu.superClass_.exitDocument.call(this); 
}; 
goog.ui.SubMenu.prototype.disposeInternal = function() { 
  if(this.subMenu_ && ! this.externalSubMenu_) { 
    this.subMenu_.dispose(); 
  } 
  this.subMenu_ = null; 
  goog.ui.SubMenu.superClass_.disposeInternal.call(this); 
}; 
goog.ui.SubMenu.prototype.setHighlighted = function(highlight, opt_btnPressed) { 
  goog.ui.SubMenu.superClass_.setHighlighted.call(this, highlight); 
  if(opt_btnPressed) { 
    this.getMenu().setMouseButtonPressed(true); 
  } 
  if(! highlight) { 
    if(this.dismissTimer_) { 
      goog.Timer.clear(this.dismissTimer_); 
    } 
    this.dismissTimer_ = goog.Timer.callOnce(this.dismissSubMenu, goog.ui.SubMenu.MENU_DELAY_MS, this); 
  } 
}; 
goog.ui.SubMenu.prototype.showSubMenu = function() { 
  var parent = this.getParent(); 
  if(parent && parent.getHighlighted() == this) { 
    this.setSubMenuVisible_(true); 
    this.dismissSiblings_(); 
    this.keyboardSetFocus_ = false; 
  } 
}; 
goog.ui.SubMenu.prototype.dismissSubMenu = function() { 
  var subMenu = this.subMenu_; 
  if(subMenu && subMenu.getParent() == this) { 
    this.setSubMenuVisible_(false); 
    subMenu.forEachChild(function(child) { 
      if(typeof child.dismissSubMenu == 'function') { 
        child.dismissSubMenu(); 
      } 
    }); 
  } 
}; 
goog.ui.SubMenu.prototype.clearTimers = function() { 
  if(this.dismissTimer_) { 
    goog.Timer.clear(this.dismissTimer_); 
  } 
  if(this.showTimer_) { 
    goog.Timer.clear(this.showTimer_); 
  } 
}; 
goog.ui.SubMenu.prototype.setVisible = function(visible, opt_force) { 
  var visibilityChanged = goog.ui.SubMenu.superClass_.setVisible.call(this, visible, opt_force); 
  if(visibilityChanged && ! this.isVisible()) { 
    this.dismissSubMenu(); 
  } 
  return visibilityChanged; 
}; 
goog.ui.SubMenu.prototype.dismissSiblings_ = function() { 
  this.getParent().forEachChild(function(child) { 
    if(child != this && typeof child.dismissSubMenu == 'function') { 
      child.dismissSubMenu(); 
      child.clearTimers(); 
    } 
  }, this); 
}; 
goog.ui.SubMenu.prototype.handleKeyEvent = function(e) { 
  var keyCode = e.keyCode; 
  if(! this.hasKeyboardControl_) { 
    if(this.isEnabled() && keyCode == goog.events.KeyCodes.RIGHT) { 
      this.showSubMenu(); 
      this.getMenu().highlightFirst(); 
      this.clearTimers(); 
    } else { 
      return false; 
    } 
  } else if(this.getMenu().handleKeyEvent(e)) { } else if(keyCode == goog.events.KeyCodes.LEFT) { 
    this.dismissSubMenu(); 
  } else { 
    return false; 
  } 
  e.preventDefault(); 
  return true; 
}; 
goog.ui.SubMenu.prototype.onChildHighlight_ = function(e) { 
  if(this.subMenu_.getParent() == this) { 
    this.clearTimers(); 
    this.getParentEventTarget().setHighlighted(this); 
    this.dismissSiblings_(); 
  } 
}; 
goog.ui.SubMenu.prototype.onParentHidden_ = function(e) { 
  if(e.target == this.getParentEventTarget()) { 
    this.dismissSubMenu(); 
    this.clearTimers(); 
  } 
}; 
goog.ui.SubMenu.prototype.handleMouseOver = function(e) { 
  if(this.isEnabled()) { 
    this.clearTimers(); 
    this.showTimer_ = goog.Timer.callOnce(this.showSubMenu, goog.ui.SubMenu.MENU_DELAY_MS, this); 
  } 
  goog.ui.SubMenu.superClass_.handleMouseOver.call(this, e); 
}; 
goog.ui.SubMenu.prototype.performActionInternal = function(e) { 
  this.clearTimers(); 
  var shouldHandleClick = this.isSupportedState(goog.ui.Component.State.SELECTED); 
  if(shouldHandleClick) { 
    return goog.ui.SubMenu.superClass_.performActionInternal.call(this, e); 
  } else { 
    this.showSubMenu(); 
    return true; 
  } 
}; 
goog.ui.SubMenu.prototype.setSubMenuVisible_ = function(visible) { 
  this.dispatchEvent(goog.ui.Component.getStateTransitionEvent(goog.ui.Component.State.OPENED, visible)); 
  var subMenu = this.getMenu(); 
  if(visible != subMenu.isVisible()) { 
    if(visible) { 
      if(! subMenu.isInDocument()) { 
        subMenu.render(); 
      } 
      this.positionSubMenu_(); 
      subMenu.setHighlightedIndex(- 1); 
    } 
    this.hasKeyboardControl_ = visible; 
    goog.dom.classes.enable(this.getElement(), goog.getCssName('goog-submenu-open'), visible); 
    subMenu.setVisible(visible); 
  } 
}; 
goog.ui.SubMenu.prototype.setMenuListenersEnabled_ = function(menu, attach) { 
  var handler = this.getHandler(); 
  var method = attach ? handler.listen: handler.unlisten; 
  method.call(handler, menu, goog.ui.Component.EventType.HIGHLIGHT, this.onChildHighlight_); 
}; 
goog.ui.SubMenu.prototype.setAlignToEnd = function(alignToEnd) { 
  if(alignToEnd != this.alignToEnd_) { 
    this.alignToEnd_ = alignToEnd; 
    if(this.isInDocument()) { 
      var oldElement = this.getElement(); 
      this.exitDocument(); 
      if(oldElement.nextSibling) { 
        this.renderBefore((oldElement.nextSibling)); 
      } else { 
        this.render((oldElement.parentNode)); 
      } 
    } 
  } 
}; 
goog.ui.SubMenu.prototype.isAlignedToEnd = function() { 
  return this.alignToEnd_; 
}; 
goog.ui.SubMenu.prototype.positionSubMenu_ = function() { 
  var position = new goog.positioning.AnchoredViewportPosition(this.getElement(), this.isAlignedToEnd() ? goog.positioning.Corner.TOP_END: goog.positioning.Corner.TOP_START, this.isPositionAdjustable_); 
  var subMenu = this.getMenu(); 
  var el = subMenu.getElement(); 
  if(! subMenu.isVisible()) { 
    el.style.visibility = 'hidden'; 
    goog.style.showElement(el, true); 
  } 
  position.reposition(el, this.isAlignedToEnd() ? goog.positioning.Corner.TOP_START: goog.positioning.Corner.TOP_END); 
  if(! subMenu.isVisible()) { 
    goog.style.showElement(el, false); 
    el.style.visibility = 'visible'; 
  } 
}; 
goog.ui.SubMenu.prototype.addItem = function(item) { 
  this.getMenu().addChild(item, true); 
}; 
goog.ui.SubMenu.prototype.addItemAt = function(item, n) { 
  this.getMenu().addChildAt(item, n, true); 
}; 
goog.ui.SubMenu.prototype.removeItem = function(item) { 
  var child = this.getMenu().removeChild(item, true); 
  if(child) { 
    child.dispose(); 
  } 
}; 
goog.ui.SubMenu.prototype.removeItemAt = function(n) { 
  var child = this.getMenu().removeChildAt(n, true); 
  if(child) { 
    child.dispose(); 
  } 
}; 
goog.ui.SubMenu.prototype.getItemAt = function(n) { 
  return this.getMenu().getChildAt(n); 
}; 
goog.ui.SubMenu.prototype.getItemCount = function() { 
  return this.getMenu().getChildCount(); 
}; 
goog.ui.SubMenu.prototype.getItems = function() { 
  return this.getMenu().getItems(); 
}; 
goog.ui.SubMenu.prototype.getMenu = function() { 
  if(! this.subMenu_) { 
    this.setMenu(new goog.ui.Menu(this.getDomHelper()), true); 
  } else if(this.externalSubMenu_ && this.subMenu_.getParent() != this) { 
    this.subMenu_.setParent(this); 
  } 
  if(! this.subMenu_.getElement()) { 
    this.subMenu_.createDom(); 
  } 
  return this.subMenu_; 
}; 
goog.ui.SubMenu.prototype.setMenu = function(menu, opt_internal) { 
  var oldMenu = this.subMenu_; 
  if(menu != oldMenu) { 
    if(oldMenu) { 
      this.dismissSubMenu(); 
      if(this.isInDocument()) { 
        this.setMenuListenersEnabled_(oldMenu, false); 
      } 
    } 
    this.subMenu_ = menu; 
    this.externalSubMenu_ = ! opt_internal; 
    if(menu) { 
      menu.setParent(this); 
      menu.setVisible(false, true); 
      menu.setAllowAutoFocus(false); 
      menu.setFocusable(false); 
      if(this.isInDocument()) { 
        this.setMenuListenersEnabled_(menu, true); 
      } 
    } 
  } 
}; 
goog.ui.SubMenu.prototype.containsElement = function(element) { 
  return this.getMenu().containsElement(element); 
}; 
goog.ui.SubMenu.prototype.setPositionAdjustable = function(isAdjustable) { 
  this.isPositionAdjustable_ = ! ! isAdjustable; 
}; 
goog.ui.SubMenu.prototype.isPositionAdjustable = function() { 
  return this.isPositionAdjustable_; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-submenu'), function() { 
  return new goog.ui.SubMenu(null); 
}); 
