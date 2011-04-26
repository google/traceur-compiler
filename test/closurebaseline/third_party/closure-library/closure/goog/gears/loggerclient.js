
goog.provide('goog.gears.LoggerClient'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug'); 
goog.require('goog.debug.Logger'); 
goog.gears.LoggerClient = function(mainThread, logCommandId, opt_workerName) { 
  if(goog.gears.LoggerClient.instance_) { 
    return goog.gears.LoggerClient.instance_; 
  } 
  goog.Disposable.call(this); 
  this.mainThread_ = mainThread; 
  this.logCommandId_ = logCommandId; 
  this.workerName_ = opt_workerName || ''; 
  var loggerClient = this; 
  goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) { 
    var name = this.getName(); 
    loggerClient.sendLog_(name, logRecord.getLevel(), logRecord.getMessage(), logRecord.getException()); 
  }; 
  goog.gears.LoggerClient.instance_ = this; 
}; 
goog.inherits(goog.gears.LoggerClient, goog.Disposable); 
goog.gears.LoggerClient.instance_ = null; 
goog.gears.LoggerClient.prototype.sendLog_ = function(name, level, msg, opt_exception) { 
  var exception; 
  if(opt_exception) { 
    var prefix = this.workerName_ ? this.workerName_ + ': ': ''; 
    exception = { 
      message: prefix + opt_exception.message, 
      stack: opt_exception.stack || goog.debug.getStacktrace(goog.debug.Logger.prototype.log) 
    }; 
    for(var i = 0; 'message' + i in opt_exception; i ++) { 
      exception['message' + i]= String(opt_exception['message' + i]); 
    } 
  } 
  this.mainThread_.sendCommand(this.logCommandId_,[name, level.value, msg, exception]); 
}; 
goog.gears.LoggerClient.prototype.disposeInternal = function() { 
  goog.gears.LoggerClient.superClass_.disposeInternal.call(this); 
  this.mainThread_ = null; 
  goog.gears.LoggerClient.instance_ = null; 
}; 
