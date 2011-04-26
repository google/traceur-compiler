
goog.provide('goog.debug.LogRecord'); 
goog.debug.LogRecord = function(level, msg, loggerName, opt_time, opt_sequenceNumber) { 
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber); 
}; 
goog.debug.LogRecord.prototype.time_; 
goog.debug.LogRecord.prototype.level_; 
goog.debug.LogRecord.prototype.msg_; 
goog.debug.LogRecord.prototype.loggerName_; 
goog.debug.LogRecord.prototype.sequenceNumber_ = 0; 
goog.debug.LogRecord.prototype.exception_ = null; 
goog.debug.LogRecord.prototype.exceptionText_ = null; 
goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS = true; 
goog.debug.LogRecord.nextSequenceNumber_ = 0; 
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName, opt_time, opt_sequenceNumber) { 
  if(goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) { 
    this.sequenceNumber_ = typeof opt_sequenceNumber == 'number' ? opt_sequenceNumber: goog.debug.LogRecord.nextSequenceNumber_ ++; 
  } 
  this.time_ = opt_time || goog.now(); 
  this.level_ = level; 
  this.msg_ = msg; 
  this.loggerName_ = loggerName; 
  delete this.exception_; 
  delete this.exceptionText_; 
}; 
goog.debug.LogRecord.prototype.getLoggerName = function() { 
  return this.loggerName_; 
}; 
goog.debug.LogRecord.prototype.getException = function() { 
  return this.exception_; 
}; 
goog.debug.LogRecord.prototype.setException = function(exception) { 
  this.exception_ = exception; 
}; 
goog.debug.LogRecord.prototype.getExceptionText = function() { 
  return this.exceptionText_; 
}; 
goog.debug.LogRecord.prototype.setExceptionText = function(text) { 
  this.exceptionText_ = text; 
}; 
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) { 
  this.loggerName_ = loggerName; 
}; 
goog.debug.LogRecord.prototype.getLevel = function() { 
  return this.level_; 
}; 
goog.debug.LogRecord.prototype.setLevel = function(level) { 
  this.level_ = level; 
}; 
goog.debug.LogRecord.prototype.getMessage = function() { 
  return this.msg_; 
}; 
goog.debug.LogRecord.prototype.setMessage = function(msg) { 
  this.msg_ = msg; 
}; 
goog.debug.LogRecord.prototype.getMillis = function() { 
  return this.time_; 
}; 
goog.debug.LogRecord.prototype.setMillis = function(time) { 
  this.time_ = time; 
}; 
goog.debug.LogRecord.prototype.getSequenceNumber = function() { 
  return this.sequenceNumber_; 
}; 
