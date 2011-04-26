
goog.provide('goog.ui.SelectionMenuButton'); 
goog.provide('goog.ui.SelectionMenuButton.SelectionState'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuButton'); 
goog.require('goog.ui.MenuItem'); 
goog.ui.SelectionMenuButton = function(opt_renderer, opt_itemRenderer, opt_domHelper) { 
  goog.ui.MenuButton.call(this, null, null, opt_renderer, opt_domHelper); 
  this.initialItemRenderer_ = opt_itemRenderer || null; 
}; 
goog.inherits(goog.ui.SelectionMenuButton, goog.ui.MenuButton); 
goog.ui.SelectionMenuButton.SelectionState = { 
  ALL: 0, 
  SOME: 1, 
  NONE: 2 
}; 
goog.ui.SelectionMenuButton.prototype.selectionState_ = goog.ui.SelectionMenuButton.SelectionState.NONE; 
goog.ui.SelectionMenuButton.prototype.initialItemRenderer_; 
goog.ui.SelectionMenuButton.prototype.setEnabled = function(enable) { 
  goog.ui.SelectionMenuButton.superClass_.setEnabled.call(this, enable); 
  this.getCheckbox_().disabled = ! enable; 
}; 
goog.ui.SelectionMenuButton.prototype.handleMouseDown = function(e) { 
  if(e.target != this.getCheckbox_()) { 
    goog.ui.SelectionMenuButton.superClass_.handleMouseDown.call(this, e); 
  } 
}; 
goog.ui.SelectionMenuButton.prototype.getCheckbox_ = function() { 
  var elements = this.dom_.getElementsByTagNameAndClass('input', goog.getCssName('goog-selectionmenubutton-checkbox'), this.getContentElement()); 
  return elements[0]; 
}; 
goog.ui.SelectionMenuButton.prototype.handleCheckboxClick_ = function(e) { 
  if(e.target.checked) { 
    this.setSelectionState(goog.ui.SelectionMenuButton.SelectionState.ALL); 
    if(this.getItemAt(0)) { 
      this.getItemAt(0).dispatchEvent(goog.ui.Component.EventType.ACTION); 
    } 
  } else { 
    this.setSelectionState(goog.ui.SelectionMenuButton.SelectionState.NONE); 
    if(this.getItemAt(1)) { 
      this.getItemAt(1).dispatchEvent(goog.ui.Component.EventType.ACTION); 
    } 
  } 
}; 
goog.ui.SelectionMenuButton.prototype.handleMenuAction_ = function(e) { 
  if(e.target.getModel() == goog.ui.SelectionMenuButton.SelectionState.ALL) { 
    this.setSelectionState(goog.ui.SelectionMenuButton.SelectionState.ALL); 
  } else { 
    this.setSelectionState(goog.ui.SelectionMenuButton.SelectionState.NONE); 
  } 
}; 
goog.ui.SelectionMenuButton.prototype.addMenuEvent_ = function() { 
  if(this.getItemAt(0) && this.getItemAt(1)) { 
    this.getHandler().listen(this.getMenu(), goog.ui.Component.EventType.ACTION, this.handleMenuAction_); 
    this.getItemAt(0).setModel(goog.ui.SelectionMenuButton.SelectionState.ALL); 
    this.getItemAt(1).setModel(goog.ui.SelectionMenuButton.SelectionState.NONE); 
  } 
}; 
goog.ui.SelectionMenuButton.prototype.addCheckboxEvent_ = function() { 
  this.getHandler().listen(this.getCheckbox_(), goog.events.EventType.CLICK, this.handleCheckboxClick_); 
}; 
goog.ui.SelectionMenuButton.prototype.createDom = function() { 
  goog.ui.SelectionMenuButton.superClass_.createDom.call(this); 
  var checkbox = this.dom_.createElement('input'); 
  checkbox.type = 'checkbox'; 
  checkbox.className = goog.getCssName('goog-selectionmenubutton-checkbox'); 
  this.setContent(checkbox); 
  var MSG_SELECTIONMENUITEM_ALL = goog.getMsg('All'); 
  var MSG_SELECTIONMENUITEM_NONE = goog.getMsg('None'); 
  var itemAll = new goog.ui.MenuItem(MSG_SELECTIONMENUITEM_ALL, null, this.dom_, this.initialItemRenderer_); 
  var itemNone = new goog.ui.MenuItem(MSG_SELECTIONMENUITEM_NONE, null, this.dom_, this.initialItemRenderer_); 
  this.addItem(itemAll); 
  this.addItem(itemNone); 
  this.addCheckboxEvent_(); 
  this.addMenuEvent_(); 
}; 
goog.ui.SelectionMenuButton.prototype.decorateInternal = function(element) { 
  goog.ui.SelectionMenuButton.superClass_.decorateInternal.call(this, element); 
  this.addCheckboxEvent_(); 
  this.addMenuEvent_(); 
}; 
goog.ui.SelectionMenuButton.prototype.setMenu = function(menu) { 
  goog.ui.SelectionMenuButton.superClass_.setMenu.call(this, menu); 
  this.addMenuEvent_(); 
}; 
goog.ui.SelectionMenuButton.prototype.setSelectionState = function(state) { 
  if(this.selectionState_ != state) { 
    var checkbox = this.getCheckbox_(); 
    if(state == goog.ui.SelectionMenuButton.SelectionState.ALL) { 
      checkbox.checked = true; 
      goog.style.setOpacity(checkbox, 1); 
    } else if(state == goog.ui.SelectionMenuButton.SelectionState.SOME) { 
      checkbox.checked = true; 
      goog.style.setOpacity(checkbox, 0.5); 
    } else { 
      checkbox.checked = false; 
      goog.style.setOpacity(checkbox, 1); 
    } 
    this.selectionState_ = state; 
  } 
}; 
goog.ui.SelectionMenuButton.prototype.getSelectionState = function() { 
  return this.selectionState_; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-selectionmenubutton-button'), function() { 
  return new goog.ui.SelectionMenuButton(); 
}); 
