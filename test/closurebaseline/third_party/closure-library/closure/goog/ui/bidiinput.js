
goog.provide('goog.ui.BidiInput'); 
goog.require('goog.events'); 
goog.require('goog.events.InputHandler'); 
goog.require('goog.i18n.bidi'); 
goog.require('goog.ui.Component'); 
goog.ui.BidiInput = function(opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
}; 
goog.inherits(goog.ui.BidiInput, goog.ui.Component); 
goog.ui.BidiInput.prototype.inputHandler_ = null; 
goog.ui.BidiInput.prototype.decorateInternal = function(element) { 
  goog.ui.BidiInput.superClass_.decorateInternal.call(this, element); 
  this.init_(); 
}; 
goog.ui.BidiInput.prototype.createDom = function() { 
  this.setElementInternal(this.getDomHelper().createDom('input', { 'type': 'text' })); 
  this.init_(); 
}; 
goog.ui.BidiInput.prototype.init_ = function() { 
  this.setDirection_(); 
  this.inputHandler_ = new goog.events.InputHandler(this.getElement()); 
  goog.events.listen(this.inputHandler_, goog.events.InputHandler.EventType.INPUT, this.setDirection_, false, this); 
}; 
goog.ui.BidiInput.prototype.setDirection_ = function() { 
  var element = this.getElement(); 
  var text = element.value; 
  var dir = ''; 
  if(goog.i18n.bidi.isRtlText(text) || goog.i18n.bidi.isLtrText(text)) { 
    if(goog.i18n.bidi.detectRtlDirectionality(text)) { 
      dir = 'rtl'; 
    } else { 
      dir = 'ltr'; 
    } 
  } 
  element.dir = dir; 
}; 
goog.ui.BidiInput.prototype.getDirection = function() { 
  var dir = this.getElement().dir; 
  if(dir == '') { 
    dir = null; 
  } 
  return dir; 
}; 
goog.ui.BidiInput.prototype.setValue = function(value) { 
  this.getElement().value = value; 
  this.setDirection_(); 
}; 
goog.ui.BidiInput.prototype.getValue = function() { 
  return this.getElement().value; 
}; 
goog.ui.BidiInput.prototype.disposeInternal = function() { 
  if(this.inputHandler_) { 
    goog.events.removeAll(this.inputHandler_); 
    this.inputHandler_.dispose(); 
    this.inputHandler_ = null; 
    goog.ui.BidiInput.superClass_.disposeInternal.call(this); 
  } 
}; 
