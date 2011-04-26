
goog.provide('goog.dom.pattern.NodeType'); 
goog.require('goog.dom.pattern.AbstractPattern'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.dom.pattern.NodeType = function(nodeType) { 
  this.nodeType_ = nodeType; 
}; 
goog.inherits(goog.dom.pattern.NodeType, goog.dom.pattern.AbstractPattern); 
goog.dom.pattern.NodeType.prototype.matchToken = function(token, type) { 
  return token.nodeType == this.nodeType_ ? goog.dom.pattern.MatchType.MATCH: goog.dom.pattern.MatchType.NO_MATCH; 
}; 
