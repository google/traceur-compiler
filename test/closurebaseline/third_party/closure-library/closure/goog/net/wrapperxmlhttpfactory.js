
goog.provide('goog.net.WrapperXmlHttpFactory'); 
goog.require('goog.net.XmlHttpFactory'); 
goog.net.WrapperXmlHttpFactory = function(xhrFactory, optionsFactory) { 
  goog.net.XmlHttpFactory.call(this); 
  this.xhrFactory_ = xhrFactory; 
  this.optionsFactory_ = optionsFactory; 
}; 
goog.inherits(goog.net.WrapperXmlHttpFactory, goog.net.XmlHttpFactory); 
goog.net.WrapperXmlHttpFactory.prototype.createInstance = function() { 
  return this.xhrFactory_(); 
}; 
goog.net.WrapperXmlHttpFactory.prototype.getOptions = function() { 
  return this.optionsFactory_(); 
}; 
