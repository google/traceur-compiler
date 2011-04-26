
goog.provide('goog.dom.pattern.FullTag'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.require('goog.dom.pattern.StartTag'); 
goog.require('goog.dom.pattern.Tag'); 
goog.dom.pattern.FullTag = function(tag, opt_attrs, opt_styles, opt_test) { 
  goog.dom.pattern.StartTag.call(this, tag, opt_attrs, opt_styles, opt_test); 
}; 
goog.inherits(goog.dom.pattern.FullTag, goog.dom.pattern.StartTag); 
goog.dom.pattern.FullTag.prototype.depth_ = 0; 
goog.dom.pattern.FullTag.prototype.matchToken = function(token, type) { 
  if(! this.depth_) { 
    if(goog.dom.pattern.Tag.prototype.matchToken.call(this, token, type)) { 
      this.depth_ = type; 
      return goog.dom.pattern.MatchType.MATCHING; 
    } else { 
      return goog.dom.pattern.MatchType.NO_MATCH; 
    } 
  } else { 
    this.depth_ += type; 
    return this.depth_ ? goog.dom.pattern.MatchType.MATCHING: goog.dom.pattern.MatchType.MATCH; 
  } 
}; 
