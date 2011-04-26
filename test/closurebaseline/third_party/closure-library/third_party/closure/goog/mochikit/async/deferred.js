
goog.provide('goog.async.Deferred'); 
goog.provide('goog.async.Deferred.AlreadyCalledError'); 
goog.provide('goog.async.Deferred.CancelledError'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.require('goog.debug.Error'); 
goog.async.Deferred = function(opt_canceller, opt_defaultScope) { 
  this.chain_ =[]; 
  this.canceller_ = opt_canceller; 
  this.defaultScope_ = opt_defaultScope || null; 
}; 
goog.async.Deferred.prototype.fired_ = false; 
goog.async.Deferred.prototype.hadError_ = false; 
goog.async.Deferred.prototype.result_; 
goog.async.Deferred.prototype.paused_ = 0; 
goog.async.Deferred.prototype.silentlyCancelled_ = false; 
goog.async.Deferred.prototype.chained_ = false; 
goog.async.Deferred.prototype.unhandledExceptionTimeoutId_; 
goog.async.Deferred.prototype.cancel = function() { 
  if(! this.hasFired()) { 
    if(this.canceller_) { 
      this.canceller_.call(this.defaultScope_, this); 
    } else { 
      this.silentlyCancelled_ = true; 
    } 
    if(! this.hasFired()) { 
      this.errback(new goog.async.Deferred.CancelledError(this)); 
    } 
  } else if(this.result_ instanceof goog.async.Deferred) { 
    this.result_.cancel(); 
  } 
}; 
goog.async.Deferred.prototype.pause_ = function() { 
  this.paused_ ++; 
}; 
goog.async.Deferred.prototype.unpause_ = function() { 
  this.paused_ --; 
  if(this.paused_ == 0 && this.hasFired()) { 
    this.fire_(); 
  } 
}; 
goog.async.Deferred.prototype.continue_ = function(isSuccess, res) { 
  this.resback_(isSuccess, res); 
  this.unpause_(); 
}; 
goog.async.Deferred.prototype.resback_ = function(isSuccess, res) { 
  this.fired_ = true; 
  this.result_ = res; 
  this.hadError_ = ! isSuccess; 
  this.fire_(); 
}; 
goog.async.Deferred.prototype.check_ = function() { 
  if(this.hasFired()) { 
    if(! this.silentlyCancelled_) { 
      throw new goog.async.Deferred.AlreadyCalledError(this); 
    } 
    this.silentlyCancelled_ = false; 
  } 
}; 
goog.async.Deferred.prototype.callback = function(result) { 
  this.check_(); 
  this.assertNotDeferred_(result); 
  this.resback_(true, result); 
}; 
goog.async.Deferred.prototype.errback = function(result) { 
  this.check_(); 
  this.assertNotDeferred_(result); 
  this.resback_(false, result); 
}; 
goog.async.Deferred.prototype.assertNotDeferred_ = function(obj) { 
  goog.asserts.assert(!(obj instanceof goog.async.Deferred), 'Deferred instances can only be chained if they are the result of a ' + 'callback'); 
}; 
goog.async.Deferred.prototype.addCallback = function(cb, opt_scope) { 
  return this.addCallbacks(cb, null, opt_scope); 
}; 
goog.async.Deferred.prototype.addErrback = function(eb, opt_scope) { 
  return this.addCallbacks(null, eb, opt_scope); 
}; 
goog.async.Deferred.prototype.addCallbacks = function(cb, eb, opt_scope) { 
  goog.asserts.assert(! this.chained_, 'Chained Deferreds can not be re-used'); 
  this.chain_.push([cb, eb, opt_scope]); 
  if(this.hasFired()) { 
    this.fire_(); 
  } 
  return this; 
}; 
goog.async.Deferred.prototype.chainDeferred = function(otherDeferred) { 
  this.addCallbacks(otherDeferred.callback, otherDeferred.errback, otherDeferred); 
  return this; 
}; 
goog.async.Deferred.prototype.awaitDeferred = function(otherDeferred) { 
  return this.addCallback(goog.bind(otherDeferred.branch, otherDeferred)); 
}; 
goog.async.Deferred.prototype.branch = function() { 
  var d = new goog.async.Deferred(); 
  this.chainDeferred(d); 
  return d; 
}; 
goog.async.Deferred.prototype.addBoth = function(f, opt_scope) { 
  return this.addCallbacks(f, f, opt_scope); 
}; 
goog.async.Deferred.prototype.hasFired = function() { 
  return this.fired_; 
}; 
goog.async.Deferred.prototype.isError = function(res) { 
  return res instanceof Error; 
}; 
goog.async.Deferred.prototype.hasErrback_ = function() { 
  return goog.array.some(this.chain_, function(chainRow) { 
    return goog.isFunction(chainRow[1]); 
  }); 
}; 
goog.async.Deferred.prototype.fire_ = function() { 
  if(this.unhandledExceptionTimeoutId_ && this.hasFired() && this.hasErrback_()) { 
    goog.global.clearTimeout(this.unhandledExceptionTimeoutId_); 
    delete this.unhandledExceptionTimeoutId_; 
  } 
  var res = this.result_; 
  var unhandledException = false; 
  var isChained = false; 
  while(this.chain_.length && this.paused_ == 0) { 
    var chainEntry = this.chain_.shift(); 
    var callback = chainEntry[0]; 
    var errback = chainEntry[1]; 
    var scope = chainEntry[2]; 
    var f = this.hadError_ ? errback: callback; 
    if(f) { 
      try { 
        var ret = f.call(scope || this.defaultScope_, res); 
        if(goog.isDef(ret)) { 
          this.hadError_ = this.hadError_ &&(ret == res || this.isError(ret)); 
          this.result_ = res = ret; 
        } 
        if(res instanceof goog.async.Deferred) { 
          isChained = true; 
          this.pause_(); 
        } 
      } catch(ex) { 
        res = ex; 
        this.hadError_ = true; 
        if(! this.hasErrback_()) { 
          unhandledException = true; 
        } 
      } 
    } 
  } 
  this.result_ = res; 
  if(isChained && this.paused_) { 
    res.addCallbacks(goog.bind(this.continue_, this, true), goog.bind(this.continue_, this, false)); 
    res.chained_ = true; 
  } 
  if(unhandledException) { 
    this.unhandledExceptionTimeoutId_ = goog.global.setTimeout(function() { 
      throw res; 
    }, 0); 
  } 
}; 
goog.async.Deferred.succeed = function(res) { 
  var d = new goog.async.Deferred(); 
  d.callback(res); 
  return d; 
}; 
goog.async.Deferred.fail = function(res) { 
  var d = new goog.async.Deferred(); 
  d.errback(res); 
  return d; 
}; 
goog.async.Deferred.AlreadyCalledError = function(deferred) { 
  goog.debug.Error.call(this); 
  this.deferred = deferred; 
}; 
goog.inherits(goog.async.Deferred.AlreadyCalledError, goog.debug.Error); 
goog.async.Deferred.AlreadyCalledError.prototype.message = 'Already called'; 
goog.async.Deferred.CancelledError = function(deferred) { 
  goog.debug.Error.call(this); 
  this.deferred = deferred; 
}; 
goog.inherits(goog.async.Deferred.CancelledError, goog.debug.Error); 
goog.async.Deferred.CancelledError.prototype.message = 'Deferred was cancelled'; 
