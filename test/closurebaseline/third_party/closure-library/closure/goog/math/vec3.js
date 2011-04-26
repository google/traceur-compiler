
goog.provide('goog.math.Vec3'); 
goog.require('goog.math'); 
goog.require('goog.math.Coordinate3'); 
goog.math.Vec3 = function(x, y, z) { 
  this.x = x; 
  this.y = y; 
  this.z = z; 
}; 
goog.inherits(goog.math.Vec3, goog.math.Coordinate3); 
goog.math.Vec3.randomUnit = function() { 
  var theta = Math.random() * Math.PI * 2; 
  var phi = Math.random() * Math.PI * 2; 
  var z = Math.cos(phi); 
  var x = Math.sqrt(1 - z * z) * Math.cos(theta); 
  var y = Math.sqrt(1 - z * z) * Math.sin(theta); 
  return new goog.math.Vec3(x, y, z); 
}; 
goog.math.Vec3.random = function() { 
  return new goog.math.Vec3.randomUnit().scale(Math.random()); 
}; 
goog.math.Vec3.fromCoordinate3 = function(a) { 
  return new goog.math.Vec3(a.x, a.y, a.z); 
}; 
goog.math.Vec3.prototype.clone = function() { 
  return new goog.math.Vec3(this.x, this.y, this.z); 
}; 
goog.math.Vec3.prototype.magnitude = function() { 
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); 
}; 
goog.math.Vec3.prototype.squaredMagnitude = function() { 
  return this.x * this.x + this.y * this.y + this.z * this.z; 
}; 
goog.math.Vec3.prototype.scale = function(s) { 
  this.x *= s; 
  this.y *= s; 
  this.z *= s; 
  return this; 
}; 
goog.math.Vec3.prototype.invert = function() { 
  this.x = - this.x; 
  this.y = - this.y; 
  this.z = - this.z; 
  return this; 
}; 
goog.math.Vec3.prototype.normalize = function() { 
  return this.scale(1 / this.magnitude()); 
}; 
goog.math.Vec3.prototype.add = function(b) { 
  this.x += b.x; 
  this.y += b.y; 
  this.z += b.z; 
  return this; 
}; 
goog.math.Vec3.prototype.subtract = function(b) { 
  this.x -= b.x; 
  this.y -= b.y; 
  this.z -= b.z; 
  return this; 
}; 
goog.math.Vec3.prototype.equals = function(b) { 
  return this == b || ! ! b && this.x == b.x && this.y == b.y && this.z == b.z; 
}; 
goog.math.Vec3.distance = goog.math.Coordinate3.distance; 
goog.math.Vec3.squaredDistance = goog.math.Coordinate3.squaredDistance; 
goog.math.Vec3.equals = goog.math.Coordinate3.equals; 
goog.math.Vec3.sum = function(a, b) { 
  return new goog.math.Vec3(a.x + b.x, a.y + b.y, a.z + b.z); 
}; 
goog.math.Vec3.difference = function(a, b) { 
  return new goog.math.Vec3(a.x - b.x, a.y - b.y, a.z - b.z); 
}; 
goog.math.Vec3.dot = function(a, b) { 
  return a.x * b.x + a.y * b.y + a.z * b.z; 
}; 
goog.math.Vec3.cross = function(a, b) { 
  return new goog.math.Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); 
}; 
goog.math.Vec3.lerp = function(a, b, x) { 
  return new goog.math.Vec3(goog.math.lerp(a.x, b.x, x), goog.math.lerp(a.y, b.y, x), goog.math.lerp(a.z, b.z, x)); 
}; 
