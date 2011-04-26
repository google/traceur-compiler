
goog.provide('goog.dom.pattern.AbstractPattern'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.dom.pattern.AbstractPattern = function() { }; 
goog.dom.pattern.AbstractPattern.prototype.matchedNode = null; 
goog.dom.pattern.AbstractPattern.prototype.reset = function() { }; 
goog.dom.pattern.AbstractPattern.prototype.matchToken = function(token, type) { 
  return goog.dom.pattern.MatchType.NO_MATCH; 
}; 
