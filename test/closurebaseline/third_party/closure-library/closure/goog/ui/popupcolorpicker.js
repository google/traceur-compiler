
goog.provide('goog.ui.PopupColorPicker'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventType'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.ui.ColorPicker'); 
goog.require('goog.ui.ColorPicker.EventType'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Popup'); 
goog.ui.PopupColorPicker = function(opt_domHelper, opt_colorPicker) { 
  goog.ui.Component.call(this, opt_domHelper); 
  if(opt_colorPicker) { 
    this.colorPicker_ = opt_colorPicker; 
  } 
}; 
goog.inherits(goog.ui.PopupColorPicker, goog.ui.Component); 
goog.ui.PopupColorPicker.prototype.initialized_ = false; 
goog.ui.PopupColorPicker.prototype.colorPicker_ = null; 
goog.ui.PopupColorPicker.prototype.popup_ = null; 
goog.ui.PopupColorPicker.prototype.pinnedCorner_ = goog.positioning.Corner.TOP_START; 
goog.ui.PopupColorPicker.prototype.popupCorner_ = goog.positioning.Corner.BOTTOM_START; 
goog.ui.PopupColorPicker.prototype.lastTarget_ = null; 
goog.ui.PopupColorPicker.prototype.allowAutoFocus_ = true; 
goog.ui.PopupColorPicker.prototype.focusable_ = true; 
goog.ui.PopupColorPicker.prototype.toggleMode_ = true; 
goog.ui.PopupColorPicker.prototype.createDom = function() { 
  goog.ui.PopupColorPicker.superClass_.createDom.call(this); 
  this.popup_ = new goog.ui.Popup(this.getElement()); 
  this.popup_.setPinnedCorner(this.pinnedCorner_); 
  goog.dom.classes.set(this.getElement(), goog.getCssName('goog-popupcolorpicker')); 
  this.getElement().unselectable = 'on'; 
}; 
goog.ui.PopupColorPicker.prototype.disposeInternal = function() { 
  goog.ui.PopupColorPicker.superClass_.disposeInternal.call(this); 
  this.colorPicker_ = null; 
  this.lastTarget_ = null; 
  this.initialized_ = false; 
  if(this.popup_) { 
    this.popup_.dispose(); 
    this.popup_ = null; 
  } 
}; 
goog.ui.PopupColorPicker.prototype.canDecorate = function(element) { 
  return false; 
}; 
goog.ui.PopupColorPicker.prototype.getColorPicker = function() { 
  return this.colorPicker_; 
}; 
goog.ui.PopupColorPicker.prototype.getAutoHide = function() { 
  return ! ! this.popup_ && this.popup_.getAutoHide(); 
}; 
goog.ui.PopupColorPicker.prototype.setAutoHide = function(autoHide) { 
  if(this.popup_) { 
    this.popup_.setAutoHide(autoHide); 
  } 
}; 
goog.ui.PopupColorPicker.prototype.getAutoHideRegion = function() { 
  return this.popup_ && this.popup_.getAutoHideRegion(); 
}; 
goog.ui.PopupColorPicker.prototype.setAutoHideRegion = function(element) { 
  if(this.popup_) { 
    this.popup_.setAutoHideRegion(element); 
  } 
}; 
goog.ui.PopupColorPicker.prototype.getPopup = function() { 
  return this.popup_; 
}; 
goog.ui.PopupColorPicker.prototype.getLastTarget = function() { 
  return this.lastTarget_; 
}; 
goog.ui.PopupColorPicker.prototype.attach = function(element) { 
  this.getHandler().listen(element, goog.events.EventType.MOUSEDOWN, this.show_); 
}; 
goog.ui.PopupColorPicker.prototype.detach = function(element) { 
  this.getHandler().unlisten(element, goog.events.EventType.MOUSEDOWN, this.show_); 
}; 
goog.ui.PopupColorPicker.prototype.getSelectedColor = function() { 
  return this.colorPicker_.getSelectedColor(); 
}; 
goog.ui.PopupColorPicker.prototype.setFocusable = function(focusable) { 
  this.focusable_ = focusable; 
  if(this.colorPicker_) { 
    this.colorPicker_.setFocusable(focusable); 
  } 
}; 
goog.ui.PopupColorPicker.prototype.setAllowAutoFocus = function(allow) { 
  this.allowAutoFocus_ = allow; 
}; 
goog.ui.PopupColorPicker.prototype.getAllowAutoFocus = function() { 
  return this.allowAutoFocus_; 
}; 
goog.ui.PopupColorPicker.prototype.setToggleMode = function(toggle) { 
  this.toggleMode_ = toggle; 
}; 
goog.ui.PopupColorPicker.prototype.getToggleMode = function() { 
  return this.toggleMode_; 
}; 
goog.ui.PopupColorPicker.prototype.setRememberSelection = function(remember) { 
  this.rememberSelection_ = remember; 
}; 
goog.ui.PopupColorPicker.prototype.getRememberSelection = function() { 
  return this.rememberSelection_; 
}; 
goog.ui.PopupColorPicker.prototype.addColors = function(colors) { }; 
goog.ui.PopupColorPicker.prototype.clearColors = function() { }; 
goog.ui.PopupColorPicker.prototype.setPinnedCorner = function(corner) { 
  this.pinnedCorner_ = corner; 
  if(this.popup_) { 
    this.popup_.setPinnedCorner(this.pinnedCorner_); 
  } 
}; 
goog.ui.PopupColorPicker.prototype.setPopupCorner = function(corner) { 
  this.popupCorner_ = corner; 
}; 
goog.ui.PopupColorPicker.prototype.show_ = function(e) { 
  if(! this.initialized_) { 
    this.colorPicker_ = this.colorPicker_ || goog.ui.ColorPicker.createSimpleColorGrid(this.getDomHelper()); 
    this.colorPicker_.setFocusable(this.focusable_); 
    this.addChild(this.colorPicker_, true); 
    this.getHandler().listen(this.colorPicker_, goog.ui.ColorPicker.EventType.CHANGE, this.onColorPicked_); 
    this.initialized_ = true; 
  } 
  if(this.popup_.isOrWasRecentlyVisible() && this.toggleMode_ && this.lastTarget_ == e.currentTarget) { 
    this.popup_.setVisible(false); 
    return; 
  } 
  this.lastTarget_ =(e.currentTarget); 
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(this.lastTarget_, this.popupCorner_)); 
  if(! this.rememberSelection_) { 
    this.colorPicker_.setSelectedIndex(- 1); 
  } 
  this.popup_.setVisible(true); 
  if(this.allowAutoFocus_) { 
    this.colorPicker_.focus(); 
  } 
}; 
goog.ui.PopupColorPicker.prototype.onColorPicked_ = function(e) { 
  if(this.colorPicker_.getSelectedIndex() == - 1) { 
    e.stopPropagation(); 
    return; 
  } 
  this.popup_.setVisible(false); 
  if(this.allowAutoFocus_) { 
    this.lastTarget_.focus(); 
  } 
}; 
