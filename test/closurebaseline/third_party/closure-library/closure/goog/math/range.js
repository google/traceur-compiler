
goog.provide('goog.math.Range'); 
goog.math.Range = function(a, b) { 
  this.start = a < b ? a: b; 
  this.end = a < b ? b: a; 
}; 
goog.math.Range.prototype.clone = function() { 
  return new goog.math.Range(this.start, this.end); 
}; 
if(goog.DEBUG) { 
  goog.math.Range.prototype.toString = function() { 
    return '[' + this.start + ', ' + this.end + ']'; 
  }; 
} 
goog.math.Range.equals = function(a, b) { 
  if(a == b) { 
    return true; 
  } 
  if(! a || ! b) { 
    return false; 
  } 
  return a.start == b.start && a.end == b.end; 
}; 
goog.math.Range.intersection = function(a, b) { 
  var c0 = Math.max(a.start, b.start); 
  var c1 = Math.min(a.end, b.end); 
  return(c0 <= c1) ? new goog.math.Range(c0, c1): null; 
}; 
goog.math.Range.hasIntersection = function(a, b) { 
  return Math.max(a.start, b.start) <= Math.min(a.end, b.end); 
}; 
goog.math.Range.boundingRange = function(a, b) { 
  return new goog.math.Range(Math.min(a.start, b.start), Math.max(a.end, b.end)); 
}; 
goog.math.Range.contains = function(a, b) { 
  return a.start <= b.start && a.end >= b.end; 
}; 
goog.math.Range.containsPoint = function(range, p) { 
  return range.start <= p && range.end >= p; 
}; 
