
goog.provide('goog.debug.LogManager'); 
goog.provide('goog.debug.Logger'); 
goog.provide('goog.debug.Logger.Level'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.require('goog.debug'); 
goog.require('goog.debug.LogBuffer'); 
goog.require('goog.debug.LogRecord'); 
goog.debug.Logger = function(name) { 
  this.name_ = name; 
}; 
goog.debug.Logger.prototype.parent_ = null; 
goog.debug.Logger.prototype.level_ = null; 
goog.debug.Logger.prototype.children_ = null; 
goog.debug.Logger.prototype.handlers_ = null; 
goog.debug.Logger.ENABLE_HIERARCHY = true; 
if(! goog.debug.Logger.ENABLE_HIERARCHY) { 
  goog.debug.Logger.rootHandlers_ =[]; 
  goog.debug.Logger.rootLevel_; 
} 
goog.debug.Logger.Level = function(name, value) { 
  this.name = name; 
  this.value = value; 
}; 
goog.debug.Logger.Level.prototype.toString = function() { 
  return this.name; 
}; 
goog.debug.Logger.Level.OFF = new goog.debug.Logger.Level('OFF', Infinity); 
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level('SHOUT', 1200); 
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level('SEVERE', 1000); 
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level('WARNING', 900); 
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level('INFO', 800); 
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level('CONFIG', 700); 
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level('FINE', 500); 
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level('FINER', 400); 
goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level('FINEST', 300); 
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level('ALL', 0); 
goog.debug.Logger.Level.PREDEFINED_LEVELS =[goog.debug.Logger.Level.OFF, goog.debug.Logger.Level.SHOUT, goog.debug.Logger.Level.SEVERE, goog.debug.Logger.Level.WARNING, goog.debug.Logger.Level.INFO, goog.debug.Logger.Level.CONFIG, goog.debug.Logger.Level.FINE, goog.debug.Logger.Level.FINER, goog.debug.Logger.Level.FINEST, goog.debug.Logger.Level.ALL]; 
goog.debug.Logger.Level.predefinedLevelsCache_ = null; 
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() { 
  goog.debug.Logger.Level.predefinedLevelsCache_ = { }; 
  for(var i = 0, level; level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i]; i ++) { 
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value]= level; 
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name]= level; 
  } 
}; 
goog.debug.Logger.Level.getPredefinedLevel = function(name) { 
  if(! goog.debug.Logger.Level.predefinedLevelsCache_) { 
    goog.debug.Logger.Level.createPredefinedLevelsCache_(); 
  } 
  return goog.debug.Logger.Level.predefinedLevelsCache_[name]|| null; 
}; 
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) { 
  if(! goog.debug.Logger.Level.predefinedLevelsCache_) { 
    goog.debug.Logger.Level.createPredefinedLevelsCache_(); 
  } 
  if(value in goog.debug.Logger.Level.predefinedLevelsCache_) { 
    return goog.debug.Logger.Level.predefinedLevelsCache_[value]; 
  } 
  for(var i = 0; i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length; ++ i) { 
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i]; 
    if(level.value <= value) { 
      return level; 
    } 
  } 
  return null; 
}; 
goog.debug.Logger.getLogger = function(name) { 
  return goog.debug.LogManager.getLogger(name); 
}; 
goog.debug.Logger.prototype.getName = function() { 
  return this.name_; 
}; 
goog.debug.Logger.prototype.addHandler = function(handler) { 
  if(goog.debug.Logger.ENABLE_HIERARCHY) { 
    if(! this.handlers_) { 
      this.handlers_ =[]; 
    } 
    this.handlers_.push(handler); 
  } else { 
    goog.asserts.assert(! this.name_, 'Cannot call addHandler on a non-root logger when ' + 'goog.debug.Logger.ENABLE_HIERARCHY is false.'); 
    goog.debug.Logger.rootHandlers_.push(handler); 
  } 
}; 
goog.debug.Logger.prototype.removeHandler = function(handler) { 
  var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_: goog.debug.Logger.rootHandlers_; 
  return ! ! handlers && goog.array.remove(handlers, handler); 
}; 
goog.debug.Logger.prototype.getParent = function() { 
  return this.parent_; 
}; 
goog.debug.Logger.prototype.getChildren = function() { 
  if(! this.children_) { 
    this.children_ = { }; 
  } 
  return this.children_; 
}; 
goog.debug.Logger.prototype.setLevel = function(level) { 
  if(goog.debug.Logger.ENABLE_HIERARCHY) { 
    this.level_ = level; 
  } else { 
    goog.asserts.assert(! this.name_, 'Cannot call setLevel() on a non-root logger when ' + 'goog.debug.Logger.ENABLE_HIERARCHY is false.'); 
    goog.debug.Logger.rootLevel_ = level; 
  } 
}; 
goog.debug.Logger.prototype.getLevel = function() { 
  return this.level_; 
}; 
goog.debug.Logger.prototype.getEffectiveLevel = function() { 
  if(! goog.debug.Logger.ENABLE_HIERARCHY) { 
    return goog.debug.Logger.rootLevel_; 
  } 
  if(this.level_) { 
    return this.level_; 
  } 
  if(this.parent_) { 
    return this.parent_.getEffectiveLevel(); 
  } 
  goog.asserts.fail('Root logger has no level set.'); 
  return null; 
}; 
goog.debug.Logger.prototype.isLoggable = function(level) { 
  return level.value >= this.getEffectiveLevel().value; 
}; 
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) { 
  if(this.isLoggable(level)) { 
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception)); 
  } 
}; 
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) { 
  if(goog.debug.LogBuffer.isBufferingEnabled()) { 
    var logRecord = goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_); 
  } else { 
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_); 
  } 
  if(opt_exception) { 
    logRecord.setException(opt_exception); 
    logRecord.setExceptionText(goog.debug.exposeException(opt_exception, arguments.callee.caller)); 
  } 
  return logRecord; 
}; 
goog.debug.Logger.prototype.shout = function(msg, opt_exception) { 
  this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception); 
}; 
goog.debug.Logger.prototype.severe = function(msg, opt_exception) { 
  this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception); 
}; 
goog.debug.Logger.prototype.warning = function(msg, opt_exception) { 
  this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception); 
}; 
goog.debug.Logger.prototype.info = function(msg, opt_exception) { 
  this.log(goog.debug.Logger.Level.INFO, msg, opt_exception); 
}; 
goog.debug.Logger.prototype.config = function(msg, opt_exception) { 
  this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception); 
}; 
goog.debug.Logger.prototype.fine = function(msg, opt_exception) { 
  this.log(goog.debug.Logger.Level.FINE, msg, opt_exception); 
}; 
goog.debug.Logger.prototype.finer = function(msg, opt_exception) { 
  this.log(goog.debug.Logger.Level.FINER, msg, opt_exception); 
}; 
goog.debug.Logger.prototype.finest = function(msg, opt_exception) { 
  this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception); 
}; 
goog.debug.Logger.prototype.logRecord = function(logRecord) { 
  if(this.isLoggable(logRecord.getLevel())) { 
    this.doLogRecord_(logRecord); 
  } 
}; 
goog.debug.Logger.prototype.logToSpeedTracer_ = function(msg) { 
  if(goog.global['console']&& goog.global['console']['markTimeline']) { 
    goog.global['console']['markTimeline'](msg); 
  } 
}; 
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) { 
  this.logToSpeedTracer_('log:' + logRecord.getMessage()); 
  if(goog.debug.Logger.ENABLE_HIERARCHY) { 
    var target = this; 
    while(target) { 
      target.callPublish_(logRecord); 
      target = target.getParent(); 
    } 
  } else { 
    for(var i = 0, handler; handler = goog.debug.Logger.rootHandlers_[i ++];) { 
      handler(logRecord); 
    } 
  } 
}; 
goog.debug.Logger.prototype.callPublish_ = function(logRecord) { 
  if(this.handlers_) { 
    for(var i = 0, handler; handler = this.handlers_[i]; i ++) { 
      handler(logRecord); 
    } 
  } 
}; 
goog.debug.Logger.prototype.setParent_ = function(parent) { 
  this.parent_ = parent; 
}; 
goog.debug.Logger.prototype.addChild_ = function(name, logger) { 
  this.getChildren()[name]= logger; 
}; 
goog.debug.LogManager = { }; 
goog.debug.LogManager.loggers_ = { }; 
goog.debug.LogManager.rootLogger_ = null; 
goog.debug.LogManager.initialize = function() { 
  if(! goog.debug.LogManager.rootLogger_) { 
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger(''); 
    goog.debug.LogManager.loggers_['']= goog.debug.LogManager.rootLogger_; 
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG); 
  } 
}; 
goog.debug.LogManager.getLoggers = function() { 
  return goog.debug.LogManager.loggers_; 
}; 
goog.debug.LogManager.getRoot = function() { 
  goog.debug.LogManager.initialize(); 
  return(goog.debug.LogManager.rootLogger_); 
}; 
goog.debug.LogManager.getLogger = function(name) { 
  goog.debug.LogManager.initialize(); 
  var ret = goog.debug.LogManager.loggers_[name]; 
  return ret || goog.debug.LogManager.createLogger_(name); 
}; 
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) { 
  return function(info) { 
    var logger = opt_logger || goog.debug.LogManager.getRoot(); 
    logger.severe('Error: ' + info.message + ' (' + info.fileName + ' @ Line: ' + info.line + ')'); 
  }; 
}; 
goog.debug.LogManager.createLogger_ = function(name) { 
  var logger = new goog.debug.Logger(name); 
  if(goog.debug.Logger.ENABLE_HIERARCHY) { 
    var lastDotIndex = name.lastIndexOf('.'); 
    var parentName = name.substr(0, lastDotIndex); 
    var leafName = name.substr(lastDotIndex + 1); 
    var parentLogger = goog.debug.LogManager.getLogger(parentName); 
    parentLogger.addChild_(leafName, logger); 
    logger.setParent_(parentLogger); 
  } 
  goog.debug.LogManager.loggers_[name]= logger; 
  return logger; 
}; 
