
goog.provide('goog.ui.BasicMenu'); 
goog.provide('goog.ui.BasicMenu.Item'); 
goog.provide('goog.ui.BasicMenu.Separator'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.events.EventType'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.ui.AttachableMenu'); 
goog.require('goog.ui.ItemEvent'); 
goog.ui.BasicMenu = function(opt_class, opt_parent) { 
  var cls = opt_class || 'menu'; 
  var parent = opt_parent || goog.dom.getDocument().body; 
  this.element_ = goog.dom.createDom('div', { 
    'tabIndex': 0, 
    'class': cls 
  }); 
  goog.dom.a11y.setRole(this.element_, 'menu'); 
  goog.dom.a11y.setState(this.element_, 'haspopup', true); 
  parent.appendChild(this.element_); 
  goog.ui.AttachableMenu.call(this, this.element_); 
  this.parentMenu_ = null; 
  this.items_ =[]; 
  this.activeItem_; 
}; 
goog.inherits(goog.ui.BasicMenu, goog.ui.AttachableMenu); 
goog.ui.BasicMenu.prototype.evtKey_ = null; 
goog.ui.BasicMenu.prototype.resizeEvtKey_ = null; 
goog.ui.BasicMenu.prototype.zIndex_ = 10; 
goog.ui.BasicMenu.SUBMENU_ACTIVATION_DELAY_MS_ = 300; 
goog.ui.BasicMenu.prototype.getZIndex = function() { 
  return this.zIndex_; 
}; 
goog.ui.BasicMenu.prototype.setZIndex = function(zIndex) { 
  this.zIndex_ = zIndex; 
}; 
goog.ui.BasicMenu.prototype.add = function(item) { 
  var el = this.getElement(); 
  if(! el) { 
    throw Error('setElement() called before create()'); 
  } 
  if(item.getMenu()) { 
    throw Error('Menu item already added to a menu'); 
  } 
  item.setMenu_(this); 
  this.items_.push(item); 
  el.appendChild(item.create()); 
}; 
goog.ui.BasicMenu.prototype.insertAt = function(item, index) { 
  var el = this.getElement(); 
  if(! el) { 
    throw Error('setElement() called before create()'); 
  } 
  if(item.getMenu()) { 
    throw Error('Menu item already added to a menu'); 
  } 
  item.setMenu_(this); 
  goog.array.insertAt(this.items_, item, index); 
  el.insertBefore(item.create(), el.childNodes[index]); 
}; 
goog.ui.BasicMenu.prototype.remove = function(item) { 
  item.remove(); 
  item.setMenu_(null); 
  goog.array.remove(this.items_, item); 
}; 
goog.ui.BasicMenu.prototype.removeAt = function(index) { 
  this.remove(this.items_[index]); 
}; 
goog.ui.BasicMenu.prototype.focus = function() { 
  this.element_.focus(); 
}; 
goog.ui.BasicMenu.prototype.setParentMenu_ = function(parent) { 
  this.parentMenu_ = parent; 
  this.setParentEventTarget(parent); 
}; 
goog.ui.BasicMenu.prototype.getParentMenu = function() { 
  return this.parentMenu_; 
}; 
goog.ui.BasicMenu.prototype.setAnchorElement = function(el, opt_pos, opt_eventType) { 
  if(this.evtKey_) { 
    goog.events.unlistenByKey(this.evtKey_); 
  } 
  if(this.anchorElement_ != el) { 
    this.clickToClose_ = false; 
    this.lastHideTime_ = - 1; 
  } 
  var eventType = opt_eventType || goog.events.EventType.CLICK; 
  this.evtKey_ = goog.events.listen(el, eventType, this.openMenu_, false, this); 
  this.resizeEvtKey_ = goog.events.listen(window, goog.events.EventType.RESIZE, this.onResize_, false, this); 
  this.setPosition(new goog.positioning.AnchoredPosition(el, goog.isDef(opt_pos) ? opt_pos: goog.positioning.Corner.BOTTOM_START)); 
  this.anchorElement_ = el; 
}; 
goog.ui.BasicMenu.prototype.disposeInternal = function() { 
  for(var i = 0; i < this.items_.length; i ++) { 
    this.items_[i].dispose(); 
  } 
  goog.events.unlistenByKey(this.evtKey_); 
  goog.events.unlistenByKey(this.resizeEvtKey_); 
  goog.dom.removeNode(this.element_); 
  delete this.element_; 
  this.anchorElement_ = null; 
  goog.ui.BasicMenu.superClass_.disposeInternal.call(this); 
}; 
goog.ui.BasicMenu.prototype.setVisible = function(visible, opt_bubble) { 
  if(this.isOrWasRecentlyVisible() && visible) { 
    return; 
  } 
  if(visible == false) { 
    if(this.activeItem_) { 
      this.activeItem_.closeSubmenu(); 
      goog.ui.AttachableMenu.prototype.setSelectedItem.call(this, null); 
    } 
    if(this.parentMenu_ && ! opt_bubble) { 
      this.parentMenu_.focus(); 
    } 
  } else { 
    if(this.parentMenu_) { 
      this.zIndex_ = this.parentMenu_.getZIndex() + 1; 
    } 
    this.element_.style.zIndex = this.zIndex_; 
  } 
  if(opt_bubble && this.parentMenu_) { 
    this.parentMenu_.setVisible(visible, opt_bubble); 
  } 
  if(this.activationTimer_) { 
    window.clearTimeout(this.activationTimer_); 
    this.activationTimer_ = null; 
  } 
  this.activeItem_ = null; 
  goog.ui.PopupBase.prototype.setVisible.call(this, visible); 
}; 
goog.ui.BasicMenu.prototype.setSelectedIndex = function(index) { 
  this.setSelectedItem(index == - 1 ? null: this.element_.childNodes[index]); 
}; 
goog.ui.BasicMenu.prototype.itemSelectionHandler_ = function(el, opt_keyEvent) { 
  if(el || ! this.activeItem_ || ! this.activeItem_.hasOpenSubmenu()) { 
    goog.ui.AttachableMenu.prototype.setSelectedItem.call(this, el); 
  } 
  var item = el ? this.getItemForElement_(el): null; 
  if(item && item != this.activeItem_) { 
    if(opt_keyEvent && this.activeItem_) { 
      this.activeItem_.closeSubmenu(); 
      this.activeItem_ = null; 
    } 
    if(this.activationTimer_) { 
      window.clearTimeout(this.activationTimer_); 
      this.activationTimer_ = null; 
    } 
    if(! opt_keyEvent) { 
      this.activationTimer_ = window.setTimeout(goog.bind(this.selectItem_, this, item), goog.ui.BasicMenu.SUBMENU_ACTIVATION_DELAY_MS_); 
    } 
    if(this.parentMenu_) { 
      this.parentMenu_.setSelectedItem(this.anchorElement_); 
      this.element_.focus(); 
    } 
  } 
}; 
goog.ui.BasicMenu.prototype.setSelectedItem = function(arg) { 
  var el, item; 
  if(! arg) { 
    el = null; 
    item = null; 
  } else if(arg instanceof goog.ui.BasicMenu.Item) { 
    item = arg; 
    el = item.element_; 
  } else { 
    el = arg; 
    item = this.getItemForElement_(el); 
  } 
  if(el || ! this.activeItem_ || ! this.activeItem_.hasOpenSubmenu()) { 
    goog.ui.AttachableMenu.prototype.setSelectedItem.call(this, el); 
  } 
  if(item == this.activeItem_) { 
    return; 
  } 
  if(this.activeItem_ && el) { 
    this.activeItem_.closeSubmenu(); 
  } 
  if(el) { 
    item = this.getItemForElement_(el); 
    if(item.hasSubmenu()) { 
      item.openSubmenu(); 
      item.getSubmenu().focus(); 
    } 
    this.activeItem_ = item; 
  } 
}; 
goog.ui.BasicMenu.prototype.getSelectedItem = function() { 
  return this.selectedElement_ ? this.items_[goog.array.indexOf(this.element_.childNodes, this.selectedElement_)]: null; 
}; 
goog.ui.BasicMenu.prototype.selectItem_ = function(item) { 
  if(this.activationTimer_) { 
    window.clearTimeout(this.activationTimer_); 
    this.activationTimer_ = null; 
  } 
  var selectedItem = this.getItemForElement_(this.selectedElement_); 
  if(selectedItem != item) { 
    return; 
  } 
  if(this.activeItem_ && item) { 
    this.activeItem_.closeSubmenu(); 
  } 
  if(item.hasSubmenu()) { 
    item.openSubmenu(); 
    item.getSubmenu().focus(); 
  } else { 
    this.element_.focus(); 
  } 
  this.activeItem_ = item; 
}; 
goog.ui.BasicMenu.prototype.activateItem_ = function(el) { 
  var item = this.getItemForElement_(el); 
  if(item.hasSubmenu()) { 
    item.openSubmenu(); 
    var submenu = item.getSubmenu(); 
    submenu.focus(); 
    this.activeItem_ = item; 
  } else { 
    this.setVisible(false, true); 
    this.dispatchEvent(new goog.ui.ItemEvent(goog.ui.MenuBase.Events.ITEM_ACTION, this, item)); 
  } 
}; 
goog.ui.BasicMenu.prototype.openMenu_ = function() { 
  if(! this.clickToClose_) { 
    this.setVisible(true); 
  } 
  this.clickToClose_ = false; 
}; 
goog.ui.BasicMenu.prototype.containsElement_ = function(el) { 
  if(goog.dom.contains(this.element_, el)) { 
    return true; 
  } 
  if(this.activeItem_ && this.activeItem_.hasSubmenu()) { 
    return this.activeItem_.getSubmenu().containsElement_(el); 
  } 
  return false; 
}; 
goog.ui.BasicMenu.prototype.onDocumentMouseDown_ = function(e) { 
  if(this.anchorElement_ == e.target || goog.dom.contains(this.anchorElement_,(e.target))) { 
    this.clickToClose_ = true; 
  } 
  var rootMenu = this; 
  while(rootMenu.parentMenu_) { 
    rootMenu = rootMenu.parentMenu_; 
  } 
  if(! rootMenu.containsElement_((e.target))) { 
    this.hide_(); 
  } 
}; 
goog.ui.BasicMenu.prototype.onMouseOver = function(e) { 
  var eltItem = this.getAncestorMenuItem_((e.target)); 
  if(eltItem == null) { 
    return; 
  } 
  this.itemSelectionHandler_(eltItem); 
}; 
goog.ui.BasicMenu.prototype.onMouseOut = function(e) { 
  var eltItem = this.getAncestorMenuItem_((e.target)); 
  if(eltItem == null) { 
    return; 
  } 
  this.itemSelectionHandler_(null); 
}; 
goog.ui.BasicMenu.prototype.onDocumentFocus_ = function(e) { }; 
goog.ui.BasicMenu.prototype.onMouseUp = function(e) { 
  var eltItem = this.getAncestorMenuItem_((e.target)); 
  if(eltItem != null) { 
    this.activateItem_(eltItem); 
  } 
}; 
goog.ui.BasicMenu.prototype.onResize_ = function() { 
  if(! this.isDisposed() && this.isVisible()) { 
    this.reposition(); 
  } 
}; 
goog.ui.BasicMenu.prototype.onKeyDown = function(e) { 
  var handled = false; 
  switch(e.keyCode) { 
    case 37: 
      if(this.parentMenu_) { 
        this.setVisible(false); 
      } 
      handled = true; 
      break; 

    case 39: 
      var item = this.getItemForElement_(this.selectedElement_); 
      if(this.selectedElement_ && item.hasSubmenu()) { 
        this.activateItem_(this.selectedElement_); 
        item.getSubmenu().setSelectedIndex(0); 
      } 
      handled = true; 
      break; 

    case 40: 
      this.itemSelectionHandler_(this.getNextPrevItem(false), true); 
      handled = true; 
      break; 

    case 38: 
      this.itemSelectionHandler_(this.getNextPrevItem(true), true); 
      handled = true; 
      break; 

    case 13: 
      if(this.selectedElement_) { 
        this.activateItem_(this.selectedElement_); 
      } 
      handled = true; 
      break; 

    case 27: 
      this.setVisible(false); 
      handled = true; 
      break; 

  } 
  if(handled) { 
    e.preventDefault(); 
  } 
}; 
goog.ui.BasicMenu.prototype.onShow_ = function() { 
  goog.ui.BasicMenu.superClass_.onShow_.call(this); 
  this.setSelectedItem(null); 
  var rtl = goog.style.isRightToLeft(this.element_); 
  goog.dom.classes.enable(this.element_, goog.getCssName('goog-rtl'), rtl); 
  if(! this.parentMenu_) { 
    this.element_.focus(); 
  } 
}; 
goog.ui.BasicMenu.prototype.getItemForElement_ = function(el) { 
  var index = - 1; 
  for(var node = el; node; node = goog.dom.getPreviousElementSibling(node)) { 
    index ++; 
  } 
  return index == - 1 ? null: this.items_[index]; 
}; 
goog.ui.BasicMenu.Item = function(caption, opt_value, opt_submenu) { 
  goog.Disposable.call(this); 
  this.caption_ = String(caption); 
  this.value_ = opt_value || caption; 
  this.submenu_ = opt_submenu || null; 
  this.menu_ = null; 
  this.element_ = null; 
}; 
goog.inherits(goog.ui.BasicMenu.Item, goog.Disposable); 
goog.ui.BasicMenu.Item.prototype.getCaption = function() { 
  return this.caption_; 
}; 
goog.ui.BasicMenu.Item.prototype.getValue = function() { 
  return this.value_; 
}; 
goog.ui.BasicMenu.Item.prototype.setCaption = function(caption) { 
  this.caption_ = caption; 
  if(this.element_) { 
    this.element_.firstChild.nodeValue = caption; 
  } 
}; 
goog.ui.BasicMenu.Item.prototype.setValue = function(value) { 
  this.value_ = value; 
}; 
goog.ui.BasicMenu.Item.prototype.disposeInternal = function() { 
  goog.ui.BasicMenu.Item.superClass_.disposeInternal.call(this); 
  this.remove(); 
  if(this.submenu_) { 
    this.submenu_.dispose(); 
  } 
}; 
goog.ui.BasicMenu.Item.prototype.setMenu_ = function(menu) { 
  this.menu_ = menu; 
  if(this.submenu_) { 
    this.submenu_.setParentMenu_(menu); 
  } 
}; 
goog.ui.BasicMenu.Item.prototype.getMenu = function() { 
  return this.menu_; 
}; 
goog.ui.BasicMenu.Item.prototype.create = function() { 
  if(! this.menu_) { 
    throw Error('MenuItem is not attached to a menu'); 
  } 
  var leftArrow, rightArrow; 
  if(this.submenu_) { 
    rightArrow = goog.dom.createDom('span', goog.getCssName('goog-menu-arrow-right'), '\u25b6'); 
    leftArrow = goog.dom.createDom('span', goog.getCssName('goog-menu-arrow-left'), '\u25c0'); 
  } 
  this.element_ = goog.dom.createDom('div', this.menu_.getItemClassName(), this.caption_, leftArrow, rightArrow); 
  return this.element_; 
}; 
goog.ui.BasicMenu.Item.prototype.remove = function() { 
  goog.dom.removeNode(this.element_); 
  this.element_ = null; 
}; 
goog.ui.BasicMenu.Item.prototype.hasSubmenu = function() { 
  return this.submenu_ != null; 
}; 
goog.ui.BasicMenu.Item.prototype.hasOpenSubmenu = function() { 
  return this.hasSubmenu() ? this.submenu_.isOrWasRecentlyVisible(): false; 
}; 
goog.ui.BasicMenu.Item.prototype.getSubmenu = function() { 
  return this.submenu_; 
}; 
goog.ui.BasicMenu.Item.prototype.openSubmenu = function() { 
  if(this.submenu_) { 
    var submenu = this.submenu_; 
    var pinComplement = goog.positioning.flipCornerHorizontal(submenu.getPinnedCorner()); 
    submenu.setAnchorElement(this.element_, pinComplement); 
    submenu.setVisible(true); 
  } 
}; 
goog.ui.BasicMenu.Item.prototype.closeSubmenu = function() { 
  if(this.submenu_) { 
    this.submenu_.setVisible(false); 
  } 
}; 
goog.ui.BasicMenu.Separator = function() { 
  goog.ui.BasicMenu.Item.call(this, null); 
}; 
goog.inherits(goog.ui.BasicMenu.Separator, goog.ui.BasicMenu.Item); 
goog.ui.BasicMenu.Separator.prototype.create = function() { 
  if(! this.menu_) { 
    throw Error('MenuSeparator is not attached to a menu'); 
  } 
  this.element_ = goog.dom.createElement('hr'); 
  goog.dom.a11y.setRole(this.element_, 'separator'); 
  return this.element_; 
}; 
