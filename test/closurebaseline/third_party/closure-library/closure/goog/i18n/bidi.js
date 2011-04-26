
goog.provide('goog.i18n.bidi'); 
goog.i18n.bidi.FORCE_RTL = false; 
goog.i18n.bidi.IS_RTL = goog.i18n.bidi.FORCE_RTL ||(goog.LOCALE.substring(0, 2) == 'ar' || goog.LOCALE.substring(0, 2) == 'fa' || goog.LOCALE.substring(0, 2) == 'he' || goog.LOCALE.substring(0, 2) == 'iw' || goog.LOCALE.substring(0, 2) == 'ur' || goog.LOCALE.substring(0, 2) == 'yi') &&(goog.LOCALE.length == 2 || goog.LOCALE.substring(2, 3) == '-' || goog.LOCALE.substring(2, 3) == '_'); 
goog.i18n.bidi.Format = { 
  LRE: '\u202A', 
  RLE: '\u202B', 
  PDF: '\u202C', 
  LRM: '\u200E', 
  RLM: '\u200F' 
}; 
goog.i18n.bidi.Dir = { 
  RTL: - 1, 
  UNKNOWN: 0, 
  LTR: 1 
}; 
goog.i18n.bidi.RIGHT = 'right'; 
goog.i18n.bidi.LEFT = 'left'; 
goog.i18n.bidi.toDir = function(givenDir) { 
  if(typeof givenDir == 'number') { 
    return givenDir > 0 ? goog.i18n.bidi.Dir.LTR: givenDir < 0 ? goog.i18n.bidi.Dir.RTL: goog.i18n.bidi.Dir.UNKNOWN; 
  } else { 
    return givenDir ? goog.i18n.bidi.Dir.RTL: goog.i18n.bidi.Dir.LTR; 
  } 
}; 
goog.i18n.bidi.ltrChars_ = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' + '\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF'; 
goog.i18n.bidi.rtlChars_ = '\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC'; 
goog.i18n.bidi.htmlSkipReg_ = /<[^>]*>|&[^;]+;/g; 
goog.i18n.bidi.stripHtmlIfNeeded_ = function(str, opt_isStripNeeded) { 
  return opt_isStripNeeded ? str.replace(goog.i18n.bidi.htmlSkipReg_, ' '): str; 
}; 
goog.i18n.bidi.rtlCharReg_ = new RegExp('[' + goog.i18n.bidi.rtlChars_ + ']'); 
goog.i18n.bidi.ltrCharReg_ = new RegExp('[' + goog.i18n.bidi.ltrChars_ + ']'); 
goog.i18n.bidi.hasAnyRtl = function(str, opt_isHtml) { 
  return goog.i18n.bidi.rtlCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml)); 
}; 
goog.i18n.bidi.hasRtlChar = goog.i18n.bidi.hasAnyRtl; 
goog.i18n.bidi.hasAnyLtr = function(str, opt_isHtml) { 
  return goog.i18n.bidi.ltrCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml)); 
}; 
goog.i18n.bidi.ltrRe_ = new RegExp('^[' + goog.i18n.bidi.ltrChars_ + ']'); 
goog.i18n.bidi.rtlRe_ = new RegExp('^[' + goog.i18n.bidi.rtlChars_ + ']'); 
goog.i18n.bidi.isRtlChar = function(str) { 
  return goog.i18n.bidi.rtlRe_.test(str); 
}; 
goog.i18n.bidi.isLtrChar = function(str) { 
  return goog.i18n.bidi.ltrRe_.test(str); 
}; 
goog.i18n.bidi.isNeutralChar = function(str) { 
  return ! goog.i18n.bidi.isLtrChar(str) && ! goog.i18n.bidi.isRtlChar(str); 
}; 
goog.i18n.bidi.ltrDirCheckRe_ = new RegExp('^[^' + goog.i18n.bidi.rtlChars_ + ']*[' + goog.i18n.bidi.ltrChars_ + ']'); 
goog.i18n.bidi.rtlDirCheckRe_ = new RegExp('^[^' + goog.i18n.bidi.ltrChars_ + ']*[' + goog.i18n.bidi.rtlChars_ + ']'); 
goog.i18n.bidi.startsWithRtl = function(str, opt_isHtml) { 
  return goog.i18n.bidi.rtlDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml)); 
}; 
goog.i18n.bidi.isRtlText = goog.i18n.bidi.startsWithRtl; 
goog.i18n.bidi.startsWithLtr = function(str, opt_isHtml) { 
  return goog.i18n.bidi.ltrDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml)); 
}; 
goog.i18n.bidi.isLtrText = goog.i18n.bidi.startsWithLtr; 
goog.i18n.bidi.isRequiredLtrRe_ = /^http:\/\/.*/; 
goog.i18n.bidi.isNeutralText = function(str, opt_isHtml) { 
  str = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml); 
  return goog.i18n.bidi.isRequiredLtrRe_.test(str) || ! goog.i18n.bidi.hasAnyLtr(str) && ! goog.i18n.bidi.hasAnyRtl(str); 
}; 
goog.i18n.bidi.ltrExitDirCheckRe_ = new RegExp('[' + goog.i18n.bidi.ltrChars_ + '][^' + goog.i18n.bidi.rtlChars_ + ']*$'); 
goog.i18n.bidi.rtlExitDirCheckRe_ = new RegExp('[' + goog.i18n.bidi.rtlChars_ + '][^' + goog.i18n.bidi.ltrChars_ + ']*$'); 
goog.i18n.bidi.endsWithLtr = function(str, opt_isHtml) { 
  return goog.i18n.bidi.ltrExitDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml)); 
}; 
goog.i18n.bidi.isLtrExitText = goog.i18n.bidi.endsWithLtr; 
goog.i18n.bidi.endsWithRtl = function(str, opt_isHtml) { 
  return goog.i18n.bidi.rtlExitDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml)); 
}; 
goog.i18n.bidi.isRtlExitText = goog.i18n.bidi.endsWithRtl; 
goog.i18n.bidi.rtlLocalesRe_ = new RegExp('^(ar|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Arab|Hebr|Thaa|Nkoo|Tfng))' + '(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)'); 
goog.i18n.bidi.isRtlLanguage = function(lang) { 
  return goog.i18n.bidi.rtlLocalesRe_.test(lang); 
}; 
goog.i18n.bidi.bracketGuardHtmlRe_ = /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(&lt;.*?(&gt;)+)/g; 
goog.i18n.bidi.bracketGuardTextRe_ = /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(<.*?>+)/g; 
goog.i18n.bidi.guardBracketInHtml = function(s, opt_isRtlContext) { 
  var useRtl = opt_isRtlContext === undefined ? goog.i18n.bidi.hasAnyRtl(s): opt_isRtlContext; 
  if(useRtl) { 
    return s.replace(goog.i18n.bidi.bracketGuardHtmlRe_, '<span dir=rtl>$&</span>'); 
  } 
  return s.replace(goog.i18n.bidi.bracketGuardHtmlRe_, '<span dir=ltr>$&</span>'); 
}; 
goog.i18n.bidi.guardBracketInText = function(s, opt_isRtlContext) { 
  var useRtl = opt_isRtlContext === undefined ? goog.i18n.bidi.hasAnyRtl(s): opt_isRtlContext; 
  var mark = useRtl ? goog.i18n.bidi.Format.RLM: goog.i18n.bidi.Format.LRM; 
  return s.replace(goog.i18n.bidi.bracketGuardTextRe_, mark + '$&' + mark); 
}; 
goog.i18n.bidi.enforceRtlInHtml = function(html) { 
  if(html.charAt(0) == '<') { 
    return html.replace(/<\w+/, '$& dir=rtl'); 
  } 
  return '\n<span dir=rtl>' + html + '</span>'; 
}; 
goog.i18n.bidi.enforceRtlInText = function(text) { 
  return goog.i18n.bidi.Format.RLE + text + goog.i18n.bidi.Format.PDF; 
}; 
goog.i18n.bidi.enforceLtrInHtml = function(html) { 
  if(html.charAt(0) == '<') { 
    return html.replace(/<\w+/, '$& dir=ltr'); 
  } 
  return '\n<span dir=ltr>' + html + '</span>'; 
}; 
goog.i18n.bidi.enforceLtrInText = function(text) { 
  return goog.i18n.bidi.Format.LRE + text + goog.i18n.bidi.Format.PDF; 
}; 
goog.i18n.bidi.dimensionsRe_ = /:\s*([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)/g; 
goog.i18n.bidi.leftRe_ = /left/gi; 
goog.i18n.bidi.rightRe_ = /right/gi; 
goog.i18n.bidi.tempRe_ = /%%%%/g; 
goog.i18n.bidi.mirrorCSS = function(cssStr) { 
  return cssStr.replace(goog.i18n.bidi.dimensionsRe_, ':$1 $4 $3 $2').replace(goog.i18n.bidi.leftRe_, '%%%%').replace(goog.i18n.bidi.rightRe_, goog.i18n.bidi.LEFT).replace(goog.i18n.bidi.tempRe_, goog.i18n.bidi.RIGHT); 
}; 
goog.i18n.bidi.doubleQuoteSubstituteRe_ = /([\u0591-\u05f2])"/g; 
goog.i18n.bidi.singleQuoteSubstituteRe_ = /([\u0591-\u05f2])'/g; 
goog.i18n.bidi.normalizeHebrewQuote = function(str) { 
  return str.replace(goog.i18n.bidi.doubleQuoteSubstituteRe_, '$1\u05f4').replace(goog.i18n.bidi.singleQuoteSubstituteRe_, '$1\u05f3'); 
}; 
goog.i18n.bidi.wordSeparatorRe_ = /\s+/; 
goog.i18n.bidi.hasNumeralsRe_ = /\d/; 
goog.i18n.bidi.rtlDetectionThreshold_ = 0.40; 
goog.i18n.bidi.estimateDirection = function(str, opt_isHtml) { 
  var rtlCount = 0; 
  var totalCount = 0; 
  var hasWeaklyLtr = false; 
  var tokens = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml).split(goog.i18n.bidi.wordSeparatorRe_); 
  for(var i = 0; i < tokens.length; i ++) { 
    var token = tokens[i]; 
    if(goog.i18n.bidi.startsWithRtl(token)) { 
      rtlCount ++; 
      totalCount ++; 
    } else if(goog.i18n.bidi.isRequiredLtrRe_.test(token)) { 
      hasWeaklyLtr = true; 
    } else if(goog.i18n.bidi.hasAnyLtr(token)) { 
      totalCount ++; 
    } else if(goog.i18n.bidi.hasNumeralsRe_.test(token)) { 
      hasWeaklyLtr = true; 
    } 
  } 
  return totalCount == 0 ?(hasWeaklyLtr ? goog.i18n.bidi.Dir.LTR: goog.i18n.bidi.Dir.UNKNOWN):(rtlCount / totalCount > goog.i18n.bidi.rtlDetectionThreshold_ ? goog.i18n.bidi.Dir.RTL: goog.i18n.bidi.Dir.LTR); 
}; 
goog.i18n.bidi.detectRtlDirectionality = function(str, opt_isHtml) { 
  return goog.i18n.bidi.estimateDirection(str, opt_isHtml) == goog.i18n.bidi.Dir.RTL; 
}; 
goog.i18n.bidi.setElementDirAndAlign = function(element, dir) { 
  if(element &&(dir = goog.i18n.bidi.toDir(dir)) != goog.i18n.bidi.Dir.UNKNOWN) { 
    element.style.textAlign = dir == goog.i18n.bidi.Dir.RTL ? 'right': 'left'; 
    element.dir = dir == goog.i18n.bidi.Dir.RTL ? 'rtl': 'ltr'; 
  } 
}; 
