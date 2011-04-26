
goog.provide('goog.dom.FontSizeMonitor'); 
goog.provide('goog.dom.FontSizeMonitor.EventType'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.userAgent'); 
goog.dom.FontSizeMonitor = function(opt_domHelper) { 
  goog.events.EventTarget.call(this); 
  var dom = opt_domHelper || goog.dom.getDomHelper(); 
  this.sizeElement_ = dom.createDom(goog.userAgent.IE ? 'div': 'iframe', { 'style': 'position:absolute;width:9em;height:9em;top:-99em' }); 
  var p = dom.getDocument().body; 
  p.insertBefore(this.sizeElement_, p.firstChild); 
  var resizeTarget = this.resizeTarget_ = goog.userAgent.IE ? this.sizeElement_: goog.dom.getFrameContentWindow((this.sizeElement_)); 
  if(goog.userAgent.GECKO) { 
    this.sizeElement_.tabIndex = - 1; 
    var doc = resizeTarget.document; 
    doc.open(); 
    doc.close(); 
  } 
  goog.events.listen(resizeTarget, goog.events.EventType.RESIZE, this.handleResize_, false, this); 
  this.lastWidth_ = this.sizeElement_.offsetWidth; 
}; 
goog.inherits(goog.dom.FontSizeMonitor, goog.events.EventTarget); 
goog.dom.FontSizeMonitor.EventType = { CHANGE: 'fontsizechange' }; 
goog.dom.FontSizeMonitor.CHANGE_EVENT = goog.dom.FontSizeMonitor.EventType.CHANGE; 
goog.dom.FontSizeMonitor.prototype.disposeInternal = function() { 
  goog.dom.FontSizeMonitor.superClass_.disposeInternal.call(this); 
  goog.events.unlisten(this.resizeTarget_, goog.events.EventType.RESIZE, this.handleResize_, false, this); 
  this.resizeTarget_ = null; 
  if(! goog.userAgent.GECKO || goog.userAgent.isVersion('1.9')) { 
    goog.dom.removeNode(this.sizeElement_); 
  } 
  delete this.sizeElement_; 
}; 
goog.dom.FontSizeMonitor.prototype.handleResize_ = function(e) { 
  var currentWidth = this.sizeElement_.offsetWidth; 
  if(this.lastWidth_ != currentWidth) { 
    this.lastWidth_ = currentWidth; 
    this.dispatchEvent(goog.dom.FontSizeMonitor.EventType.CHANGE); 
  } 
}; 
