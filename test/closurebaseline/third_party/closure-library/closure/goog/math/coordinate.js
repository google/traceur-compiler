
goog.provide('goog.math.Coordinate'); 
goog.math.Coordinate = function(opt_x, opt_y) { 
  this.x = goog.isDef(opt_x) ? opt_x: 0; 
  this.y = goog.isDef(opt_y) ? opt_y: 0; 
}; 
goog.math.Coordinate.prototype.clone = function() { 
  return new goog.math.Coordinate(this.x, this.y); 
}; 
if(goog.DEBUG) { 
  goog.math.Coordinate.prototype.toString = function() { 
    return '(' + this.x + ', ' + this.y + ')'; 
  }; 
} 
goog.math.Coordinate.equals = function(a, b) { 
  if(a == b) { 
    return true; 
  } 
  if(! a || ! b) { 
    return false; 
  } 
  return a.x == b.x && a.y == b.y; 
}; 
goog.math.Coordinate.distance = function(a, b) { 
  var dx = a.x - b.x; 
  var dy = a.y - b.y; 
  return Math.sqrt(dx * dx + dy * dy); 
}; 
goog.math.Coordinate.squaredDistance = function(a, b) { 
  var dx = a.x - b.x; 
  var dy = a.y - b.y; 
  return dx * dx + dy * dy; 
}; 
goog.math.Coordinate.difference = function(a, b) { 
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y); 
}; 
goog.math.Coordinate.sum = function(a, b) { 
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y); 
}; 
