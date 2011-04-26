
goog.provide('goog.dom.SavedCaretRange'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.SavedRange'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.string'); 
goog.dom.SavedCaretRange = function(range) { 
  goog.dom.SavedRange.call(this); 
  this.startCaretId_ = goog.string.createUniqueString(); 
  this.endCaretId_ = goog.string.createUniqueString(); 
  this.dom_ = goog.dom.getDomHelper(range.getDocument()); 
  range.surroundWithNodes(this.createCaret_(true), this.createCaret_(false)); 
}; 
goog.inherits(goog.dom.SavedCaretRange, goog.dom.SavedRange); 
goog.dom.SavedCaretRange.prototype.toAbstractRange = function() { 
  var range = null; 
  var startCaret = this.getCaret(true); 
  var endCaret = this.getCaret(false); 
  if(startCaret && endCaret) { 
    range = goog.dom.Range.createFromNodes(startCaret, 0, endCaret, 0); 
  } 
  return range; 
}; 
goog.dom.SavedCaretRange.prototype.getCaret = function(start) { 
  return this.dom_.getElement(start ? this.startCaretId_: this.endCaretId_); 
}; 
goog.dom.SavedCaretRange.prototype.removeCarets = function(opt_range) { 
  goog.dom.removeNode(this.getCaret(true)); 
  goog.dom.removeNode(this.getCaret(false)); 
  return opt_range; 
}; 
goog.dom.SavedCaretRange.prototype.setRestorationDocument = function(doc) { 
  this.dom_.setDocument(doc); 
}; 
goog.dom.SavedCaretRange.prototype.restoreInternal = function() { 
  var range = null; 
  var startCaret = this.getCaret(true); 
  var endCaret = this.getCaret(false); 
  if(startCaret && endCaret) { 
    var startNode = startCaret.parentNode; 
    var startOffset = goog.array.indexOf(startNode.childNodes, startCaret); 
    var endNode = endCaret.parentNode; 
    var endOffset = goog.array.indexOf(endNode.childNodes, endCaret); 
    if(endNode == startNode) { 
      endOffset -= 1; 
    } 
    range = goog.dom.Range.createFromNodes(startNode, startOffset, endNode, endOffset); 
    range = this.removeCarets(range); 
    range.select(); 
  } else { 
    this.removeCarets(); 
  } 
  return range; 
}; 
goog.dom.SavedCaretRange.prototype.disposeInternal = function() { 
  this.removeCarets(); 
  this.dom_ = null; 
}; 
goog.dom.SavedCaretRange.prototype.createCaret_ = function(start) { 
  return this.dom_.createDom(goog.dom.TagName.SPAN, { 'id': start ? this.startCaretId_: this.endCaretId_ }); 
}; 
goog.dom.SavedCaretRange.CARET_REGEX = /<span\s+id="?goog_\d+"?><\/span>/ig; 
goog.dom.SavedCaretRange.htmlEqual = function(str1, str2) { 
  return str1 == str2 || str1.replace(goog.dom.SavedCaretRange.CARET_REGEX, '') == str2.replace(goog.dom.SavedCaretRange.CARET_REGEX, ''); 
}; 
