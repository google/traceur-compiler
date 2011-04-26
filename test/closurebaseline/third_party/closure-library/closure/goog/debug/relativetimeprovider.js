
goog.provide('goog.debug.RelativeTimeProvider'); 
goog.debug.RelativeTimeProvider = function() { 
  this.relativeTimeStart_ = goog.now(); 
}; 
goog.debug.RelativeTimeProvider.defaultInstance_ = new goog.debug.RelativeTimeProvider(); 
goog.debug.RelativeTimeProvider.prototype.set = function(timeStamp) { 
  this.relativeTimeStart_ = timeStamp; 
}; 
goog.debug.RelativeTimeProvider.prototype.reset = function() { 
  this.set(goog.now()); 
}; 
goog.debug.RelativeTimeProvider.prototype.get = function() { 
  return this.relativeTimeStart_; 
}; 
goog.debug.RelativeTimeProvider.getDefaultInstance = function() { 
  return goog.debug.RelativeTimeProvider.defaultInstance_; 
}; 
