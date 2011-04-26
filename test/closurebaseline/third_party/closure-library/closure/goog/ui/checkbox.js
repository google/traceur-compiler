
goog.provide('goog.ui.Checkbox'); 
goog.provide('goog.ui.Checkbox.State'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.ui.CheckboxRenderer'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.registry'); 
goog.ui.Checkbox = function(opt_checked, opt_domHelper, opt_renderer) { 
  var renderer = opt_renderer || goog.ui.CheckboxRenderer.getInstance(); 
  goog.ui.Control.call(this, null, renderer, opt_domHelper); 
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false); 
  this.checked_ = goog.isDef(opt_checked) ? opt_checked: goog.ui.Checkbox.State.UNCHECKED; 
}; 
goog.inherits(goog.ui.Checkbox, goog.ui.Control); 
goog.ui.Checkbox.State = { 
  CHECKED: true, 
  UNCHECKED: false, 
  UNDETERMINED: null 
}; 
goog.ui.Checkbox.prototype.label_ = null; 
goog.ui.Checkbox.prototype.getChecked = function() { 
  return this.checked_; 
}; 
goog.ui.Checkbox.prototype.isChecked = function() { 
  return this.checked_ == goog.ui.Checkbox.State.CHECKED; 
}; 
goog.ui.Checkbox.prototype.isUnchecked = function() { 
  return this.checked_ == goog.ui.Checkbox.State.UNCHECKED; 
}; 
goog.ui.Checkbox.prototype.isUndetermined = function() { 
  return this.checked_ == goog.ui.Checkbox.State.UNDETERMINED; 
}; 
goog.ui.Checkbox.prototype.setChecked = function(checked) { 
  if(checked != this.checked_) { 
    this.checked_ = checked; 
    this.getRenderer().setCheckboxState(this.getElement(), this.checked_); 
  } 
}; 
goog.ui.Checkbox.prototype.setCheckedInternal = function(checked) { 
  this.checked_ = checked; 
}; 
goog.ui.Checkbox.prototype.setLabel = function(label) { 
  if(this.isInDocument()) { 
    this.exitDocument(); 
    this.label_ = label; 
    this.enterDocument(); 
  } else { 
    this.label_ = label; 
  } 
}; 
goog.ui.Checkbox.prototype.toggle = function() { 
  this.setChecked(this.checked_ ? goog.ui.Checkbox.State.UNCHECKED: goog.ui.Checkbox.State.CHECKED); 
}; 
goog.ui.Checkbox.prototype.enterDocument = function() { 
  goog.base(this, 'enterDocument'); 
  if(this.isHandleMouseEvents()) { 
    if(this.label_) { 
      this.getHandler().listen(this.label_, goog.events.EventType.CLICK, this.handleClickOrSpace_); 
    } 
    this.getHandler().listen(this.getElement(), goog.events.EventType.CLICK, this.handleClickOrSpace_); 
  } 
}; 
goog.ui.Checkbox.prototype.setEnabled = function(enabled) { 
  goog.base(this, 'setEnabled', enabled); 
  var el = this.getElement(); 
  if(el) { 
    el.tabIndex = this.isEnabled() ? 0: - 1; 
  } 
}; 
goog.ui.Checkbox.prototype.handleClickOrSpace_ = function(e) { 
  e.stopPropagation(); 
  var eventType = this.checked_ ? goog.ui.Component.EventType.UNCHECK: goog.ui.Component.EventType.CHECK; 
  if(this.isEnabled() && this.dispatchEvent(eventType)) { 
    e.preventDefault(); 
    this.toggle(); 
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
  } 
}; 
goog.ui.Checkbox.prototype.handleKeyEventInternal = function(e) { 
  if(e.keyCode == goog.events.KeyCodes.SPACE) { 
    this.handleClickOrSpace_(e); 
  } 
  return false; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.CheckboxRenderer.CSS_CLASS, function() { 
  return new goog.ui.Checkbox(); 
}); 
