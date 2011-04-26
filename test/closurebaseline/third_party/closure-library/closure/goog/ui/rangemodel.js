
goog.provide('goog.ui.RangeModel'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.ui.Component.EventType'); 
goog.ui.RangeModel = function() { 
  goog.events.EventTarget.call(this); 
}; 
goog.inherits(goog.ui.RangeModel, goog.events.EventTarget); 
goog.ui.RangeModel.prototype.value_ = 0; 
goog.ui.RangeModel.prototype.minimum_ = 0; 
goog.ui.RangeModel.prototype.maximum_ = 100; 
goog.ui.RangeModel.prototype.extent_ = 0; 
goog.ui.RangeModel.prototype.step_ = 1; 
goog.ui.RangeModel.prototype.isChanging_ = false; 
goog.ui.RangeModel.prototype.mute_ = false; 
goog.ui.RangeModel.prototype.setMute = function(muteValue) { 
  this.mute_ = muteValue; 
}; 
goog.ui.RangeModel.prototype.setValue = function(value) { 
  value = this.roundToStepWithMin(value); 
  if(this.value_ != value) { 
    if(value + this.extent_ > this.maximum_) { 
      this.value_ = this.maximum_ - this.extent_; 
    } else if(value < this.minimum_) { 
      this.value_ = this.minimum_; 
    } else { 
      this.value_ = value; 
    } 
    if(! this.isChanging_ && ! this.mute_) { 
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
    } 
  } 
}; 
goog.ui.RangeModel.prototype.getValue = function() { 
  return this.roundToStepWithMin(this.value_); 
}; 
goog.ui.RangeModel.prototype.setExtent = function(extent) { 
  extent = this.roundToStepWithMin(extent); 
  if(this.extent_ != extent) { 
    if(extent < 0) { 
      this.extent_ = 0; 
    } else if(this.value_ + extent > this.maximum_) { 
      this.extent_ = this.maximum_ - this.value_; 
    } else { 
      this.extent_ = extent; 
    } 
    if(! this.isChanging_ && ! this.mute_) { 
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
    } 
  } 
}; 
goog.ui.RangeModel.prototype.getExtent = function() { 
  return this.roundToStep(this.extent_); 
}; 
goog.ui.RangeModel.prototype.setMinimum = function(minimum) { 
  if(this.minimum_ != minimum) { 
    var oldIsChanging = this.isChanging_; 
    this.isChanging_ = true; 
    this.minimum_ = minimum; 
    if(minimum + this.extent_ > this.maximum_) { 
      this.extent_ = this.maximum_ - this.minimum_; 
    } 
    if(minimum > this.value_) { 
      this.setValue(minimum); 
    } 
    if(minimum > this.maximum_) { 
      this.extent_ = 0; 
      this.setMaximum(minimum); 
      this.setValue(minimum); 
    } 
    this.isChanging_ = oldIsChanging; 
    if(! this.isChanging_ && ! this.mute_) { 
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
    } 
  } 
}; 
goog.ui.RangeModel.prototype.getMinimum = function() { 
  return this.roundToStepWithMin(this.minimum_); 
}; 
goog.ui.RangeModel.prototype.setMaximum = function(maximum) { 
  maximum = this.roundToStepWithMin(maximum); 
  if(this.maximum_ != maximum) { 
    var oldIsChanging = this.isChanging_; 
    this.isChanging_ = true; 
    this.maximum_ = maximum; 
    if(maximum < this.value_ + this.extent_) { 
      this.setValue(maximum - this.extent_); 
    } 
    if(maximum < this.minimum_) { 
      this.extent_ = 0; 
      this.setMinimum(maximum); 
      this.setValue(this.maximum_); 
    } 
    if(maximum < this.minimum_ + this.extent_) { 
      this.extent_ = this.maximum_ - this.minimum_; 
    } 
    this.isChanging_ = oldIsChanging; 
    if(! this.isChanging_ && ! this.mute_) { 
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
    } 
  } 
}; 
goog.ui.RangeModel.prototype.getMaximum = function() { 
  return this.roundToStepWithMin(this.maximum_); 
}; 
goog.ui.RangeModel.prototype.getStep = function() { 
  return this.step_; 
}; 
goog.ui.RangeModel.prototype.setStep = function(step) { 
  if(this.step_ != step) { 
    this.step_ = step; 
    var oldIsChanging = this.isChanging_; 
    this.isChanging_ = true; 
    this.setMaximum(this.getMaximum()); 
    this.setExtent(this.getExtent()); 
    this.setValue(this.getValue()); 
    this.isChanging_ = oldIsChanging; 
    if(! this.isChanging_ && ! this.mute_) { 
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
    } 
  } 
}; 
goog.ui.RangeModel.prototype.roundToStepWithMin = function(value) { 
  if(this.step_ == null) return value; 
  return this.minimum_ + Math.round((value - this.minimum_) / this.step_) * this.step_; 
}; 
goog.ui.RangeModel.prototype.roundToStep = function(value) { 
  if(this.step_ == null) return value; 
  return Math.round(value / this.step_) * this.step_; 
}; 
