
goog.provide('goog.dom.browserrange.W3cRange'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.RangeEndpoint'); 
goog.require('goog.dom.browserrange.AbstractRange'); 
goog.require('goog.string'); 
goog.dom.browserrange.W3cRange = function(range) { 
  this.range_ = range; 
}; 
goog.inherits(goog.dom.browserrange.W3cRange, goog.dom.browserrange.AbstractRange); 
goog.dom.browserrange.W3cRange.getBrowserRangeForNode = function(node) { 
  var nodeRange = goog.dom.getOwnerDocument(node).createRange(); 
  if(node.nodeType == goog.dom.NodeType.TEXT) { 
    nodeRange.setStart(node, 0); 
    nodeRange.setEnd(node, node.length); 
  } else { 
    if(! goog.dom.browserrange.canContainRangeEndpoint(node)) { 
      var rangeParent = node.parentNode; 
      var rangeStartOffset = goog.array.indexOf(rangeParent.childNodes, node); 
      nodeRange.setStart(rangeParent, rangeStartOffset); 
      nodeRange.setEnd(rangeParent, rangeStartOffset + 1); 
    } else { 
      var tempNode, leaf = node; 
      while((tempNode = leaf.firstChild) && goog.dom.browserrange.canContainRangeEndpoint(tempNode)) { 
        leaf = tempNode; 
      } 
      nodeRange.setStart(leaf, 0); 
      leaf = node; 
      while((tempNode = leaf.lastChild) && goog.dom.browserrange.canContainRangeEndpoint(tempNode)) { 
        leaf = tempNode; 
      } 
      nodeRange.setEnd(leaf, leaf.nodeType == goog.dom.NodeType.ELEMENT ? leaf.childNodes.length: leaf.length); 
    } 
  } 
  return nodeRange; 
}; 
goog.dom.browserrange.W3cRange.getBrowserRangeForNodes = function(startNode, startOffset, endNode, endOffset) { 
  var nodeRange = goog.dom.getOwnerDocument(startNode).createRange(); 
  nodeRange.setStart(startNode, startOffset); 
  nodeRange.setEnd(endNode, endOffset); 
  return nodeRange; 
}; 
goog.dom.browserrange.W3cRange.createFromNodeContents = function(node) { 
  return new goog.dom.browserrange.W3cRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node)); 
}; 
goog.dom.browserrange.W3cRange.createFromNodes = function(startNode, startOffset, endNode, endOffset) { 
  return new goog.dom.browserrange.W3cRange(goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode, startOffset, endNode, endOffset)); 
}; 
goog.dom.browserrange.W3cRange.prototype.clone = function() { 
  return new this.constructor(this.range_.cloneRange()); 
}; 
goog.dom.browserrange.W3cRange.prototype.getBrowserRange = function() { 
  return this.range_; 
}; 
goog.dom.browserrange.W3cRange.prototype.getContainer = function() { 
  return this.range_.commonAncestorContainer; 
}; 
goog.dom.browserrange.W3cRange.prototype.getStartNode = function() { 
  return this.range_.startContainer; 
}; 
goog.dom.browserrange.W3cRange.prototype.getStartOffset = function() { 
  return this.range_.startOffset; 
}; 
goog.dom.browserrange.W3cRange.prototype.getEndNode = function() { 
  return this.range_.endContainer; 
}; 
goog.dom.browserrange.W3cRange.prototype.getEndOffset = function() { 
  return this.range_.endOffset; 
}; 
goog.dom.browserrange.W3cRange.prototype.compareBrowserRangeEndpoints = function(range, thisEndpoint, otherEndpoint) { 
  return this.range_.compareBoundaryPoints(otherEndpoint == goog.dom.RangeEndpoint.START ?(thisEndpoint == goog.dom.RangeEndpoint.START ? goog.global['Range'].START_TO_START: goog.global['Range'].START_TO_END):(thisEndpoint == goog.dom.RangeEndpoint.START ? goog.global['Range'].END_TO_START: goog.global['Range'].END_TO_END),(range)); 
}; 
goog.dom.browserrange.W3cRange.prototype.isCollapsed = function() { 
  return this.range_.collapsed; 
}; 
goog.dom.browserrange.W3cRange.prototype.getText = function() { 
  return this.range_.toString(); 
}; 
goog.dom.browserrange.W3cRange.prototype.getValidHtml = function() { 
  var div = goog.dom.getDomHelper(this.range_.startContainer).createDom('div'); 
  div.appendChild(this.range_.cloneContents()); 
  var result = div.innerHTML; 
  if(goog.string.startsWith(result, '<') || ! this.isCollapsed() && ! goog.string.contains(result, '<')) { 
    return result; 
  } 
  var container = this.getContainer(); 
  container = container.nodeType == goog.dom.NodeType.ELEMENT ? container: container.parentNode; 
  var html = goog.dom.getOuterHtml((container.cloneNode(false))); 
  return html.replace('>', '>' + result); 
}; 
goog.dom.browserrange.W3cRange.prototype.select = function(reverse) { 
  var win = goog.dom.getWindow(goog.dom.getOwnerDocument(this.getStartNode())); 
  this.selectInternal(win.getSelection(), reverse); 
}; 
goog.dom.browserrange.W3cRange.prototype.selectInternal = function(selection, reverse) { 
  selection.removeAllRanges(); 
  selection.addRange(this.range_); 
}; 
goog.dom.browserrange.W3cRange.prototype.removeContents = function() { 
  var range = this.range_; 
  range.extractContents(); 
  if(range.startContainer.hasChildNodes()) { 
    var rangeStartContainer = range.startContainer.childNodes[range.startOffset]; 
    if(rangeStartContainer) { 
      var rangePrevious = rangeStartContainer.previousSibling; 
      if(goog.dom.getRawTextContent(rangeStartContainer) == '') { 
        goog.dom.removeNode(rangeStartContainer); 
      } 
      if(rangePrevious && goog.dom.getRawTextContent(rangePrevious) == '') { 
        goog.dom.removeNode(rangePrevious); 
      } 
    } 
  } 
}; 
goog.dom.browserrange.W3cRange.prototype.surroundContents = function(element) { 
  this.range_.surroundContents(element); 
  return element; 
}; 
goog.dom.browserrange.W3cRange.prototype.insertNode = function(node, before) { 
  var range = this.range_.cloneRange(); 
  range.collapse(before); 
  range.insertNode(node); 
  range.detach(); 
  return node; 
}; 
goog.dom.browserrange.W3cRange.prototype.surroundWithNodes = function(startNode, endNode) { 
  var win = goog.dom.getWindow(goog.dom.getOwnerDocument(this.getStartNode())); 
  var selectionRange = goog.dom.Range.createFromWindow(win); 
  if(selectionRange) { 
    var sNode = selectionRange.getStartNode(); 
    var eNode = selectionRange.getEndNode(); 
    var sOffset = selectionRange.getStartOffset(); 
    var eOffset = selectionRange.getEndOffset(); 
  } 
  var clone1 = this.range_.cloneRange(); 
  var clone2 = this.range_.cloneRange(); 
  clone1.collapse(false); 
  clone2.collapse(true); 
  clone1.insertNode(endNode); 
  clone2.insertNode(startNode); 
  clone1.detach(); 
  clone2.detach(); 
  if(selectionRange) { 
    var isInsertedNode = function(n) { 
      return n == startNode || n == endNode; 
    }; 
    if(sNode.nodeType == goog.dom.NodeType.TEXT) { 
      while(sOffset > sNode.length) { 
        sOffset -= sNode.length; 
        do { 
          sNode = sNode.nextSibling; 
        } while(isInsertedNode(sNode)); 
      } 
    } 
    if(eNode.nodeType == goog.dom.NodeType.TEXT) { 
      while(eOffset > eNode.length) { 
        eOffset -= eNode.length; 
        do { 
          eNode = eNode.nextSibling; 
        } while(isInsertedNode(eNode)); 
      } 
    } 
    goog.dom.Range.createFromNodes(sNode,(sOffset), eNode,(eOffset)).select(); 
  } 
}; 
goog.dom.browserrange.W3cRange.prototype.collapse = function(toStart) { 
  this.range_.collapse(toStart); 
}; 
