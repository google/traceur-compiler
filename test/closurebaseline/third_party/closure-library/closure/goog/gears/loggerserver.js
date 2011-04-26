
goog.provide('goog.gears.LoggerServer'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.debug.Logger.Level'); 
goog.require('goog.gears.Worker.EventType'); 
goog.gears.LoggerServer = function(worker, logCommandId, opt_workerName) { 
  goog.Disposable.call(this); 
  this.logCommandId_ = logCommandId; 
  this.worker_ = worker; 
  this.workerName_ = opt_workerName || ''; 
  this.msgPrefix_ = '[' + worker.getId() + '] '; 
  worker.addEventListener(goog.gears.Worker.EventType.COMMAND, this.onCommand_, false, this); 
}; 
goog.inherits(goog.gears.LoggerServer, goog.Disposable); 
goog.gears.LoggerServer.prototype.useMessagePrefix_ = true; 
goog.gears.LoggerServer.prototype.getUseMessagePrefix = function() { 
  return this.useMessagePrefix_; 
}; 
goog.gears.LoggerServer.prototype.setUseMessagePrefix = function(b) { 
  this.useMessagePrefix_ = b; 
}; 
goog.gears.LoggerServer.prototype.onCommand_ = function(e) { 
  var message =(e.message); 
  var commandId = message[0]; 
  if(commandId == this.logCommandId_) { 
    var params = message[1]; 
    var i = 0; 
    var name = params[i ++]; 
    if(params.length == 5) { 
      i ++; 
    } 
    var levelValue = params[i ++]; 
    var level = goog.debug.Logger.Level.getPredefinedLevelByValue(levelValue); 
    if(level) { 
      var msg =(this.useMessagePrefix_ ? this.msgPrefix_: '') + params[i ++]; 
      var exception = params[i ++]; 
      var logger = goog.debug.Logger.getLogger(name); 
      var logRecord = logger.getLogRecord(level, msg, exception); 
      if(this.workerName_) { 
        logRecord.workerName = this.workerName_; 
        if(exception) { 
          exception.workerName = this.workerName_; 
        } 
      } 
      logger.logRecord(logRecord); 
    } 
  } 
}; 
goog.gears.LoggerServer.prototype.disposeInternal = function() { 
  goog.gears.LoggerServer.superClass_.disposeInternal.call(this); 
  this.worker_.removeEventListener(goog.gears.Worker.EventType.COMMAND, this.onCommand_, false, this); 
  this.worker_ = null; 
}; 
