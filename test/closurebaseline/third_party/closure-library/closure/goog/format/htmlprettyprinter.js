
goog.provide('goog.format.HtmlPrettyPrinter'); 
goog.provide('goog.format.HtmlPrettyPrinter.Buffer'); 
goog.require('goog.object'); 
goog.require('goog.string.StringBuffer'); 
goog.format.HtmlPrettyPrinter = function(opt_timeOutMillis) { 
  this.timeOutMillis_ = opt_timeOutMillis && opt_timeOutMillis > 0 ? opt_timeOutMillis: 0; 
}; 
goog.format.HtmlPrettyPrinter.instance_ = null; 
goog.format.HtmlPrettyPrinter.getInstance_ = function() { 
  if(! goog.format.HtmlPrettyPrinter.instance_) { 
    goog.format.HtmlPrettyPrinter.instance_ = new goog.format.HtmlPrettyPrinter(); 
  } 
  return goog.format.HtmlPrettyPrinter.instance_; 
}; 
goog.format.HtmlPrettyPrinter.format = function(html) { 
  return goog.format.HtmlPrettyPrinter.getInstance_().format(html); 
}; 
goog.format.HtmlPrettyPrinter.TOKEN_REGEX_ = /(?:<!--.*?-->|<!.*?>|<(\/?)(\w+)[^>]*>|[^<]+|<)/g; 
goog.format.HtmlPrettyPrinter.NON_PRETTY_PRINTED_TAGS_ = goog.object.createSet('script', 'style', 'pre', 'xmp'); 
goog.format.HtmlPrettyPrinter.BLOCK_TAGS_ = goog.object.createSet('address', 'applet', 'area', 'base', 'basefont', 'blockquote', 'body', 'caption', 'center', 'col', 'colgroup', 'dir', 'div', 'dl', 'fieldset', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'iframe', 'isindex', 'legend', 'link', 'menu', 'meta', 'noframes', 'noscript', 'ol', 'optgroup', 'option', 'p', 'param', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'title', 'tr', 'ul'); 
goog.format.HtmlPrettyPrinter.BREAKS_FLOW_TAGS_ = goog.object.createSet('br', 'dd', 'dt', 'br', 'li', 'noframes'); 
goog.format.HtmlPrettyPrinter.EMPTY_TAGS_ = goog.object.createSet('br', 'hr', 'isindex'); 
goog.format.HtmlPrettyPrinter.prototype.format = function(html) { 
  html = html.replace(/^\s*?( *\S)/, '$1'); 
  html = html.replace(/\s+$/, ''); 
  var timeOutMillis = this.timeOutMillis_; 
  var startMillis = timeOutMillis ? goog.now(): 0; 
  var buffer = new goog.format.HtmlPrettyPrinter.Buffer(); 
  var tokenRegex = goog.format.HtmlPrettyPrinter.TOKEN_REGEX_; 
  var nonPpTags = goog.format.HtmlPrettyPrinter.NON_PRETTY_PRINTED_TAGS_; 
  var blockTags = goog.format.HtmlPrettyPrinter.BLOCK_TAGS_; 
  var breaksFlowTags = goog.format.HtmlPrettyPrinter.BREAKS_FLOW_TAGS_; 
  var emptyTags = goog.format.HtmlPrettyPrinter.EMPTY_TAGS_; 
  var lastIndex = 0; 
  var nonPpTagStack =[]; 
  var match; 
  while(match = tokenRegex.exec(html)) { 
    var token = match[0]; 
    if(match.length == 3) { 
      var tagName = match[2]; 
      if(tagName) { 
        tagName = tagName.toLowerCase(); 
      } 
      if(nonPpTags.hasOwnProperty(tagName)) { 
        if(match[1]== '/') { 
          var stackSize = nonPpTagStack.length; 
          var startTagName = stackSize ? nonPpTagStack[stackSize - 1]: null; 
          if(startTagName == tagName) { 
            nonPpTagStack.pop(); 
            buffer.pushToken(false, token, ! nonPpTagStack.length); 
          } else { 
            buffer.pushToken(false, token, false); 
          } 
        } else { 
          buffer.pushToken(! nonPpTagStack.length, token, false); 
          nonPpTagStack.push(tagName); 
        } 
      } else if(nonPpTagStack.length) { 
        buffer.pushToken(false, token, false); 
      } else if(blockTags.hasOwnProperty(tagName)) { 
        var isEmpty = emptyTags.hasOwnProperty(tagName); 
        var isEndTag = match[1]== '/'; 
        buffer.pushToken(isEmpty || ! isEndTag, token, isEmpty || isEndTag); 
      } else if(breaksFlowTags.hasOwnProperty(tagName)) { 
        var isEmpty = emptyTags.hasOwnProperty(tagName); 
        var isEndTag = match[1]== '/'; 
        buffer.pushToken(false, token, isEndTag || isEmpty); 
      } else { 
        buffer.pushToken(false, token, false); 
      } 
    } else { 
      buffer.pushToken(false, token, false); 
    } 
    var newLastIndex = tokenRegex.lastIndex; 
    if(! token || newLastIndex <= lastIndex) { 
      throw Error('Regex failed to make progress through source html.'); 
    } 
    lastIndex = newLastIndex; 
    if(timeOutMillis) { 
      if(goog.now() - startMillis > timeOutMillis) { 
        buffer.pushToken(false, html.substring(tokenRegex.lastIndex), false); 
        tokenRegex.lastIndex = 0; 
        break; 
      } 
    } 
  } 
  buffer.lineBreak(); 
  var result = String(buffer); 
  var expectedLength = html.length + buffer.breakCount; 
  if(result.length != expectedLength) { 
    throw Error('Lost data pretty printing html.'); 
  } 
  return result; 
}; 
goog.format.HtmlPrettyPrinter.Buffer = function() { 
  this.out_ = new goog.string.StringBuffer(); 
}; 
goog.format.HtmlPrettyPrinter.Buffer.prototype.breakCount = 0; 
goog.format.HtmlPrettyPrinter.Buffer.prototype.isBeginningOfNewLine_ = true; 
goog.format.HtmlPrettyPrinter.Buffer.prototype.needsNewLine_ = false; 
goog.format.HtmlPrettyPrinter.Buffer.prototype.pushToken = function(breakBefore, token, breakAfter) { 
  if((this.needsNewLine_ || breakBefore) && ! /^\r?\n/.test(token) && ! /\/ul/i.test(token)) { 
    this.lineBreak(); 
  } 
  this.out_.append(token); 
  this.isBeginningOfNewLine_ = /\r?\n$/.test(token); 
  this.needsNewLine_ = breakAfter && ! this.isBeginningOfNewLine_; 
}; 
goog.format.HtmlPrettyPrinter.Buffer.prototype.lineBreak = function() { 
  if(! this.isBeginningOfNewLine_) { 
    this.out_.append('\n'); 
    ++ this.breakCount; 
  } 
}; 
goog.format.HtmlPrettyPrinter.Buffer.prototype.toString = function() { 
  return this.out_.toString(); 
}; 
