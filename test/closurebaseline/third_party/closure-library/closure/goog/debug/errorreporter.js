
goog.provide('goog.debug.ErrorReporter'); 
goog.provide('goog.debug.ErrorReporter.ExceptionEvent'); 
goog.require('goog.debug'); 
goog.require('goog.debug.ErrorHandler'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.net.XhrIo'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.require('goog.uri.utils'); 
goog.debug.ErrorReporter = function(handlerUrl, opt_contextProvider, opt_noAutoProtect) { 
  this.contextProvider_ = opt_contextProvider || null; 
  this.xhrSender_ = goog.debug.ErrorReporter.defaultXhrSender; 
  this.handlerUrl_ = handlerUrl; 
  if(! opt_noAutoProtect) { 
    this.setup_(); 
  } 
}; 
goog.inherits(goog.debug.ErrorReporter, goog.events.EventTarget); 
goog.debug.ErrorReporter.ExceptionEvent = function(error, context) { 
  goog.events.Event.call(this, goog.debug.ErrorReporter.ExceptionEvent.TYPE); 
  this.error = error; 
  this.context = context; 
}; 
goog.inherits(goog.debug.ErrorReporter.ExceptionEvent, goog.events.Event); 
goog.debug.ErrorReporter.ExceptionEvent.TYPE = goog.events.getUniqueId('exception'); 
goog.debug.ErrorReporter.prototype.errorHandler_ = null; 
goog.debug.ErrorReporter.prototype.extraHeaders_; 
goog.debug.ErrorReporter.logger_ = goog.debug.Logger.getLogger('goog.debug.ErrorReporter'); 
goog.debug.ErrorReporter.install = function(loggingUrl, opt_contextProvider, opt_noAutoProtect) { 
  var instance = new goog.debug.ErrorReporter(loggingUrl, opt_contextProvider, opt_noAutoProtect); 
  return instance; 
}; 
goog.debug.ErrorReporter.defaultXhrSender = function(uri, method, content, opt_headers) { 
  goog.net.XhrIo.send(uri, null, method, content, opt_headers); 
}; 
goog.debug.ErrorReporter.prototype.protectAdditionalEntryPoint = function(fn) { 
  if(this.errorHandler_) { 
    return this.errorHandler_.protectEntryPoint(fn); 
  } 
  return null; 
}; 
goog.debug.ErrorReporter.prototype.setLoggingHeaders = function(loggingHeaders) { 
  this.extraHeaders_ = loggingHeaders; 
}; 
goog.debug.ErrorReporter.prototype.setXhrSender = function(xhrSender) { 
  this.xhrSender_ = xhrSender; 
}; 
goog.debug.ErrorReporter.prototype.setup_ = function() { 
  if(goog.userAgent.IE) { 
    goog.debug.catchErrors(goog.bind(this.handleException, this), false, null); 
  } else { 
    this.errorHandler_ = new goog.debug.ErrorHandler(goog.bind(this.handleException, this)); 
    this.errorHandler_.protectWindowSetTimeout(); 
    this.errorHandler_.protectWindowSetInterval(); 
    goog.debug.entryPointRegistry.monitorAll(this.errorHandler_); 
  } 
}; 
goog.debug.ErrorReporter.prototype.handleException = function(e, opt_context) { 
  var error =(goog.debug.normalizeErrorObject(e)); 
  var context = opt_context ? goog.object.clone(opt_context): { }; 
  if(this.contextProvider_) { 
    try { 
      this.contextProvider_(error, context); 
    } catch(err) { 
      goog.debug.ErrorReporter.logger_.severe('Context provider threw an ' + 'exception: ' + err.message); 
    } 
  } 
  this.sendErrorReport(error.message, error.fileName, error.lineNumber, error.stack, context); 
  try { 
    this.dispatchEvent(new goog.debug.ErrorReporter.ExceptionEvent(error, context)); 
  } catch(ex) { } 
}; 
goog.debug.ErrorReporter.prototype.sendErrorReport = function(message, fileName, line, opt_trace, opt_context) { 
  try { 
    var requestUrl = goog.uri.utils.appendParams(this.handlerUrl_, 'script', fileName, 'error', message, 'line', line); 
    var queryMap = { }; 
    queryMap['trace']= opt_trace; 
    if(opt_context) { 
      for(var entry in opt_context) { 
        queryMap['context.' + entry]= opt_context[entry]; 
      } 
    } 
    var queryData = goog.uri.utils.buildQueryDataFromMap(queryMap); 
    this.xhrSender_(requestUrl, 'POST', queryData, this.extraHeaders_); 
  } catch(e) { 
    var logMessage = goog.string.buildString('Error occurred in sending an error report.\n\n', 'script:', fileName, '\n', 'line:', line, '\n', 'error:', message, '\n', 'trace:', opt_trace); 
    goog.debug.ErrorReporter.logger_.info(logMessage); 
  } 
}; 
