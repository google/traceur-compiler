
goog.provide('goog.dom.iter.AncestorIterator'); 
goog.provide('goog.dom.iter.ChildIterator'); 
goog.provide('goog.dom.iter.SiblingIterator'); 
goog.require('goog.iter.Iterator'); 
goog.require('goog.iter.StopIteration'); 
goog.dom.iter.SiblingIterator = function(node, opt_includeNode, opt_reverse) { 
  this.node_ = node; 
  this.reverse_ = ! ! opt_reverse; 
  if(node && ! opt_includeNode) { 
    this.next(); 
  } 
}; 
goog.inherits(goog.dom.iter.SiblingIterator, goog.iter.Iterator); 
goog.dom.iter.SiblingIterator.prototype.next = function() { 
  var node = this.node_; 
  if(! node) { 
    throw goog.iter.StopIteration; 
  } 
  this.node_ = this.reverse_ ? node.previousSibling: node.nextSibling; 
  return node; 
}; 
goog.dom.iter.ChildIterator = function(element, opt_reverse, opt_startIndex) { 
  if(! goog.isDef(opt_startIndex)) { 
    opt_startIndex = opt_reverse && element.childNodes.length ? element.childNodes.length - 1: 0; 
  } 
  goog.dom.iter.SiblingIterator.call(this, element.childNodes[opt_startIndex], true, opt_reverse); 
}; 
goog.inherits(goog.dom.iter.ChildIterator, goog.dom.iter.SiblingIterator); 
goog.dom.iter.AncestorIterator = function(node, opt_includeNode) { 
  this.node_ = node; 
  if(node && ! opt_includeNode) { 
    this.next(); 
  } 
}; 
goog.inherits(goog.dom.iter.AncestorIterator, goog.iter.Iterator); 
goog.dom.iter.AncestorIterator.prototype.next = function() { 
  var node = this.node_; 
  if(! node) { 
    throw goog.iter.StopIteration; 
  } 
  this.node_ = node.parentNode; 
  return node; 
}; 
