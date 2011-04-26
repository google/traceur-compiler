
goog.provide('goog.ui.MenuBase'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.events.KeyHandler.EventType'); 
goog.require('goog.ui.Popup'); 
goog.ui.MenuBase = function(opt_element) { 
  goog.ui.Popup.call(this, opt_element); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.keyHandler_ = new goog.events.KeyHandler(this.getElement()); 
}; 
goog.inherits(goog.ui.MenuBase, goog.ui.Popup); 
goog.ui.MenuBase.Events = { }; 
goog.ui.MenuBase.Events.ITEM_ACTION = 'itemaction'; 
goog.ui.MenuBase.prototype.disposeInternal = function() { 
  goog.ui.MenuBase.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.keyHandler_.dispose(); 
}; 
goog.ui.MenuBase.prototype.onShow_ = function() { 
  goog.ui.MenuBase.superClass_.onShow_.call(this); 
  var el = this.getElement(); 
  this.eventHandler_.listen(el, goog.events.EventType.MOUSEOVER, this.onMouseOver); 
  this.eventHandler_.listen(el, goog.events.EventType.MOUSEOUT, this.onMouseOut); 
  this.eventHandler_.listen(el, goog.events.EventType.MOUSEDOWN, this.onMouseDown); 
  this.eventHandler_.listen(el, goog.events.EventType.MOUSEUP, this.onMouseUp); 
  this.eventHandler_.listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyDown); 
}; 
goog.ui.MenuBase.prototype.onHide_ = function(opt_target) { 
  goog.ui.MenuBase.superClass_.onHide_.call(this, opt_target); 
  this.eventHandler_.removeAll(); 
}; 
goog.ui.MenuBase.prototype.getSelectedItem = function() { 
  return null; 
}; 
goog.ui.MenuBase.prototype.setSelectedItem = function(item) { }; 
goog.ui.MenuBase.prototype.onMouseOver = function(e) { }; 
goog.ui.MenuBase.prototype.onMouseOut = function(e) { }; 
goog.ui.MenuBase.prototype.onMouseDown = function(e) { }; 
goog.ui.MenuBase.prototype.onMouseUp = function(e) { }; 
goog.ui.MenuBase.prototype.onKeyDown = function(e) { }; 
