
goog.provide('goog.ui.TextareaRenderer'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlRenderer'); 
goog.ui.TextareaRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
}; 
goog.inherits(goog.ui.TextareaRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.TextareaRenderer); 
goog.ui.TextareaRenderer.CSS_CLASS = goog.getCssName('goog-textarea'); 
goog.ui.TextareaRenderer.prototype.getAriaRole = function() { 
  return undefined; 
}; 
goog.ui.TextareaRenderer.prototype.decorate = function(control, element) { 
  goog.ui.TextareaRenderer.superClass_.decorate.call(this, control, element); 
  control.setContentInternal(element.value); 
  return element; 
}; 
goog.ui.TextareaRenderer.prototype.createDom = function(textarea) { 
  this.setUpTextarea_(textarea); 
  var element = textarea.getDomHelper().createDom('textarea', { 
    'class': this.getClassNames(textarea).join(' '), 
    'disabled': ! textarea.isEnabled() 
  }, textarea.getContent() || ''); 
  return element; 
}; 
goog.ui.TextareaRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == goog.dom.TagName.TEXTAREA; 
}; 
goog.ui.TextareaRenderer.prototype.setRightToLeft = goog.nullFunction; 
goog.ui.TextareaRenderer.prototype.isFocusable = function(textarea) { 
  return textarea.isEnabled(); 
}; 
goog.ui.TextareaRenderer.prototype.setFocusable = goog.nullFunction; 
goog.ui.TextareaRenderer.prototype.setState = function(textarea, state, enable) { 
  goog.ui.TextareaRenderer.superClass_.setState.call(this, textarea, state, enable); 
  var element = textarea.getElement(); 
  if(element && state == goog.ui.Component.State.DISABLED) { 
    element.disabled = enable; 
  } 
}; 
goog.ui.TextareaRenderer.prototype.updateAriaState = goog.nullFunction; 
goog.ui.TextareaRenderer.prototype.setUpTextarea_ = function(textarea) { 
  textarea.setHandleMouseEvents(false); 
  textarea.setAutoStates(goog.ui.Component.State.ALL, false); 
  textarea.setSupportedState(goog.ui.Component.State.FOCUSED, false); 
}; 
goog.ui.TextareaRenderer.prototype.setContent = function(element, value) { 
  if(element) { 
    element.value = value; 
  } 
}; 
goog.ui.TextareaRenderer.prototype.getCssClass = function() { 
  return goog.ui.TextareaRenderer.CSS_CLASS; 
}; 
