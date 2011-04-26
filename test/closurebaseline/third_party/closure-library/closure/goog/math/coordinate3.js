
goog.provide('goog.math.Coordinate3'); 
goog.math.Coordinate3 = function(opt_x, opt_y, opt_z) { 
  this.x = goog.isDef(opt_x) ? opt_x: 0; 
  this.y = goog.isDef(opt_y) ? opt_y: 0; 
  this.z = goog.isDef(opt_z) ? opt_z: 0; 
}; 
goog.math.Coordinate3.prototype.clone = function() { 
  return new goog.math.Coordinate3(this.x, this.y, this.z); 
}; 
if(goog.DEBUG) { 
  goog.math.Coordinate3.prototype.toString = function() { 
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ')'; 
  }; 
} 
goog.math.Coordinate3.equals = function(a, b) { 
  if(a == b) { 
    return true; 
  } 
  if(! a || ! b) { 
    return false; 
  } 
  return a.x == b.x && a.y == b.y && a.z == b.z; 
}; 
goog.math.Coordinate3.distance = function(a, b) { 
  var dx = a.x - b.x; 
  var dy = a.y - b.y; 
  var dz = a.z - b.z; 
  return Math.sqrt(dx * dx + dy * dy + dz * dz); 
}; 
goog.math.Coordinate3.squaredDistance = function(a, b) { 
  var dx = a.x - b.x; 
  var dy = a.y - b.y; 
  var dz = a.z - b.z; 
  return dx * dx + dy * dy + dz * dz; 
}; 
goog.math.Coordinate3.difference = function(a, b) { 
  return new goog.math.Coordinate3(a.x - b.x, a.y - b.y, a.z - b.z); 
}; 
goog.math.Coordinate3.prototype.toArray = function() { 
  return[this.x, this.y, this.z]; 
}; 
goog.math.Coordinate3.fromArray = function(a) { 
  if(a.length <= 3) { 
    return new goog.math.Coordinate3(a[0], a[1], a[2]); 
  } 
  throw Error('Conversion from an array requires an array of length 3'); 
}; 
