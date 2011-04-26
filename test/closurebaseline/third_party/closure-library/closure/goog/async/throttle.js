
goog.provide('goog.Throttle'); 
goog.provide('goog.async.Throttle'); 
goog.require('goog.Disposable'); 
goog.require('goog.Timer'); 
goog.async.Throttle = function(listener, interval, opt_handler) { 
  goog.Disposable.call(this); 
  this.listener_ = listener; 
  this.interval_ = interval; 
  this.handler_ = opt_handler; 
  this.callback_ = goog.bind(this.onTimer_, this); 
}; 
goog.inherits(goog.async.Throttle, goog.Disposable); 
goog.Throttle = goog.async.Throttle; 
goog.async.Throttle.prototype.shouldFire_ = false; 
goog.async.Throttle.prototype.pauseCount_ = 0; 
goog.async.Throttle.prototype.timer_ = null; 
goog.async.Throttle.prototype.fire = function() { 
  if(! this.timer_ && ! this.pauseCount_) { 
    this.doAction_(); 
  } else { 
    this.shouldFire_ = true; 
  } 
}; 
goog.async.Throttle.prototype.stop = function() { 
  if(this.timer_) { 
    goog.Timer.clear(this.timer_); 
    this.timer_ = null; 
    this.shouldFire_ = false; 
  } 
}; 
goog.async.Throttle.prototype.pause = function() { 
  this.pauseCount_ ++; 
}; 
goog.async.Throttle.prototype.resume = function() { 
  this.pauseCount_ --; 
  if(! this.pauseCount_ && this.shouldFire_ && ! this.timer_) { 
    this.shouldFire_ = false; 
    this.doAction_(); 
  } 
}; 
goog.async.Throttle.prototype.disposeInternal = function() { 
  goog.async.Throttle.superClass_.disposeInternal.call(this); 
  this.stop(); 
}; 
goog.async.Throttle.prototype.onTimer_ = function() { 
  this.timer_ = null; 
  if(this.shouldFire_ && ! this.pauseCount_) { 
    this.shouldFire_ = false; 
    this.doAction_(); 
  } 
}; 
goog.async.Throttle.prototype.doAction_ = function() { 
  this.timer_ = goog.Timer.callOnce(this.callback_, this.interval_); 
  this.listener_.call(this.handler_); 
}; 
