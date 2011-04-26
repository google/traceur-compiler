
goog.provide('goog.math.Box'); 
goog.require('goog.math.Coordinate'); 
goog.math.Box = function(top, right, bottom, left) { 
  this.top = top; 
  this.right = right; 
  this.bottom = bottom; 
  this.left = left; 
}; 
goog.math.Box.boundingBox = function(var_args) { 
  var box = new goog.math.Box(arguments[0].y, arguments[0].x, arguments[0].y, arguments[0].x); 
  for(var i = 1; i < arguments.length; i ++) { 
    var coord = arguments[i]; 
    box.top = Math.min(box.top, coord.y); 
    box.right = Math.max(box.right, coord.x); 
    box.bottom = Math.max(box.bottom, coord.y); 
    box.left = Math.min(box.left, coord.x); 
  } 
  return box; 
}; 
goog.math.Box.prototype.clone = function() { 
  return new goog.math.Box(this.top, this.right, this.bottom, this.left); 
}; 
if(goog.DEBUG) { 
  goog.math.Box.prototype.toString = function() { 
    return '(' + this.top + 't, ' + this.right + 'r, ' + this.bottom + 'b, ' + this.left + 'l)'; 
  }; 
} 
goog.math.Box.prototype.contains = function(other) { 
  return goog.math.Box.contains(this, other); 
}; 
goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom, opt_left) { 
  if(goog.isObject(top)) { 
    this.top -= top.top; 
    this.right += top.right; 
    this.bottom += top.bottom; 
    this.left -= top.left; 
  } else { 
    this.top -= top; 
    this.right += opt_right; 
    this.bottom += opt_bottom; 
    this.left -= opt_left; 
  } 
  return this; 
}; 
goog.math.Box.prototype.expandToInclude = function(box) { 
  this.left = Math.min(this.left, box.left); 
  this.top = Math.min(this.top, box.top); 
  this.right = Math.max(this.right, box.right); 
  this.bottom = Math.max(this.bottom, box.bottom); 
}; 
goog.math.Box.equals = function(a, b) { 
  if(a == b) { 
    return true; 
  } 
  if(! a || ! b) { 
    return false; 
  } 
  return a.top == b.top && a.right == b.right && a.bottom == b.bottom && a.left == b.left; 
}; 
goog.math.Box.contains = function(box, other) { 
  if(! box || ! other) { 
    return false; 
  } 
  if(other instanceof goog.math.Box) { 
    return other.left >= box.left && other.right <= box.right && other.top >= box.top && other.bottom <= box.bottom; 
  } 
  return other.x >= box.left && other.x <= box.right && other.y >= box.top && other.y <= box.bottom; 
}; 
goog.math.Box.distance = function(box, coord) { 
  if(coord.x >= box.left && coord.x <= box.right) { 
    if(coord.y >= box.top && coord.y <= box.bottom) { 
      return 0; 
    } 
    return coord.y < box.top ? box.top - coord.y: coord.y - box.bottom; 
  } 
  if(coord.y >= box.top && coord.y <= box.bottom) { 
    return coord.x < box.left ? box.left - coord.x: coord.x - box.right; 
  } 
  return goog.math.Coordinate.distance(coord, new goog.math.Coordinate(coord.x < box.left ? box.left: box.right, coord.y < box.top ? box.top: box.bottom)); 
}; 
goog.math.Box.intersects = function(a, b) { 
  return(a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom); 
}; 
goog.math.Box.intersectsWithPadding = function(a, b, padding) { 
  return(a.left <= b.right + padding && b.left <= a.right + padding && a.top <= b.bottom + padding && b.top <= a.bottom + padding); 
}; 
