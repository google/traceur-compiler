
goog.provide('goog.demos.SampleComponent'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.events.KeyHandler.EventType'); 
goog.require('goog.ui.Component'); 
goog.demos.SampleComponent = function(opt_label, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.initialLabel_ = opt_label || 'Click Me'; 
  this.color_ = 'red'; 
  this.eh_ = new goog.events.EventHandler(this); 
  this.kh_ = null; 
}; 
goog.inherits(goog.demos.SampleComponent, goog.ui.Component); 
goog.demos.SampleComponent.prototype.changeColor_ = function() { 
  if(this.color_ == 'red') { 
    this.color_ = 'green'; 
  } else if(this.color_ == 'green') { 
    this.color_ = 'blue'; 
  } else { 
    this.color_ = 'red'; 
  } 
  this.getElement().style.backgroundColor = this.color_; 
}; 
goog.demos.SampleComponent.prototype.createDom = function() { 
  this.decorateInternal(this.dom_.createElement('div')); 
}; 
goog.demos.SampleComponent.prototype.decorateInternal = function(element) { 
  goog.demos.SampleComponent.superClass_.decorateInternal.call(this, element); 
  if(! this.getLabelText()) { 
    this.setLabelText(this.initialLabel_); 
  } 
  var elem = this.getElement(); 
  goog.dom.classes.add(elem, goog.getCssName('goog-sample-component')); 
  elem.style.backgroundColor = this.color_; 
  elem.tabIndex = 0; 
  this.kh_ = new goog.events.KeyHandler(elem); 
  this.eh_.listen(this.kh_, goog.events.KeyHandler.EventType.KEY, this.onKey_); 
}; 
goog.demos.SampleComponent.prototype.disposeInternal = function() { 
  goog.demos.SampleComponent.superClass_.disposeInternal.call(this); 
  this.eh_.dispose(); 
  if(this.kh_) { 
    this.kh_.dispose(); 
  } 
}; 
goog.demos.SampleComponent.prototype.enterDocument = function() { 
  goog.demos.SampleComponent.superClass_.enterDocument.call(this); 
  this.eh_.listen(this.getElement(), goog.events.EventType.CLICK, this.onDivClicked_); 
}; 
goog.demos.SampleComponent.prototype.exitDocument = function() { 
  goog.demos.SampleComponent.superClass_.exitDocument.call(this); 
  this.eh_.unlisten(this.getElement(), goog.events.EventType.CLICK, this.onDivClicked_); 
}; 
goog.demos.SampleComponent.prototype.getLabelText = function() { 
  if(! this.getElement()) { 
    return ''; 
  } 
  return goog.dom.getTextContent(this.getElement()); 
}; 
goog.demos.SampleComponent.prototype.onDivClicked_ = function(event) { 
  this.changeColor_(); 
}; 
goog.demos.SampleComponent.prototype.onKey_ = function(event) { 
  var keyCodes = goog.events.KeyCodes; 
  if(event.keyCode == keyCodes.SPACE || event.keyCode == keyCodes.ENTER) { 
    this.changeColor_(); 
  } 
}; 
goog.demos.SampleComponent.prototype.setLabelText = function(text) { 
  if(this.getElement()) { 
    goog.dom.setTextContent(this.getElement(), text); 
  } 
}; 
