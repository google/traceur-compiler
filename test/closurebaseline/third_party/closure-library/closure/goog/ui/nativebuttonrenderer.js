
goog.provide('goog.ui.NativeButtonRenderer'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.ButtonRenderer'); 
goog.require('goog.ui.Component.State'); 
goog.ui.NativeButtonRenderer = function() { 
  goog.ui.ButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.NativeButtonRenderer, goog.ui.ButtonRenderer); 
goog.addSingletonGetter(goog.ui.NativeButtonRenderer); 
goog.ui.NativeButtonRenderer.prototype.getAriaRole = function() { 
  return undefined; 
}; 
goog.ui.NativeButtonRenderer.prototype.createDom = function(button) { 
  this.setUpNativeButton_(button); 
  return button.getDomHelper().createDom('button', { 
    'class': this.getClassNames(button).join(' '), 
    'disabled': ! button.isEnabled(), 
    'title': button.getTooltip() || '', 
    'value': button.getValue() || '' 
  }, button.getCaption() || ''); 
}; 
goog.ui.NativeButtonRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == 'BUTTON' ||(element.tagName == 'INPUT' &&(element.type == 'button' || element.type == 'submit' || element.type == 'reset')); 
}; 
goog.ui.NativeButtonRenderer.prototype.decorate = function(button, element) { 
  this.setUpNativeButton_(button); 
  if(element.disabled) { 
    goog.dom.classes.add(element, this.getClassForState(goog.ui.Component.State.DISABLED)); 
  } 
  return goog.ui.NativeButtonRenderer.superClass_.decorate.call(this, button, element); 
}; 
goog.ui.NativeButtonRenderer.prototype.initializeDom = function(button) { 
  button.getHandler().listen(button.getElement(), goog.events.EventType.CLICK, button.performActionInternal); 
}; 
goog.ui.NativeButtonRenderer.prototype.setAllowTextSelection = goog.nullFunction; 
goog.ui.NativeButtonRenderer.prototype.setRightToLeft = goog.nullFunction; 
goog.ui.NativeButtonRenderer.prototype.isFocusable = function(button) { 
  return button.isEnabled(); 
}; 
goog.ui.NativeButtonRenderer.prototype.setFocusable = goog.nullFunction; 
goog.ui.NativeButtonRenderer.prototype.setState = function(button, state, enable) { 
  goog.ui.NativeButtonRenderer.superClass_.setState.call(this, button, state, enable); 
  var element = button.getElement(); 
  if(element && state == goog.ui.Component.State.DISABLED) { 
    element.disabled = enable; 
  } 
}; 
goog.ui.NativeButtonRenderer.prototype.getValue = function(element) { 
  return element.value; 
}; 
goog.ui.NativeButtonRenderer.prototype.setValue = function(element, value) { 
  if(element) { 
    element.value = value; 
  } 
}; 
goog.ui.NativeButtonRenderer.prototype.updateAriaState = goog.nullFunction; 
goog.ui.NativeButtonRenderer.prototype.setUpNativeButton_ = function(button) { 
  button.setHandleMouseEvents(false); 
  button.setAutoStates(goog.ui.Component.State.ALL, false); 
  button.setSupportedState(goog.ui.Component.State.FOCUSED, false); 
}; 
