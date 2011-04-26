
goog.provide('goog.string'); 
goog.provide('goog.string.Unicode'); 
goog.string.Unicode = { NBSP: '\xa0' }; 
goog.string.startsWith = function(str, prefix) { 
  return str.lastIndexOf(prefix, 0) == 0; 
}; 
goog.string.endsWith = function(str, suffix) { 
  var l = str.length - suffix.length; 
  return l >= 0 && str.indexOf(suffix, l) == l; 
}; 
goog.string.caseInsensitiveStartsWith = function(str, prefix) { 
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0; 
}; 
goog.string.caseInsensitiveEndsWith = function(str, suffix) { 
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0; 
}; 
goog.string.subs = function(str, var_args) { 
  for(var i = 1; i < arguments.length; i ++) { 
    var replacement = String(arguments[i]).replace(/\$/g, '$$$$'); 
    str = str.replace(/\%s/, replacement); 
  } 
  return str; 
}; 
goog.string.collapseWhitespace = function(str) { 
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, ''); 
}; 
goog.string.isEmpty = function(str) { 
  return /^[\s\xa0]*$/.test(str); 
}; 
goog.string.isEmptySafe = function(str) { 
  return goog.string.isEmpty(goog.string.makeSafe(str)); 
}; 
goog.string.isBreakingWhitespace = function(str) { 
  return ! /[^\t\n\r ]/.test(str); 
}; 
goog.string.isAlpha = function(str) { 
  return ! /[^a-zA-Z]/.test(str); 
}; 
goog.string.isNumeric = function(str) { 
  return ! /[^0-9]/.test(str); 
}; 
goog.string.isAlphaNumeric = function(str) { 
  return ! /[^a-zA-Z0-9]/.test(str); 
}; 
goog.string.isSpace = function(ch) { 
  return ch == ' '; 
}; 
goog.string.isUnicodeChar = function(ch) { 
  return ch.length == 1 && ch >= ' ' && ch <= '~' || ch >= '\u0080' && ch <= '\uFFFD'; 
}; 
goog.string.stripNewlines = function(str) { 
  return str.replace(/(\r\n|\r|\n)+/g, ' '); 
}; 
goog.string.canonicalizeNewlines = function(str) { 
  return str.replace(/(\r\n|\r|\n)/g, '\n'); 
}; 
goog.string.normalizeWhitespace = function(str) { 
  return str.replace(/\xa0|\s/g, ' '); 
}; 
goog.string.normalizeSpaces = function(str) { 
  return str.replace(/\xa0|[ \t]+/g, ' '); 
}; 
goog.string.collapseBreakingSpaces = function(str) { 
  return str.replace(/[\t\r\n ]+/g, ' ').replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, ''); 
}; 
goog.string.trim = function(str) { 
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, ''); 
}; 
goog.string.trimLeft = function(str) { 
  return str.replace(/^[\s\xa0]+/, ''); 
}; 
goog.string.trimRight = function(str) { 
  return str.replace(/[\s\xa0]+$/, ''); 
}; 
goog.string.caseInsensitiveCompare = function(str1, str2) { 
  var test1 = String(str1).toLowerCase(); 
  var test2 = String(str2).toLowerCase(); 
  if(test1 < test2) { 
    return - 1; 
  } else if(test1 == test2) { 
    return 0; 
  } else { 
    return 1; 
  } 
}; 
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g; 
goog.string.numerateCompare = function(str1, str2) { 
  if(str1 == str2) { 
    return 0; 
  } 
  if(! str1) { 
    return - 1; 
  } 
  if(! str2) { 
    return 1; 
  } 
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_); 
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_); 
  var count = Math.min(tokens1.length, tokens2.length); 
  for(var i = 0; i < count; i ++) { 
    var a = tokens1[i]; 
    var b = tokens2[i]; 
    if(a != b) { 
      var num1 = parseInt(a, 10); 
      if(! isNaN(num1)) { 
        var num2 = parseInt(b, 10); 
        if(! isNaN(num2) && num1 - num2) { 
          return num1 - num2; 
        } 
      } 
      return a < b ? - 1: 1; 
    } 
  } 
  if(tokens1.length != tokens2.length) { 
    return tokens1.length - tokens2.length; 
  } 
  return str1 < str2 ? - 1: 1; 
}; 
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/; 
goog.string.urlEncode = function(str) { 
  str = String(str); 
  if(! goog.string.encodeUriRegExp_.test(str)) { 
    return encodeURIComponent(str); 
  } 
  return str; 
}; 
goog.string.urlDecode = function(str) { 
  return decodeURIComponent(str.replace(/\+/g, ' ')); 
}; 
goog.string.newLineToBr = function(str, opt_xml) { 
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />': '<br>'); 
}; 
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) { 
  if(opt_isLikelyToContainHtmlChars) { 
    return str.replace(goog.string.amperRe_, '&amp;').replace(goog.string.ltRe_, '&lt;').replace(goog.string.gtRe_, '&gt;').replace(goog.string.quotRe_, '&quot;'); 
  } else { 
    if(! goog.string.allRe_.test(str)) return str; 
    if(str.indexOf('&') != - 1) { 
      str = str.replace(goog.string.amperRe_, '&amp;'); 
    } 
    if(str.indexOf('<') != - 1) { 
      str = str.replace(goog.string.ltRe_, '&lt;'); 
    } 
    if(str.indexOf('>') != - 1) { 
      str = str.replace(goog.string.gtRe_, '&gt;'); 
    } 
    if(str.indexOf('"') != - 1) { 
      str = str.replace(goog.string.quotRe_, '&quot;'); 
    } 
    return str; 
  } 
}; 
goog.string.amperRe_ = /&/g; 
goog.string.ltRe_ = /</g; 
goog.string.gtRe_ = />/g; 
goog.string.quotRe_ = /\"/g; 
goog.string.allRe_ = /[&<>\"]/; 
goog.string.unescapeEntities = function(str) { 
  if(goog.string.contains(str, '&')) { 
    if('document' in goog.global) { 
      return goog.string.unescapeEntitiesUsingDom_(str); 
    } else { 
      return goog.string.unescapePureXmlEntities_(str); 
    } 
  } 
  return str; 
}; 
goog.string.unescapeEntitiesUsingDom_ = function(str) { 
  var seen = { 
    '&amp;': '&', 
    '&lt;': '<', 
    '&gt;': '>', 
    '&quot;': '"' 
  }; 
  var div = goog.global['document']['createElement']('div'); 
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) { 
    var value = seen[s]; 
    if(value) { 
      return value; 
    } 
    if(entity.charAt(0) == '#') { 
      var n = Number('0' + entity.substr(1)); 
      if(! isNaN(n)) { 
        value = String.fromCharCode(n); 
      } 
    } 
    if(! value) { 
      div['innerHTML']= s; 
      value = div['firstChild']['nodeValue']; 
    } 
    return seen[s]= value; 
  }); 
}; 
goog.string.unescapePureXmlEntities_ = function(str) { 
  return str.replace(/&([^;]+);/g, function(s, entity) { 
    switch(entity) { 
      case 'amp': 
        return '&'; 

      case 'lt': 
        return '<'; 

      case 'gt': 
        return '>'; 

      case 'quot': 
        return '"'; 

      default: 
        if(entity.charAt(0) == '#') { 
          var n = Number('0' + entity.substr(1)); 
          if(! isNaN(n)) { 
            return String.fromCharCode(n); 
          } 
        } 
        return s; 

    } 
  }); 
}; 
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g; 
goog.string.whitespaceEscape = function(str, opt_xml) { 
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml); 
}; 
goog.string.stripQuotes = function(str, quoteChars) { 
  var length = quoteChars.length; 
  for(var i = 0; i < length; i ++) { 
    var quoteChar = length == 1 ? quoteChars: quoteChars.charAt(i); 
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) { 
      return str.substring(1, str.length - 1); 
    } 
  } 
  return str; 
}; 
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) { 
  if(opt_protectEscapedCharacters) { 
    str = goog.string.unescapeEntities(str); 
  } 
  if(str.length > chars) { 
    str = str.substring(0, chars - 3) + '...'; 
  } 
  if(opt_protectEscapedCharacters) { 
    str = goog.string.htmlEscape(str); 
  } 
  return str; 
}; 
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) { 
  if(opt_protectEscapedCharacters) { 
    str = goog.string.unescapeEntities(str); 
  } 
  if(opt_trailingChars && str.length > chars) { 
    if(opt_trailingChars > chars) { 
      opt_trailingChars = chars; 
    } 
    var endPoint = str.length - opt_trailingChars; 
    var startPoint = chars - opt_trailingChars; 
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint); 
  } else if(str.length > chars) { 
    var half = Math.floor(chars / 2); 
    var endPos = str.length - half; 
    half += chars % 2; 
    str = str.substring(0, half) + '...' + str.substring(endPos); 
  } 
  if(opt_protectEscapedCharacters) { 
    str = goog.string.htmlEscape(str); 
  } 
  return str; 
}; 
goog.string.specialEscapeChars_ = { 
  '\0': '\\0', 
  '\b': '\\b', 
  '\f': '\\f', 
  '\n': '\\n', 
  '\r': '\\r', 
  '\t': '\\t', 
  '\x0B': '\\x0B', 
  '"': '\\"', 
  '\\': '\\\\' 
}; 
goog.string.jsEscapeCache_ = { '\'': '\\\'' }; 
goog.string.quote = function(s) { 
  s = String(s); 
  if(s.quote) { 
    return s.quote(); 
  } else { 
    var sb =['"']; 
    for(var i = 0; i < s.length; i ++) { 
      var ch = s.charAt(i); 
      var cc = ch.charCodeAt(0); 
      sb[i + 1]= goog.string.specialEscapeChars_[ch]||((cc > 31 && cc < 127) ? ch: goog.string.escapeChar(ch)); 
    } 
    sb.push('"'); 
    return sb.join(''); 
  } 
}; 
goog.string.escapeString = function(str) { 
  var sb =[]; 
  for(var i = 0; i < str.length; i ++) { 
    sb[i]= goog.string.escapeChar(str.charAt(i)); 
  } 
  return sb.join(''); 
}; 
goog.string.escapeChar = function(c) { 
  if(c in goog.string.jsEscapeCache_) { 
    return goog.string.jsEscapeCache_[c]; 
  } 
  if(c in goog.string.specialEscapeChars_) { 
    return goog.string.jsEscapeCache_[c]= goog.string.specialEscapeChars_[c]; 
  } 
  var rv = c; 
  var cc = c.charCodeAt(0); 
  if(cc > 31 && cc < 127) { 
    rv = c; 
  } else { 
    if(cc < 256) { 
      rv = '\\x'; 
      if(cc < 16 || cc > 256) { 
        rv += '0'; 
      } 
    } else { 
      rv = '\\u'; 
      if(cc < 4096) { 
        rv += '0'; 
      } 
    } 
    rv += cc.toString(16).toUpperCase(); 
  } 
  return goog.string.jsEscapeCache_[c]= rv; 
}; 
goog.string.toMap = function(s) { 
  var rv = { }; 
  for(var i = 0; i < s.length; i ++) { 
    rv[s.charAt(i)]= true; 
  } 
  return rv; 
}; 
goog.string.contains = function(s, ss) { 
  return s.indexOf(ss) != - 1; 
}; 
goog.string.removeAt = function(s, index, stringLength) { 
  var resultStr = s; 
  if(index >= 0 && index < s.length && stringLength > 0) { 
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength); 
  } 
  return resultStr; 
}; 
goog.string.remove = function(s, ss) { 
  var re = new RegExp(goog.string.regExpEscape(ss), ''); 
  return s.replace(re, ''); 
}; 
goog.string.removeAll = function(s, ss) { 
  var re = new RegExp(goog.string.regExpEscape(ss), 'g'); 
  return s.replace(re, ''); 
}; 
goog.string.regExpEscape = function(s) { 
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08'); 
}; 
goog.string.repeat = function(string, length) { 
  return new Array(length + 1).join(string); 
}; 
goog.string.padNumber = function(num, length, opt_precision) { 
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision): String(num); 
  var index = s.indexOf('.'); 
  if(index == - 1) { 
    index = s.length; 
  } 
  return goog.string.repeat('0', Math.max(0, length - index)) + s; 
}; 
goog.string.makeSafe = function(obj) { 
  return obj == null ? '': String(obj); 
}; 
goog.string.buildString = function(var_args) { 
  return Array.prototype.join.call(arguments, ''); 
}; 
goog.string.getRandomString = function() { 
  var x = 2147483648; 
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36); 
}; 
goog.string.compareVersions = function(version1, version2) { 
  var order = 0; 
  var v1Subs = goog.string.trim(String(version1)).split('.'); 
  var v2Subs = goog.string.trim(String(version2)).split('.'); 
  var subCount = Math.max(v1Subs.length, v2Subs.length); 
  for(var subIdx = 0; order == 0 && subIdx < subCount; subIdx ++) { 
    var v1Sub = v1Subs[subIdx]|| ''; 
    var v2Sub = v2Subs[subIdx]|| ''; 
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g'); 
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g'); 
    do { 
      var v1Comp = v1CompParser.exec(v1Sub) ||['', '', '']; 
      var v2Comp = v2CompParser.exec(v2Sub) ||['', '', '']; 
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) { 
        break; 
      } 
      var v1CompNum = v1Comp[1].length == 0 ? 0: parseInt(v1Comp[1], 10); 
      var v2CompNum = v2Comp[1].length == 0 ? 0: parseInt(v2Comp[1], 10); 
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2]); 
    } while(order == 0); 
  } 
  return order; 
}; 
goog.string.compareElements_ = function(left, right) { 
  if(left < right) { 
    return - 1; 
  } else if(left > right) { 
    return 1; 
  } 
  return 0; 
}; 
goog.string.HASHCODE_MAX_ = 0x100000000; 
goog.string.hashCode = function(str) { 
  var result = 0; 
  for(var i = 0; i < str.length; ++ i) { 
    result = 31 * result + str.charCodeAt(i); 
    result %= goog.string.HASHCODE_MAX_; 
  } 
  return result; 
}; 
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0; 
goog.string.createUniqueString = function() { 
  return 'goog_' + goog.string.uniqueStringCounter_ ++; 
}; 
goog.string.toNumber = function(str) { 
  var num = Number(str); 
  if(num == 0 && goog.string.isEmpty(str)) { 
    return NaN; 
  } 
  return num; 
}; 
goog.string.toCamelCaseCache_ = { }; 
goog.string.toCamelCase = function(str) { 
  return goog.string.toCamelCaseCache_[str]||(goog.string.toCamelCaseCache_[str]= String(str).replace(/\-([a-z])/g, function(all, match) { 
    return match.toUpperCase(); 
  })); 
}; 
goog.string.toSelectorCaseCache_ = { }; 
goog.string.toSelectorCase = function(str) { 
  return goog.string.toSelectorCaseCache_[str]||(goog.string.toSelectorCaseCache_[str]= String(str).replace(/([A-Z])/g, '-$1').toLowerCase()); 
}; 
