
goog.provide('goog.format'); 
goog.require('goog.i18n.GraphemeBreak'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.format.fileSize = function(bytes, opt_decimals) { 
  return goog.format.numBytesToString(bytes, opt_decimals, false); 
}; 
goog.format.isConvertableScaledNumber = function(val) { 
  return goog.format.SCALED_NUMERIC_RE_.test(val); 
}; 
goog.format.stringToNumericValue = function(stringValue) { 
  if(goog.string.endsWith(stringValue, 'B')) { 
    return goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_BINARY_); 
  } 
  return goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_SI_); 
}; 
goog.format.stringToNumBytes = function(stringValue) { 
  return goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_BINARY_); 
}; 
goog.format.numericValueToString = function(val, opt_decimals) { 
  return goog.format.numericValueToString_(val, goog.format.NUMERIC_SCALES_SI_, opt_decimals); 
}; 
goog.format.numBytesToString = function(val, opt_decimals, opt_suffix) { 
  var suffix = ''; 
  if(! goog.isDef(opt_suffix) || opt_suffix) { 
    suffix = 'B'; 
  } 
  return goog.format.numericValueToString_(val, goog.format.NUMERIC_SCALES_BINARY_, opt_decimals, suffix); 
}; 
goog.format.stringToNumericValue_ = function(stringValue, conversion) { 
  var match = stringValue.match(goog.format.SCALED_NUMERIC_RE_); 
  if(! match) { 
    return NaN; 
  } 
  var val = match[1]* conversion[match[2]]; 
  return val; 
}; 
goog.format.numericValueToString_ = function(val, conversion, opt_decimals, opt_suffix) { 
  var prefixes = goog.format.NUMERIC_SCALE_PREFIXES_; 
  var orig_val = val; 
  var symbol = ''; 
  var scale = 1; 
  if(val < 0) { 
    val = - val; 
  } 
  for(var i = 0; i < prefixes.length; i ++) { 
    var unit = prefixes[i]; 
    scale = conversion[unit]; 
    if(val >= scale ||(scale <= 1 && val > 0.1 * scale)) { 
      symbol = unit; 
      break; 
    } 
  } 
  if(! symbol) { 
    scale = 1; 
  } else if(opt_suffix) { 
    symbol += opt_suffix; 
  } 
  var ex = Math.pow(10, goog.isDef(opt_decimals) ? opt_decimals: 2); 
  return Math.round(orig_val / scale * ex) / ex + symbol; 
}; 
goog.format.SCALED_NUMERIC_RE_ = /^([-]?\d+\.?\d*)([K,M,G,T,P,k,m,u,n]?)[B]?$/; 
goog.format.NUMERIC_SCALE_PREFIXES_ =['P', 'T', 'G', 'M', 'K', '', 'm', 'u', 'n']; 
goog.format.NUMERIC_SCALES_SI_ = { 
  '': 1, 
  'n': 1e-9, 
  'u': 1e-6, 
  'm': 1e-3, 
  'k': 1e3, 
  'K': 1e3, 
  'M': 1e6, 
  'G': 1e9, 
  'T': 1e12, 
  'P': 1e15 
}; 
goog.format.NUMERIC_SCALES_BINARY_ = { 
  '': 1, 
  'n': Math.pow(1024, - 3), 
  'u': Math.pow(1024, - 2), 
  'm': 1.0 / 1024, 
  'k': 1024, 
  'K': 1024, 
  'M': Math.pow(1024, 2), 
  'G': Math.pow(1024, 3), 
  'T': Math.pow(1024, 4), 
  'P': Math.pow(1024, 5) 
}; 
goog.format.FIRST_GRAPHEME_EXTEND_ = 0x300; 
goog.format.insertWordBreaksGeneric_ = function(str, hasGraphemeBreak, opt_maxlen) { 
  var maxlen = opt_maxlen || 10; 
  if(maxlen > str.length) return str; 
  var rv =[]; 
  var n = 0; 
  var nestingCharCode = 0; 
  var lastDumpPosition = 0; 
  var charCode = 0; 
  for(var i = 0; i < str.length; i ++) { 
    var lastCharCode = charCode; 
    charCode = str.charCodeAt(i); 
    var isPotentiallyGraphemeExtending = charCode >= goog.format.FIRST_GRAPHEME_EXTEND_ && ! hasGraphemeBreak(lastCharCode, charCode, true); 
    if(n >= maxlen && charCode > goog.format.WbrToken_.SPACE && ! isPotentiallyGraphemeExtending) { 
      rv.push(str.substring(lastDumpPosition, i), goog.format.WORD_BREAK_HTML); 
      lastDumpPosition = i; 
      n = 0; 
    } 
    if(! nestingCharCode) { 
      if(charCode == goog.format.WbrToken_.LT || charCode == goog.format.WbrToken_.AMP) { 
        nestingCharCode = charCode; 
      } else if(charCode <= goog.format.WbrToken_.SPACE) { 
        n = 0; 
      } else { 
        n ++; 
      } 
    } else if(charCode == goog.format.WbrToken_.GT && nestingCharCode == goog.format.WbrToken_.LT) { 
      nestingCharCode = 0; 
    } else if(charCode == goog.format.WbrToken_.SEMI_COLON && nestingCharCode == goog.format.WbrToken_.AMP) { 
      nestingCharCode = 0; 
      n ++; 
    } 
  } 
  rv.push(str.substr(lastDumpPosition)); 
  return rv.join(''); 
}; 
goog.format.insertWordBreaks = function(str, opt_maxlen) { 
  return goog.format.insertWordBreaksGeneric_(str, goog.i18n.GraphemeBreak.hasGraphemeBreak, opt_maxlen); 
}; 
goog.format.conservativelyHasGraphemeBreak_ = function(lastCharCode, charCode, opt_extended) { 
  return charCode >= 0x400 && charCode < 0x523; 
}; 
goog.format.insertWordBreaksBasic = function(str, opt_maxlen) { 
  return goog.format.insertWordBreaksGeneric_(str, goog.format.conservativelyHasGraphemeBreak_, opt_maxlen); 
}; 
goog.format.IS_IE8_OR_ABOVE_ = goog.userAgent.IE && goog.userAgent.isVersion(8); 
goog.format.WORD_BREAK_HTML = goog.userAgent.WEBKIT ? '<wbr></wbr>': goog.userAgent.OPERA ? '&shy;': goog.format.IS_IE8_OR_ABOVE_ ? '&#8203;': '<wbr>'; 
goog.format.WbrToken_ = { 
  LT: 60, 
  GT: 62, 
  AMP: 38, 
  SEMI_COLON: 59, 
  SPACE: 32 
}; 
