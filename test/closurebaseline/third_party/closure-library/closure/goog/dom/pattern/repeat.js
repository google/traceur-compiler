
goog.provide('goog.dom.pattern.Repeat'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.pattern.AbstractPattern'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.dom.pattern.Repeat = function(pattern, opt_minimum, opt_maximum) { 
  this.pattern_ = pattern; 
  this.minimum_ = opt_minimum || 0; 
  this.maximum_ = opt_maximum || null; 
  this.matches =[]; 
}; 
goog.inherits(goog.dom.pattern.Repeat, goog.dom.pattern.AbstractPattern); 
goog.dom.pattern.Repeat.prototype.pattern_; 
goog.dom.pattern.Repeat.prototype.minimum_ = 0; 
goog.dom.pattern.Repeat.prototype.maximum_ = 0; 
goog.dom.pattern.Repeat.prototype.count = 0; 
goog.dom.pattern.Repeat.prototype.needsReset_ = false; 
goog.dom.pattern.Repeat.prototype.matches; 
goog.dom.pattern.Repeat.prototype.matchToken = function(token, type) { 
  if(this.needsReset_) { 
    this.reset(); 
  } 
  if(token.nodeType == goog.dom.NodeType.TEXT && token.nodeValue.match(/^\s+$/)) { 
    return goog.dom.pattern.MatchType.MATCHING; 
  } 
  switch(this.pattern_.matchToken(token, type)) { 
    case goog.dom.pattern.MatchType.MATCH: 
      if(this.count == 0) { 
        this.matchedNode = token; 
      } 
      this.count ++; 
      this.matches.push(this.pattern_.matchedNode); 
      if(this.maximum_ !== null && this.count == this.maximum_) { 
        this.needsReset_ = true; 
        return goog.dom.pattern.MatchType.MATCH; 
      } else { 
        return goog.dom.pattern.MatchType.MATCHING; 
      } 

    case goog.dom.pattern.MatchType.MATCHING: 
      return goog.dom.pattern.MatchType.MATCHING; 

    case goog.dom.pattern.MatchType.BACKTRACK_MATCH: 
      this.count ++; 
      if(this.currentPosition_ == this.patterns_.length) { 
        this.needsReset_ = true; 
        return goog.dom.pattern.MatchType.BACKTRACK_MATCH; 
      } else { 
        return this.matchToken(token, type); 
      } 

    default: 
      this.needsReset_ = true; 
      if(this.count >= this.minimum_) { 
        return goog.dom.pattern.MatchType.BACKTRACK_MATCH; 
      } else { 
        return goog.dom.pattern.MatchType.NO_MATCH; 
      } 

  } 
}; 
goog.dom.pattern.Repeat.prototype.reset = function() { 
  this.pattern_.reset(); 
  this.count = 0; 
  this.needsReset_ = false; 
  this.matches.length = 0; 
}; 
