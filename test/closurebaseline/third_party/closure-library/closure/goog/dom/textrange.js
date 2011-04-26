
goog.provide('goog.dom.TextRange'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.AbstractRange'); 
goog.require('goog.dom.RangeType'); 
goog.require('goog.dom.SavedRange'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.TextRangeIterator'); 
goog.require('goog.dom.browserrange'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.dom.TextRange = function() { }; 
goog.inherits(goog.dom.TextRange, goog.dom.AbstractRange); 
goog.dom.TextRange.createFromBrowserRange = function(range, opt_isReversed) { 
  return goog.dom.TextRange.createFromBrowserRangeWrapper_(goog.dom.browserrange.createRange(range), opt_isReversed); 
}; 
goog.dom.TextRange.createFromBrowserRangeWrapper_ = function(browserRange, opt_isReversed) { 
  var range = new goog.dom.TextRange(); 
  range.browserRangeWrapper_ = browserRange; 
  range.isReversed_ = ! ! opt_isReversed; 
  return range; 
}; 
goog.dom.TextRange.createFromNodeContents = function(node, opt_isReversed) { 
  return goog.dom.TextRange.createFromBrowserRangeWrapper_(goog.dom.browserrange.createRangeFromNodeContents(node), opt_isReversed); 
}; 
goog.dom.TextRange.createFromNodes = function(anchorNode, anchorOffset, focusNode, focusOffset) { 
  var range = new goog.dom.TextRange(); 
  range.isReversed_ = goog.dom.Range.isReversed(anchorNode, anchorOffset, focusNode, focusOffset); 
  if(anchorNode.tagName == 'BR') { 
    var parent = anchorNode.parentNode; 
    anchorOffset = goog.array.indexOf(parent.childNodes, anchorNode); 
    anchorNode = parent; 
  } 
  if(focusNode.tagName == 'BR') { 
    var parent = focusNode.parentNode; 
    focusOffset = goog.array.indexOf(parent.childNodes, focusNode); 
    focusNode = parent; 
  } 
  if(range.isReversed_) { 
    range.startNode_ = focusNode; 
    range.startOffset_ = focusOffset; 
    range.endNode_ = anchorNode; 
    range.endOffset_ = anchorOffset; 
  } else { 
    range.startNode_ = anchorNode; 
    range.startOffset_ = anchorOffset; 
    range.endNode_ = focusNode; 
    range.endOffset_ = focusOffset; 
  } 
  return range; 
}; 
goog.dom.TextRange.prototype.browserRangeWrapper_ = null; 
goog.dom.TextRange.prototype.startNode_ = null; 
goog.dom.TextRange.prototype.startOffset_ = null; 
goog.dom.TextRange.prototype.endNode_ = null; 
goog.dom.TextRange.prototype.endOffset_ = null; 
goog.dom.TextRange.prototype.isReversed_ = false; 
goog.dom.TextRange.prototype.clone = function() { 
  var range = new goog.dom.TextRange(); 
  range.browserRangeWrapper_ = this.browserRangeWrapper_; 
  range.startNode_ = this.startNode_; 
  range.startOffset_ = this.startOffset_; 
  range.endNode_ = this.endNode_; 
  range.endOffset_ = this.endOffset_; 
  range.isReversed_ = this.isReversed_; 
  return range; 
}; 
goog.dom.TextRange.prototype.getType = function() { 
  return goog.dom.RangeType.TEXT; 
}; 
goog.dom.TextRange.prototype.getBrowserRangeObject = function() { 
  return this.getBrowserRangeWrapper_().getBrowserRange(); 
}; 
goog.dom.TextRange.prototype.setBrowserRangeObject = function(nativeRange) { 
  if(goog.dom.AbstractRange.isNativeControlRange(nativeRange)) { 
    return false; 
  } 
  this.browserRangeWrapper_ = goog.dom.browserrange.createRange(nativeRange); 
  this.clearCachedValues_(); 
  return true; 
}; 
goog.dom.TextRange.prototype.clearCachedValues_ = function() { 
  this.startNode_ = this.startOffset_ = this.endNode_ = this.endOffset_ = null; 
}; 
goog.dom.TextRange.prototype.getTextRangeCount = function() { 
  return 1; 
}; 
goog.dom.TextRange.prototype.getTextRange = function(i) { 
  return this; 
}; 
goog.dom.TextRange.prototype.getBrowserRangeWrapper_ = function() { 
  return this.browserRangeWrapper_ ||(this.browserRangeWrapper_ = goog.dom.browserrange.createRangeFromNodes(this.getStartNode(), this.getStartOffset(), this.getEndNode(), this.getEndOffset())); 
}; 
goog.dom.TextRange.prototype.getContainer = function() { 
  return this.getBrowserRangeWrapper_().getContainer(); 
}; 
goog.dom.TextRange.prototype.getStartNode = function() { 
  return this.startNode_ ||(this.startNode_ = this.getBrowserRangeWrapper_().getStartNode()); 
}; 
goog.dom.TextRange.prototype.getStartOffset = function() { 
  return this.startOffset_ != null ? this.startOffset_:(this.startOffset_ = this.getBrowserRangeWrapper_().getStartOffset()); 
}; 
goog.dom.TextRange.prototype.getEndNode = function() { 
  return this.endNode_ ||(this.endNode_ = this.getBrowserRangeWrapper_().getEndNode()); 
}; 
goog.dom.TextRange.prototype.getEndOffset = function() { 
  return this.endOffset_ != null ? this.endOffset_:(this.endOffset_ = this.getBrowserRangeWrapper_().getEndOffset()); 
}; 
goog.dom.TextRange.prototype.moveToNodes = function(startNode, startOffset, endNode, endOffset, isReversed) { 
  this.startNode_ = startNode; 
  this.startOffset_ = startOffset; 
  this.endNode_ = endNode; 
  this.endOffset_ = endOffset; 
  this.isReversed_ = isReversed; 
  this.browserRangeWrapper_ = null; 
}; 
goog.dom.TextRange.prototype.isReversed = function() { 
  return this.isReversed_; 
}; 
goog.dom.TextRange.prototype.containsRange = function(otherRange, opt_allowPartial) { 
  var otherRangeType = otherRange.getType(); 
  if(otherRangeType == goog.dom.RangeType.TEXT) { 
    return this.getBrowserRangeWrapper_().containsRange(otherRange.getBrowserRangeWrapper_(), opt_allowPartial); 
  } else if(otherRangeType == goog.dom.RangeType.CONTROL) { 
    var elements = otherRange.getElements(); 
    var fn = opt_allowPartial ? goog.array.some: goog.array.every; 
    return fn(elements, function(el) { 
      return this.containsNode(el, opt_allowPartial); 
    }, this); 
  } 
  return false; 
}; 
goog.dom.TextRange.isAttachedNode = function(node) { 
  if(goog.userAgent.IE && ! goog.userAgent.isDocumentMode(9)) { 
    var returnValue = false; 
    try { 
      returnValue = node.parentNode; 
    } catch(e) { } 
    return ! ! returnValue; 
  } else { 
    return goog.dom.contains(node.ownerDocument.body, node); 
  } 
}; 
goog.dom.TextRange.prototype.isRangeInDocument = function() { 
  return(! this.startNode_ || goog.dom.TextRange.isAttachedNode(this.startNode_)) &&(! this.endNode_ || goog.dom.TextRange.isAttachedNode(this.endNode_)) &&(!(goog.userAgent.IE && ! goog.userAgent.isDocumentMode(9)) || this.getBrowserRangeWrapper_().isRangeInDocument()); 
}; 
goog.dom.TextRange.prototype.isCollapsed = function() { 
  return this.getBrowserRangeWrapper_().isCollapsed(); 
}; 
goog.dom.TextRange.prototype.getText = function() { 
  return this.getBrowserRangeWrapper_().getText(); 
}; 
goog.dom.TextRange.prototype.getHtmlFragment = function() { 
  return this.getBrowserRangeWrapper_().getHtmlFragment(); 
}; 
goog.dom.TextRange.prototype.getValidHtml = function() { 
  return this.getBrowserRangeWrapper_().getValidHtml(); 
}; 
goog.dom.TextRange.prototype.getPastableHtml = function() { 
  var html = this.getValidHtml(); 
  if(html.match(/^\s*<td\b/i)) { 
    html = '<table><tbody><tr>' + html + '</tr></tbody></table>'; 
  } else if(html.match(/^\s*<tr\b/i)) { 
    html = '<table><tbody>' + html + '</tbody></table>'; 
  } else if(html.match(/^\s*<tbody\b/i)) { 
    html = '<table>' + html + '</table>'; 
  } else if(html.match(/^\s*<li\b/i)) { 
    var container = this.getContainer(); 
    var tagType = goog.dom.TagName.UL; 
    while(container) { 
      if(container.tagName == goog.dom.TagName.OL) { 
        tagType = goog.dom.TagName.OL; 
        break; 
      } else if(container.tagName == goog.dom.TagName.UL) { 
        break; 
      } 
      container = container.parentNode; 
    } 
    html = goog.string.buildString('<', tagType, '>', html, '</', tagType, '>'); 
  } 
  return html; 
}; 
goog.dom.TextRange.prototype.__iterator__ = function(opt_keys) { 
  return new goog.dom.TextRangeIterator(this.getStartNode(), this.getStartOffset(), this.getEndNode(), this.getEndOffset()); 
}; 
goog.dom.TextRange.prototype.select = function() { 
  this.getBrowserRangeWrapper_().select(this.isReversed_); 
}; 
goog.dom.TextRange.prototype.removeContents = function() { 
  this.getBrowserRangeWrapper_().removeContents(); 
  this.clearCachedValues_(); 
}; 
goog.dom.TextRange.prototype.surroundContents = function(element) { 
  var output = this.getBrowserRangeWrapper_().surroundContents(element); 
  this.clearCachedValues_(); 
  return output; 
}; 
goog.dom.TextRange.prototype.insertNode = function(node, before) { 
  var output = this.getBrowserRangeWrapper_().insertNode(node, before); 
  this.clearCachedValues_(); 
  return output; 
}; 
goog.dom.TextRange.prototype.surroundWithNodes = function(startNode, endNode) { 
  this.getBrowserRangeWrapper_().surroundWithNodes(startNode, endNode); 
  this.clearCachedValues_(); 
}; 
goog.dom.TextRange.prototype.saveUsingDom = function() { 
  return new goog.dom.DomSavedTextRange_(this); 
}; 
goog.dom.TextRange.prototype.collapse = function(toAnchor) { 
  var toStart = this.isReversed() ? ! toAnchor: toAnchor; 
  if(this.browserRangeWrapper_) { 
    this.browserRangeWrapper_.collapse(toStart); 
  } 
  if(toStart) { 
    this.endNode_ = this.startNode_; 
    this.endOffset_ = this.startOffset_; 
  } else { 
    this.startNode_ = this.endNode_; 
    this.startOffset_ = this.endOffset_; 
  } 
  this.isReversed_ = false; 
}; 
goog.dom.DomSavedTextRange_ = function(range) { 
  this.anchorNode_ = range.getAnchorNode(); 
  this.anchorOffset_ = range.getAnchorOffset(); 
  this.focusNode_ = range.getFocusNode(); 
  this.focusOffset_ = range.getFocusOffset(); 
}; 
goog.inherits(goog.dom.DomSavedTextRange_, goog.dom.SavedRange); 
goog.dom.DomSavedTextRange_.prototype.restoreInternal = function() { 
  return goog.dom.Range.createFromNodes(this.anchorNode_, this.anchorOffset_, this.focusNode_, this.focusOffset_); 
}; 
goog.dom.DomSavedTextRange_.prototype.disposeInternal = function() { 
  goog.dom.DomSavedTextRange_.superClass_.disposeInternal.call(this); 
  this.anchorNode_ = null; 
  this.focusNode_ = null; 
}; 
