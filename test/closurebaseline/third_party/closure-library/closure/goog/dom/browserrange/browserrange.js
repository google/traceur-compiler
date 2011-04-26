
goog.provide('goog.dom.browserrange'); 
goog.provide('goog.dom.browserrange.Error'); 
goog.require('goog.dom'); 
goog.require('goog.dom.browserrange.GeckoRange'); 
goog.require('goog.dom.browserrange.IeRange'); 
goog.require('goog.dom.browserrange.OperaRange'); 
goog.require('goog.dom.browserrange.W3cRange'); 
goog.require('goog.dom.browserrange.WebKitRange'); 
goog.require('goog.userAgent'); 
goog.dom.browserrange.Error = { NOT_IMPLEMENTED: 'Not Implemented' }; 
goog.dom.browserrange.createRange = function(range) { 
  if(goog.userAgent.IE && ! goog.userAgent.isDocumentMode(9)) { 
    return new goog.dom.browserrange.IeRange((range), goog.dom.getOwnerDocument(range.parentElement())); 
  } else if(goog.userAgent.WEBKIT) { 
    return new goog.dom.browserrange.WebKitRange((range)); 
  } else if(goog.userAgent.GECKO) { 
    return new goog.dom.browserrange.GeckoRange((range)); 
  } else if(goog.userAgent.OPERA) { 
    return new goog.dom.browserrange.OperaRange((range)); 
  } else { 
    return new goog.dom.browserrange.W3cRange((range)); 
  } 
}; 
goog.dom.browserrange.createRangeFromNodeContents = function(node) { 
  if(goog.userAgent.IE && ! goog.userAgent.isDocumentMode(9)) { 
    return goog.dom.browserrange.IeRange.createFromNodeContents(node); 
  } else if(goog.userAgent.WEBKIT) { 
    return goog.dom.browserrange.WebKitRange.createFromNodeContents(node); 
  } else if(goog.userAgent.GECKO) { 
    return goog.dom.browserrange.GeckoRange.createFromNodeContents(node); 
  } else if(goog.userAgent.OPERA) { 
    return goog.dom.browserrange.OperaRange.createFromNodeContents(node); 
  } else { 
    return goog.dom.browserrange.W3cRange.createFromNodeContents(node); 
  } 
}; 
goog.dom.browserrange.createRangeFromNodes = function(startNode, startOffset, endNode, endOffset) { 
  if(goog.userAgent.IE && ! goog.userAgent.isDocumentMode(9)) { 
    return goog.dom.browserrange.IeRange.createFromNodes(startNode, startOffset, endNode, endOffset); 
  } else if(goog.userAgent.WEBKIT) { 
    return goog.dom.browserrange.WebKitRange.createFromNodes(startNode, startOffset, endNode, endOffset); 
  } else if(goog.userAgent.GECKO) { 
    return goog.dom.browserrange.GeckoRange.createFromNodes(startNode, startOffset, endNode, endOffset); 
  } else if(goog.userAgent.OPERA) { 
    return goog.dom.browserrange.OperaRange.createFromNodes(startNode, startOffset, endNode, endOffset); 
  } else { 
    return goog.dom.browserrange.W3cRange.createFromNodes(startNode, startOffset, endNode, endOffset); 
  } 
}; 
goog.dom.browserrange.canContainRangeEndpoint = function(node) { 
  return goog.dom.canHaveChildren(node) || node.nodeType == goog.dom.NodeType.TEXT; 
}; 
