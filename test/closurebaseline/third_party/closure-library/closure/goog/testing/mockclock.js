
goog.provide('goog.testing.MockClock'); 
goog.require('goog.Disposable'); 
goog.require('goog.testing.PropertyReplacer'); 
goog.testing.MockClock = function(opt_autoInstall) { 
  goog.Disposable.call(this); 
  this.queue_ =[]; 
  this.deletedKeys_ = { }; 
  if(opt_autoInstall) { 
    this.install(); 
  } 
}; 
goog.inherits(goog.testing.MockClock, goog.Disposable); 
goog.testing.MockClock.prototype.timeoutsMade_ = 0; 
goog.testing.MockClock.prototype.replacer_ = null; 
goog.testing.MockClock.prototype.deletedKeys_ = null; 
goog.testing.MockClock.prototype.nowMillis_ = 0; 
goog.testing.MockClock.prototype.timeoutDelay_ = 0; 
goog.testing.MockClock.prototype.install = function() { 
  if(! this.replacer_) { 
    var r = this.replacer_ = new goog.testing.PropertyReplacer(); 
    r.set(window, 'setTimeout', goog.bind(this.setTimeout_, this)); 
    r.set(window, 'setInterval', goog.bind(this.setInterval_, this)); 
    r.set(window, 'clearTimeout', goog.bind(this.clearTimeout_, this)); 
    r.set(window, 'clearInterval', goog.bind(this.clearInterval_, this)); 
    this.oldGoogNow_ = goog.now; 
    goog.now = goog.bind(this.getCurrentTime, this); 
  } 
}; 
goog.testing.MockClock.prototype.uninstall = function() { 
  if(this.replacer_) { 
    this.replacer_.reset(); 
    this.replacer_ = null; 
    goog.now = this.oldGoogNow_; 
  } 
}; 
goog.testing.MockClock.prototype.disposeInternal = function() { 
  this.uninstall(); 
  this.queue_ = null; 
  this.deletedKeys_ = null; 
  goog.testing.MockClock.superClass_.disposeInternal.call(this); 
}; 
goog.testing.MockClock.prototype.reset = function() { 
  this.queue_ =[]; 
  this.deletedKeys_ = { }; 
  this.nowMillis_ = 0; 
  this.timeoutsMade_ = 0; 
  this.timeoutDelay_ = 0; 
}; 
goog.testing.MockClock.prototype.setTimeoutDelay = function(delay) { 
  this.timeoutDelay_ = delay; 
}; 
goog.testing.MockClock.prototype.getTimeoutDelay = function() { 
  return this.timeoutDelay_; 
}; 
goog.testing.MockClock.prototype.tick = function(opt_millis) { 
  if(typeof opt_millis != 'number') { 
    opt_millis = 1; 
  } 
  var endTime = this.nowMillis_ + opt_millis; 
  this.runFunctionsWithinRange_(endTime); 
  this.nowMillis_ = endTime; 
  return endTime; 
}; 
goog.testing.MockClock.prototype.getTimeoutsMade = function() { 
  return this.timeoutsMade_; 
}; 
goog.testing.MockClock.prototype.getCurrentTime = function() { 
  return this.nowMillis_; 
}; 
goog.testing.MockClock.prototype.isTimeoutSet = function(timeoutKey) { 
  return timeoutKey <= this.timeoutsMade_ && ! this.deletedKeys_[timeoutKey]; 
}; 
goog.testing.MockClock.prototype.runFunctionsWithinRange_ = function(endTime) { 
  var adjustedEndTime = endTime - this.timeoutDelay_; 
  while(this.queue_.length && this.queue_[this.queue_.length - 1].runAtMillis <= adjustedEndTime) { 
    var timeout = this.queue_.pop(); 
    if(!(timeout.timeoutKey in this.deletedKeys_)) { 
      this.nowMillis_ = Math.max(this.nowMillis_, timeout.runAtMillis + this.timeoutDelay_); 
      timeout.funcToCall.call(goog.global, timeout.timeoutKey); 
      if(timeout.recurring) { 
        this.scheduleFunction_(timeout.timeoutKey, timeout.funcToCall, timeout.millis, true); 
      } 
    } 
  } 
}; 
goog.testing.MockClock.prototype.scheduleFunction_ = function(timeoutKey, funcToCall, millis, recurring) { 
  var timeout = { 
    runAtMillis: this.nowMillis_ + millis, 
    funcToCall: funcToCall, 
    recurring: recurring, 
    timeoutKey: timeoutKey, 
    millis: millis 
  }; 
  goog.testing.MockClock.insert_(timeout, this.queue_); 
}; 
goog.testing.MockClock.insert_ = function(timeout, queue) { 
  for(var i = queue.length; i != 0; i --) { 
    if(queue[i - 1].runAtMillis > timeout.runAtMillis) { 
      break; 
    } 
    queue[i]= queue[i - 1]; 
  } 
  queue[i]= timeout; 
}; 
goog.testing.MockClock.MAX_INT_ = 2147483647; 
goog.testing.MockClock.prototype.setTimeout_ = function(funcToCall, millis) { 
  if(millis > goog.testing.MockClock.MAX_INT_) { 
    throw Error('Bad timeout value: ' + millis + '.  Timeouts over MAX_INT ' + '(24.8 days) cause timeouts to be fired ' + 'immediately in most browsers, except for IE.'); 
  } 
  this.timeoutsMade_ = this.timeoutsMade_ + 1; 
  this.scheduleFunction_(this.timeoutsMade_, funcToCall, millis, false); 
  return this.timeoutsMade_; 
}; 
goog.testing.MockClock.prototype.setInterval_ = function(funcToCall, millis) { 
  this.timeoutsMade_ = this.timeoutsMade_ + 1; 
  this.scheduleFunction_(this.timeoutsMade_, funcToCall, millis, true); 
  return this.timeoutsMade_; 
}; 
goog.testing.MockClock.prototype.clearTimeout_ = function(timeoutKey) { 
  this.deletedKeys_[timeoutKey]= true; 
}; 
goog.testing.MockClock.prototype.clearInterval_ = function(timeoutKey) { 
  this.deletedKeys_[timeoutKey]= true; 
}; 
