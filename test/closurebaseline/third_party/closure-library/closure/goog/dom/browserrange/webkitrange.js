
goog.provide('goog.dom.browserrange.WebKitRange'); 
goog.require('goog.dom.RangeEndpoint'); 
goog.require('goog.dom.browserrange.W3cRange'); 
goog.require('goog.userAgent'); 
goog.dom.browserrange.WebKitRange = function(range) { 
  goog.dom.browserrange.W3cRange.call(this, range); 
}; 
goog.inherits(goog.dom.browserrange.WebKitRange, goog.dom.browserrange.W3cRange); 
goog.dom.browserrange.WebKitRange.createFromNodeContents = function(node) { 
  return new goog.dom.browserrange.WebKitRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node)); 
}; 
goog.dom.browserrange.WebKitRange.createFromNodes = function(startNode, startOffset, endNode, endOffset) { 
  return new goog.dom.browserrange.WebKitRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode, startOffset, endNode, endOffset)); 
}; 
goog.dom.browserrange.WebKitRange.prototype.compareBrowserRangeEndpoints = function(range, thisEndpoint, otherEndpoint) { 
  if(goog.userAgent.isVersion('528')) { 
    return(goog.dom.browserrange.WebKitRange.superClass_.compareBrowserRangeEndpoints.call(this, range, thisEndpoint, otherEndpoint)); 
  } 
  return this.range_.compareBoundaryPoints(otherEndpoint == goog.dom.RangeEndpoint.START ?(thisEndpoint == goog.dom.RangeEndpoint.START ? goog.global['Range'].START_TO_START: goog.global['Range'].END_TO_START):(thisEndpoint == goog.dom.RangeEndpoint.START ? goog.global['Range'].START_TO_END: goog.global['Range'].END_TO_END),(range)); 
}; 
goog.dom.browserrange.WebKitRange.prototype.selectInternal = function(selection, reversed) { 
  selection.removeAllRanges(); 
  if(reversed) { 
    selection.setBaseAndExtent(this.getEndNode(), this.getEndOffset(), this.getStartNode(), this.getStartOffset()); 
  } else { 
    selection.setBaseAndExtent(this.getStartNode(), this.getStartOffset(), this.getEndNode(), this.getEndOffset()); 
  } 
}; 
