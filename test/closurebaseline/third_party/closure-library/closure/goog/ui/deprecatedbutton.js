
goog.provide('goog.ui.DeprecatedButton'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.ui.DeprecatedButton = function(opt_class) { 
  this.class_ = opt_class ? opt_class: goog.getCssName('goog-button'); 
  this.id_ = this.getNextUniqueId_(); 
}; 
goog.inherits(goog.ui.DeprecatedButton, goog.events.EventTarget); 
goog.ui.DeprecatedButton.BASE_ID_ = 'goog.ui.DeprecatedButton.'; 
goog.ui.DeprecatedButton.nextId_ = 0; 
goog.ui.DeprecatedButton.getNextUniqueId = function() { 
  return goog.ui.DeprecatedButton.BASE_ID_ + goog.ui.DeprecatedButton.nextId_ ++; 
}; 
goog.ui.DeprecatedButton.prototype.getNextUniqueId_ = function() { 
  return goog.ui.DeprecatedButton.getNextUniqueId(); 
}; 
goog.ui.DeprecatedButton.EventType = { 
  ACTIVATE: 'activate', 
  ENABLE: 'enable' 
}; 
goog.ui.DeprecatedButton.prototype.enabled_ = true; 
goog.ui.DeprecatedButton.prototype.rendered_ = false; 
goog.ui.DeprecatedButton.prototype.caption_ = ''; 
goog.ui.DeprecatedButton.prototype.tooltip_ = null; 
goog.ui.DeprecatedButton.prototype.value_ = null; 
goog.ui.DeprecatedButton.prototype.element_ = null; 
goog.ui.DeprecatedButton.prototype.getCaption = function() { 
  return this.caption_; 
}; 
goog.ui.DeprecatedButton.prototype.setCaption = function(caption) { 
  this.caption_ = caption; 
  if(this.isRendered()) { 
    var element = this.getElement(); 
    element.value = caption; 
    goog.dom.setTextContent(element, caption); 
  } 
}; 
goog.ui.DeprecatedButton.prototype.getTooltip = function() { 
  return this.tooltip_; 
}; 
goog.ui.DeprecatedButton.prototype.setTooltip = function(tooltip) { 
  this.tooltip_ = tooltip; 
  if(this.isRendered()) { 
    this.getElement().title = tooltip; 
  } 
}; 
goog.ui.DeprecatedButton.prototype.getValue = function() { 
  return this.value_; 
}; 
goog.ui.DeprecatedButton.prototype.setValue = function(value) { 
  this.value_ = value; 
}; 
goog.ui.DeprecatedButton.prototype.getEnabled = function() { 
  return this.enabled_; 
}; 
goog.ui.DeprecatedButton.prototype.setEnabled = function(enable) { 
  if(this.getEnabled() != enable && this.dispatchEvent(goog.ui.DeprecatedButton.EventType.ENABLE)) { 
    if(this.isRendered()) { 
      this.element_.disabled = ! enable; 
    } 
    this.enabled_ = enable; 
  } 
}; 
goog.ui.DeprecatedButton.prototype.getClass = function() { 
  return this.class_; 
}; 
goog.ui.DeprecatedButton.prototype.getElement = function() { 
  return this.element_; 
}; 
goog.ui.DeprecatedButton.prototype.getId = function() { 
  return this.id_; 
}; 
goog.ui.DeprecatedButton.prototype.isRendered = function() { 
  return this.rendered_; 
}; 
goog.ui.DeprecatedButton.prototype.render = function(opt_element) { 
  if(this.isRendered()) { 
    throw Error('Compenent already rendered'); 
  } 
  var domHelper = goog.dom.getDomHelper(opt_element); 
  var element = domHelper.createDom('button', { 
    value: this.caption_, 
    title: this.tooltip_, 
    disabled: ! this.enabled_, 
    className: this.class_ 
  }); 
  goog.dom.setTextContent(element, this.caption_); 
  var parentElement = opt_element || domHelper.getDocument().body; 
  domHelper.appendChild(parentElement, element); 
  goog.events.listen(element, goog.events.EventType.CLICK, this.onClick_, true, this); 
  this.element_ = element; 
  this.rendered_ = true; 
}; 
goog.ui.DeprecatedButton.prototype.decorate = function(element) { 
  if(this.isRendered()) { 
    throw Error('Component already rendered'); 
  } else if(element &&(element.tagName == 'BUTTON' ||(element.tagName == 'INPUT' &&(element.type == 'BUTTON' || element.type == 'SUBMIT' || element.type == 'RESET')))) { 
    this.element_ = element; 
    this.setCaption(element.value); 
    this.setTooltip(element.title); 
    this.class_ = element.className; 
    goog.events.listen(element, goog.events.EventType.CLICK, this.onClick_, true, this); 
    this.rendered_ = true; 
  } else { 
    throw Error('Invalid element to decorate'); 
  } 
}; 
goog.ui.DeprecatedButton.prototype.onClick_ = function(e) { 
  if(this.getEnabled()) { 
    this.dispatchEvent(goog.ui.DeprecatedButton.EventType.ACTIVATE); 
  } 
}; 
goog.ui.DeprecatedButton.prototype.disposeInternal = function() { 
  goog.ui.DeprecatedButton.superClass_.disposeInternal.call(this); 
  var element = this.element_; 
  if(element) { 
    goog.events.unlisten(element, goog.events.EventType.CLICK, this.onClick_, true, this); 
    var domHelper = goog.dom.getDomHelper(element); 
    domHelper.removeNode(element); 
    this.element_ = null; 
  } 
  delete this.value_; 
}; 
