
goog.provide('goog.dom.browserrange.OperaRange'); 
goog.require('goog.dom.browserrange.W3cRange'); 
goog.dom.browserrange.OperaRange = function(range) { 
  goog.dom.browserrange.W3cRange.call(this, range); 
}; 
goog.inherits(goog.dom.browserrange.OperaRange, goog.dom.browserrange.W3cRange); 
goog.dom.browserrange.OperaRange.createFromNodeContents = function(node) { 
  return new goog.dom.browserrange.OperaRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node)); 
}; 
goog.dom.browserrange.OperaRange.createFromNodes = function(startNode, startOffset, endNode, endOffset) { 
  return new goog.dom.browserrange.OperaRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode, startOffset, endNode, endOffset)); 
}; 
goog.dom.browserrange.OperaRange.prototype.selectInternal = function(selection, reversed) { 
  selection.collapse(this.getStartNode(), this.getStartOffset()); 
  if(this.getEndNode() != this.getStartNode() || this.getEndOffset() != this.getStartOffset()) { 
    selection.extend(this.getEndNode(), this.getEndOffset()); 
  } 
  if(selection.rangeCount == 0) { 
    selection.addRange(this.range_); 
  } 
}; 
