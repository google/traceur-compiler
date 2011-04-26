
goog.provide('goog.dom.TextRangeIterator'); 
goog.require('goog.array'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.RangeIterator'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.iter.StopIteration'); 
goog.dom.TextRangeIterator = function(startNode, startOffset, endNode, endOffset, opt_reverse) { 
  var goNext; 
  if(startNode) { 
    this.startNode_ = startNode; 
    this.startOffset_ = startOffset; 
    this.endNode_ = endNode; 
    this.endOffset_ = endOffset; 
    if(startNode.nodeType == goog.dom.NodeType.ELEMENT && startNode.tagName != goog.dom.TagName.BR) { 
      var startChildren = startNode.childNodes; 
      var candidate = startChildren[startOffset]; 
      if(candidate) { 
        this.startNode_ = candidate; 
        this.startOffset_ = 0; 
      } else { 
        if(startChildren.length) { 
          this.startNode_ =(goog.array.peek(startChildren)); 
        } 
        goNext = true; 
      } 
    } 
    if(endNode.nodeType == goog.dom.NodeType.ELEMENT) { 
      this.endNode_ = endNode.childNodes[endOffset]; 
      if(this.endNode_) { 
        this.endOffset_ = 0; 
      } else { 
        this.endNode_ = endNode; 
      } 
    } 
  } 
  goog.dom.RangeIterator.call(this, opt_reverse ? this.endNode_: this.startNode_, opt_reverse); 
  if(goNext) { 
    try { 
      this.next(); 
    } catch(e) { 
      if(e != goog.iter.StopIteration) { 
        throw e; 
      } 
    } 
  } 
}; 
goog.inherits(goog.dom.TextRangeIterator, goog.dom.RangeIterator); 
goog.dom.TextRangeIterator.prototype.startNode_ = null; 
goog.dom.TextRangeIterator.prototype.endNode_ = null; 
goog.dom.TextRangeIterator.prototype.startOffset_ = 0; 
goog.dom.TextRangeIterator.prototype.endOffset_ = 0; 
goog.dom.TextRangeIterator.prototype.getStartTextOffset = function() { 
  return this.node.nodeType != goog.dom.NodeType.TEXT ? - 1: this.node == this.startNode_ ? this.startOffset_: 0; 
}; 
goog.dom.TextRangeIterator.prototype.getEndTextOffset = function() { 
  return this.node.nodeType != goog.dom.NodeType.TEXT ? - 1: this.node == this.endNode_ ? this.endOffset_: this.node.nodeValue.length; 
}; 
goog.dom.TextRangeIterator.prototype.getStartNode = function() { 
  return this.startNode_; 
}; 
goog.dom.TextRangeIterator.prototype.setStartNode = function(node) { 
  if(! this.isStarted()) { 
    this.setPosition(node); 
  } 
  this.startNode_ = node; 
  this.startOffset_ = 0; 
}; 
goog.dom.TextRangeIterator.prototype.getEndNode = function() { 
  return this.endNode_; 
}; 
goog.dom.TextRangeIterator.prototype.setEndNode = function(node) { 
  this.endNode_ = node; 
  this.endOffset_ = 0; 
}; 
goog.dom.TextRangeIterator.prototype.isLast = function() { 
  return this.isStarted() && this.node == this.endNode_ &&(! this.endOffset_ || ! this.isStartTag()); 
}; 
goog.dom.TextRangeIterator.prototype.next = function() { 
  if(this.isLast()) { 
    throw goog.iter.StopIteration; 
  } 
  return goog.dom.TextRangeIterator.superClass_.next.call(this); 
}; 
goog.dom.TextRangeIterator.prototype.skipTag = function() { 
  goog.dom.TextRangeIterator.superClass_.skipTag.apply(this); 
  if(goog.dom.contains(this.node, this.endNode_)) { 
    throw goog.iter.StopIteration; 
  } 
}; 
goog.dom.TextRangeIterator.prototype.copyFrom = function(other) { 
  this.startNode_ = other.startNode_; 
  this.endNode_ = other.endNode_; 
  this.startOffset_ = other.startOffset_; 
  this.endOffset_ = other.endOffset_; 
  this.isReversed_ = other.isReversed_; 
  goog.dom.TextRangeIterator.superClass_.copyFrom.call(this, other); 
}; 
goog.dom.TextRangeIterator.prototype.clone = function() { 
  var copy = new goog.dom.TextRangeIterator(this.startNode_, this.startOffset_, this.endNode_, this.endOffset_, this.isReversed_); 
  copy.copyFrom(this); 
  return copy; 
}; 
