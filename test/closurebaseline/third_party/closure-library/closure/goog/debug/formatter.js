
goog.provide('goog.debug.Formatter'); 
goog.provide('goog.debug.HtmlFormatter'); 
goog.provide('goog.debug.TextFormatter'); 
goog.require('goog.debug.RelativeTimeProvider'); 
goog.require('goog.string'); 
goog.debug.Formatter = function(opt_prefix) { 
  this.prefix_ = opt_prefix || ''; 
  this.startTimeProvider_ = goog.debug.RelativeTimeProvider.getDefaultInstance(); 
}; 
goog.debug.Formatter.prototype.showAbsoluteTime = true; 
goog.debug.Formatter.prototype.showRelativeTime = true; 
goog.debug.Formatter.prototype.showLoggerName = true; 
goog.debug.Formatter.prototype.showExceptionText = false; 
goog.debug.Formatter.prototype.showSeverityLevel = false; 
goog.debug.Formatter.prototype.formatRecord = goog.abstractMethod; 
goog.debug.Formatter.prototype.setStartTimeProvider = function(provider) { 
  this.startTimeProvider_ = provider; 
}; 
goog.debug.Formatter.prototype.getStartTimeProvider = function() { 
  return this.startTimeProvider_; 
}; 
goog.debug.Formatter.prototype.resetRelativeTimeStart = function() { 
  this.startTimeProvider_.reset(); 
}; 
goog.debug.Formatter.getDateTimeStamp_ = function(logRecord) { 
  var time = new Date(logRecord.getMillis()); 
  return goog.debug.Formatter.getTwoDigitString_((time.getFullYear() - 2000)) + goog.debug.Formatter.getTwoDigitString_((time.getMonth() + 1)) + goog.debug.Formatter.getTwoDigitString_(time.getDate()) + ' ' + goog.debug.Formatter.getTwoDigitString_(time.getHours()) + ':' + goog.debug.Formatter.getTwoDigitString_(time.getMinutes()) + ':' + goog.debug.Formatter.getTwoDigitString_(time.getSeconds()) + '.' + goog.debug.Formatter.getTwoDigitString_(Math.floor(time.getMilliseconds() / 10)); 
}; 
goog.debug.Formatter.getTwoDigitString_ = function(n) { 
  if(n < 10) { 
    return '0' + n; 
  } 
  return String(n); 
}; 
goog.debug.Formatter.getRelativeTime_ = function(logRecord, relativeTimeStart) { 
  var ms = logRecord.getMillis() - relativeTimeStart; 
  var sec = ms / 1000; 
  var str = sec.toFixed(3); 
  var spacesToPrepend = 0; 
  if(sec < 1) { 
    spacesToPrepend = 2; 
  } else { 
    while(sec < 100) { 
      spacesToPrepend ++; 
      sec *= 10; 
    } 
  } 
  while(spacesToPrepend -- > 0) { 
    str = ' ' + str; 
  } 
  return str; 
}; 
goog.debug.HtmlFormatter = function(opt_prefix) { 
  goog.debug.Formatter.call(this, opt_prefix); 
}; 
goog.inherits(goog.debug.HtmlFormatter, goog.debug.Formatter); 
goog.debug.HtmlFormatter.prototype.showExceptionText = true; 
goog.debug.HtmlFormatter.prototype.formatRecord = function(logRecord) { 
  var className; 
  switch(logRecord.getLevel().value) { 
    case goog.debug.Logger.Level.SHOUT.value: 
      className = 'dbg-sh'; 
      break; 

    case goog.debug.Logger.Level.SEVERE.value: 
      className = 'dbg-sev'; 
      break; 

    case goog.debug.Logger.Level.WARNING.value: 
      className = 'dbg-w'; 
      break; 

    case goog.debug.Logger.Level.INFO.value: 
      className = 'dbg-i'; 
      break; 

    case goog.debug.Logger.Level.FINE.value: 
    default: 
      className = 'dbg-f'; 
      break; 

  } 
  var sb =[]; 
  sb.push(this.prefix_, ' '); 
  if(this.showAbsoluteTime) { 
    sb.push('[', goog.debug.Formatter.getDateTimeStamp_(logRecord), '] '); 
  } 
  if(this.showRelativeTime) { 
    sb.push('[', goog.string.whitespaceEscape(goog.debug.Formatter.getRelativeTime_(logRecord, this.startTimeProvider_.get())), 's] '); 
  } 
  if(this.showLoggerName) { 
    sb.push('[', goog.string.htmlEscape(logRecord.getLoggerName()), '] '); 
  } 
  sb.push('<span class="', className, '">', goog.string.newLineToBr(goog.string.whitespaceEscape(goog.string.htmlEscape(logRecord.getMessage())))); 
  if(this.showExceptionText && logRecord.getException()) { 
    sb.push('<br>', goog.string.newLineToBr(goog.string.whitespaceEscape(logRecord.getExceptionText() || ''))); 
  } 
  sb.push('</span><br>'); 
  return sb.join(''); 
}; 
goog.debug.TextFormatter = function(opt_prefix) { 
  goog.debug.Formatter.call(this, opt_prefix); 
}; 
goog.inherits(goog.debug.TextFormatter, goog.debug.Formatter); 
goog.debug.TextFormatter.prototype.formatRecord = function(logRecord) { 
  var sb =[]; 
  sb.push(this.prefix_, ' '); 
  if(this.showAbsoluteTime) { 
    sb.push('[', goog.debug.Formatter.getDateTimeStamp_(logRecord), '] '); 
  } 
  if(this.showRelativeTime) { 
    sb.push('[', goog.debug.Formatter.getRelativeTime_(logRecord, this.startTimeProvider_.get()), 's] '); 
  } 
  if(this.showLoggerName) { 
    sb.push('[', logRecord.getLoggerName(), '] '); 
  } 
  if(this.showSeverityLevel) { 
    sb.push('[', logRecord.getLevel().name, '] '); 
  } 
  sb.push(logRecord.getMessage(), '\n'); 
  if(this.showExceptionText && logRecord.getException()) { 
    sb.push(logRecord.getExceptionText(), '\n'); 
  } 
  return sb.join(''); 
}; 
