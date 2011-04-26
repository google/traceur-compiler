
goog.provide('goog.net.XmlHttpFactory'); 
goog.net.XmlHttpFactory = function() { }; 
goog.net.XmlHttpFactory.prototype.cachedOptions_ = null; 
goog.net.XmlHttpFactory.prototype.createInstance = goog.abstractMethod; 
goog.net.XmlHttpFactory.prototype.getOptions = function() { 
  return this.cachedOptions_ ||(this.cachedOptions_ = this.internalGetOptions()); 
}; 
goog.net.XmlHttpFactory.prototype.internalGetOptions = goog.abstractMethod; 
