
goog.provide('goog.messaging.LoggerClient'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug'); 
goog.require('goog.debug.LogManager'); 
goog.require('goog.debug.Logger'); 
goog.messaging.LoggerClient = function(channel, serviceName) { 
  if(goog.messaging.LoggerClient.instance_) { 
    return goog.messaging.LoggerClient.instance_; 
  } 
  goog.base(this); 
  this.channel_ = channel; 
  this.serviceName_ = serviceName; 
  this.publishHandler_ = goog.bind(this.sendLog_, this); 
  goog.debug.LogManager.getRoot().addHandler(this.publishHandler_); 
  goog.messaging.LoggerClient.instance_ = this; 
}; 
goog.inherits(goog.messaging.LoggerClient, goog.Disposable); 
goog.messaging.LoggerClient.instance_ = null; 
goog.messaging.LoggerClient.prototype.sendLog_ = function(logRecord) { 
  var name = logRecord.getLoggerName(); 
  var level = logRecord.getLevel(); 
  var msg = logRecord.getMessage(); 
  var originalException = logRecord.getException(); 
  var exception; 
  if(originalException) { 
    var normalizedException = goog.debug.normalizeErrorObject(originalException); 
    exception = { 
      'name': normalizedException.name, 
      'message': normalizedException.message, 
      'lineNumber': normalizedException.lineNumber, 
      'fileName': normalizedException.fileName, 
      'stack': originalException.stack || goog.debug.getStacktrace(goog.debug.Logger.prototype.log) 
    }; 
    if(goog.isObject(originalException)) { 
      for(var i = 0; 'message' + i in originalException; i ++) { 
        exception['message' + i]= String(originalException['message' + i]); 
      } 
    } 
  } 
  this.channel_.send(this.serviceName_, { 
    'name': name, 
    'level': level.value, 
    'message': msg, 
    'exception': exception 
  }); 
}; 
goog.messaging.LoggerClient.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  goog.debug.LogManager.getRoot().removeHandler(this.publishHandler_); 
  delete this.channel_; 
  goog.messaging.LoggerClient.instance_ = null; 
}; 
