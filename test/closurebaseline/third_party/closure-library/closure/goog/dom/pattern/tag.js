
goog.provide('goog.dom.pattern.Tag'); 
goog.require('goog.dom.pattern'); 
goog.require('goog.dom.pattern.AbstractPattern'); 
goog.require('goog.dom.pattern.MatchType'); 
goog.require('goog.object'); 
goog.dom.pattern.Tag = function(tag, type, opt_attrs, opt_styles, opt_test) { 
  if(goog.isString(tag)) { 
    this.tag_ = tag.toUpperCase(); 
  } else { 
    this.tag_ = tag; 
  } 
  this.type_ = type; 
  this.attrs_ = opt_attrs || null; 
  this.styles_ = opt_styles || null; 
  this.test_ = opt_test || null; 
}; 
goog.inherits(goog.dom.pattern.Tag, goog.dom.pattern.AbstractPattern); 
goog.dom.pattern.Tag.prototype.tag_; 
goog.dom.pattern.Tag.prototype.type_; 
goog.dom.pattern.Tag.prototype.attrs_ = null; 
goog.dom.pattern.Tag.prototype.styles_ = null; 
goog.dom.pattern.Tag.prototype.test_ = null; 
goog.dom.pattern.Tag.prototype.matchToken = function(token, type) { 
  if(type == this.type_ && goog.dom.pattern.matchStringOrRegex(this.tag_, token.nodeName)) { 
    if(this.attrs_ && ! goog.object.every(this.attrs_, goog.dom.pattern.matchStringOrRegexMap, token)) { 
      return goog.dom.pattern.MatchType.NO_MATCH; 
    } 
    if(this.styles_ && ! goog.object.every(this.styles_, goog.dom.pattern.matchStringOrRegexMap, token.style)) { 
      return goog.dom.pattern.MatchType.NO_MATCH; 
    } 
    if(this.test_ && ! this.test_(token)) { 
      return goog.dom.pattern.MatchType.NO_MATCH; 
    } 
    this.matchedNode = token; 
    return goog.dom.pattern.MatchType.MATCH; 
  } 
  return goog.dom.pattern.MatchType.NO_MATCH; 
}; 
