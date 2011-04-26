
goog.provide('goog.async.ConditionalDelay'); 
goog.require('goog.Disposable'); 
goog.require('goog.async.Delay'); 
goog.async.ConditionalDelay = function(listener, opt_handler) { 
  goog.Disposable.call(this); 
  this.listener_ = listener; 
  this.handler_ = opt_handler; 
  this.delay_ = new goog.async.Delay(goog.bind(this.onTick_, this), 0, this); 
}; 
goog.inherits(goog.async.ConditionalDelay, goog.Disposable); 
goog.async.ConditionalDelay.prototype.interval_ = 0; 
goog.async.ConditionalDelay.prototype.runUntil_ = 0; 
goog.async.ConditionalDelay.prototype.isDone_ = false; 
goog.async.ConditionalDelay.prototype.disposeInternal = function() { 
  this.delay_.dispose(); 
  delete this.listener_; 
  delete this.handler_; 
  goog.async.ConditionalDelay.superClass_.disposeInternal.call(this); 
}; 
goog.async.ConditionalDelay.prototype.start = function(opt_interval, opt_timeout) { 
  this.stop(); 
  this.isDone_ = false; 
  var timeout = opt_timeout || 0; 
  this.interval_ = Math.max(opt_interval || 0, 0); 
  this.runUntil_ = timeout < 0 ? - 1:(goog.now() + timeout); 
  this.delay_.start(timeout < 0 ? this.interval_: Math.min(this.interval_, timeout)); 
}; 
goog.async.ConditionalDelay.prototype.stop = function() { 
  this.delay_.stop(); 
}; 
goog.async.ConditionalDelay.prototype.isActive = function() { 
  return this.delay_.isActive(); 
}; 
goog.async.ConditionalDelay.prototype.isDone = function() { 
  return this.isDone_; 
}; 
goog.async.ConditionalDelay.prototype.onSuccess = function() { }; 
goog.async.ConditionalDelay.prototype.onFailure = function() { }; 
goog.async.ConditionalDelay.prototype.onTick_ = function() { 
  var successful = this.listener_.call(this.handler_); 
  if(successful) { 
    this.isDone_ = true; 
    this.onSuccess(); 
  } else { 
    if(this.runUntil_ < 0) { 
      this.delay_.start(this.interval_); 
    } else { 
      var timeLeft = this.runUntil_ - goog.now(); 
      if(timeLeft <= 0) { 
        this.onFailure(); 
      } else { 
        this.delay_.start(Math.min(this.interval_, timeLeft)); 
      } 
    } 
  } 
}; 
