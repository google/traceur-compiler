
goog.provide('goog.dom.pattern.ChildMatches'); 
goog.require('goog.dom.pattern.AllChildren'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.dom.pattern.ChildMatches = function(childPattern, opt_minimumMatches) { 
  this.childPattern_ = childPattern; 
  this.matches =[]; 
  this.minimumMatches_ = opt_minimumMatches || 0; 
  goog.dom.pattern.AllChildren.call(this); 
}; 
goog.inherits(goog.dom.pattern.ChildMatches, goog.dom.pattern.AllChildren); 
goog.dom.pattern.ChildMatches.prototype.matches; 
goog.dom.pattern.ChildMatches.prototype.minimumMatches_ = 0; 
goog.dom.pattern.ChildMatches.prototype.childPattern_; 
goog.dom.pattern.ChildMatches.prototype.needsReset_ = false; 
goog.dom.pattern.ChildMatches.prototype.matchToken = function(token, type) { 
  if(this.needsReset_) { 
    this.reset(); 
  } 
  var status = goog.dom.pattern.AllChildren.prototype.matchToken.apply(this, arguments); 
  switch(status) { 
    case goog.dom.pattern.MatchType.MATCHING: 
      var backtrack = false; 
      switch(this.childPattern_.matchToken(token, type)) { 
        case goog.dom.pattern.MatchType.BACKTRACK_MATCH: 
          backtrack = true; 

        case goog.dom.pattern.MatchType.MATCH: 
          this.matches.push(this.childPattern_.matchedNode); 
          break; 

        default: 
          break; 

      } 
      if(backtrack) { 
        if(this.childPattern_.matchToken(token, type) == goog.dom.pattern.MatchType.MATCH) { 
          this.matches.push(this.childPattern_.matchedNode); 
        } 
      } 
      return goog.dom.pattern.MatchType.MATCHING; 

    case goog.dom.pattern.MatchType.BACKTRACK_MATCH: 
      this.needsReset_ = true; 
      return(this.matches.length >= this.minimumMatches_) ? goog.dom.pattern.MatchType.BACKTRACK_MATCH: goog.dom.pattern.MatchType.NO_MATCH; 

    default: 
      this.needsReset_ = true; 
      return status; 

  } 
}; 
goog.dom.pattern.ChildMatches.prototype.reset = function() { 
  this.needsReset_ = false; 
  this.matches.length = 0; 
  this.childPattern_.reset(); 
  goog.dom.pattern.AllChildren.prototype.reset.call(this); 
}; 
