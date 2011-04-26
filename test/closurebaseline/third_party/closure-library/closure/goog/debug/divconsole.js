
goog.provide('goog.debug.DivConsole'); 
goog.require('goog.debug.HtmlFormatter'); 
goog.require('goog.debug.LogManager'); 
goog.require('goog.style'); 
goog.debug.DivConsole = function(element) { 
  this.publishHandler_ = goog.bind(this.addLogRecord, this); 
  this.formatter_ = new goog.debug.HtmlFormatter(); 
  this.formatter_.showAbsoluteTime = false; 
  this.isCapturing_ = false; 
  this.element_ = element; 
  this.elementOwnerDocument_ = this.element_.ownerDocument || this.element_.document; 
  this.installStyles(); 
}; 
goog.debug.DivConsole.prototype.installStyles = function() { 
  goog.style.installStyles('.dbg-sev{color:#F00}' + '.dbg-w{color:#C40}' + '.dbg-sh{font-weight:bold;color:#000}' + '.dbg-i{color:#444}' + '.dbg-f{color:#999}' + '.dbg-ev{color:#0A0}' + '.dbg-m{color:#990}' + '.logmsg{border-bottom:1px solid #CCC;padding:2px}' + '.logsep{background-color: #8C8;}' + '.logdiv{border:1px solid #CCC;background-color:#FCFCFC;' + 'font:medium monospace}', this.element_); 
  this.element_.className += ' logdiv'; 
}; 
goog.debug.DivConsole.prototype.setCapturing = function(capturing) { 
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
goog.debug.DivConsole.prototype.addLogRecord = function(logRecord) { 
  var scroll = this.element_.scrollHeight - this.element_.scrollTop - this.element_.clientHeight <= 100; 
  var div = this.elementOwnerDocument_.createElement('div'); 
  div.className = 'logmsg'; 
  div.innerHTML = this.formatter_.formatRecord(logRecord); 
  this.element_.appendChild(div); 
  if(scroll) { 
    this.element_.scrollTop = this.element_.scrollHeight; 
  } 
}; 
goog.debug.DivConsole.prototype.getFormatter = function() { 
  return this.formatter_; 
}; 
goog.debug.DivConsole.prototype.setFormatter = function(formatter) { 
  this.formatter_ = formatter; 
}; 
goog.debug.DivConsole.prototype.addSeparator = function() { 
  var div = this.elementOwnerDocument_.createElement('div'); 
  div.className = 'logmsg logsep'; 
  this.element_.appendChild(div); 
}; 
goog.debug.DivConsole.prototype.clear = function() { 
  this.element_.innerHTML = ''; 
}; 
