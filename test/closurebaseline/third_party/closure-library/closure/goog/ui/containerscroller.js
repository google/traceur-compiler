
goog.provide('goog.ui.ContainerScroller'); 
goog.require('goog.Timer'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Container.EventType'); 
goog.ui.ContainerScroller = function(container) { 
  goog.Disposable.call(this); 
  this.container_ = container; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.eventHandler_.listen(container, goog.ui.Component.EventType.HIGHLIGHT, this.onHighlight_); 
  this.eventHandler_.listen(container, goog.ui.Component.EventType.ENTER, this.onEnter_); 
  this.eventHandler_.listen(container, goog.ui.Container.EventType.AFTER_SHOW, this.onAfterShow_); 
  this.eventHandler_.listen(container, goog.ui.Component.EventType.HIDE, this.onHide_); 
  this.doScrolling_(true); 
}; 
goog.inherits(goog.ui.ContainerScroller, goog.Disposable); 
goog.ui.ContainerScroller.prototype.lastEnterTarget_ = null; 
goog.ui.ContainerScroller.prototype.scrollTopBeforeHide_ = null; 
goog.ui.ContainerScroller.prototype.disableHover_ = false; 
goog.ui.ContainerScroller.prototype.onEnter_ = function(e) { 
  if(this.disableHover_) { 
    e.preventDefault(); 
  } else { 
    this.lastEnterTarget_ =(e.target); 
  } 
}; 
goog.ui.ContainerScroller.prototype.onHighlight_ = function(e) { 
  this.doScrolling_(); 
}; 
goog.ui.ContainerScroller.prototype.onAfterShow_ = function(e) { 
  if(this.scrollTopBeforeHide_ != null) { 
    this.container_.getElement().scrollTop = this.scrollTopBeforeHide_; 
    this.doScrolling_(false); 
  } else { 
    this.doScrolling_(true); 
  } 
}; 
goog.ui.ContainerScroller.prototype.onHide_ = function(e) { 
  if(e.target == this.container_) { 
    this.lastEnterTarget_ = null; 
    this.scrollTopBeforeHide_ = this.container_.getElement().scrollTop; 
  } 
}; 
goog.ui.ContainerScroller.prototype.doScrolling_ = function(opt_center) { 
  var highlighted = this.container_.getHighlighted(); 
  if(this.container_.isVisible() && highlighted && highlighted != this.lastEnterTarget_) { 
    var element = this.container_.getElement(); 
    goog.style.scrollIntoContainerView(highlighted.getElement(), element, opt_center); 
    this.temporarilyDisableHover_(); 
    this.lastEnterTarget_ = null; 
  } 
}; 
goog.ui.ContainerScroller.prototype.temporarilyDisableHover_ = function() { 
  this.disableHover_ = true; 
  goog.Timer.callOnce(function() { 
    this.disableHover_ = false; 
  }, 0, this); 
}; 
goog.ui.ContainerScroller.prototype.disposeInternal = function() { 
  goog.ui.ContainerScroller.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.lastEnterTarget_ = null; 
}; 
