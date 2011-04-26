
goog.provide('goog.math.Rect'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Size'); 
goog.math.Rect = function(x, y, w, h) { 
  this.left = x; 
  this.top = y; 
  this.width = w; 
  this.height = h; 
}; 
goog.math.Rect.prototype.clone = function() { 
  return new goog.math.Rect(this.left, this.top, this.width, this.height); 
}; 
goog.math.Rect.prototype.toBox = function() { 
  var right = this.left + this.width; 
  var bottom = this.top + this.height; 
  return new goog.math.Box(this.top, right, bottom, this.left); 
}; 
goog.math.Rect.createFromBox = function(box) { 
  return new goog.math.Rect(box.left, box.top, box.right - box.left, box.bottom - box.top); 
}; 
if(goog.DEBUG) { 
  goog.math.Rect.prototype.toString = function() { 
    return '(' + this.left + ', ' + this.top + ' - ' + this.width + 'w x ' + this.height + 'h)'; 
  }; 
} 
goog.math.Rect.equals = function(a, b) { 
  if(a == b) { 
    return true; 
  } 
  if(! a || ! b) { 
    return false; 
  } 
  return a.left == b.left && a.width == b.width && a.top == b.top && a.height == b.height; 
}; 
goog.math.Rect.prototype.intersection = function(rect) { 
  var x0 = Math.max(this.left, rect.left); 
  var x1 = Math.min(this.left + this.width, rect.left + rect.width); 
  if(x0 <= x1) { 
    var y0 = Math.max(this.top, rect.top); 
    var y1 = Math.min(this.top + this.height, rect.top + rect.height); 
    if(y0 <= y1) { 
      this.left = x0; 
      this.top = y0; 
      this.width = x1 - x0; 
      this.height = y1 - y0; 
      return true; 
    } 
  } 
  return false; 
}; 
goog.math.Rect.intersection = function(a, b) { 
  var x0 = Math.max(a.left, b.left); 
  var x1 = Math.min(a.left + a.width, b.left + b.width); 
  if(x0 <= x1) { 
    var y0 = Math.max(a.top, b.top); 
    var y1 = Math.min(a.top + a.height, b.top + b.height); 
    if(y0 <= y1) { 
      return new goog.math.Rect(x0, y0, x1 - x0, y1 - y0); 
    } 
  } 
  return null; 
}; 
goog.math.Rect.intersects = function(a, b) { 
  return(a.left <= b.left + b.width && b.left <= a.left + a.width && a.top <= b.top + b.height && b.top <= a.top + a.height); 
}; 
goog.math.Rect.prototype.intersects = function(rect) { 
  return goog.math.Rect.intersects(this, rect); 
}; 
goog.math.Rect.difference = function(a, b) { 
  var intersection = goog.math.Rect.intersection(a, b); 
  if(! intersection || ! intersection.height || ! intersection.width) { 
    return[a.clone()]; 
  } 
  var result =[]; 
  var top = a.top; 
  var height = a.height; 
  var ar = a.left + a.width; 
  var ab = a.top + a.height; 
  var br = b.left + b.width; 
  var bb = b.top + b.height; 
  if(b.top > a.top) { 
    result.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top)); 
    top = b.top; 
    height -= b.top - a.top; 
  } 
  if(bb < ab) { 
    result.push(new goog.math.Rect(a.left, bb, a.width, ab - bb)); 
    height = bb - top; 
  } 
  if(b.left > a.left) { 
    result.push(new goog.math.Rect(a.left, top, b.left - a.left, height)); 
  } 
  if(br < ar) { 
    result.push(new goog.math.Rect(br, top, ar - br, height)); 
  } 
  return result; 
}; 
goog.math.Rect.prototype.difference = function(rect) { 
  return goog.math.Rect.difference(this, rect); 
}; 
goog.math.Rect.prototype.boundingRect = function(rect) { 
  var right = Math.max(this.left + this.width, rect.left + rect.width); 
  var bottom = Math.max(this.top + this.height, rect.top + rect.height); 
  this.left = Math.min(this.left, rect.left); 
  this.top = Math.min(this.top, rect.top); 
  this.width = right - this.left; 
  this.height = bottom - this.top; 
}; 
goog.math.Rect.boundingRect = function(a, b) { 
  if(! a || ! b) { 
    return null; 
  } 
  var clone = a.clone(); 
  clone.boundingRect(b); 
  return clone; 
}; 
goog.math.Rect.prototype.contains = function(another) { 
  if(another instanceof goog.math.Rect) { 
    return this.left <= another.left && this.left + this.width >= another.left + another.width && this.top <= another.top && this.top + this.height >= another.top + another.height; 
  } else { 
    return another.x >= this.left && another.x <= this.left + this.width && another.y >= this.top && another.y <= this.top + this.height; 
  } 
}; 
goog.math.Rect.prototype.getSize = function() { 
  return new goog.math.Size(this.width, this.height); 
}; 
