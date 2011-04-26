
goog.provide('goog.dom.pattern.Text'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.pattern'); 
goog.require('goog.dom.pattern.AbstractPattern'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.dom.pattern.Text = function(match) { 
  this.match_ = match; 
}; 
goog.inherits(goog.dom.pattern.Text, goog.dom.pattern.AbstractPattern); 
goog.dom.pattern.Text.prototype.match_; 
goog.dom.pattern.Text.prototype.matchToken = function(token, type) { 
  if(token.nodeType == goog.dom.NodeType.TEXT && goog.dom.pattern.matchStringOrRegex(this.match_, token.nodeValue)) { 
    this.matchedNode = token; 
    return goog.dom.pattern.MatchType.MATCH; 
  } 
  return goog.dom.pattern.MatchType.NO_MATCH; 
}; 
