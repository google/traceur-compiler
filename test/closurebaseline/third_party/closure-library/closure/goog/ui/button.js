
goog.provide('goog.ui.Button'); 
goog.provide('goog.ui.Button.Side'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.ui.ButtonRenderer'); 
goog.require('goog.ui.ButtonSide'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.NativeButtonRenderer'); 
goog.ui.Button = function(content, opt_renderer, opt_domHelper) { 
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.NativeButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.Button, goog.ui.Control); 
goog.ui.Button.Side = goog.ui.ButtonSide; 
goog.ui.Button.prototype.value_; 
goog.ui.Button.prototype.tooltip_; 
goog.ui.Button.prototype.getValue = function() { 
  return this.value_; 
}; 
goog.ui.Button.prototype.setValue = function(value) { 
  this.value_ = value; 
  this.getRenderer().setValue(this.getElement(), value); 
}; 
goog.ui.Button.prototype.setValueInternal = function(value) { 
  this.value_ = value; 
}; 
goog.ui.Button.prototype.getTooltip = function() { 
  return this.tooltip_; 
}; 
goog.ui.Button.prototype.setTooltip = function(tooltip) { 
  this.tooltip_ = tooltip; 
  this.getRenderer().setTooltip(this.getElement(), tooltip); 
}; 
goog.ui.Button.prototype.setTooltipInternal = function(tooltip) { 
  this.tooltip_ = tooltip; 
}; 
goog.ui.Button.prototype.setCollapsed = function(sides) { 
  this.getRenderer().setCollapsed(this, sides); 
}; 
goog.ui.Button.prototype.disposeInternal = function() { 
  goog.ui.Button.superClass_.disposeInternal.call(this); 
  delete this.value_; 
  delete this.tooltip_; 
}; 
goog.ui.Button.prototype.enterDocument = function() { 
  goog.ui.Button.superClass_.enterDocument.call(this); 
  if(this.isSupportedState(goog.ui.Component.State.FOCUSED)) { 
    var keyTarget = this.getKeyEventTarget(); 
    if(keyTarget) { 
      this.getHandler().listen(keyTarget, goog.events.EventType.KEYUP, this.handleKeyEventInternal); 
    } 
  } 
}; 
goog.ui.Button.prototype.handleKeyEventInternal = function(e) { 
  if(e.keyCode == goog.events.KeyCodes.ENTER && e.type == goog.events.KeyHandler.EventType.KEY || e.keyCode == goog.events.KeyCodes.SPACE && e.type == goog.events.EventType.KEYUP) { 
    return this.performActionInternal(e); 
  } 
  return e.keyCode == goog.events.KeyCodes.SPACE; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.ButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.Button(null); 
}); 
