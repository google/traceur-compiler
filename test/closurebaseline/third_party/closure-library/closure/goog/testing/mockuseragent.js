
goog.provide('goog.testing.MockUserAgent'); 
goog.require('goog.Disposable'); 
goog.require('goog.userAgent'); 
goog.testing.MockUserAgent = function() { 
  goog.Disposable.call(this); 
  this.userAgent_ = goog.userAgent.getUserAgentString(); 
  this.originalUserAgentFunction_ = goog.userAgent.getUserAgentString; 
  this.navigator_ = goog.userAgent.getNavigator(); 
  this.originalNavigatorFunction_ = goog.userAgent.getNavigator; 
}; 
goog.inherits(goog.testing.MockUserAgent, goog.Disposable); 
goog.testing.MockUserAgent.prototype.installed_; 
goog.testing.MockUserAgent.prototype.install = function() { 
  if(! this.installed_) { 
    goog.userAgent.getUserAgentString = goog.bind(this.getUserAgentString, this); 
    goog.userAgent.getNavigator = goog.bind(this.getNavigator, this); 
    this.installed_ = true; 
  } 
}; 
goog.testing.MockUserAgent.prototype.getUserAgentString = function() { 
  return this.userAgent_; 
}; 
goog.testing.MockUserAgent.prototype.setUserAgentString = function(userAgent) { 
  this.userAgent_ = userAgent; 
}; 
goog.testing.MockUserAgent.prototype.getNavigator = function() { 
  return this.navigator_; 
}; 
goog.testing.MockUserAgent.prototype.setNavigator = function(navigator) { 
  this.navigator_ = navigator; 
}; 
goog.testing.MockUserAgent.prototype.uninstall = function() { 
  if(this.installed_) { 
    goog.userAgent.getUserAgentString = this.originalUserAgentFunction_; 
    goog.userAgent.getNavigator = this.originalNavigatorFunction_; 
    this.installed_ = false; 
  } 
}; 
goog.testing.MockUserAgent.prototype.disposeInternal = function() { 
  this.uninstall(); 
  delete this.userAgent_; 
  delete this.originalUserAgentFunction_; 
  delete this.navigator_; 
  delete this.originalNavigatorFunction_; 
  goog.testing.MockUserAgent.superClass_.disposeInternal.call(this); 
}; 
