
goog.provide('goog.ui.Zippy'); 
goog.provide('goog.ui.ZippyEvent'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.style'); 
goog.ui.Zippy = function(header, opt_content, opt_expanded, opt_expandedHeader, opt_domHelper) { 
  goog.events.EventTarget.call(this); 
  this.dom_ = opt_domHelper || goog.dom.getDomHelper(); 
  this.elHeader_ = this.dom_.getElement(header) || null; 
  this.elExpandedHeader_ = this.dom_.getElement(opt_expandedHeader || null); 
  this.lazyCreateFunc_ = goog.isFunction(opt_content) ? opt_content: null; 
  this.elContent_ = this.lazyCreateFunc_ || ! opt_content ? null: this.dom_.getElement((opt_content)); 
  this.expanded_ = opt_expanded == true; 
  var self = this; 
  function addHeaderEvents(el) { 
    if(el) { 
      el.tabIndex = 0; 
      goog.events.listen(el, goog.events.EventType.CLICK, self.onHeaderClick_, false, self); 
      goog.events.listen(el, goog.events.EventType.KEYDOWN, self.onHeaderKeyDown_, false, self); 
    } 
  } 
  addHeaderEvents(this.elHeader_); 
  addHeaderEvents(this.elExpandedHeader_); 
  this.setExpanded(this.expanded_); 
}; 
goog.inherits(goog.ui.Zippy, goog.events.EventTarget); 
goog.ui.Zippy.Events = { TOGGLE: 'toggle' }; 
goog.ui.Zippy.prototype.disposeInternal = function() { 
  if(this.elHeader_) { 
    goog.events.removeAll(this.elHeader_); 
  } 
  if(this.elExpandedHeader_) { 
    goog.events.removeAll(this.elExpandedHeader_); 
  } 
  goog.ui.Zippy.superClass_.disposeInternal.call(this); 
}; 
goog.ui.Zippy.prototype.getContentElement = function() { 
  return this.elContent_; 
}; 
goog.ui.Zippy.prototype.expand = function() { 
  this.setExpanded(true); 
}; 
goog.ui.Zippy.prototype.collapse = function() { 
  this.setExpanded(false); 
}; 
goog.ui.Zippy.prototype.toggle = function() { 
  this.setExpanded(! this.expanded_); 
}; 
goog.ui.Zippy.prototype.setExpanded = function(expanded) { 
  if(this.elContent_) { 
    goog.style.showElement(this.elContent_, expanded); 
  } else if(expanded && this.lazyCreateFunc_) { 
    this.elContent_ = this.lazyCreateFunc_(); 
  } 
  if(this.elExpandedHeader_) { 
    goog.style.showElement(this.elHeader_, ! expanded); 
    goog.style.showElement(this.elExpandedHeader_, expanded); 
  } else { 
    this.updateHeaderClassName(expanded); 
  } 
  this.setExpandedInternal(expanded); 
  this.dispatchEvent(new goog.ui.ZippyEvent(goog.ui.Zippy.Events.TOGGLE, this, this.expanded_)); 
}; 
goog.ui.Zippy.prototype.setExpandedInternal = function(expanded) { 
  this.expanded_ = expanded; 
}; 
goog.ui.Zippy.prototype.isExpanded = function() { 
  return this.expanded_; 
}; 
goog.ui.Zippy.prototype.updateHeaderClassName = function(expanded) { 
  if(this.elHeader_) { 
    goog.dom.classes.enable(this.elHeader_, goog.getCssName('goog-zippy-expanded'), expanded); 
    goog.dom.classes.enable(this.elHeader_, goog.getCssName('goog-zippy-collapsed'), ! expanded); 
  } 
}; 
goog.ui.Zippy.prototype.onHeaderKeyDown_ = function(event) { 
  if(event.keyCode == goog.events.KeyCodes.ENTER || event.keyCode == goog.events.KeyCodes.SPACE) { 
    this.toggle(); 
    event.preventDefault(); 
    event.stopPropagation(); 
  } 
}; 
goog.ui.Zippy.prototype.onHeaderClick_ = function(event) { 
  this.toggle(); 
}; 
goog.ui.ZippyEvent = function(type, target, expanded) { 
  goog.events.Event.call(this, type, target); 
  this.expanded = expanded; 
}; 
goog.inherits(goog.ui.ZippyEvent, goog.events.Event); 
