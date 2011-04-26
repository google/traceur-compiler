
goog.provide('goog.ui.ButtonRenderer'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.ui.ButtonSide'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlRenderer'); 
goog.ui.ButtonRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
}; 
goog.inherits(goog.ui.ButtonRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.ButtonRenderer); 
goog.ui.ButtonRenderer.CSS_CLASS = goog.getCssName('goog-button'); 
goog.ui.ButtonRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.BUTTON; 
}; 
goog.ui.ButtonRenderer.prototype.updateAriaState = function(element, state, enable) { 
  if(state == goog.ui.Component.State.CHECKED) { 
    goog.dom.a11y.setState(element, goog.dom.a11y.State.PRESSED, enable); 
  } else { 
    goog.ui.ButtonRenderer.superClass_.updateAriaState.call(this, element, state, enable); 
  } 
}; 
goog.ui.ButtonRenderer.prototype.createDom = function(button) { 
  var element = goog.ui.ButtonRenderer.superClass_.createDom.call(this, button); 
  var tooltip = button.getTooltip(); 
  if(tooltip) { 
    this.setTooltip(element, tooltip); 
  } 
  var value = button.getValue(); 
  if(value) { 
    this.setValue(element, value); 
  } 
  if(button.isSupportedState(goog.ui.Component.State.CHECKED)) { 
    this.updateAriaState(element, goog.ui.Component.State.CHECKED, false); 
  } 
  return element; 
}; 
goog.ui.ButtonRenderer.prototype.decorate = function(button, element) { 
  element = goog.ui.ButtonRenderer.superClass_.decorate.call(this, button, element); 
  button.setValueInternal(this.getValue(element)); 
  button.setTooltipInternal(this.getTooltip(element)); 
  if(button.isSupportedState(goog.ui.Component.State.CHECKED)) { 
    this.updateAriaState(element, goog.ui.Component.State.CHECKED, false); 
  } 
  return element; 
}; 
goog.ui.ButtonRenderer.prototype.getValue = goog.nullFunction; 
goog.ui.ButtonRenderer.prototype.setValue = goog.nullFunction; 
goog.ui.ButtonRenderer.prototype.getTooltip = function(element) { 
  return element.title; 
}; 
goog.ui.ButtonRenderer.prototype.setTooltip = function(element, tooltip) { 
  if(element) { 
    element.title = tooltip || ''; 
  } 
}; 
goog.ui.ButtonRenderer.prototype.setCollapsed = function(button, sides) { 
  var isRtl = button.isRightToLeft(); 
  var collapseLeftClassName = goog.getCssName(this.getStructuralCssClass(), 'collapse-left'); 
  var collapseRightClassName = goog.getCssName(this.getStructuralCssClass(), 'collapse-right'); 
  button.enableClassName(isRtl ? collapseRightClassName: collapseLeftClassName, ! !(sides & goog.ui.ButtonSide.START)); 
  button.enableClassName(isRtl ? collapseLeftClassName: collapseRightClassName, ! !(sides & goog.ui.ButtonSide.END)); 
}; 
goog.ui.ButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.ButtonRenderer.CSS_CLASS; 
}; 
