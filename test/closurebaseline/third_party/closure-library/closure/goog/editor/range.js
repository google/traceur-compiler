
goog.provide('goog.editor.range'); 
goog.provide('goog.editor.range.Point'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.Range'); 
goog.require('goog.dom.RangeEndpoint'); 
goog.require('goog.dom.SavedCaretRange'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.style'); 
goog.require('goog.iter'); 
goog.editor.range.narrow = function(range, el) { 
  var startContainer = range.getStartNode(); 
  var endContainer = range.getEndNode(); 
  if(startContainer && endContainer) { 
    var isElement = function(node) { 
      return node == el; 
    }; 
    var hasStart = goog.dom.getAncestor(startContainer, isElement, true); 
    var hasEnd = goog.dom.getAncestor(endContainer, isElement, true); 
    if(hasStart && hasEnd) { 
      return range.clone(); 
    } else if(hasStart) { 
      var leaf = goog.editor.node.getRightMostLeaf(el); 
      return goog.dom.Range.createFromNodes(range.getStartNode(), range.getStartOffset(), leaf, goog.editor.node.getLength(leaf)); 
    } else if(hasEnd) { 
      return goog.dom.Range.createFromNodes(goog.editor.node.getLeftMostLeaf(el), 0, range.getEndNode(), range.getEndOffset()); 
    } 
  } 
  return null; 
}; 
goog.editor.range.expand = function(range, opt_stopNode) { 
  var expandedRange = goog.editor.range.expandEndPointToContainer_(range, goog.dom.RangeEndpoint.START, opt_stopNode); 
  expandedRange = goog.editor.range.expandEndPointToContainer_(expandedRange, goog.dom.RangeEndpoint.END, opt_stopNode); 
  var startNode = expandedRange.getStartNode(); 
  var endNode = expandedRange.getEndNode(); 
  var startOffset = expandedRange.getStartOffset(); 
  var endOffset = expandedRange.getEndOffset(); 
  if(startNode == endNode) { 
    while(endNode != opt_stopNode && startOffset == 0 && endOffset == goog.editor.node.getLength(endNode)) { 
      var parentNode = endNode.parentNode; 
      startOffset = goog.array.indexOf(parentNode.childNodes, endNode); 
      endOffset = startOffset + 1; 
      endNode = parentNode; 
    } 
    startNode = endNode; 
  } 
  return goog.dom.Range.createFromNodes(startNode, startOffset, endNode, endOffset); 
}; 
goog.editor.range.expandEndPointToContainer_ = function(range, endpoint, opt_stopNode) { 
  var expandStart = endpoint == goog.dom.RangeEndpoint.START; 
  var node = expandStart ? range.getStartNode(): range.getEndNode(); 
  var offset = expandStart ? range.getStartOffset(): range.getEndOffset(); 
  var container = range.getContainerElement(); 
  while(node != container && node != opt_stopNode) { 
    if(expandStart && offset != 0 || ! expandStart && offset != goog.editor.node.getLength(node)) { 
      break; 
    } 
    var parentNode = node.parentNode; 
    var index = goog.array.indexOf(parentNode.childNodes, node); 
    offset = expandStart ? index: index + 1; 
    node = parentNode; 
  } 
  return goog.dom.Range.createFromNodes(expandStart ? node: range.getStartNode(), expandStart ? offset: range.getStartOffset(), expandStart ? range.getEndNode(): node, expandStart ? range.getEndOffset(): offset); 
}; 
goog.editor.range.selectNodeStart = function(node) { 
  goog.dom.Range.createCaret(goog.editor.node.getLeftMostLeaf(node), 0).select(); 
}; 
goog.editor.range.placeCursorNextTo = function(node, toLeft) { 
  var parent = node.parentNode; 
  var offset = goog.array.indexOf(parent.childNodes, node) +(toLeft ? 0: 1); 
  var point = goog.editor.range.Point.createDeepestPoint(parent, offset, toLeft); 
  var range = goog.dom.Range.createCaret(point.node, point.offset); 
  range.select(); 
  return range; 
}; 
goog.editor.range.selectionPreservingNormalize = function(node) { 
  var doc = goog.dom.getOwnerDocument(node); 
  var selection = goog.dom.Range.createFromWindow(goog.dom.getWindow(doc)); 
  var normalizedRange = goog.editor.range.rangePreservingNormalize(node, selection); 
  if(normalizedRange) { 
    normalizedRange.select(); 
  } 
}; 
goog.editor.range.normalizeNodeIe_ = function(node) { 
  var lastText = null; 
  var child = node.firstChild; 
  while(child) { 
    var next = child.nextSibling; 
    if(child.nodeType == goog.dom.NodeType.TEXT) { 
      if(child.nodeValue == '') { 
        node.removeChild(child); 
      } else if(lastText) { 
        lastText.nodeValue += child.nodeValue; 
        node.removeChild(child); 
      } else { 
        lastText = child; 
      } 
    } else { 
      goog.editor.range.normalizeNodeIe_(child); 
      lastText = null; 
    } 
    child = next; 
  } 
}; 
goog.editor.range.normalizeNode = function(node) { 
  if(goog.userAgent.IE) { 
    goog.editor.range.normalizeNodeIe_(node); 
  } else { 
    node.normalize(); 
  } 
}; 
goog.editor.range.rangePreservingNormalize = function(node, range) { 
  if(range) { 
    var rangeFactory = goog.editor.range.normalize(range); 
    var container = goog.editor.style.getContainer(range.getContainerElement()); 
  } 
  if(container) { 
    goog.editor.range.normalizeNode(goog.dom.findCommonAncestor(container, node)); 
  } else if(node) { 
    goog.editor.range.normalizeNode(node); 
  } 
  if(rangeFactory) { 
    return rangeFactory(); 
  } else { 
    return null; 
  } 
}; 
goog.editor.range.getDeepEndPoint = function(range, atStart) { 
  return atStart ? goog.editor.range.Point.createDeepestPoint(range.getStartNode(), range.getStartOffset()): goog.editor.range.Point.createDeepestPoint(range.getEndNode(), range.getEndOffset()); 
}; 
goog.editor.range.normalize = function(range) { 
  var startPoint = goog.editor.range.normalizePoint_(goog.editor.range.getDeepEndPoint(range, true)); 
  var startParent = startPoint.getParentPoint(); 
  var startPreviousSibling = startPoint.node.previousSibling; 
  if(startPoint.node.nodeType == goog.dom.NodeType.TEXT) { 
    startPoint.node = null; 
  } 
  var endPoint = goog.editor.range.normalizePoint_(goog.editor.range.getDeepEndPoint(range, false)); 
  var endParent = endPoint.getParentPoint(); 
  var endPreviousSibling = endPoint.node.previousSibling; 
  if(endPoint.node.nodeType == goog.dom.NodeType.TEXT) { 
    endPoint.node = null; 
  } 
  return function() { 
    if(! startPoint.node && startPreviousSibling) { 
      startPoint.node = startPreviousSibling.nextSibling; 
      if(! startPoint.node) { 
        startPoint = goog.editor.range.Point.getPointAtEndOfNode(startPreviousSibling); 
      } 
    } 
    if(! endPoint.node && endPreviousSibling) { 
      endPoint.node = endPreviousSibling.nextSibling; 
      if(! endPoint.node) { 
        endPoint = goog.editor.range.Point.getPointAtEndOfNode(endPreviousSibling); 
      } 
    } 
    return goog.dom.Range.createFromNodes(startPoint.node || startParent.node.firstChild || startParent.node, startPoint.offset, endPoint.node || endParent.node.firstChild || endParent.node, endPoint.offset); 
  }; 
}; 
goog.editor.range.normalizePoint_ = function(point) { 
  var previous; 
  if(point.node.nodeType == goog.dom.NodeType.TEXT) { 
    for(var current = point.node.previousSibling; current && current.nodeType == goog.dom.NodeType.TEXT; current = current.previousSibling) { 
      point.offset += goog.editor.node.getLength(current); 
    } 
    previous = current; 
  } else { 
    previous = point.node.previousSibling; 
  } 
  var parent = point.node.parentNode; 
  point.node = previous ? previous.nextSibling: parent.firstChild; 
  return point; 
}; 
goog.editor.range.isEditable = function(range) { 
  var rangeContainer = range.getContainerElement(); 
  var rangeContainerIsOutsideRange = range.getStartNode() != rangeContainer.parentElement; 
  return(rangeContainerIsOutsideRange && goog.editor.node.isEditableContainer(rangeContainer)) || goog.editor.node.isEditable(rangeContainer); 
}; 
goog.editor.range.intersectsTag = function(range, tagName) { 
  if(goog.dom.getAncestorByTagNameAndClass(range.getContainerElement(), tagName)) { 
    return true; 
  } 
  return goog.iter.some(range, function(node) { 
    return node.tagName == tagName; 
  }); 
}; 
goog.editor.range.Point = function(node, offset) { 
  this.node = node; 
  this.offset = offset; 
}; 
goog.editor.range.Point.prototype.getParentPoint = function() { 
  var parent = this.node.parentNode; 
  return new goog.editor.range.Point(parent, goog.array.indexOf(parent.childNodes, this.node)); 
}; 
goog.editor.range.Point.createDeepestPoint = function(node, offset, opt_trendLeft) { 
  while(node.nodeType == goog.dom.NodeType.ELEMENT) { 
    var child = node.childNodes[offset]; 
    if(! child && ! node.lastChild) { 
      break; 
    } 
    if(child) { 
      var prevSibling = child.previousSibling; 
      if(opt_trendLeft && prevSibling) { 
        node = prevSibling; 
        offset = goog.editor.node.getLength(node); 
      } else { 
        node = child; 
        offset = 0; 
      } 
    } else { 
      node = node.lastChild; 
      offset = goog.editor.node.getLength(node); 
    } 
  } 
  return new goog.editor.range.Point(node, offset); 
}; 
goog.editor.range.Point.getPointAtEndOfNode = function(node) { 
  return new goog.editor.range.Point(node, goog.editor.node.getLength(node)); 
}; 
goog.editor.range.saveUsingNormalizedCarets = function(range) { 
  return new goog.editor.range.NormalizedCaretRange_(range); 
}; 
goog.editor.range.NormalizedCaretRange_ = function(range) { 
  goog.dom.SavedCaretRange.call(this, range); 
}; 
goog.inherits(goog.editor.range.NormalizedCaretRange_, goog.dom.SavedCaretRange); 
goog.editor.range.NormalizedCaretRange_.prototype.removeCarets = function(opt_range) { 
  var startCaret = this.getCaret(true); 
  var endCaret = this.getCaret(false); 
  var node = startCaret && endCaret ? goog.dom.findCommonAncestor(startCaret, endCaret): startCaret || endCaret; 
  goog.editor.range.NormalizedCaretRange_.superClass_.removeCarets.call(this); 
  if(opt_range) { 
    return goog.editor.range.rangePreservingNormalize(node, opt_range); 
  } else if(node) { 
    goog.editor.range.selectionPreservingNormalize(node); 
  } 
}; 
