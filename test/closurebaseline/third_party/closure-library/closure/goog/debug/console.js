
goog.provide('goog.debug.Console'); 
goog.require('goog.debug.LogManager'); 
goog.require('goog.debug.Logger.Level'); 
goog.require('goog.debug.TextFormatter'); 
goog.debug.Console = function() { 
  this.publishHandler_ = goog.bind(this.addLogRecord, this); 
  this.formatter_ = new goog.debug.TextFormatter(); 
  this.formatter_.showAbsoluteTime = false; 
  this.formatter_.showExceptionText = false; 
  this.isCapturing_ = false; 
  this.logBuffer_ = ''; 
}; 
goog.debug.Console.prototype.getFormatter = function() { 
  return this.formatter_; 
}; 
goog.debug.Console.prototype.setCapturing = function(capturing) { 
  if(capturing == this.isCapturing_) { 
    return; 
  } 
  var rootLogger = goog.debug.LogManager.getRoot(); 
  if(capturing) { 
    rootLogger.addHandler(this.publishHandler_); 
  } else { 
    rootLogger.removeHandler(this.publishHandler_); 
    this.logBuffer = ''; 
  } 
  this.isCapturing_ = capturing; 
}; 
goog.debug.Console.prototype.addLogRecord = function(logRecord) { 
  var record = this.formatter_.formatRecord(logRecord); 
  if(window.console && window.console['firebug']) { 
    switch(logRecord.getLevel()) { 
      case goog.debug.Logger.Level.SHOUT: 
        window.console['info'](record); 
        break; 

      case goog.debug.Logger.Level.SEVERE: 
        window.console['error'](record); 
        break; 

      case goog.debug.Logger.Level.WARNING: 
        window.console['warn'](record); 
        break; 

      default: 
        window.console['debug'](record); 
        break; 

    } 
  } else if(window.console) { 
    window.console.log(record); 
  } else if(window.opera) { 
    window.opera['postError'](record); 
  } else { 
    this.logBuffer_ += record; 
  } 
}; 
goog.debug.Console.instance = null; 
goog.debug.Console.autoInstall = function() { 
  if(! goog.debug.Console.instance) { 
    goog.debug.Console.instance = new goog.debug.Console(); 
  } 
  if(window.location.href.indexOf('Debug=true') != - 1) { 
    goog.debug.Console.instance.setCapturing(true); 
  } 
}; 
goog.debug.Console.show = function() { 
  alert(goog.debug.Console.instance.logBuffer_); 
}; 
