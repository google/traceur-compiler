
goog.provide('goog.ui.LabelInput'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.Component'); 
goog.ui.LabelInput = function(opt_label, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.label_ = opt_label || ''; 
}; 
goog.inherits(goog.ui.LabelInput, goog.ui.Component); 
goog.ui.LabelInput.prototype.ffKeyRestoreValue_ = null; 
goog.ui.LabelInput.prototype.eventHandler_; 
goog.ui.LabelInput.prototype.hasFocus_ = false; 
goog.ui.LabelInput.prototype.createDom = function() { 
  this.setElementInternal(this.getDomHelper().createDom('input', { 'type': 'text' })); 
}; 
goog.ui.LabelInput.prototype.decorateInternal = function(element) { 
  goog.ui.LabelInput.superClass_.decorateInternal.call(this, element); 
  if(! this.label_) { 
    this.label_ = element.getAttribute('label') || ''; 
  } 
}; 
goog.ui.LabelInput.prototype.enterDocument = function() { 
  goog.ui.LabelInput.superClass_.enterDocument.call(this); 
  this.attachEvents_(); 
  this.check_(); 
  this.getElement().labelInput_ = this; 
}; 
goog.ui.LabelInput.prototype.exitDocument = function() { 
  goog.ui.LabelInput.superClass_.exitDocument.call(this); 
  this.detachEvents_(); 
  this.getElement().labelInput_ = null; 
}; 
goog.ui.LabelInput.prototype.attachEvents_ = function() { 
  var eh = new goog.events.EventHandler(this); 
  eh.listen(this.getElement(), goog.events.EventType.FOCUS, this.handleFocus_); 
  eh.listen(this.getElement(), goog.events.EventType.BLUR, this.handleBlur_); 
  if(goog.userAgent.GECKO) { 
    eh.listen(this.getElement(),[goog.events.EventType.KEYPRESS, goog.events.EventType.KEYDOWN, goog.events.EventType.KEYUP], this.handleEscapeKeys_); 
  } 
  var d = goog.dom.getOwnerDocument(this.getElement()); 
  var w = goog.dom.getWindow(d); 
  eh.listen(w, goog.events.EventType.LOAD, this.handleWindowLoad_); 
  this.eventHandler_ = eh; 
  this.attachEventsToForm_(); 
}; 
goog.ui.LabelInput.prototype.attachEventsToForm_ = function() { 
  if(! this.formAttached_ && this.eventHandler_ && this.getElement().form) { 
    this.eventHandler_.listen(this.getElement().form, goog.events.EventType.SUBMIT, this.handleFormSubmit_); 
    this.formAttached_ = true; 
  } 
}; 
goog.ui.LabelInput.prototype.detachEvents_ = function() { 
  if(this.eventHandler_) { 
    this.eventHandler_.dispose(); 
    this.eventHandler_ = null; 
  } 
}; 
goog.ui.LabelInput.prototype.disposeInternal = function() { 
  goog.ui.LabelInput.superClass_.disposeInternal.call(this); 
  this.detachEvents_(); 
}; 
goog.ui.LabelInput.prototype.LABEL_CLASS_NAME = goog.getCssName('label-input-label'); 
goog.ui.LabelInput.prototype.handleFocus_ = function(e) { 
  this.hasFocus_ = true; 
  goog.dom.classes.remove(this.getElement(), this.LABEL_CLASS_NAME); 
  if(! this.hasChanged() && ! this.inFocusAndSelect_) { 
    var me = this; 
    var clearValue = function() { 
      me.getElement().value = ''; 
    }; 
    if(goog.userAgent.IE) { 
      goog.Timer.callOnce(clearValue, 10); 
    } else { 
      clearValue(); 
    } 
  } 
}; 
goog.ui.LabelInput.prototype.handleBlur_ = function(e) { 
  this.eventHandler_.unlisten(this.getElement(), goog.events.EventType.CLICK, this.handleFocus_); 
  this.ffKeyRestoreValue_ = null; 
  this.hasFocus_ = false; 
  this.check_(); 
}; 
goog.ui.LabelInput.prototype.handleEscapeKeys_ = function(e) { 
  if(e.keyCode == 27) { 
    if(e.type == goog.events.EventType.KEYDOWN) { 
      this.ffKeyRestoreValue_ = this.getElement().value; 
    } else if(e.type == goog.events.EventType.KEYPRESS) { 
      this.getElement().value =(this.ffKeyRestoreValue_); 
    } else if(e.type == goog.events.EventType.KEYUP) { 
      this.ffKeyRestoreValue_ = null; 
    } 
    e.preventDefault(); 
  } 
}; 
goog.ui.LabelInput.prototype.handleFormSubmit_ = function(e) { 
  if(! this.hasChanged()) { 
    this.getElement().value = ''; 
    goog.Timer.callOnce(this.handleAfterSubmit_, 10, this); 
  } 
}; 
goog.ui.LabelInput.prototype.handleAfterSubmit_ = function(e) { 
  if(! this.hasChanged()) { 
    this.getElement().value = this.label_; 
  } 
}; 
goog.ui.LabelInput.prototype.handleWindowLoad_ = function(e) { 
  this.check_(); 
}; 
goog.ui.LabelInput.prototype.hasFocus = function() { 
  return this.hasFocus_; 
}; 
goog.ui.LabelInput.prototype.hasChanged = function() { 
  return this.getElement().value != '' && this.getElement().value != this.label_; 
}; 
goog.ui.LabelInput.prototype.clear = function() { 
  this.getElement().value = ''; 
  if(this.ffKeyRestoreValue_ != null) { 
    this.ffKeyRestoreValue_ = ''; 
  } 
}; 
goog.ui.LabelInput.prototype.setValue = function(s) { 
  if(this.ffKeyRestoreValue_ != null) { 
    this.ffKeyRestoreValue_ = s; 
  } 
  this.getElement().value = s; 
  this.check_(); 
}; 
goog.ui.LabelInput.prototype.getValue = function() { 
  if(this.ffKeyRestoreValue_ != null) { 
    return this.ffKeyRestoreValue_; 
  } 
  return this.hasChanged() ?(this.getElement().value): ''; 
}; 
goog.ui.LabelInput.prototype.setLabel = function(label) { 
  if(this.getElement() && ! this.hasChanged()) { 
    this.getElement().value = ''; 
  } 
  this.label_ = label; 
  this.restoreLabel_(); 
}; 
goog.ui.LabelInput.prototype.getLabel = function() { 
  return this.label_; 
}; 
goog.ui.LabelInput.prototype.check_ = function() { 
  this.attachEventsToForm_(); 
  if(! this.hasChanged()) { 
    if(! this.inFocusAndSelect_ && ! this.hasFocus_) { 
      goog.dom.classes.add(this.getElement(), this.LABEL_CLASS_NAME); 
    } 
    goog.Timer.callOnce(this.restoreLabel_, 10, this); 
  } else { 
    goog.dom.classes.remove(this.getElement(), this.LABEL_CLASS_NAME); 
  } 
}; 
goog.ui.LabelInput.prototype.focusAndSelect = function() { 
  var hc = this.hasChanged(); 
  this.inFocusAndSelect_ = true; 
  this.getElement().focus(); 
  if(! hc) { 
    this.getElement().value = this.label_; 
  } 
  this.getElement().select(); 
  if(this.eventHandler_) { 
    this.eventHandler_.listenOnce(this.getElement(), goog.events.EventType.CLICK, this.handleFocus_); 
  } 
  goog.Timer.callOnce(this.focusAndSelect_, 10, this); 
}; 
goog.ui.LabelInput.prototype.setEnabled = function(enabled) { 
  this.getElement().disabled = ! enabled; 
  goog.dom.classes.enable(this.getElement(), goog.getCssName(this.LABEL_CLASS_NAME, 'disabled'), ! enabled); 
}; 
goog.ui.LabelInput.prototype.focusAndSelect_ = function() { 
  this.inFocusAndSelect_ = false; 
}; 
goog.ui.LabelInput.prototype.restoreLabel_ = function() { 
  if(this.getElement() && ! this.hasChanged() && ! this.hasFocus_) { 
    this.getElement().value = this.label_; 
  } 
}; 
