
goog.provide('goog.gears.HttpRequest'); 
goog.require('goog.Timer'); 
goog.require('goog.gears'); 
goog.require('goog.net.XmlHttp'); 
goog.gears.HttpRequest.setup = function() { 
  goog.net.XmlHttp.setFactory(goog.gears.HttpRequest.factory_, goog.gears.HttpRequest.optionsFactory_); 
  goog.Timer.defaultTimerObject = goog.gears.getFactory().create('beta.timer', '1.0'); 
}; 
goog.gears.HttpRequest.factory_ = function() { 
  return goog.gears.getFactory().create('beta.httprequest', '1.0'); 
}; 
goog.gears.HttpRequest.options_ = { }; 
goog.gears.HttpRequest.options_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION]= true; 
goog.gears.HttpRequest.optionsFactory_ = function() { 
  return goog.gears.HttpRequest.options_; 
}; 
