
goog.provide('goog.dom.pattern.Sequence'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.pattern.AbstractPattern'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.dom.pattern.Sequence = function(patterns, opt_ignoreWhitespace) { 
  this.patterns = patterns; 
  this.ignoreWhitespace_ = ! ! opt_ignoreWhitespace; 
}; 
goog.inherits(goog.dom.pattern.Sequence, goog.dom.pattern.AbstractPattern); 
goog.dom.pattern.Sequence.prototype.patterns; 
goog.dom.pattern.Sequence.prototype.currentPosition_ = 0; 
goog.dom.pattern.Sequence.prototype.ignoreWhitespace_ = false; 
goog.dom.pattern.Sequence.prototype.matchToken = function(token, type) { 
  if(this.ignoreWhitespace_ && token.nodeType == goog.dom.NodeType.TEXT && goog.dom.pattern.BREAKING_TEXTNODE_RE.test(token.nodeValue)) { 
    return goog.dom.pattern.MatchType.MATCHING; 
  } 
  switch(this.patterns[this.currentPosition_].matchToken(token, type)) { 
    case goog.dom.pattern.MatchType.MATCH: 
      if(this.currentPosition_ == 0) { 
        this.matchedNode = token; 
      } 
      this.currentPosition_ ++; 
      if(this.currentPosition_ == this.patterns.length) { 
        this.reset(); 
        return goog.dom.pattern.MatchType.MATCH; 
      } else { 
        return goog.dom.pattern.MatchType.MATCHING; 
      } 

    case goog.dom.pattern.MatchType.MATCHING: 
      return goog.dom.pattern.MatchType.MATCHING; 

    case goog.dom.pattern.MatchType.BACKTRACK_MATCH: 
      this.currentPosition_ ++; 
      if(this.currentPosition_ == this.patterns.length) { 
        this.reset(); 
        return goog.dom.pattern.MatchType.BACKTRACK_MATCH; 
      } else { 
        return this.matchToken(token, type); 
      } 

    default: 
      this.reset(); 
      return goog.dom.pattern.MatchType.NO_MATCH; 

  } 
}; 
goog.dom.pattern.Sequence.prototype.reset = function() { 
  if(this.patterns[this.currentPosition_]) { 
    this.patterns[this.currentPosition_].reset(); 
  } 
  this.currentPosition_ = 0; 
}; 
