
goog.provide('goog.i18n.DateTimeParse'); 
goog.require('goog.date.DateLike'); 
goog.require('goog.i18n.DateTimeFormat'); 
goog.require('goog.i18n.DateTimeSymbols'); 
goog.i18n.DateTimeParse = function(pattern) { 
  this.patternParts_ =[]; 
  if(typeof pattern == 'number') { 
    this.applyStandardPattern_(pattern); 
  } else { 
    this.applyPattern_(pattern); 
  } 
}; 
goog.i18n.DateTimeParse.ambiguousYearCenturyStart = 80; 
goog.i18n.DateTimeParse.prototype.applyPattern_ = function(pattern) { 
  var inQuote = false; 
  var buf = ''; 
  for(var i = 0; i < pattern.length; i ++) { 
    var ch = pattern.charAt(i); 
    if(ch == ' ') { 
      if(buf.length > 0) { 
        this.patternParts_.push({ 
          text: buf, 
          count: 0, 
          abutStart: false 
        }); 
        buf = ''; 
      } 
      this.patternParts_.push({ 
        text: ' ', 
        count: 0, 
        abutStart: false 
      }); 
      while(i < pattern.length - 1 && pattern.charAt(i + 1) == ' ') { 
        i ++; 
      } 
    } else if(inQuote) { 
      if(ch == '\'') { 
        if(i + 1 < pattern.length && pattern.charAt(i + 1) == '\'') { 
          buf += '\''; 
          i ++; 
        } else { 
          inQuote = false; 
        } 
      } else { 
        buf += ch; 
      } 
    } else if(goog.i18n.DateTimeParse.PATTERN_CHARS_.indexOf(ch) >= 0) { 
      if(buf.length > 0) { 
        this.patternParts_.push({ 
          text: buf, 
          count: 0, 
          abutStart: false 
        }); 
        buf = ''; 
      } 
      var count = this.getNextCharCount_(pattern, i); 
      this.patternParts_.push({ 
        text: ch, 
        count: count, 
        abutStart: false 
      }); 
      i += count - 1; 
    } else if(ch == '\'') { 
      if(i + 1 < pattern.length && pattern.charAt(i + 1) == '\'') { 
        buf += '\''; 
        i ++; 
      } else { 
        inQuote = true; 
      } 
    } else { 
      buf += ch; 
    } 
  } 
  if(buf.length > 0) { 
    this.patternParts_.push({ 
      text: buf, 
      count: 0, 
      abutStart: false 
    }); 
  } 
  this.markAbutStart_(); 
}; 
goog.i18n.DateTimeParse.prototype.applyStandardPattern_ = function(formatType) { 
  var pattern; 
  if(formatType > goog.i18n.DateTimeFormat.Format.SHORT_DATETIME) { 
    formatType = goog.i18n.DateTimeFormat.Format.MEDIUM_DATETIME; 
  } 
  if(formatType < 4) { 
    pattern = goog.i18n.DateTimeSymbols.DATEFORMATS[formatType]; 
  } else if(formatType < 8) { 
    pattern = goog.i18n.DateTimeSymbols.TIMEFORMATS[formatType - 4]; 
  } else { 
    pattern = goog.i18n.DateTimeSymbols.DATEFORMATS[formatType - 8]+ ' ' + goog.i18n.DateTimeSymbols.TIMEFORMATS[formatType - 8]; 
  } 
  this.applyPattern_(pattern); 
}; 
goog.i18n.DateTimeParse.prototype.parse = function(text, date, opt_start) { 
  var start = opt_start || 0; 
  return this.internalParse_(text, date, start, false); 
}; 
goog.i18n.DateTimeParse.prototype.strictParse = function(text, date, opt_start) { 
  var start = opt_start || 0; 
  return this.internalParse_(text, date, start, true); 
}; 
goog.i18n.DateTimeParse.prototype.internalParse_ = function(text, date, start, validation) { 
  var cal = new goog.i18n.DateTimeParse.MyDate_(); 
  var parsePos =[start]; 
  var abutPat = - 1; 
  var abutStart = 0; 
  var abutPass = 0; 
  for(var i = 0; i < this.patternParts_.length; i ++) { 
    if(this.patternParts_[i].count > 0) { 
      if(abutPat < 0 && this.patternParts_[i].abutStart) { 
        abutPat = i; 
        abutStart = start; 
        abutPass = 0; 
      } 
      if(abutPat >= 0) { 
        var count = this.patternParts_[i].count; 
        if(i == abutPat) { 
          count -= abutPass; 
          abutPass ++; 
          if(count == 0) { 
            return 0; 
          } 
        } 
        if(! this.subParse_(text, parsePos, this.patternParts_[i], count, cal)) { 
          i = abutPat - 1; 
          parsePos[0]= abutStart; 
          continue; 
        } 
      } else { 
        abutPat = - 1; 
        if(! this.subParse_(text, parsePos, this.patternParts_[i], 0, cal)) { 
          return 0; 
        } 
      } 
    } else { 
      abutPat = - 1; 
      if(this.patternParts_[i].text.charAt(0) == ' ') { 
        var s = parsePos[0]; 
        this.skipSpace_(text, parsePos); 
        if(parsePos[0]> s) { 
          continue; 
        } 
      } else if(text.indexOf(this.patternParts_[i].text, parsePos[0]) == parsePos[0]) { 
        parsePos[0]+= this.patternParts_[i].text.length; 
        continue; 
      } 
      return 0; 
    } 
  } 
  return cal.calcDate_(date, validation) ? parsePos[0]- start: 0; 
}; 
goog.i18n.DateTimeParse.prototype.getNextCharCount_ = function(pattern, start) { 
  var ch = pattern.charAt(start); 
  var next = start + 1; 
  while(next < pattern.length && pattern.charAt(next) == ch) { 
    next ++; 
  } 
  return next - start; 
}; 
goog.i18n.DateTimeParse.PATTERN_CHARS_ = 'GyMdkHmsSEDahKzZvQ'; 
goog.i18n.DateTimeParse.NUMERIC_FORMAT_CHARS_ = 'MydhHmsSDkK'; 
goog.i18n.DateTimeParse.prototype.isNumericField_ = function(part) { 
  if(part.count <= 0) { 
    return false; 
  } 
  var i = goog.i18n.DateTimeParse.NUMERIC_FORMAT_CHARS_.indexOf(part.text.charAt(0)); 
  return i > 0 || i == 0 && part.count < 3; 
}; 
goog.i18n.DateTimeParse.prototype.markAbutStart_ = function() { 
  var abut = false; 
  for(var i = 0; i < this.patternParts_.length; i ++) { 
    if(this.isNumericField_(this.patternParts_[i])) { 
      if(! abut && i + 1 < this.patternParts_.length && this.isNumericField_(this.patternParts_[i + 1])) { 
        abut = true; 
        this.patternParts_[i].abutStart = true; 
      } 
    } else { 
      abut = false; 
    } 
  } 
}; 
goog.i18n.DateTimeParse.prototype.skipSpace_ = function(text, pos) { 
  var m = text.substring(pos[0]).match(/^\s+/); 
  if(m) { 
    pos[0]+= m[0].length; 
  } 
}; 
goog.i18n.DateTimeParse.prototype.subParse_ = function(text, pos, part, digitCount, cal) { 
  this.skipSpace_(text, pos); 
  var start = pos[0]; 
  var ch = part.text.charAt(0); 
  var value = - 1; 
  if(this.isNumericField_(part)) { 
    if(digitCount > 0) { 
      if((start + digitCount) > text.length) { 
        return false; 
      } 
      value = this.parseInt_(text.substring(0, start + digitCount), pos); 
    } else { 
      value = this.parseInt_(text, pos); 
    } 
  } 
  switch(ch) { 
    case 'G': 
      cal.era = this.matchString_(text, pos, goog.i18n.DateTimeSymbols.ERAS); 
      return true; 

    case 'M': 
      return this.subParseMonth_(text, pos, cal, value); 

    case 'E': 
      return this.subParseDayOfWeek_(text, pos, cal); 

    case 'a': 
      cal.ampm = this.matchString_(text, pos, goog.i18n.DateTimeSymbols.AMPMS); 
      return true; 

    case 'y': 
      return this.subParseYear_(text, pos, start, value, part, cal); 

    case 'Q': 
      return this.subParseQuarter_(text, pos, cal, value); 

    case 'd': 
      cal.day = value; 
      return true; 

    case 'S': 
      return this.subParseFractionalSeconds_(value, pos, start, cal); 

    case 'h': 
      if(value == 12) { 
        value = 0; 
      } 

    case 'K': 
    case 'H': 
    case 'k': 
      cal.hours = value; 
      return true; 

    case 'm': 
      cal.minutes = value; 
      return true; 

    case 's': 
      cal.seconds = value; 
      return true; 

    case 'z': 
    case 'Z': 
    case 'v': 
      return this.subparseTimeZoneInGMT_(text, pos, cal); 

    default: 
      return false; 

  } 
}; 
goog.i18n.DateTimeParse.prototype.subParseYear_ = function(text, pos, start, value, part, cal) { 
  var ch; 
  if(value < 0) { 
    ch = text.charAt(pos[0]); 
    if(ch != '+' && ch != '-') { 
      return false; 
    } 
    pos[0]++; 
    value = this.parseInt_(text, pos); 
    if(value < 0) { 
      return false; 
    } 
    if(ch == '-') { 
      value = - value; 
    } 
  } 
  if(! ch && pos[0]- start == 2 && part.count == 2) { 
    cal.setTwoDigitYear_(value); 
  } else { 
    cal.year = value; 
  } 
  return true; 
}; 
goog.i18n.DateTimeParse.prototype.subParseMonth_ = function(text, pos, cal, value) { 
  if(value < 0) { 
    value = this.matchString_(text, pos, goog.i18n.DateTimeSymbols.MONTHS); 
    if(value < 0) { 
      value = this.matchString_(text, pos, goog.i18n.DateTimeSymbols.SHORTMONTHS); 
    } 
    if(value < 0) { 
      return false; 
    } 
    cal.month = value; 
    return true; 
  } else { 
    cal.month = value - 1; 
    return true; 
  } 
}; 
goog.i18n.DateTimeParse.prototype.subParseQuarter_ = function(text, pos, cal, value) { 
  if(value < 0) { 
    value = this.matchString_(text, pos, goog.i18n.DateTimeSymbols.QUARTERS); 
    if(value < 0) { 
      value = this.matchString_(text, pos, goog.i18n.DateTimeSymbols.SHORTQUARTERS); 
    } 
    if(value < 0) { 
      return false; 
    } 
    cal.month = value * 3; 
    cal.day = 1; 
    return true; 
  } 
  return false; 
}; 
goog.i18n.DateTimeParse.prototype.subParseDayOfWeek_ = function(text, pos, cal) { 
  var value = this.matchString_(text, pos, goog.i18n.DateTimeSymbols.WEEKDAYS); 
  if(value < 0) { 
    value = this.matchString_(text, pos, goog.i18n.DateTimeSymbols.SHORTWEEKDAYS); 
  } 
  if(value < 0) { 
    return false; 
  } 
  cal.dayOfWeek = value; 
  return true; 
}; 
goog.i18n.DateTimeParse.prototype.subParseFractionalSeconds_ = function(value, pos, start, cal) { 
  var len = pos[0]- start; 
  cal.milliseconds = len < 3 ? value * Math.pow(10, 3 - len): Math.round(value / Math.pow(10, len - 3)); 
  return true; 
}; 
goog.i18n.DateTimeParse.prototype.subparseTimeZoneInGMT_ = function(text, pos, cal) { 
  if(text.indexOf('GMT', pos[0]) == pos[0]) { 
    pos[0]+= 3; 
    return this.parseTimeZoneOffset_(text, pos, cal); 
  } 
  return this.parseTimeZoneOffset_(text, pos, cal); 
}; 
goog.i18n.DateTimeParse.prototype.parseTimeZoneOffset_ = function(text, pos, cal) { 
  if(pos[0]>= text.length) { 
    cal.tzOffset = 0; 
    return true; 
  } 
  var sign = 1; 
  switch(text.charAt(pos[0])) { 
    case '-': 
      sign = - 1; 

    case '+': 
      pos[0]++; 

  } 
  var st = pos[0]; 
  var value = this.parseInt_(text, pos); 
  if(value == 0 && pos[0]== st) { 
    return false; 
  } 
  var offset; 
  if(pos[0]< text.length && text.charAt(pos[0]) == ':') { 
    offset = value * 60; 
    pos[0]++; 
    st = pos[0]; 
    value = this.parseInt_(text, pos); 
    if(value == 0 && pos[0]== st) { 
      return false; 
    } 
    offset += value; 
  } else { 
    offset = value; 
    if(offset < 24 &&(pos[0]- st) <= 2) { 
      offset *= 60; 
    } else { 
      offset = offset % 100 + offset / 100 * 60; 
    } 
  } 
  offset *= sign; 
  cal.tzOffset = - offset; 
  return true; 
}; 
goog.i18n.DateTimeParse.prototype.parseInt_ = function(text, pos) { 
  var m = text.substring(pos[0]).match(/^\d+/); 
  if(! m) { 
    return - 1; 
  } 
  pos[0]+= m[0].length; 
  return parseInt(m[0], 10); 
}; 
goog.i18n.DateTimeParse.prototype.matchString_ = function(text, pos, data) { 
  var bestMatchLength = 0; 
  var bestMatch = - 1; 
  var lower_text = text.substring(pos[0]).toLowerCase(); 
  for(var i = 0; i < data.length; i ++) { 
    var len = data[i].length; 
    if(len > bestMatchLength && lower_text.indexOf(data[i].toLowerCase()) == 0) { 
      bestMatch = i; 
      bestMatchLength = len; 
    } 
  } 
  if(bestMatch >= 0) { 
    pos[0]+= bestMatchLength; 
  } 
  return bestMatch; 
}; 
goog.i18n.DateTimeParse.MyDate_ = function() { }; 
goog.i18n.DateTimeParse.MyDate_.prototype.era; 
goog.i18n.DateTimeParse.MyDate_.prototype.year; 
goog.i18n.DateTimeParse.MyDate_.prototype.month; 
goog.i18n.DateTimeParse.MyDate_.prototype.day; 
goog.i18n.DateTimeParse.MyDate_.prototype.hours; 
goog.i18n.DateTimeParse.MyDate_.prototype.ampm; 
goog.i18n.DateTimeParse.MyDate_.prototype.minutes; 
goog.i18n.DateTimeParse.MyDate_.prototype.seconds; 
goog.i18n.DateTimeParse.MyDate_.prototype.milliseconds; 
goog.i18n.DateTimeParse.MyDate_.prototype.tzOffset; 
goog.i18n.DateTimeParse.MyDate_.prototype.dayOfWeek; 
goog.i18n.DateTimeParse.MyDate_.prototype.setTwoDigitYear_ = function(year) { 
  var now = new Date(); 
  var defaultCenturyStartYear = now.getFullYear() - goog.i18n.DateTimeParse.ambiguousYearCenturyStart; 
  var ambiguousTwoDigitYear = defaultCenturyStartYear % 100; 
  this.ambiguousYear =(year == ambiguousTwoDigitYear); 
  year += Math.floor(defaultCenturyStartYear / 100) * 100 +(year < ambiguousTwoDigitYear ? 100: 0); 
  return this.year = year; 
}; 
goog.i18n.DateTimeParse.MyDate_.prototype.calcDate_ = function(date, validation) { 
  if(this.era != undefined && this.year != undefined && this.era == 0 && this.year > 0) { 
    this.year = -(this.year - 1); 
  } 
  if(this.year != undefined) { 
    date.setFullYear(this.year); 
  } 
  var orgDate = date.getDate(); 
  date.setDate(1); 
  if(this.month != undefined) { 
    date.setMonth(this.month); 
  } 
  if(this.day != undefined) { 
    date.setDate(this.day); 
  } else { 
    date.setDate(orgDate); 
  } 
  if(goog.isFunction(date.setHours)) { 
    if(this.hours == undefined) { 
      this.hours = date.getHours(); 
    } 
    if(this.ampm != undefined && this.ampm > 0 && this.hours < 12) { 
      this.hours += 12; 
    } 
    date.setHours(this.hours); 
  } 
  if(goog.isFunction(date.setMinutes) && this.minutes != undefined) { 
    date.setMinutes(this.minutes); 
  } 
  if(goog.isFunction(date.setSeconds) && this.seconds != undefined) { 
    date.setSeconds(this.seconds); 
  } 
  if(goog.isFunction(date.setMilliseconds) && this.milliseconds != undefined) { 
    date.setMilliseconds(this.milliseconds); 
  } 
  if(validation &&(this.year != undefined && this.year != date.getFullYear() || this.month != undefined && this.month != date.getMonth() || this.day != undefined && this.day != date.getDate() || this.hours >= 24 || this.minutes >= 60 || this.seconds >= 60 || this.milliseconds >= 1000)) { 
    return false; 
  } 
  if(this.tzOffset != undefined) { 
    var offset = date.getTimezoneOffset(); 
    date.setTime(date.getTime() +(this.tzOffset - offset) * 60 * 1000); 
  } 
  if(this.ambiguousYear) { 
    var defaultCenturyStart = new Date(); 
    defaultCenturyStart.setFullYear(defaultCenturyStart.getFullYear() - goog.i18n.DateTimeParse.ambiguousYearCenturyStart); 
    if(date.getTime() < defaultCenturyStart.getTime()) { 
      date.setFullYear(defaultCenturyStart.getFullYear() + 100); 
    } 
  } 
  if(this.dayOfWeek != undefined) { 
    if(this.day == undefined) { 
      var adjustment =(7 + this.dayOfWeek - date.getDay()) % 7; 
      if(adjustment > 3) { 
        adjustment -= 7; 
      } 
      var orgMonth = date.getMonth(); 
      date.setDate(date.getDate() + adjustment); 
      if(date.getMonth() != orgMonth) { 
        date.setDate(date.getDate() +(adjustment > 0 ? - 7: 7)); 
      } 
    } else if(this.dayOfWeek != date.getDay()) { 
      return false; 
    } 
  } 
  return true; 
}; 
