
goog.provide('goog.dom.browserrange.GeckoRange'); 
goog.require('goog.dom.browserrange.W3cRange'); 
goog.dom.browserrange.GeckoRange = function(range) { 
  goog.dom.browserrange.W3cRange.call(this, range); 
}; 
goog.inherits(goog.dom.browserrange.GeckoRange, goog.dom.browserrange.W3cRange); 
goog.dom.browserrange.GeckoRange.createFromNodeContents = function(node) { 
  return new goog.dom.browserrange.GeckoRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node)); 
}; 
goog.dom.browserrange.GeckoRange.createFromNodes = function(startNode, startOffset, endNode, endOffset) { 
  return new goog.dom.browserrange.GeckoRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode, startOffset, endNode, endOffset)); 
}; 
goog.dom.browserrange.GeckoRange.prototype.selectInternal = function(selection, reversed) { 
  var anchorNode = reversed ? this.getEndNode(): this.getStartNode(); 
  var anchorOffset = reversed ? this.getEndOffset(): this.getStartOffset(); 
  var focusNode = reversed ? this.getStartNode(): this.getEndNode(); 
  var focusOffset = reversed ? this.getStartOffset(): this.getEndOffset(); 
  selection.collapse(anchorNode, anchorOffset); 
  if(anchorNode != focusNode || anchorOffset != focusOffset) { 
    selection.extend(focusNode, focusOffset); 
  } 
}; 
