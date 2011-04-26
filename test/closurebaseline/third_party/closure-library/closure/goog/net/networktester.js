
goog.provide('goog.net.NetworkTester'); 
goog.require('goog.Timer'); 
goog.require('goog.Uri'); 
goog.require('goog.debug.Logger'); 
goog.net.NetworkTester = function(callback, opt_handler, opt_uri) { 
  this.callback_ = callback; 
  this.handler_ = opt_handler; 
  if(! opt_uri) { 
    opt_uri = new goog.Uri('//www.google.com/images/cleardot.gif'); 
    opt_uri.makeUnique(); 
  } 
  this.uri_ = opt_uri; 
}; 
goog.net.NetworkTester.DEFAULT_TIMEOUT_MS = 10000; 
goog.net.NetworkTester.prototype.logger_ = goog.debug.Logger.getLogger('goog.net.NetworkTester'); 
goog.net.NetworkTester.prototype.timeoutMs_ = goog.net.NetworkTester.DEFAULT_TIMEOUT_MS; 
goog.net.NetworkTester.prototype.running_ = false; 
goog.net.NetworkTester.prototype.retries_ = 0; 
goog.net.NetworkTester.prototype.attempt_ = 0; 
goog.net.NetworkTester.prototype.pauseBetweenRetriesMs_ = 0; 
goog.net.NetworkTester.prototype.timeoutTimer_ = null; 
goog.net.NetworkTester.prototype.pauseTimer_ = null; 
goog.net.NetworkTester.prototype.getTimeout = function() { 
  return this.timeoutMs_; 
}; 
goog.net.NetworkTester.prototype.setTimeout = function(timeoutMs) { 
  this.timeoutMs_ = timeoutMs; 
}; 
goog.net.NetworkTester.prototype.getNumRetries = function() { 
  return this.retries_; 
}; 
goog.net.NetworkTester.prototype.setNumRetries = function(retries) { 
  this.retries_ = retries; 
}; 
goog.net.NetworkTester.prototype.getPauseBetweenRetries = function() { 
  return this.pauseBetweenRetriesMs_; 
}; 
goog.net.NetworkTester.prototype.setPauseBetweenRetries = function(pauseMs) { 
  this.pauseBetweenRetriesMs_ = pauseMs; 
}; 
goog.net.NetworkTester.prototype.getUri = function() { 
  return this.uri_; 
}; 
goog.net.NetworkTester.prototype.setUri = function(uri) { 
  this.uri_ = uri; 
}; 
goog.net.NetworkTester.prototype.isRunning = function() { 
  return this.running_; 
}; 
goog.net.NetworkTester.prototype.start = function() { 
  if(this.running_) { 
    throw Error('NetworkTester.start called when already running'); 
  } 
  this.running_ = true; 
  this.logger_.info('Starting'); 
  this.attempt_ = 0; 
  this.startNextAttempt_(); 
}; 
goog.net.NetworkTester.prototype.stop = function() { 
  this.cleanupCallbacks_(); 
  this.running_ = false; 
}; 
goog.net.NetworkTester.prototype.startNextAttempt_ = function() { 
  this.attempt_ ++; 
  if(goog.net.NetworkTester.getNavigatorOffline_()) { 
    this.logger_.info('Browser is set to work offline.'); 
    goog.Timer.callOnce(goog.bind(this.onResult, this, false), 0); 
  } else { 
    this.logger_.info('Loading image (attempt ' + this.attempt_ + ') at ' + this.uri_); 
    this.image_ = new Image(); 
    this.image_.onload = goog.bind(this.onImageLoad_, this); 
    this.image_.onerror = goog.bind(this.onImageError_, this); 
    this.image_.onabort = goog.bind(this.onImageAbort_, this); 
    this.timeoutTimer_ = goog.Timer.callOnce(this.onImageTimeout_, this.timeoutMs_, this); 
    this.image_.src = String(this.uri_); 
  } 
}; 
goog.net.NetworkTester.getNavigatorOffline_ = function() { 
  return 'onLine' in navigator && ! navigator.onLine; 
}; 
goog.net.NetworkTester.prototype.onImageLoad_ = function() { 
  this.logger_.info('Image loaded'); 
  this.onResult(true); 
}; 
goog.net.NetworkTester.prototype.onImageError_ = function() { 
  this.logger_.info('Image load error'); 
  this.onResult(false); 
}; 
goog.net.NetworkTester.prototype.onImageAbort_ = function() { 
  this.logger_.info('Image load aborted'); 
  this.onResult(false); 
}; 
goog.net.NetworkTester.prototype.onImageTimeout_ = function() { 
  this.logger_.info('Image load timed out'); 
  this.onResult(false); 
}; 
goog.net.NetworkTester.prototype.onResult = function(succeeded) { 
  this.cleanupCallbacks_(); 
  if(succeeded) { 
    this.running_ = false; 
    this.callback_.call(this.handler_, true); 
  } else { 
    if(this.attempt_ <= this.retries_) { 
      if(this.pauseBetweenRetriesMs_) { 
        this.pauseTimer_ = goog.Timer.callOnce(this.onPauseFinished_, this.pauseBetweenRetriesMs_, this); 
      } else { 
        this.startNextAttempt_(); 
      } 
    } else { 
      this.running_ = false; 
      this.callback_.call(this.handler_, false); 
    } 
  } 
}; 
goog.net.NetworkTester.prototype.onPauseFinished_ = function() { 
  this.pauseTimer_ = null; 
  this.startNextAttempt_(); 
}; 
goog.net.NetworkTester.prototype.cleanupCallbacks_ = function() { 
  if(this.image_) { 
    this.image_.onload = null; 
    this.image_.onerror = null; 
    this.image_.onabort = null; 
    this.image_ = null; 
  } 
  if(this.timeoutTimer_) { 
    goog.Timer.clear(this.timeoutTimer_); 
    this.timeoutTimer_ = null; 
  } 
  if(this.pauseTimer_) { 
    goog.Timer.clear(this.pauseTimer_); 
    this.pauseTimer_ = null; 
  } 
}; 
