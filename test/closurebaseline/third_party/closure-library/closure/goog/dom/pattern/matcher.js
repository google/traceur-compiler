
goog.provide('goog.dom.pattern.Matcher'); 
goog.require('goog.dom.TagIterator'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.require('goog.iter'); 
goog.dom.pattern.Matcher = function() { 
  this.patterns_ =[]; 
  this.callbacks_ =[]; 
}; 
goog.dom.pattern.Matcher.prototype.patterns_; 
goog.dom.pattern.Matcher.prototype.callbacks_; 
goog.dom.pattern.Matcher.prototype.addPattern = function(pattern, callback) { 
  this.patterns_.push(pattern); 
  this.callbacks_.push(callback); 
}; 
goog.dom.pattern.Matcher.prototype.reset_ = function() { 
  for(var i = 0, len = this.patterns_.length; i < len; i ++) { 
    this.patterns_[i].reset(); 
  } 
}; 
goog.dom.pattern.Matcher.prototype.matchToken_ = function(position) { 
  for(var i = 0, len = this.patterns_.length; i < len; i ++) { 
    var pattern = this.patterns_[i]; 
    switch(pattern.matchToken(position.node, position.tagType)) { 
      case goog.dom.pattern.MatchType.MATCH: 
      case goog.dom.pattern.MatchType.BACKTRACK_MATCH: 
        var callback = this.callbacks_[i]; 
        if(callback(pattern.matchedNode, position, pattern)) { 
          return true; 
        } 

      default: 
        break; 

    } 
  } 
  return false; 
}; 
goog.dom.pattern.Matcher.prototype.match = function(node) { 
  var position = new goog.dom.TagIterator(node); 
  this.reset_(); 
  goog.iter.forEach(position, function() { 
    while(this.matchToken_(position)) { 
      this.reset_(); 
    } 
  }, this); 
}; 
