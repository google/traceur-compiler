
goog.provide('goog.ui.ProgressBar'); 
goog.provide('goog.ui.ProgressBar.Orientation'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.RangeModel'); 
goog.require('goog.userAgent'); 
goog.ui.ProgressBar = function(opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.rangeModel_ = new goog.ui.RangeModel; 
  goog.events.listen(this.rangeModel_, goog.ui.Component.EventType.CHANGE, this.handleChange_, false, this); 
}; 
goog.inherits(goog.ui.ProgressBar, goog.ui.Component); 
goog.ui.ProgressBar.Orientation = { 
  VERTICAL: 'vertical', 
  HORIZONTAL: 'horizontal' 
}; 
goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_ = { }; 
goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[goog.ui.ProgressBar.Orientation.VERTICAL]= goog.getCssName('progress-bar-vertical'); 
goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[goog.ui.ProgressBar.Orientation.HORIZONTAL]= goog.getCssName('progress-bar-horizontal'); 
goog.ui.ProgressBar.prototype.createDom = function() { 
  this.thumbElement_ = this.createThumb_(); 
  var cs = goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[this.orientation_]; 
  this.setElementInternal(this.getDomHelper().createDom('div', cs, this.thumbElement_)); 
  this.setValueState_(); 
  this.setMinimumState_(); 
  this.setMaximumState_(); 
}; 
goog.ui.ProgressBar.prototype.enterDocument = function() { 
  goog.ui.ProgressBar.superClass_.enterDocument.call(this); 
  this.attachEvents_(); 
  this.updateUi_(); 
  goog.dom.a11y.setRole(this.getElement(), 'progressbar'); 
  goog.dom.a11y.setState(this.getElement(), 'live', 'polite'); 
}; 
goog.ui.ProgressBar.prototype.exitDocument = function() { 
  goog.ui.ProgressBar.superClass_.exitDocument.call(this); 
  this.detachEvents_(); 
}; 
goog.ui.ProgressBar.prototype.createThumb_ = function() { 
  return(this.getDomHelper().createDom('div', goog.getCssName('progress-bar-thumb'))); 
}; 
goog.ui.ProgressBar.prototype.attachEvents_ = function() { 
  if(goog.userAgent.IE && goog.userAgent.VERSION < 7) { 
    goog.events.listen(this.getElement(), goog.events.EventType.RESIZE, this.updateUi_, false, this); 
  } 
}; 
goog.ui.ProgressBar.prototype.detachEvents_ = function() { 
  if(goog.userAgent.IE && goog.userAgent.VERSION < 7) { 
    goog.events.unlisten(this.getElement(), goog.events.EventType.RESIZE, this.updateUi_, false, this); 
  } 
}; 
goog.ui.ProgressBar.prototype.decorateInternal = function(element) { 
  goog.ui.ProgressBar.superClass_.decorateInternal.call(this, element); 
  goog.dom.classes.add(this.getElement(), goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[this.orientation_]); 
  var thumb = goog.dom.getElementsByTagNameAndClass(null, goog.getCssName('progress-bar-thumb'), this.getElement())[0]; 
  if(! thumb) { 
    thumb = this.createThumb_(); 
    this.getElement().appendChild(thumb); 
  } 
  this.thumbElement_ = thumb; 
}; 
goog.ui.ProgressBar.prototype.getValue = function() { 
  return this.rangeModel_.getValue(); 
}; 
goog.ui.ProgressBar.prototype.setValue = function(v) { 
  this.rangeModel_.setValue(v); 
  if(this.getElement()) { 
    this.setValueState_(); 
  } 
}; 
goog.ui.ProgressBar.prototype.setValueState_ = function() { 
  goog.dom.a11y.setState(this.getElement(), 'valuenow', this.getValue()); 
}; 
goog.ui.ProgressBar.prototype.getMinimum = function() { 
  return this.rangeModel_.getMinimum(); 
}; 
goog.ui.ProgressBar.prototype.setMinimum = function(v) { 
  this.rangeModel_.setMinimum(v); 
  if(this.getElement()) { 
    this.setMinimumState_(); 
  } 
}; 
goog.ui.ProgressBar.prototype.setMinimumState_ = function() { 
  goog.dom.a11y.setState(this.getElement(), 'valuemin', this.getMinimum()); 
}; 
goog.ui.ProgressBar.prototype.getMaximum = function() { 
  return this.rangeModel_.getMaximum(); 
}; 
goog.ui.ProgressBar.prototype.setMaximum = function(v) { 
  this.rangeModel_.setMaximum(v); 
  if(this.getElement()) { 
    this.setMaximumState_(); 
  } 
}; 
goog.ui.ProgressBar.prototype.setMaximumState_ = function() { 
  goog.dom.a11y.setState(this.getElement(), 'valuemax', this.getMaximum()); 
}; 
goog.ui.ProgressBar.prototype.orientation_ = goog.ui.ProgressBar.Orientation.HORIZONTAL; 
goog.ui.ProgressBar.prototype.handleChange_ = function(e) { 
  this.updateUi_(); 
  this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
}; 
goog.ui.ProgressBar.prototype.updateUi_ = function() { 
  if(this.thumbElement_) { 
    var min = this.getMinimum(); 
    var max = this.getMaximum(); 
    var val = this.getValue(); 
    var ratio =(val - min) /(max - min); 
    var size = Math.round(ratio * 100); 
    if(this.orientation_ == goog.ui.ProgressBar.Orientation.VERTICAL) { 
      if(goog.userAgent.IE && goog.userAgent.VERSION < 7) { 
        this.thumbElement_.style.top = 0; 
        this.thumbElement_.style.height = '100%'; 
        var h = this.thumbElement_.offsetHeight; 
        var bottom = Math.round(ratio * h); 
        this.thumbElement_.style.top = h - bottom + 'px'; 
        this.thumbElement_.style.height = bottom + 'px'; 
      } else { 
        this.thumbElement_.style.top =(100 - size) + '%'; 
        this.thumbElement_.style.height = size + '%'; 
      } 
    } else { 
      this.thumbElement_.style.width = size + '%'; 
    } 
  } 
}; 
goog.ui.ProgressBar.prototype.initializeUi_ = function() { 
  var tStyle = this.thumbElement_.style; 
  if(this.orientation_ == goog.ui.ProgressBar.Orientation.VERTICAL) { 
    tStyle.left = 0; 
    tStyle.width = '100%'; 
  } else { 
    tStyle.top = tStyle.left = 0; 
    tStyle.height = '100%'; 
  } 
}; 
goog.ui.ProgressBar.prototype.setOrientation = function(orient) { 
  if(this.orientation_ != orient) { 
    var oldCss = goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[this.orientation_]; 
    var newCss = goog.ui.ProgressBar.ORIENTATION_TO_CSS_NAME_[orient]; 
    this.orientation_ = orient; 
    if(this.getElement()) { 
      goog.dom.classes.swap(this.getElement(), oldCss, newCss); 
      this.initializeUi_(); 
      this.updateUi_(); 
    } 
  } 
}; 
goog.ui.ProgressBar.prototype.getOrientation = function() { 
  return this.orientation_; 
}; 
goog.ui.ProgressBar.prototype.disposeInternal = function() { 
  this.detachEvents_(); 
  goog.ui.ProgressBar.superClass_.disposeInternal.call(this); 
  this.thumbElement_ = null; 
  this.rangeModel_.dispose(); 
}; 
goog.ui.ProgressBar.prototype.getStep = function() { 
  return this.rangeModel_.getStep(); 
}; 
goog.ui.ProgressBar.prototype.setStep = function(step) { 
  this.rangeModel_.setStep(step); 
}; 
