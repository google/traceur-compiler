
goog.provide('goog.ui.CharCounter'); 
goog.provide('goog.ui.CharCounter.Display'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.InputHandler'); 
goog.ui.CharCounter = function(elInput, elCount, maxLength, opt_displayMode) { 
  goog.events.EventTarget.call(this); 
  this.elInput_ = elInput; 
  this.elCount_ = elCount; 
  this.maxLength_ = maxLength; 
  this.display_ = opt_displayMode || goog.ui.CharCounter.Display.REMAINING; 
  elInput.maxLength = maxLength; 
  this.inputHandler_ = new goog.events.InputHandler(elInput); 
  goog.events.listen(this.inputHandler_, goog.events.InputHandler.EventType.INPUT, this.onChange_, false, this); 
  this.checkLength_(); 
}; 
goog.inherits(goog.ui.CharCounter, goog.events.EventTarget); 
goog.ui.CharCounter.Display = { 
  REMAINING: 0, 
  INCREMENTAL: 1 
}; 
goog.ui.CharCounter.prototype.setMaxLength = function(maxLength) { 
  this.maxLength_ = maxLength; 
  this.elInput_.maxLength = maxLength; 
  this.checkLength_(); 
}; 
goog.ui.CharCounter.prototype.getMaxLength = function() { 
  return this.maxLength_; 
}; 
goog.ui.CharCounter.prototype.setDisplayMode = function(displayMode) { 
  this.display_ = displayMode; 
  this.checkLength_(); 
}; 
goog.ui.CharCounter.prototype.getDisplayMode = function() { 
  return this.display_; 
}; 
goog.ui.CharCounter.prototype.onChange_ = function(event) { 
  this.checkLength_(); 
}; 
goog.ui.CharCounter.prototype.checkLength_ = function() { 
  var count = this.elInput_.value.length; 
  if(count > this.maxLength_) { 
    var scrollTop = this.elInput_.scrollTop; 
    var scrollLeft = this.elInput_.scrollLeft; 
    this.elInput_.value = this.elInput_.value.substring(0, this.maxLength_); 
    count = this.maxLength_; 
    this.elInput_.scrollTop = scrollTop; 
    this.elInput_.scrollLeft = scrollLeft; 
  } 
  if(this.elCount_) { 
    var incremental = this.display_ == goog.ui.CharCounter.Display.INCREMENTAL; 
    goog.dom.setTextContent(this.elCount_,(incremental ? count: this.maxLength_ - count)); 
  } 
}; 
goog.ui.CharCounter.prototype.disposeInternal = function() { 
  goog.ui.CharCounter.superClass_.disposeInternal.call(this); 
  delete this.elInput_; 
  this.inputHandler_.dispose(); 
  this.inputHandler_ = null; 
}; 
