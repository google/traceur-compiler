
goog.provide('goog.dom.AbstractRange'); 
goog.provide('goog.dom.RangeIterator'); 
goog.provide('goog.dom.RangeType'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.SavedCaretRange'); 
goog.require('goog.dom.TagIterator'); 
goog.require('goog.userAgent'); 
goog.dom.RangeType = { 
  TEXT: 'text', 
  CONTROL: 'control', 
  MULTI: 'mutli' 
}; 
goog.dom.AbstractRange = function() { }; 
goog.dom.AbstractRange.getBrowserSelectionForWindow = function(win) { 
  if(win.getSelection) { 
    return win.getSelection(); 
  } else { 
    var doc = win.document; 
    var sel = doc.selection; 
    if(sel) { 
      try { 
        var range = sel.createRange(); 
        if(range.parentElement) { 
          if(range.parentElement().document != doc) { 
            return null; 
          } 
        } else if(! range.length || range.item(0).document != doc) { 
          return null; 
        } 
      } catch(e) { 
        return null; 
      } 
      return sel; 
    } 
    return null; 
  } 
}; 
goog.dom.AbstractRange.isNativeControlRange = function(range) { 
  return ! ! range && ! ! range.addElement; 
}; 
goog.dom.AbstractRange.prototype.clone = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getType = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getBrowserRangeObject = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.setBrowserRangeObject = function(nativeRange) { 
  return false; 
}; 
goog.dom.AbstractRange.prototype.getTextRangeCount = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getTextRange = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getTextRanges = function() { 
  var output =[]; 
  for(var i = 0, len = this.getTextRangeCount(); i < len; i ++) { 
    output.push(this.getTextRange(i)); 
  } 
  return output; 
}; 
goog.dom.AbstractRange.prototype.getContainer = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getContainerElement = function() { 
  var node = this.getContainer(); 
  return(node.nodeType == goog.dom.NodeType.ELEMENT ? node: node.parentNode); 
}; 
goog.dom.AbstractRange.prototype.getStartNode = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getStartOffset = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getEndNode = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getEndOffset = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getAnchorNode = function() { 
  return this.isReversed() ? this.getEndNode(): this.getStartNode(); 
}; 
goog.dom.AbstractRange.prototype.getAnchorOffset = function() { 
  return this.isReversed() ? this.getEndOffset(): this.getStartOffset(); 
}; 
goog.dom.AbstractRange.prototype.getFocusNode = function() { 
  return this.isReversed() ? this.getStartNode(): this.getEndNode(); 
}; 
goog.dom.AbstractRange.prototype.getFocusOffset = function() { 
  return this.isReversed() ? this.getStartOffset(): this.getEndOffset(); 
}; 
goog.dom.AbstractRange.prototype.isReversed = function() { 
  return false; 
}; 
goog.dom.AbstractRange.prototype.getDocument = function() { 
  return goog.dom.getOwnerDocument(goog.userAgent.IE ? this.getContainer(): this.getStartNode()); 
}; 
goog.dom.AbstractRange.prototype.getWindow = function() { 
  return goog.dom.getWindow(this.getDocument()); 
}; 
goog.dom.AbstractRange.prototype.containsRange = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.containsNode = function(node, opt_allowPartial) { 
  return this.containsRange(goog.dom.Range.createFromNodeContents(node), opt_allowPartial); 
}; 
goog.dom.AbstractRange.prototype.isRangeInDocument = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.isCollapsed = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getText = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getHtmlFragment = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getValidHtml = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.getPastableHtml = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.__iterator__ = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.select = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.removeContents = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.insertNode = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.replaceContentsWithNode = function(node) { 
  if(! this.isCollapsed()) { 
    this.removeContents(); 
  } 
  return this.insertNode(node, true); 
}; 
goog.dom.AbstractRange.prototype.surroundWithNodes = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.saveUsingDom = goog.abstractMethod; 
goog.dom.AbstractRange.prototype.saveUsingCarets = function() { 
  return(this.getStartNode() && this.getEndNode()) ? new goog.dom.SavedCaretRange(this): null; 
}; 
goog.dom.AbstractRange.prototype.collapse = goog.abstractMethod; 
goog.dom.RangeIterator = function(node, opt_reverse) { 
  goog.dom.TagIterator.call(this, node, opt_reverse, true); 
}; 
goog.inherits(goog.dom.RangeIterator, goog.dom.TagIterator); 
goog.dom.RangeIterator.prototype.getStartTextOffset = goog.abstractMethod; 
goog.dom.RangeIterator.prototype.getEndTextOffset = goog.abstractMethod; 
goog.dom.RangeIterator.prototype.getStartNode = goog.abstractMethod; 
goog.dom.RangeIterator.prototype.getEndNode = goog.abstractMethod; 
goog.dom.RangeIterator.prototype.isLast = goog.abstractMethod; 
