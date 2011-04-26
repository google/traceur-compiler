
goog.provide('goog.Timer'); 
goog.require('goog.events.EventTarget'); 
goog.Timer = function(opt_interval, opt_timerObject) { 
  goog.events.EventTarget.call(this); 
  this.interval_ = opt_interval || 1; 
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject; 
  this.boundTick_ = goog.bind(this.tick_, this); 
  this.last_ = goog.now(); 
}; 
goog.inherits(goog.Timer, goog.events.EventTarget); 
goog.Timer.MAX_TIMEOUT_ = 2147483647; 
goog.Timer.prototype.enabled = false; 
goog.Timer.defaultTimerObject = goog.global['window']; 
goog.Timer.intervalScale = 0.8; 
goog.Timer.prototype.timer_ = null; 
goog.Timer.prototype.getInterval = function() { 
  return this.interval_; 
}; 
goog.Timer.prototype.setInterval = function(interval) { 
  this.interval_ = interval; 
  if(this.timer_ && this.enabled) { 
    this.stop(); 
    this.start(); 
  } else if(this.timer_) { 
    this.stop(); 
  } 
}; 
goog.Timer.prototype.tick_ = function() { 
  if(this.enabled) { 
    var elapsed = goog.now() - this.last_; 
    if(elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) { 
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_ - elapsed); 
      return; 
    } 
    this.dispatchTick(); 
    if(this.enabled) { 
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_); 
      this.last_ = goog.now(); 
    } 
  } 
}; 
goog.Timer.prototype.dispatchTick = function() { 
  this.dispatchEvent(goog.Timer.TICK); 
}; 
goog.Timer.prototype.start = function() { 
  this.enabled = true; 
  if(! this.timer_) { 
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_); 
    this.last_ = goog.now(); 
  } 
}; 
goog.Timer.prototype.stop = function() { 
  this.enabled = false; 
  if(this.timer_) { 
    this.timerObject_.clearTimeout(this.timer_); 
    this.timer_ = null; 
  } 
}; 
goog.Timer.prototype.disposeInternal = function() { 
  goog.Timer.superClass_.disposeInternal.call(this); 
  this.stop(); 
  delete this.timerObject_; 
}; 
goog.Timer.TICK = 'tick'; 
goog.Timer.callOnce = function(listener, opt_delay, opt_handler) { 
  if(goog.isFunction(listener)) { 
    if(opt_handler) { 
      listener = goog.bind(listener, opt_handler); 
    } 
  } else if(listener && typeof listener.handleEvent == 'function') { 
    listener = goog.bind(listener.handleEvent, listener); 
  } else { 
    throw Error('Invalid listener argument'); 
  } 
  if(opt_delay > goog.Timer.MAX_TIMEOUT_) { 
    return - 1; 
  } else { 
    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0); 
  } 
}; 
goog.Timer.clear = function(timerId) { 
  goog.Timer.defaultTimerObject.clearTimeout(timerId); 
}; 
