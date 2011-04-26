
goog.provide('goog.i18n.BidiFormatter'); 
goog.require('goog.i18n.bidi'); 
goog.require('goog.string'); 
goog.i18n.BidiFormatter = function(contextDir, opt_alwaysSpan) { 
  this.contextDir_ = goog.i18n.bidi.toDir(contextDir); 
  this.alwaysSpan_ = ! ! opt_alwaysSpan; 
}; 
goog.i18n.BidiFormatter.prototype.getContextDir = function() { 
  return this.contextDir_; 
}; 
goog.i18n.BidiFormatter.prototype.getAlwaysSpan = function() { 
  return this.alwaysSpan_; 
}; 
goog.i18n.BidiFormatter.prototype.setContextDir = function(contextDir) { 
  this.contextDir_ = goog.i18n.bidi.toDir(contextDir); 
}; 
goog.i18n.BidiFormatter.prototype.setAlwaysSpan = function(alwaysSpan) { 
  this.alwaysSpan_ = alwaysSpan; 
}; 
goog.i18n.BidiFormatter.prototype.estimateDirection = goog.i18n.bidi.estimateDirection; 
goog.i18n.BidiFormatter.prototype.areDirectionalitiesOpposite_ = function(dir1, dir2) { 
  return dir1 * dir2 < 0; 
}; 
goog.i18n.BidiFormatter.prototype.dirResetIfNeeded_ = function(str, dir, opt_isHtml, opt_dirReset) { 
  if(opt_dirReset &&(this.areDirectionalitiesOpposite_(dir, this.contextDir_) ||(this.contextDir_ == goog.i18n.bidi.Dir.LTR && goog.i18n.bidi.endsWithRtl(str, opt_isHtml)) ||(this.contextDir_ == goog.i18n.bidi.Dir.RTL && goog.i18n.bidi.endsWithLtr(str, opt_isHtml)))) { 
    return this.contextDir_ == goog.i18n.bidi.Dir.LTR ? goog.i18n.bidi.Format.LRM: goog.i18n.bidi.Format.RLM; 
  } else { 
    return ''; 
  } 
}; 
goog.i18n.BidiFormatter.prototype.dirAttrValue = function(str, opt_isHtml) { 
  return this.knownDirAttrValue(this.estimateDirection(str, opt_isHtml)); 
}; 
goog.i18n.BidiFormatter.prototype.knownDirAttrValue = function(dir) { 
  if(dir == goog.i18n.bidi.Dir.UNKNOWN) { 
    dir = this.contextDir_; 
  } 
  return dir == goog.i18n.bidi.Dir.RTL ? 'rtl': 'ltr'; 
}; 
goog.i18n.BidiFormatter.prototype.dirAttr = function(str, opt_isHtml) { 
  return this.knownDirAttr(this.estimateDirection(str, opt_isHtml)); 
}; 
goog.i18n.BidiFormatter.prototype.knownDirAttr = function(dir) { 
  if(dir != this.contextDir_) { 
    return dir == goog.i18n.bidi.Dir.RTL ? 'dir=rtl': dir == goog.i18n.bidi.Dir.LTR ? 'dir=ltr': ''; 
  } 
  return ''; 
}; 
goog.i18n.BidiFormatter.prototype.spanWrap = function(str, opt_isHtml, opt_dirReset) { 
  var dir = this.estimateDirection(str, opt_isHtml); 
  return this.spanWrapWithKnownDir(dir, str, opt_isHtml, opt_dirReset); 
}; 
goog.i18n.BidiFormatter.prototype.spanWrapWithKnownDir = function(dir, str, opt_isHtml, opt_dirReset) { 
  opt_dirReset = opt_dirReset ||(opt_dirReset == undefined); 
  var dirCondition = dir != goog.i18n.bidi.Dir.UNKNOWN && dir != this.contextDir_; 
  if(! opt_isHtml) { 
    str = goog.string.htmlEscape(str); 
  } 
  var result =[]; 
  if(this.alwaysSpan_ || dirCondition) { 
    result.push('<span'); 
    if(dirCondition) { 
      result.push(dir == goog.i18n.bidi.Dir.RTL ? ' dir=rtl': ' dir=ltr'); 
    } 
    result.push('>' + str + '</span>'); 
  } else { 
    result.push(str); 
  } 
  result.push(this.dirResetIfNeeded_(str, dir, true, opt_dirReset)); 
  return result.join(''); 
}; 
goog.i18n.BidiFormatter.prototype.unicodeWrap = function(str, opt_isHtml, opt_dirReset) { 
  var dir = this.estimateDirection(str, opt_isHtml); 
  return this.unicodeWrapWithKnownDir(dir, str, opt_isHtml, opt_dirReset); 
}; 
goog.i18n.BidiFormatter.prototype.unicodeWrapWithKnownDir = function(dir, str, opt_isHtml, opt_dirReset) { 
  opt_dirReset = opt_dirReset ||(opt_dirReset == undefined); 
  var result =[]; 
  if(dir != goog.i18n.bidi.Dir.UNKNOWN && dir != this.contextDir_) { 
    result.push(dir == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.Format.RLE: goog.i18n.bidi.Format.LRE); 
    result.push(str); 
    result.push(goog.i18n.bidi.Format.PDF); 
  } else { 
    result.push(str); 
  } 
  result.push(this.dirResetIfNeeded_(str, dir, opt_isHtml, opt_dirReset)); 
  return result.join(''); 
}; 
goog.i18n.BidiFormatter.prototype.markAfter = function(str, opt_isHtml) { 
  return this.dirResetIfNeeded_(str, this.estimateDirection(str, opt_isHtml), opt_isHtml, true); 
}; 
goog.i18n.BidiFormatter.prototype.mark = function() { 
  switch(this.contextDir_) { 
    case(goog.i18n.bidi.Dir.LTR): 
      return goog.i18n.bidi.Format.LRM; 

    case(goog.i18n.bidi.Dir.RTL): 
      return goog.i18n.bidi.Format.RLM; 

    default: 
      return ''; 

  } 
}; 
goog.i18n.BidiFormatter.prototype.startEdge = function() { 
  return this.contextDir_ == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.RIGHT: goog.i18n.bidi.LEFT; 
}; 
goog.i18n.BidiFormatter.prototype.endEdge = function() { 
  return this.contextDir_ == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.LEFT: goog.i18n.bidi.RIGHT; 
}; 
