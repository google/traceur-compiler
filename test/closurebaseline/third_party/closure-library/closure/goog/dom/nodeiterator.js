
goog.provide('goog.dom.NodeIterator'); 
goog.require('goog.dom.TagIterator'); 
goog.dom.NodeIterator = function(opt_node, opt_reversed, opt_unconstrained, opt_depth) { 
  goog.dom.TagIterator.call(this, opt_node, opt_reversed, opt_unconstrained, null, opt_depth); 
}; 
goog.inherits(goog.dom.NodeIterator, goog.dom.TagIterator); 
goog.dom.NodeIterator.prototype.next = function() { 
  do { 
    goog.dom.NodeIterator.superClass_.next.call(this); 
  } while(this.isEndTag()); 
  return this.node; 
}; 
