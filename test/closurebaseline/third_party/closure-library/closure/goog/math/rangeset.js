
goog.provide('goog.math.RangeSet'); 
goog.require('goog.array'); 
goog.require('goog.iter.Iterator'); 
goog.require('goog.iter.StopIteration'); 
goog.require('goog.math.Range'); 
goog.math.RangeSet = function() { 
  this.ranges_ =[]; 
}; 
if(goog.DEBUG) { 
  goog.math.RangeSet.prototype.toString = function() { 
    return '[' + this.ranges_.join(', ') + ']'; 
  }; 
} 
goog.math.RangeSet.equals = function(a, b) { 
  return a == b || ! !(a && b && goog.array.equals(a.ranges_, b.ranges_, goog.math.Range.equals)); 
}; 
goog.math.RangeSet.prototype.clone = function() { 
  var set = new goog.math.RangeSet(); 
  for(var i = this.ranges_.length; i --;) { 
    set.ranges_[i]= this.ranges_[i].clone(); 
  } 
  return set; 
}; 
goog.math.RangeSet.prototype.add = function(a) { 
  if(a.end <= a.start) { 
    return; 
  } 
  a = a.clone(); 
  for(var i = 0, b; b = this.ranges_[i]; i ++) { 
    if(a.start <= b.end) { 
      a.start = Math.min(a.start, b.start); 
      break; 
    } 
  } 
  var insertionPoint = i; 
  for(; b = this.ranges_[i]; i ++) { 
    if(a.end < b.start) { 
      break; 
    } 
    a.end = Math.max(a.end, b.end); 
  } 
  this.ranges_.splice(insertionPoint, i - insertionPoint, a); 
}; 
goog.math.RangeSet.prototype.remove = function(a) { 
  if(a.end <= a.start) { 
    return; 
  } 
  for(var i = 0, b; b = this.ranges_[i]; i ++) { 
    if(a.start < b.end) { 
      break; 
    } 
  } 
  if(! b || a.end < b.start) { 
    return; 
  } 
  var insertionPoint = i; 
  if(a.start > b.start) { 
    insertionPoint ++; 
    if(a.end < b.end) { 
      goog.array.insertAt(this.ranges_, new goog.math.Range(a.end, b.end), insertionPoint); 
    } 
    b.end = a.start; 
  } 
  for(i = insertionPoint, b; b = this.ranges_[i]; i ++) { 
    b.start = Math.max(a.end, b.start); 
    if(a.end < b.end) { 
      break; 
    } 
  } 
  this.ranges_.splice(insertionPoint, i - insertionPoint); 
}; 
goog.math.RangeSet.prototype.contains = function(a) { 
  if(a.end <= a.start) { 
    return false; 
  } 
  for(var i = 0, b; b = this.ranges_[i]; i ++) { 
    if(a.start < b.end) { 
      if(a.end >= b.start) { 
        return goog.math.Range.contains(b, a); 
      } 
      break; 
    } 
  } 
  return false; 
}; 
goog.math.RangeSet.prototype.containsValue = function(value) { 
  for(var i = 0, b; b = this.ranges_[i]; i ++) { 
    if(value < b.end) { 
      if(value >= b.start) { 
        return true; 
      } 
      break; 
    } 
  } 
  return false; 
}; 
goog.math.RangeSet.prototype.union = function(set) { 
  set = set.clone(); 
  for(var i = 0, a; a = this.ranges_[i]; i ++) { 
    set.add(a); 
  } 
  return set; 
}; 
goog.math.RangeSet.prototype.intersection = function(set) { 
  if(this.isEmpty() || set.isEmpty()) { 
    return new goog.math.RangeSet(); 
  } 
  set = set.inverse(this.getBounds()); 
  var r = this.clone(); 
  for(var i = 0, a; a = set.ranges_[i]; i ++) { 
    r.remove(a); 
  } 
  return r; 
}; 
goog.math.RangeSet.prototype.slice = function(range) { 
  var set = new goog.math.RangeSet(); 
  if(range.start >= range.end) { 
    return set; 
  } 
  for(var i = 0, b; b = this.ranges_[i]; i ++) { 
    if(b.end <= range.start) { 
      continue; 
    } 
    if(b.start > range.end) { 
      break; 
    } 
    set.add(new goog.math.Range(Math.max(range.start, b.start), Math.min(range.end, b.end))); 
  } 
  return set; 
}; 
goog.math.RangeSet.prototype.inverse = function(range) { 
  var set = new goog.math.RangeSet(); 
  set.add(range); 
  for(var i = 0, b; b = this.ranges_[i]; i ++) { 
    if(range.start >= b.end) { 
      continue; 
    } 
    if(range.end < b.start) { 
      break; 
    } 
    set.remove(b); 
  } 
  return set; 
}; 
goog.math.RangeSet.prototype.getBounds = function() { 
  if(this.ranges_.length) { 
    return new goog.math.Range(this.ranges_[0].start, goog.array.peek(this.ranges_).end); 
  } 
  return null; 
}; 
goog.math.RangeSet.prototype.isEmpty = function() { 
  return this.ranges_.length == 0; 
}; 
goog.math.RangeSet.prototype.clear = function() { 
  this.ranges_.length = 0; 
}; 
goog.math.RangeSet.prototype.__iterator__ = function(opt_keys) { 
  var i = 0; 
  var list = this.ranges_; 
  var iterator = new goog.iter.Iterator(); 
  iterator.next = function() { 
    if(i >= list.length) { 
      throw goog.iter.StopIteration; 
    } 
    return list[i ++].clone(); 
  }; 
  return iterator; 
}; 
