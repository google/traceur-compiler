
goog.provide('goog.dom.pattern.AllChildren'); 
goog.require('goog.dom.pattern.AbstractPattern'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.dom.pattern.AllChildren = function() { }; 
goog.inherits(goog.dom.pattern.AllChildren, goog.dom.pattern.AbstractPattern); 
goog.dom.pattern.AllChildren.prototype.depth_ = 0; 
goog.dom.pattern.AllChildren.prototype.matchToken = function(token, type) { 
  this.depth_ += type; 
  if(this.depth_ >= 0) { 
    return goog.dom.pattern.MatchType.MATCHING; 
  } else { 
    this.depth_ = 0; 
    return goog.dom.pattern.MatchType.BACKTRACK_MATCH; 
  } 
}; 
goog.dom.pattern.AllChildren.prototype.reset = function() { 
  this.depth_ = 0; 
}; 
