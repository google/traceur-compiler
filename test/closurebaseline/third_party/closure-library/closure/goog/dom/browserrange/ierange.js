
goog.provide('goog.dom.browserrange.IeRange'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeIterator'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.RangeEndpoint'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.browserrange.AbstractRange'); 
goog.require('goog.iter'); 
goog.require('goog.iter.StopIteration'); 
goog.require('goog.string'); 
goog.dom.browserrange.IeRange = function(range, doc) { 
  this.range_ = range; 
  this.doc_ = doc; 
}; 
goog.inherits(goog.dom.browserrange.IeRange, goog.dom.browserrange.AbstractRange); 
goog.dom.browserrange.IeRange.logger_ = goog.debug.Logger.getLogger('goog.dom.browserrange.IeRange'); 
goog.dom.browserrange.IeRange.getBrowserRangeForNode_ = function(node) { 
  var nodeRange = goog.dom.getOwnerDocument(node).body.createTextRange(); 
  if(node.nodeType == goog.dom.NodeType.ELEMENT) { 
    nodeRange.moveToElementText(node); 
    if(goog.dom.browserrange.canContainRangeEndpoint(node) && ! node.childNodes.length) { 
      nodeRange.collapse(false); 
    } 
  } else { 
    var offset = 0; 
    var sibling = node; 
    while(sibling = sibling.previousSibling) { 
      var nodeType = sibling.nodeType; 
      if(nodeType == goog.dom.NodeType.TEXT) { 
        offset += sibling.length; 
      } else if(nodeType == goog.dom.NodeType.ELEMENT) { 
        nodeRange.moveToElementText(sibling); 
        break; 
      } 
    } 
    if(! sibling) { 
      nodeRange.moveToElementText(node.parentNode); 
    } 
    nodeRange.collapse(! sibling); 
    if(offset) { 
      nodeRange.move('character', offset); 
    } 
    nodeRange.moveEnd('character', node.length); 
  } 
  return nodeRange; 
}; 
goog.dom.browserrange.IeRange.getBrowserRangeForNodes_ = function(startNode, startOffset, endNode, endOffset) { 
  var child, collapse = false; 
  if(startNode.nodeType == goog.dom.NodeType.ELEMENT) { 
    if(startOffset > startNode.childNodes.length) { 
      goog.dom.browserrange.IeRange.logger_.severe('Cannot have startOffset > startNode child count'); 
    } 
    child = startNode.childNodes[startOffset]; 
    collapse = ! child; 
    startNode = child || startNode.lastChild || startNode; 
    startOffset = 0; 
  } 
  var leftRange = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(startNode); 
  if(startOffset) { 
    leftRange.move('character', startOffset); 
  } 
  if(startNode == endNode && startOffset == endOffset) { 
    leftRange.collapse(true); 
    return leftRange; 
  } 
  if(collapse) { 
    leftRange.collapse(false); 
  } 
  collapse = false; 
  if(endNode.nodeType == goog.dom.NodeType.ELEMENT) { 
    if(endOffset > endNode.childNodes.length) { 
      goog.dom.browserrange.IeRange.logger_.severe('Cannot have endOffset > endNode child count'); 
    } 
    child = endNode.childNodes[endOffset]; 
    endNode = child || endNode.lastChild || endNode; 
    endOffset = 0; 
    collapse = ! child; 
  } 
  var rightRange = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(endNode); 
  rightRange.collapse(! collapse); 
  if(endOffset) { 
    rightRange.moveEnd('character', endOffset); 
  } 
  leftRange.setEndPoint('EndToEnd', rightRange); 
  return leftRange; 
}; 
goog.dom.browserrange.IeRange.createFromNodeContents = function(node) { 
  var range = new goog.dom.browserrange.IeRange(goog.dom.browserrange.IeRange.getBrowserRangeForNode_(node), goog.dom.getOwnerDocument(node)); 
  if(! goog.dom.browserrange.canContainRangeEndpoint(node)) { 
    range.startNode_ = range.endNode_ = range.parentNode_ = node.parentNode; 
    range.startOffset_ = goog.array.indexOf(range.parentNode_.childNodes, node); 
    range.endOffset_ = range.startOffset_ + 1; 
  } else { 
    var tempNode, leaf = node; 
    while((tempNode = leaf.firstChild) && goog.dom.browserrange.canContainRangeEndpoint(tempNode)) { 
      leaf = tempNode; 
    } 
    range.startNode_ = leaf; 
    range.startOffset_ = 0; 
    leaf = node; 
    while((tempNode = leaf.lastChild) && goog.dom.browserrange.canContainRangeEndpoint(tempNode)) { 
      leaf = tempNode; 
    } 
    range.endNode_ = leaf; 
    range.endOffset_ = leaf.nodeType == goog.dom.NodeType.ELEMENT ? leaf.childNodes.length: leaf.length; 
    range.parentNode_ = node; 
  } 
  return range; 
}; 
goog.dom.browserrange.IeRange.createFromNodes = function(startNode, startOffset, endNode, endOffset) { 
  var range = new goog.dom.browserrange.IeRange(goog.dom.browserrange.IeRange.getBrowserRangeForNodes_(startNode, startOffset, endNode, endOffset), goog.dom.getOwnerDocument(startNode)); 
  range.startNode_ = startNode; 
  range.startOffset_ = startOffset; 
  range.endNode_ = endNode; 
  range.endOffset_ = endOffset; 
  return range; 
}; 
goog.dom.browserrange.IeRange.prototype.parentNode_ = null; 
goog.dom.browserrange.IeRange.prototype.startNode_ = null; 
goog.dom.browserrange.IeRange.prototype.endNode_ = null; 
goog.dom.browserrange.IeRange.prototype.startOffset_ = - 1; 
goog.dom.browserrange.IeRange.prototype.endOffset_ = - 1; 
goog.dom.browserrange.IeRange.prototype.clone = function() { 
  var range = new goog.dom.browserrange.IeRange(this.range_.duplicate(), this.doc_); 
  range.parentNode_ = this.parentNode_; 
  range.startNode_ = this.startNode_; 
  range.endNode_ = this.endNode_; 
  return range; 
}; 
goog.dom.browserrange.IeRange.prototype.getBrowserRange = function() { 
  return this.range_; 
}; 
goog.dom.browserrange.IeRange.prototype.clearCachedValues_ = function() { 
  this.parentNode_ = this.startNode_ = this.endNode_ = null; 
  this.startOffset_ = this.endOffset_ = - 1; 
}; 
goog.dom.browserrange.IeRange.prototype.getContainer = function() { 
  if(! this.parentNode_) { 
    var selectText = this.range_.text; 
    var range = this.range_.duplicate(); 
    var rightTrimmedSelectText = selectText.replace(/ +$/, ''); 
    var numSpacesAtEnd = selectText.length - rightTrimmedSelectText.length; 
    if(numSpacesAtEnd) { 
      range.moveEnd('character', - numSpacesAtEnd); 
    } 
    var parent = range.parentElement(); 
    var htmlText = range.htmlText; 
    var htmlTextLen = goog.string.stripNewlines(htmlText).length; 
    if(this.isCollapsed() && htmlTextLen > 0) { 
      return(this.parentNode_ = parent); 
    } 
    while(htmlTextLen > goog.string.stripNewlines(parent.outerHTML).length) { 
      parent = parent.parentNode; 
    } 
    while(parent.childNodes.length == 1 && parent.innerText == goog.dom.browserrange.IeRange.getNodeText_(parent.firstChild)) { 
      if(! goog.dom.browserrange.canContainRangeEndpoint(parent.firstChild)) { 
        break; 
      } 
      parent = parent.firstChild; 
    } 
    if(selectText.length == 0) { 
      parent = this.findDeepestContainer_(parent); 
    } 
    this.parentNode_ = parent; 
  } 
  return this.parentNode_; 
}; 
goog.dom.browserrange.IeRange.prototype.findDeepestContainer_ = function(node) { 
  var childNodes = node.childNodes; 
  for(var i = 0, len = childNodes.length; i < len; i ++) { 
    var child = childNodes[i]; 
    if(goog.dom.browserrange.canContainRangeEndpoint(child)) { 
      var childRange = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(child); 
      var start = goog.dom.RangeEndpoint.START; 
      var end = goog.dom.RangeEndpoint.END; 
      var isChildRangeErratic =(childRange.htmlText != child.outerHTML); 
      var isNativeInRangeErratic = this.isCollapsed() && isChildRangeErratic; 
      var inChildRange = isNativeInRangeErratic ?(this.compareBrowserRangeEndpoints(childRange, start, start) >= 0 && this.compareBrowserRangeEndpoints(childRange, start, end) <= 0): this.range_.inRange(childRange); 
      if(inChildRange) { 
        return this.findDeepestContainer_(child); 
      } 
    } 
  } 
  return node; 
}; 
goog.dom.browserrange.IeRange.prototype.getStartNode = function() { 
  if(! this.startNode_) { 
    this.startNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.START); 
    if(this.isCollapsed()) { 
      this.endNode_ = this.startNode_; 
    } 
  } 
  return this.startNode_; 
}; 
goog.dom.browserrange.IeRange.prototype.getStartOffset = function() { 
  if(this.startOffset_ < 0) { 
    this.startOffset_ = this.getOffset_(goog.dom.RangeEndpoint.START); 
    if(this.isCollapsed()) { 
      this.endOffset_ = this.startOffset_; 
    } 
  } 
  return this.startOffset_; 
}; 
goog.dom.browserrange.IeRange.prototype.getEndNode = function() { 
  if(this.isCollapsed()) { 
    return this.getStartNode(); 
  } 
  if(! this.endNode_) { 
    this.endNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.END); 
  } 
  return this.endNode_; 
}; 
goog.dom.browserrange.IeRange.prototype.getEndOffset = function() { 
  if(this.isCollapsed()) { 
    return this.getStartOffset(); 
  } 
  if(this.endOffset_ < 0) { 
    this.endOffset_ = this.getOffset_(goog.dom.RangeEndpoint.END); 
    if(this.isCollapsed()) { 
      this.startOffset_ = this.endOffset_; 
    } 
  } 
  return this.endOffset_; 
}; 
goog.dom.browserrange.IeRange.prototype.compareBrowserRangeEndpoints = function(range, thisEndpoint, otherEndpoint) { 
  return this.range_.compareEndPoints((thisEndpoint == goog.dom.RangeEndpoint.START ? 'Start': 'End') + 'To' +(otherEndpoint == goog.dom.RangeEndpoint.START ? 'Start': 'End'), range); 
}; 
goog.dom.browserrange.IeRange.prototype.getEndpointNode_ = function(endpoint, opt_node) { 
  var node = opt_node || this.getContainer(); 
  if(! node || ! node.firstChild) { 
    return node; 
  } 
  var start = goog.dom.RangeEndpoint.START, end = goog.dom.RangeEndpoint.END; 
  var isStartEndpoint = endpoint == start; 
  for(var j = 0, length = node.childNodes.length; j < length; j ++) { 
    var i = isStartEndpoint ? j: length - j - 1; 
    var child = node.childNodes[i]; 
    var childRange; 
    try { 
      childRange = goog.dom.browserrange.createRangeFromNodeContents(child); 
    } catch(e) { 
      continue; 
    } 
    var ieRange = childRange.getBrowserRange(); 
    if(this.isCollapsed()) { 
      if(! goog.dom.browserrange.canContainRangeEndpoint(child)) { 
        if(this.compareBrowserRangeEndpoints(ieRange, start, start) == 0) { 
          this.startOffset_ = this.endOffset_ = i; 
          return node; 
        } 
      } else if(childRange.containsRange(this)) { 
        return this.getEndpointNode_(endpoint, child); 
      } 
    } else if(this.containsRange(childRange)) { 
      if(! goog.dom.browserrange.canContainRangeEndpoint(child)) { 
        if(isStartEndpoint) { 
          this.startOffset_ = i; 
        } else { 
          this.endOffset_ = i + 1; 
        } 
        return node; 
      } 
      return this.getEndpointNode_(endpoint, child); 
    } else if(this.compareBrowserRangeEndpoints(ieRange, start, end) < 0 && this.compareBrowserRangeEndpoints(ieRange, end, start) > 0) { 
      return this.getEndpointNode_(endpoint, child); 
    } 
  } 
  return node; 
}; 
goog.dom.browserrange.IeRange.prototype.compareNodeEndpoints_ = function(node, thisEndpoint, otherEndpoint) { 
  return this.range_.compareEndPoints((thisEndpoint == goog.dom.RangeEndpoint.START ? 'Start': 'End') + 'To' +(otherEndpoint == goog.dom.RangeEndpoint.START ? 'Start': 'End'), goog.dom.browserrange.createRangeFromNodeContents(node).getBrowserRange()); 
}; 
goog.dom.browserrange.IeRange.prototype.getOffset_ = function(endpoint, opt_container) { 
  var isStartEndpoint = endpoint == goog.dom.RangeEndpoint.START; 
  var container = opt_container ||(isStartEndpoint ? this.getStartNode(): this.getEndNode()); 
  if(container.nodeType == goog.dom.NodeType.ELEMENT) { 
    var children = container.childNodes; 
    var len = children.length; 
    var edge = isStartEndpoint ? 0: len - 1; 
    var sign = isStartEndpoint ? 1: - 1; 
    for(var i = edge; i >= 0 && i < len; i += sign) { 
      var child = children[i]; 
      if(goog.dom.browserrange.canContainRangeEndpoint(child)) { 
        continue; 
      } 
      var endPointCompare = this.compareNodeEndpoints_(child, endpoint, endpoint); 
      if(endPointCompare == 0) { 
        return isStartEndpoint ? i: i + 1; 
      } 
    } 
    return i == - 1 ? 0: i; 
  } else { 
    var range = this.range_.duplicate(); 
    var nodeRange = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(container); 
    range.setEndPoint(isStartEndpoint ? 'EndToEnd': 'StartToStart', nodeRange); 
    var rangeLength = range.text.length; 
    return isStartEndpoint ? container.length - rangeLength: rangeLength; 
  } 
}; 
goog.dom.browserrange.IeRange.getNodeText_ = function(node) { 
  return node.nodeType == goog.dom.NodeType.TEXT ? node.nodeValue: node.innerText; 
}; 
goog.dom.browserrange.IeRange.prototype.isRangeInDocument = function() { 
  var range = this.doc_.body.createTextRange(); 
  range.moveToElementText(this.doc_.body); 
  return this.containsRange(new goog.dom.browserrange.IeRange(range, this.doc_), true); 
}; 
goog.dom.browserrange.IeRange.prototype.isCollapsed = function() { 
  return this.range_.compareEndPoints('StartToEnd', this.range_) == 0; 
}; 
goog.dom.browserrange.IeRange.prototype.getText = function() { 
  return this.range_.text; 
}; 
goog.dom.browserrange.IeRange.prototype.getValidHtml = function() { 
  return this.range_.htmlText; 
}; 
goog.dom.browserrange.IeRange.prototype.select = function(opt_reverse) { 
  this.range_.select(); 
}; 
goog.dom.browserrange.IeRange.prototype.removeContents = function() { 
  if(this.range_.htmlText) { 
    var startNode = this.getStartNode(); 
    var endNode = this.getEndNode(); 
    var oldText = this.range_.text; 
    var clone = this.range_.duplicate(); 
    clone.moveStart('character', 1); 
    clone.moveStart('character', - 1); 
    if(clone.text != oldText) { 
      var iter = new goog.dom.NodeIterator(startNode, false, true); 
      var toDelete =[]; 
      goog.iter.forEach(iter, function(node) { 
        if(node.nodeType != goog.dom.NodeType.TEXT && this.containsNode(node)) { 
          toDelete.push(node); 
          iter.skipTag(); 
        } 
        if(node == endNode) { 
          throw goog.iter.StopIteration; 
        } 
      }); 
      this.collapse(true); 
      goog.array.forEach(toDelete, goog.dom.removeNode); 
      this.clearCachedValues_(); 
      return; 
    } 
    this.range_ = clone; 
    this.range_.text = ''; 
    this.clearCachedValues_(); 
    var newStartNode = this.getStartNode(); 
    var newStartOffset = this.getStartOffset(); 
    try { 
      var sibling = startNode.nextSibling; 
      if(startNode == endNode && startNode.parentNode && startNode.nodeType == goog.dom.NodeType.TEXT && sibling && sibling.nodeType == goog.dom.NodeType.TEXT) { 
        startNode.nodeValue += sibling.nodeValue; 
        goog.dom.removeNode(sibling); 
        this.range_ = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(newStartNode); 
        this.range_.move('character', newStartOffset); 
        this.clearCachedValues_(); 
      } 
    } catch(e) { } 
  } 
}; 
goog.dom.browserrange.IeRange.getDomHelper_ = function(range) { 
  return goog.dom.getDomHelper(range.parentElement()); 
}; 
goog.dom.browserrange.IeRange.pasteElement_ = function(range, element, opt_domHelper) { 
  opt_domHelper = opt_domHelper || goog.dom.browserrange.IeRange.getDomHelper_(range); 
  var id; 
  var originalId = id = element.id; 
  if(! id) { 
    id = element.id = goog.string.createUniqueString(); 
  } 
  range.pasteHTML(element.outerHTML); 
  element = opt_domHelper.getElement(id); 
  if(element) { 
    if(! originalId) { 
      element.removeAttribute('id'); 
    } 
  } 
  return element; 
}; 
goog.dom.browserrange.IeRange.prototype.surroundContents = function(element) { 
  goog.dom.removeNode(element); 
  element.innerHTML = this.range_.htmlText; 
  element = goog.dom.browserrange.IeRange.pasteElement_(this.range_, element); 
  if(element) { 
    this.range_.moveToElementText(element); 
  } 
  this.clearCachedValues_(); 
  return element; 
}; 
goog.dom.browserrange.IeRange.insertNode_ = function(clone, node, before, opt_domHelper) { 
  opt_domHelper = opt_domHelper || goog.dom.browserrange.IeRange.getDomHelper_(clone); 
  var isNonElement; 
  if(node.nodeType != goog.dom.NodeType.ELEMENT) { 
    isNonElement = true; 
    node = opt_domHelper.createDom(goog.dom.TagName.DIV, null, node); 
  } 
  clone.collapse(before); 
  node = goog.dom.browserrange.IeRange.pasteElement_(clone,(node), opt_domHelper); 
  if(isNonElement) { 
    var newNonElement = node.firstChild; 
    opt_domHelper.flattenElement(node); 
    node = newNonElement; 
  } 
  return node; 
}; 
goog.dom.browserrange.IeRange.prototype.insertNode = function(node, before) { 
  var output = goog.dom.browserrange.IeRange.insertNode_(this.range_.duplicate(), node, before); 
  this.clearCachedValues_(); 
  return output; 
}; 
goog.dom.browserrange.IeRange.prototype.surroundWithNodes = function(startNode, endNode) { 
  var clone1 = this.range_.duplicate(); 
  var clone2 = this.range_.duplicate(); 
  goog.dom.browserrange.IeRange.insertNode_(clone1, startNode, true); 
  goog.dom.browserrange.IeRange.insertNode_(clone2, endNode, false); 
  this.clearCachedValues_(); 
}; 
goog.dom.browserrange.IeRange.prototype.collapse = function(toStart) { 
  this.range_.collapse(toStart); 
  if(toStart) { 
    this.endNode_ = this.startNode_; 
    this.endOffset_ = this.startOffset_; 
  } else { 
    this.startNode_ = this.endNode_; 
    this.startOffset_ = this.endOffset_; 
  } 
}; 
