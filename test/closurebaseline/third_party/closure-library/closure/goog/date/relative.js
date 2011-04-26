
goog.provide('goog.date.relative'); 
goog.require('goog.i18n.DateTimeFormat'); 
goog.date.relative.MINUTE_MS_ = 60000; 
goog.date.relative.DAY_MS_ = 86400000; 
goog.date.relative.Unit_ = { 
  MINUTES: 0, 
  HOURS: 1, 
  DAYS: 2 
}; 
goog.date.relative.fullDateFormatter_; 
goog.date.relative.shortTimeFormatter_; 
goog.date.relative.monthDateFormatter_; 
goog.date.relative.formatMonth_ = function(date) { 
  if(! goog.date.relative.monthDateFormatter_) { 
    goog.date.relative.monthDateFormatter_ = new goog.i18n.DateTimeFormat('MMM dd'); 
  } 
  return goog.date.relative.monthDateFormatter_.format(date); 
}; 
goog.date.relative.formatShortTime_ = function(date) { 
  if(! goog.date.relative.shortTimeFormatter_) { 
    goog.date.relative.shortTimeFormatter_ = new goog.i18n.DateTimeFormat(goog.i18n.DateTimeFormat.Format.SHORT_TIME); 
  } 
  return goog.date.relative.shortTimeFormatter_.format(date); 
}; 
goog.date.relative.formatFullDate_ = function(date) { 
  if(! goog.date.relative.fullDateFormatter_) { 
    goog.date.relative.fullDateFormatter_ = new goog.i18n.DateTimeFormat(goog.i18n.DateTimeFormat.Format.FULL_DATE); 
  } 
  return goog.date.relative.fullDateFormatter_.format(date); 
}; 
goog.date.relative.format = function(dateMs) { 
  var now = goog.now(); 
  var delta = Math.floor((now - dateMs) / goog.date.relative.MINUTE_MS_); 
  var future = false; 
  if(delta < 0) { 
    future = true; 
    delta *= - 1; 
  } 
  if(delta < 60) { 
    return goog.date.relative.getMessage_(delta, future, goog.date.relative.Unit_.MINUTES); 
  } else { 
    delta = Math.floor(delta / 60); 
    if(delta < 24) { 
      return goog.date.relative.getMessage_(delta, future, goog.date.relative.Unit_.HOURS); 
    } else { 
      var offset = new Date(goog.now()).getTimezoneOffset() * goog.date.relative.MINUTE_MS_; 
      delta = Math.floor((now + offset) / goog.date.relative.DAY_MS_) - Math.floor((dateMs + offset) / goog.date.relative.DAY_MS_); 
      if(future) { 
        delta *= - 1; 
      } 
      if(delta < 14) { 
        return goog.date.relative.getMessage_(delta, future, goog.date.relative.Unit_.DAYS); 
      } else { 
        return ''; 
      } 
    } 
  } 
}; 
goog.date.relative.formatPast = function(dateMs) { 
  var now = goog.now(); 
  if(now < dateMs) { 
    dateMs = now; 
  } 
  return goog.date.relative.format(dateMs); 
}; 
goog.date.relative.formatDay = function(dateMs) { 
  var message; 
  var today = new Date(goog.now()); 
  today.setHours(0); 
  today.setMinutes(0); 
  today.setSeconds(0); 
  today.setMilliseconds(0); 
  var yesterday = new Date(today.getTime() - goog.date.relative.DAY_MS_); 
  if(today.getTime() < dateMs) { 
    var MSG_TODAY = goog.getMsg('Today'); 
    message = MSG_TODAY; 
  } else if(yesterday.getTime() < dateMs) { 
    var MSG_YESTERDAY = goog.getMsg('Yesterday'); 
    message = MSG_YESTERDAY; 
  } else { 
    message = goog.date.relative.formatMonth_(new Date(dateMs)); 
  } 
  return message; 
}; 
goog.date.relative.getDateString = function(date, opt_shortTimeMsg, opt_fullDateMsg) { 
  return goog.date.relative.getDateString_(date, goog.date.relative.format, opt_shortTimeMsg, opt_fullDateMsg); 
}; 
goog.date.relative.getPastDateString = function(date, opt_shortTimeMsg, opt_fullDateMsg) { 
  return goog.date.relative.getDateString_(date, goog.date.relative.formatPast, opt_shortTimeMsg, opt_fullDateMsg); 
}; 
goog.date.relative.getDateString_ = function(date, relativeFormatter, opt_shortTimeMsg, opt_fullDateMsg) { 
  var dateMs = date.getTime(); 
  var relativeDate = relativeFormatter(dateMs); 
  if(relativeDate) { 
    relativeDate = ' (' + relativeDate + ')'; 
  } 
  var delta = Math.floor((goog.now() - dateMs) / goog.date.relative.MINUTE_MS_); 
  if(delta < 60 * 24) { 
    return(opt_shortTimeMsg || goog.date.relative.formatShortTime_(date)) + relativeDate; 
  } else { 
    return(opt_fullDateMsg || goog.date.relative.formatFullDate_(date)) + relativeDate; 
  } 
}; 
goog.date.relative.getMessage_ = function(delta, future, unit) { 
  if(! future && unit == goog.date.relative.Unit_.MINUTES) { 
    var MSG_MINUTES_AGO_SINGULAR = goog.getMsg('{$num} minute ago', { 'num': delta }); 
    var MSG_MINUTES_AGO_PLURAL = goog.getMsg('{$num} minutes ago', { 'num': delta }); 
    return delta == 1 ? MSG_MINUTES_AGO_SINGULAR: MSG_MINUTES_AGO_PLURAL; 
  } else if(future && unit == goog.date.relative.Unit_.MINUTES) { 
    var MSG_IN_MINUTES_SINGULAR = goog.getMsg('in {$num} minute', { 'num': delta }); 
    var MSG_IN_MINUTES_PLURAL = goog.getMsg('in {$num} minutes', { 'num': delta }); 
    return delta == 1 ? MSG_IN_MINUTES_SINGULAR: MSG_IN_MINUTES_PLURAL; 
  } else if(! future && unit == goog.date.relative.Unit_.HOURS) { 
    var MSG_HOURS_AGO_SINGULAR = goog.getMsg('{$num} hour ago', { 'num': delta }); 
    var MSG_HOURS_AGO_PLURAL = goog.getMsg('{$num} hours ago', { 'num': delta }); 
    return delta == 1 ? MSG_HOURS_AGO_SINGULAR: MSG_HOURS_AGO_PLURAL; 
  } else if(future && unit == goog.date.relative.Unit_.HOURS) { 
    var MSG_IN_HOURS_SINGULAR = goog.getMsg('in {$num} hour', { 'num': delta }); 
    var MSG_IN_HOURS_PLURAL = goog.getMsg('in {$num} hours', { 'num': delta }); 
    return delta == 1 ? MSG_IN_HOURS_SINGULAR: MSG_IN_HOURS_PLURAL; 
  } else if(! future && unit == goog.date.relative.Unit_.DAYS) { 
    var MSG_DAYS_AGO_SINGULAR = goog.getMsg('{$num} day ago', { 'num': delta }); 
    var MSG_DAYS_AGO_PLURAL = goog.getMsg('{$num} days ago', { 'num': delta }); 
    return delta == 1 ? MSG_DAYS_AGO_SINGULAR: MSG_DAYS_AGO_PLURAL; 
  } else if(future && unit == goog.date.relative.Unit_.DAYS) { 
    var MSG_IN_DAYS_SINGULAR = goog.getMsg('in {$num} day', { 'num': delta }); 
    var MSG_IN_DAYS_PLURAL = goog.getMsg('in {$num} days', { 'num': delta }); 
    return delta == 1 ? MSG_IN_DAYS_SINGULAR: MSG_IN_DAYS_PLURAL; 
  } else { 
    return ''; 
  } 
}; 
