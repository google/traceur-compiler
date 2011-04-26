
goog.provide('goog.debug.DebugWindow'); 
goog.require('goog.debug.HtmlFormatter'); 
goog.require('goog.debug.LogManager'); 
goog.require('goog.structs.CircularBuffer'); 
goog.require('goog.userAgent'); 
goog.debug.DebugWindow = function(opt_identifier, opt_prefix) { 
  this.identifier_ = opt_identifier || ''; 
  this.prefix_ = opt_prefix || ''; 
  this.outputBuffer_ =[]; 
  this.savedMessages_ = new goog.structs.CircularBuffer(goog.debug.DebugWindow.MAX_SAVED); 
  this.publishHandler_ = goog.bind(this.addLogRecord, this); 
  this.formatter_ = new goog.debug.HtmlFormatter(this.prefix_); 
  this.filteredLoggers_ = { }; 
  this.setCapturing(true); 
  this.enabled_ = goog.debug.DebugWindow.isEnabled(this.identifier_); 
  goog.global.setInterval(goog.bind(this.saveWindowPositionSize_, this), 7500); 
}; 
goog.debug.DebugWindow.MAX_SAVED = 500; 
goog.debug.DebugWindow.COOKIE_TIME = 30 * 24 * 60 * 60 * 1000; 
goog.debug.DebugWindow.prototype.welcomeMessage = 'LOGGING'; 
goog.debug.DebugWindow.prototype.enableOnSevere_ = false; 
goog.debug.DebugWindow.prototype.win_ = null; 
goog.debug.DebugWindow.prototype.winOpening_ = false; 
goog.debug.DebugWindow.prototype.isCapturing_ = false; 
goog.debug.DebugWindow.showedBlockedAlert_ = false; 
goog.debug.DebugWindow.prototype.bufferTimeout_ = null; 
goog.debug.DebugWindow.prototype.lastCall_ = goog.now(); 
goog.debug.DebugWindow.prototype.setWelcomeMessage = function(msg) { 
  this.welcomeMessage = msg; 
}; 
goog.debug.DebugWindow.prototype.init = function() { 
  if(this.enabled_) { 
    this.openWindow_(); 
  } 
}; 
goog.debug.DebugWindow.prototype.isEnabled = function() { 
  return this.enabled_; 
}; 
goog.debug.DebugWindow.prototype.setEnabled = function(enable) { 
  this.enabled_ = enable; 
  if(this.enabled_) { 
    this.openWindow_(); 
    if(this.win_) { 
      this.writeInitialDocument_(); 
    } 
  } 
  this.setCookie_('enabled', enable ? '1': '0'); 
}; 
goog.debug.DebugWindow.prototype.setForceEnableOnSevere = function(enableOnSevere) { 
  this.enableOnSevere_ = enableOnSevere; 
}; 
goog.debug.DebugWindow.prototype.isCapturing = function() { 
  return this.isCapturing_; 
}; 
goog.debug.DebugWindow.prototype.setCapturing = function(capturing) { 
  if(capturing == this.isCapturing_) { 
    return; 
  } 
  this.isCapturing_ = capturing; 
  var rootLogger = goog.debug.LogManager.getRoot(); 
  if(capturing) { 
    rootLogger.addHandler(this.publishHandler_); 
  } else { 
    rootLogger.removeHandler(this.publishHandler_); 
  } 
}; 
goog.debug.DebugWindow.prototype.getFormatter = function() { 
  return this.formatter_; 
}; 
goog.debug.DebugWindow.prototype.setFormatter = function(formatter) { 
  this.formatter_ = formatter; 
}; 
goog.debug.DebugWindow.prototype.addSeparator = function() { 
  this.write_('<hr>'); 
}; 
goog.debug.DebugWindow.prototype.hasActiveWindow = function() { 
  return ! ! this.win_ && ! this.win_.closed; 
}; 
goog.debug.DebugWindow.prototype.clear_ = function() { 
  this.savedMessages_.clear(); 
  if(this.hasActiveWindow()) { 
    this.writeInitialDocument_(); 
  } 
}; 
goog.debug.DebugWindow.prototype.addLogRecord = function(logRecord) { 
  if(this.filteredLoggers_[logRecord.getLoggerName()]) { 
    return; 
  } 
  var html = this.formatter_.formatRecord(logRecord); 
  this.write_(html); 
  if(this.enableOnSevere_ && logRecord.getLevel().value >= goog.debug.Logger.Level.SEVERE.value) { 
    this.setEnabled(true); 
  } 
}; 
goog.debug.DebugWindow.prototype.write_ = function(html) { 
  if(this.enabled_) { 
    this.openWindow_(); 
    this.savedMessages_.add(html); 
    this.writeToLog_(html); 
  } else { 
    this.savedMessages_.add(html); 
  } 
}; 
goog.debug.DebugWindow.prototype.writeToLog_ = function(html) { 
  this.outputBuffer_.push(html); 
  goog.global.clearTimeout(this.bufferTimeout_); 
  if(goog.now() - this.lastCall_ > 750) { 
    this.writeBufferToLog_(); 
  } else { 
    this.bufferTimeout_ = goog.global.setTimeout(goog.bind(this.writeBufferToLog_, this), 250); 
  } 
}; 
goog.debug.DebugWindow.prototype.writeBufferToLog_ = function() { 
  this.lastCall_ = goog.now(); 
  if(this.hasActiveWindow()) { 
    var body = this.win_.document.body; 
    var scroll = body && body.scrollHeight -(body.scrollTop + body.clientHeight) <= 100; 
    this.win_.document.write(this.outputBuffer_.join('')); 
    this.outputBuffer_.length = 0; 
    if(scroll) { 
      this.win_.scrollTo(0, 1000000); 
    } 
  } 
}; 
goog.debug.DebugWindow.prototype.writeSavedMessages_ = function() { 
  var messages = this.savedMessages_.getValues(); 
  for(var i = 0; i < messages.length; i ++) { 
    this.writeToLog_(messages[i]); 
  } 
}; 
goog.debug.DebugWindow.prototype.openWindow_ = function() { 
  if(this.hasActiveWindow() || this.winOpening_) { 
    return; 
  } 
  var winpos = this.getCookie_('dbg', '0,0,800,500').split(','); 
  var x = Number(winpos[0]); 
  var y = Number(winpos[1]); 
  var w = Number(winpos[2]); 
  var h = Number(winpos[3]); 
  this.winOpening_ = true; 
  this.win_ = window.open('', this.getWindowName_(), 'width=' + w + ',height=' + h + ',toolbar=no,resizable=yes,' + 'scrollbars=yes,left=' + x + ',top=' + y + ',status=no,screenx=' + x + ',screeny=' + y); 
  if(! this.win_) { 
    if(! this.showedBlockedAlert_) { 
      alert('Logger popup was blocked'); 
      this.showedBlockedAlert_ = true; 
    } 
  } 
  this.winOpening_ = false; 
  if(this.win_) { 
    this.writeInitialDocument_(); 
  } 
}; 
goog.debug.DebugWindow.prototype.getWindowName_ = function() { 
  return goog.userAgent.IE ? this.identifier_.replace(/[\s\-\.\,]/g, '_'): this.identifier_; 
}; 
goog.debug.DebugWindow.prototype.getStyleRules = function() { 
  return '*{font:normal 14px monospace;}' + '.dbg-sev{color:#F00}' + '.dbg-w{color:#E92}' + '.dbg-sh{background-color:#fd4;font-weight:bold;color:#000}' + '.dbg-i{color:#666}' + '.dbg-f{color:#999}' + '.dbg-ev{color:#0A0}' + '.dbg-m{color:#990}'; 
}; 
goog.debug.DebugWindow.prototype.writeInitialDocument_ = function() { 
  if(this.hasActiveWindow()) { 
    return; 
  } 
  this.win_.document.open(); 
  var html = '<style>' + this.getStyleRules() + '</style>' + '<hr><div class="dbg-ev" style="text-align:center">' + this.welcomeMessage + '<br><small>Logger: ' + this.identifier_ + '</small></div><hr>'; 
  this.writeToLog_(html); 
  this.writeSavedMessages_(); 
}; 
goog.debug.DebugWindow.prototype.setCookie_ = function(key, value) { 
  key += this.identifier_; 
  document.cookie = key + '=' + encodeURIComponent(value) + ';path=/;expires=' +(new Date(goog.now() + goog.debug.DebugWindow.COOKIE_TIME)).toUTCString(); 
}; 
goog.debug.DebugWindow.prototype.getCookie_ = function(key, opt_default) { 
  return goog.debug.DebugWindow.getCookieValue_(this.identifier_, key, opt_default); 
}; 
goog.debug.DebugWindow.getCookieValue_ = function(identifier, key, opt_default) { 
  var fullKey = key + identifier; 
  var cookie = String(document.cookie); 
  var start = cookie.indexOf(fullKey + '='); 
  if(start != - 1) { 
    var end = cookie.indexOf(';', start); 
    return decodeURIComponent(cookie.substring(start + fullKey.length + 1, end == - 1 ? cookie.length: end)); 
  } else { 
    return opt_default || ''; 
  } 
}; 
goog.debug.DebugWindow.isEnabled = function(identifier) { 
  return goog.debug.DebugWindow.getCookieValue_(identifier, 'enabled') == '1'; 
}; 
goog.debug.DebugWindow.prototype.saveWindowPositionSize_ = function() { 
  if(! this.hasActiveWindow()) { 
    return; 
  } 
  var x = this.win_.screenX || this.win_.screenLeft || 0; 
  var y = this.win_.screenY || this.win_.screenTop || 0; 
  var w = this.win_.outerWidth || 800; 
  var h = this.win_.outerHeight || 500; 
  this.setCookie_('dbg', x + ',' + y + ',' + w + ',' + h); 
}; 
goog.debug.DebugWindow.prototype.addFilter = function(loggerName) { 
  this.filteredLoggers_[loggerName]= 1; 
}; 
goog.debug.DebugWindow.prototype.removeFilter = function(loggerName) { 
  delete this.filteredLoggers_[loggerName]; 
}; 
