
goog.provide('goog.dom.pattern'); 
goog.provide('goog.dom.pattern.MatchType'); 
goog.dom.pattern.BREAKING_TEXTNODE_RE = /^\s*$/; 
goog.dom.pattern.matchStringOrRegex = function(obj, str) { 
  if(goog.isString(obj)) { 
    return str == obj; 
  } else { 
    return ! !(str && str.match(obj)); 
  } 
}; 
goog.dom.pattern.matchStringOrRegexMap = function(elem, index, orig) { 
  return goog.dom.pattern.matchStringOrRegex(elem, index in this ? this[index]:(this.getAttribute ? this.getAttribute(index): null)); 
}; 
goog.dom.pattern.MatchType = { 
  NO_MATCH: 0, 
  MATCHING: 1, 
  MATCH: 2, 
  BACKTRACK_MATCH: 3 
}; 
