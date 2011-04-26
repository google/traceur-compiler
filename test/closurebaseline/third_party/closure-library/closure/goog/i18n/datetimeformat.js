
goog.provide('goog.i18n.DateTimeFormat'); 
goog.provide('goog.i18n.DateTimeFormat.Format'); 
goog.require('goog.asserts'); 
goog.require('goog.date.DateLike'); 
goog.require('goog.i18n.DateTimeSymbols'); 
goog.require('goog.i18n.TimeZone'); 
goog.require('goog.string'); 
goog.i18n.DateTimeFormat = function(pattern) { 
  goog.asserts.assert(goog.isDef(pattern), 'Pattern must be defined'); 
  this.patternParts_ =[]; 
  if(typeof pattern == 'number') { 
    this.applyStandardPattern_(pattern); 
  } else { 
    this.applyPattern_(pattern); 
  } 
}; 
goog.i18n.DateTimeFormat.Format = { 
  FULL_DATE: 0, 
  LONG_DATE: 1, 
  MEDIUM_DATE: 2, 
  SHORT_DATE: 3, 
  FULL_TIME: 4, 
  LONG_TIME: 5, 
  MEDIUM_TIME: 6, 
  SHORT_TIME: 7, 
  FULL_DATETIME: 8, 
  LONG_DATETIME: 9, 
  MEDIUM_DATETIME: 10, 
  SHORT_DATETIME: 11 
}; 
goog.i18n.DateTimeFormat.TOKENS_ =[/^\'(?:[^\']|\'\')*\'/, /^(?:G+|y+|M+|k+|S+|E+|a+|h+|K+|H+|c+|L+|Q+|d+|m+|s+|v+|z+|Z+)/, /^[^\'GyMkSEahKHcLQdmsvzZ]+/]; 
goog.i18n.DateTimeFormat.PartTypes_ = { 
  QUOTED_STRING: 0, 
  FIELD: 1, 
  LITERAL: 2 
}; 
goog.i18n.DateTimeFormat.prototype.applyPattern_ = function(pattern) { 
  while(pattern) { 
    for(var i = 0; i < goog.i18n.DateTimeFormat.TOKENS_.length; ++ i) { 
      var m = pattern.match(goog.i18n.DateTimeFormat.TOKENS_[i]); 
      if(m) { 
        var part = m[0]; 
        pattern = pattern.substring(part.length); 
        if(i == goog.i18n.DateTimeFormat.PartTypes_.QUOTED_STRING) { 
          if(part == "''") { 
            part = "'"; 
          } else { 
            part = part.substring(1, part.length - 1); 
            part = part.replace(/\'\'/, "'"); 
          } 
        } 
        this.patternParts_.push({ 
          text: part, 
          type: i 
        }); 
        break; 
      } 
    } 
  } 
}; 
goog.i18n.DateTimeFormat.prototype.format = function(date, opt_timeZone) { 
  var diff = opt_timeZone ?(date.getTimezoneOffset() - opt_timeZone.getOffset(date)) * 60000: 0; 
  var dateForDate = diff ? new Date(date.getTime() + diff): date; 
  var dateForTime = dateForDate; 
  if(opt_timeZone && dateForDate.getTimezoneOffset() != date.getTimezoneOffset()) { 
    diff += diff > 0 ? - 24 * 60 * 60000: 24 * 60 * 60000; 
    dateForTime = new Date(date.getTime() + diff); 
  } 
  var out =[]; 
  for(var i = 0; i < this.patternParts_.length; ++ i) { 
    var text = this.patternParts_[i].text; 
    if(goog.i18n.DateTimeFormat.PartTypes_.FIELD == this.patternParts_[i].type) { 
      out.push(this.formatField_(text, date, dateForDate, dateForTime, opt_timeZone)); 
    } else { 
      out.push(text); 
    } 
  } 
  return out.join(''); 
}; 
goog.i18n.DateTimeFormat.prototype.applyStandardPattern_ = function(formatType) { 
  var pattern; 
  if(formatType < 4) { 
    pattern = goog.i18n.DateTimeSymbols.DATEFORMATS[formatType]; 
  } else if(formatType < 8) { 
    pattern = goog.i18n.DateTimeSymbols.TIMEFORMATS[formatType - 4]; 
  } else if(formatType < 12) { 
    pattern = goog.i18n.DateTimeSymbols.DATEFORMATS[formatType - 8]+ ' ' + goog.i18n.DateTimeSymbols.TIMEFORMATS[formatType - 8]; 
  } else { 
    this.applyStandardPattern_(goog.i18n.DateTimeFormat.Format.MEDIUM_DATETIME); 
    return; 
  } 
  this.applyPattern_(pattern); 
}; 
goog.i18n.DateTimeFormat.prototype.formatEra_ = function(count, date) { 
  var value = date.getFullYear() > 0 ? 1: 0; 
  return count >= 4 ? goog.i18n.DateTimeSymbols.ERANAMES[value]: goog.i18n.DateTimeSymbols.ERAS[value]; 
}; 
goog.i18n.DateTimeFormat.prototype.formatYear_ = function(count, date) { 
  var value = date.getFullYear(); 
  if(value < 0) { 
    value = - value; 
  } 
  return count == 2 ? goog.string.padNumber(value % 100, 2): String(value); 
}; 
goog.i18n.DateTimeFormat.prototype.formatMonth_ = function(count, date) { 
  var value = date.getMonth(); 
  switch(count) { 
    case 5: 
      return goog.i18n.DateTimeSymbols.NARROWMONTHS[value]; 

    case 4: 
      return goog.i18n.DateTimeSymbols.MONTHS[value]; 

    case 3: 
      return goog.i18n.DateTimeSymbols.SHORTMONTHS[value]; 

    default: 
      return goog.string.padNumber(value + 1, count); 

  } 
}; 
goog.i18n.DateTimeFormat.prototype.format24Hours_ = function(count, date) { 
  return goog.string.padNumber(date.getHours() || 24, count); 
}; 
goog.i18n.DateTimeFormat.prototype.formatFractionalSeconds_ = function(count, date) { 
  var value = date.getTime() % 1000 / 1000; 
  return value.toFixed(Math.min(3, count)).substr(2) +(count > 3 ? goog.string.padNumber(0, count - 3): ''); 
}; 
goog.i18n.DateTimeFormat.prototype.formatDayOfWeek_ = function(count, date) { 
  var value = date.getDay(); 
  return count >= 4 ? goog.i18n.DateTimeSymbols.WEEKDAYS[value]: goog.i18n.DateTimeSymbols.SHORTWEEKDAYS[value]; 
}; 
goog.i18n.DateTimeFormat.prototype.formatAmPm_ = function(count, date) { 
  var hours = date.getHours(); 
  return goog.i18n.DateTimeSymbols.AMPMS[hours >= 12 && hours < 24 ? 1: 0]; 
}; 
goog.i18n.DateTimeFormat.prototype.format1To12Hours_ = function(count, date) { 
  return goog.string.padNumber(date.getHours() % 12 || 12, count); 
}; 
goog.i18n.DateTimeFormat.prototype.format0To11Hours_ = function(count, date) { 
  return goog.string.padNumber(date.getHours() % 12, count); 
}; 
goog.i18n.DateTimeFormat.prototype.format0To23Hours_ = function(count, date) { 
  return goog.string.padNumber(date.getHours(), count); 
}; 
goog.i18n.DateTimeFormat.prototype.formatStandaloneDay_ = function(count, date) { 
  var value = date.getDay(); 
  switch(count) { 
    case 5: 
      return goog.i18n.DateTimeSymbols.STANDALONENARROWWEEKDAYS[value]; 

    case 4: 
      return goog.i18n.DateTimeSymbols.STANDALONEWEEKDAYS[value]; 

    case 3: 
      return goog.i18n.DateTimeSymbols.STANDALONESHORTWEEKDAYS[value]; 

    default: 
      return goog.string.padNumber(value, 1); 

  } 
}; 
goog.i18n.DateTimeFormat.prototype.formatStandaloneMonth_ = function(count, date) { 
  var value = date.getMonth(); 
  switch(count) { 
    case 5: 
      return goog.i18n.DateTimeSymbols.STANDALONENARROWMONTHS[value]; 

    case 4: 
      return goog.i18n.DateTimeSymbols.STANDALONEMONTHS[value]; 

    case 3: 
      return goog.i18n.DateTimeSymbols.STANDALONESHORTMONTHS[value]; 

    default: 
      return goog.string.padNumber(value + 1, count); 

  } 
}; 
goog.i18n.DateTimeFormat.prototype.formatQuarter_ = function(count, date) { 
  var value = Math.floor(date.getMonth() / 3); 
  return count < 4 ? goog.i18n.DateTimeSymbols.SHORTQUARTERS[value]: goog.i18n.DateTimeSymbols.QUARTERS[value]; 
}; 
goog.i18n.DateTimeFormat.prototype.formatDate_ = function(count, date) { 
  return goog.string.padNumber(date.getDate(), count); 
}; 
goog.i18n.DateTimeFormat.prototype.formatMinutes_ = function(count, date) { 
  return goog.string.padNumber(date.getMinutes(), count); 
}; 
goog.i18n.DateTimeFormat.prototype.formatSeconds_ = function(count, date) { 
  return goog.string.padNumber(date.getSeconds(), count); 
}; 
goog.i18n.DateTimeFormat.prototype.formatTimeZoneRFC_ = function(count, date, opt_timeZone) { 
  opt_timeZone = opt_timeZone || goog.i18n.TimeZone.createTimeZone(date.getTimezoneOffset()); 
  return count < 4 ? opt_timeZone.getRFCTimeZoneString(date): opt_timeZone.getGMTString(date); 
}; 
goog.i18n.DateTimeFormat.prototype.formatTimeZone_ = function(count, date, opt_timeZone) { 
  opt_timeZone = opt_timeZone || goog.i18n.TimeZone.createTimeZone(date.getTimezoneOffset()); 
  return count < 4 ? opt_timeZone.getShortName(date): opt_timeZone.getLongName(date); 
}; 
goog.i18n.DateTimeFormat.prototype.formatTimeZoneId_ = function(date, opt_timeZone) { 
  opt_timeZone = opt_timeZone || goog.i18n.TimeZone.createTimeZone(date.getTimezoneOffset()); 
  return opt_timeZone.getTimeZoneId(); 
}; 
goog.i18n.DateTimeFormat.prototype.formatField_ = function(patternStr, date, dateForDate, dateForTime, opt_timeZone) { 
  var count = patternStr.length; 
  switch(patternStr.charAt(0)) { 
    case 'G': 
      return this.formatEra_(count, dateForDate); 

    case 'y': 
      return this.formatYear_(count, dateForDate); 

    case 'M': 
      return this.formatMonth_(count, dateForDate); 

    case 'k': 
      return this.format24Hours_(count, dateForTime); 

    case 'S': 
      return this.formatFractionalSeconds_(count, dateForTime); 

    case 'E': 
      return this.formatDayOfWeek_(count, dateForDate); 

    case 'a': 
      return this.formatAmPm_(count, dateForTime); 

    case 'h': 
      return this.format1To12Hours_(count, dateForTime); 

    case 'K': 
      return this.format0To11Hours_(count, dateForTime); 

    case 'H': 
      return this.format0To23Hours_(count, dateForTime); 

    case 'c': 
      return this.formatStandaloneDay_(count, dateForDate); 

    case 'L': 
      return this.formatStandaloneMonth_(count, dateForDate); 

    case 'Q': 
      return this.formatQuarter_(count, dateForDate); 

    case 'd': 
      return this.formatDate_(count, dateForDate); 

    case 'm': 
      return this.formatMinutes_(count, dateForTime); 

    case 's': 
      return this.formatSeconds_(count, dateForTime); 

    case 'v': 
      return this.formatTimeZoneId_(date, opt_timeZone); 

    case 'z': 
      return this.formatTimeZone_(count, date, opt_timeZone); 

    case 'Z': 
      return this.formatTimeZoneRFC_(count, date, opt_timeZone); 

    default: 
      return ''; 

  } 
}; 
