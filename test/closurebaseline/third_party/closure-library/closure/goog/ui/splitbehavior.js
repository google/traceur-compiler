
goog.provide('goog.ui.SplitBehavior'); 
goog.provide('goog.ui.SplitBehavior.DefaultHandlers'); 
goog.require('goog.Disposable'); 
goog.require('goog.array'); 
goog.require('goog.dispose'); 
goog.require('goog.dom'); 
goog.require('goog.dom.DomHelper'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.string'); 
goog.require('goog.ui.ButtonSide'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.Error'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.decorate'); 
goog.require('goog.ui.registry'); 
goog.ui.SplitBehavior = function(first, second, opt_behaviorHandler, opt_eventType, opt_domHelper) { 
  goog.Disposable.call(this); 
  this.first_ = first; 
  this.second_ = second; 
  this.behaviorHandler_ = opt_behaviorHandler || goog.ui.SplitBehavior.DefaultHandlers.CAPTION; 
  this.eventType_ = opt_eventType || goog.ui.Component.EventType.ACTION; 
  this.dom_ = opt_domHelper || goog.dom.getDomHelper(); 
  this.isActive_ = false; 
  this.eventHandler_ = new goog.events.EventHandler(); 
  this.disposeFirst_ = true; 
  this.disposeSecond_ = true; 
}; 
goog.inherits(goog.ui.SplitBehavior, goog.Disposable); 
goog.ui.SplitBehavior.CSS_CLASS = goog.getCssName('goog-split-behavior'); 
goog.ui.SplitBehavior.DefaultHandlers = { 
  NONE: goog.nullFunction, 
  CAPTION: function(targetControl, e) { 
    var item =(e.target); 
    var value =(((item && item.getValue()) || '')); 
    var button =(targetControl); 
    button.setCaption && button.setCaption(value); 
    button.setValue && button.setValue(value); 
  }, 
  VALUE: function(targetControl, e) { 
    var item =(e.target); 
    var value =((item && item.getValue()) || ''); 
    var button =(targetControl); 
    button.setValue && button.setValue(value); 
  } 
}; 
goog.ui.SplitBehavior.prototype.element_ = null; 
goog.ui.SplitBehavior.prototype.getElement = function() { 
  return this.element_; 
}; 
goog.ui.SplitBehavior.prototype.getBehaviorHandler = function() { 
  return this.behaviorHandler_; 
}; 
goog.ui.SplitBehavior.prototype.getEventType = function() { 
  return this.eventType_; 
}; 
goog.ui.SplitBehavior.prototype.setDisposeControls = function(disposeFirst, disposeSecond) { 
  this.disposeFirst_ = ! ! disposeFirst; 
  this.disposeSecond_ = ! ! disposeSecond; 
}; 
goog.ui.SplitBehavior.prototype.setHandler = function(behaviorHandler) { 
  this.behaviorHandler_ = behaviorHandler; 
  if(this.isActive_) { 
    this.setActive(false); 
    this.setActive(true); 
  } 
}; 
goog.ui.SplitBehavior.prototype.setEventType = function(eventType) { 
  this.eventType_ = eventType; 
  if(this.isActive_) { 
    this.setActive(false); 
    this.setActive(true); 
  } 
}; 
goog.ui.SplitBehavior.prototype.decorate = function(element, opt_activate) { 
  if(this.first_ || this.second_) { 
    throw Error('Cannot decorate controls are already set'); 
  } 
  this.decorateChildren_(element); 
  var activate = goog.isDefAndNotNull(opt_activate) ? ! ! opt_activate: true; 
  this.element_ = element; 
  this.setActive(activate); 
  return this; 
}; 
goog.ui.SplitBehavior.prototype.render = function(element, opt_activate) { 
  goog.dom.classes.add(element, goog.ui.SplitBehavior.CSS_CLASS); 
  this.first_.render(element); 
  this.second_.render(element); 
  this.collapseSides_(this.first_, this.second_); 
  var activate = goog.isDefAndNotNull(opt_activate) ? ! ! opt_activate: true; 
  this.element_ = element; 
  this.setActive(activate); 
  return this; 
}; 
goog.ui.SplitBehavior.prototype.setActive = function(activate) { 
  if(this.isActive_ == activate) { 
    return; 
  } 
  this.isActive_ = activate; 
  if(activate) { 
    this.eventHandler_.listen(this.second_, this.eventType_, goog.bind(this.behaviorHandler_, this, this.first_)); 
  } else { 
    this.eventHandler_.removeAll(); 
  } 
}; 
goog.ui.SplitBehavior.prototype.disposeInternal = function() { 
  this.setActive(false); 
  goog.dispose(this.eventHandler_); 
  if(this.disposeFirst_) { 
    goog.dispose(this.first_); 
  } 
  if(this.disposeSecond_) { 
    goog.dispose(this.second_); 
  } 
  goog.ui.SplitBehavior.superClass_.disposeInternal.call(this); 
}; 
goog.ui.SplitBehavior.prototype.decorateChildren_ = function(element) { 
  var childNodes = element.childNodes; 
  var len = childNodes.length; 
  var finished = false; 
  for(var i = 0; i < len && ! finished; i ++) { 
    var child = childNodes[i]; 
    if(child.nodeType == goog.dom.NodeType.ELEMENT) { 
      if(! this.first_) { 
        this.first_ =(goog.ui.decorate(child)); 
      } else if(! this.second_) { 
        this.second_ =(goog.ui.decorate(child)); 
        finished = true; 
      } 
    } 
  } 
}; 
goog.ui.SplitBehavior.prototype.collapseSides_ = function(first, second) { 
  if(goog.isFunction(first.setCollapsed) && goog.isFunction(second.setCollapsed)) { 
    first.setCollapsed(goog.ui.ButtonSide.END); 
    second.setCollapsed(goog.ui.ButtonSide.START); 
  } 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.SplitBehavior.CSS_CLASS, function() { 
  return new goog.ui.SplitBehavior(null, null); 
}); 
