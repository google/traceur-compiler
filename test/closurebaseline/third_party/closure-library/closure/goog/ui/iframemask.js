
goog.provide('goog.ui.IframeMask'); 
goog.require('goog.Disposable'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.DomHelper'); 
goog.require('goog.dom.iframe'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.style'); 
goog.ui.IframeMask = function(opt_domHelper, opt_iframePool) { 
  goog.Disposable.call(this); 
  this.dom_ = opt_domHelper || goog.dom.getDomHelper(); 
  this.snapElement_ = this.dom_.getDocument().documentElement; 
  this.handler_ = new goog.events.EventHandler(this); 
  this.iframePool_ = opt_iframePool; 
}; 
goog.inherits(goog.ui.IframeMask, goog.Disposable); 
goog.ui.IframeMask.prototype.iframe_; 
goog.ui.IframeMask.prototype.zIndex_ = 1; 
goog.ui.IframeMask.prototype.opacity_ = 0; 
goog.ui.IframeMask.prototype.disposeInternal = function() { 
  if(this.iframePool_) { 
    this.iframePool_.releaseObject((this.iframe_)); 
  } else { 
    goog.dom.removeNode(this.iframe_); 
  } 
  this.iframe_ = null; 
  this.handler_.dispose(); 
  this.handler_ = null; 
  goog.ui.IframeMask.superClass_.disposeInternal.call(this); 
}; 
goog.ui.IframeMask.HIDDEN_CSS_TEXT_ = 'position:absolute;display:none;z-index:1'; 
goog.ui.IframeMask.prototype.hideMask = function() { 
  if(this.iframe_) { 
    this.iframe_.style.cssText = goog.ui.IframeMask.HIDDEN_CSS_TEXT_; 
    if(this.iframePool_) { 
      this.iframePool_.releaseObject(this.iframe_); 
      this.iframe_ = null; 
    } 
  } 
}; 
goog.ui.IframeMask.prototype.getIframe_ = function() { 
  if(! this.iframe_) { 
    this.iframe_ = this.iframePool_ ?(this.iframePool_.getObject()): goog.dom.iframe.createBlank(this.dom_); 
    this.iframe_.style.cssText = goog.ui.IframeMask.HIDDEN_CSS_TEXT_; 
    this.dom_.getDocument().body.appendChild(this.iframe_); 
  } 
  return this.iframe_; 
}; 
goog.ui.IframeMask.prototype.applyMask = function() { 
  var iframe = this.getIframe_(); 
  var bounds = goog.style.getBounds(this.snapElement_); 
  iframe.style.cssText = 'position:absolute;' + 'left:' + bounds.left + 'px;' + 'top:' + bounds.top + 'px;' + 'width:' + bounds.width + 'px;' + 'height:' + bounds.height + 'px;' + 'z-index:' + this.zIndex_; 
  goog.style.setOpacity(iframe, this.opacity_); 
  iframe.style.display = 'block'; 
}; 
goog.ui.IframeMask.prototype.setOpacity = function(opacity) { 
  this.opacity_ = opacity; 
}; 
goog.ui.IframeMask.prototype.setZIndex = function(zIndex) { 
  this.zIndex_ = zIndex; 
}; 
goog.ui.IframeMask.prototype.setSnapElement = function(snapElement) { 
  this.snapElement_ = snapElement; 
  if(this.iframe_ && goog.style.isElementShown(this.iframe_)) { 
    this.applyMask(); 
  } 
}; 
goog.ui.IframeMask.prototype.listenOnTarget = function(target, showEvent, hideEvent, opt_snapElement) { 
  var timerKey; 
  this.handler_.listen(target, showEvent, function() { 
    if(opt_snapElement) { 
      this.setSnapElement(opt_snapElement); 
    } 
    timerKey = goog.Timer.callOnce(this.applyMask, 0, this); 
  }); 
  this.handler_.listen(target, hideEvent, function() { 
    if(timerKey) { 
      goog.Timer.clear(timerKey); 
      timerKey = null; 
    } 
    this.hideMask(); 
  }); 
}; 
goog.ui.IframeMask.prototype.removeHandlers = function() { 
  this.handler_.removeAll(); 
}; 
