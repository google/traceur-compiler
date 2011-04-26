
goog.provide('goog.math.Vec2'); 
goog.require('goog.math'); 
goog.require('goog.math.Coordinate'); 
goog.math.Vec2 = function(x, y) { 
  this.x = x; 
  this.y = y; 
}; 
goog.inherits(goog.math.Vec2, goog.math.Coordinate); 
goog.math.Vec2.randomUnit = function() { 
  var angle = Math.random() * Math.PI * 2; 
  return new goog.math.Vec2(Math.cos(angle), Math.sin(angle)); 
}; 
goog.math.Vec2.random = function() { 
  var mag = Math.sqrt(Math.random()); 
  var angle = Math.random() * Math.PI * 2; 
  return new goog.math.Vec2(Math.cos(angle) * mag, Math.sin(angle) * mag); 
}; 
goog.math.Vec2.fromCoordinate = function(a) { 
  return new goog.math.Vec2(a.x, a.y); 
}; 
goog.math.Vec2.prototype.clone = function() { 
  return new goog.math.Vec2(this.x, this.y); 
}; 
goog.math.Vec2.prototype.magnitude = function() { 
  return Math.sqrt(this.x * this.x + this.y * this.y); 
}; 
goog.math.Vec2.prototype.squaredMagnitude = function() { 
  return this.x * this.x + this.y * this.y; 
}; 
goog.math.Vec2.prototype.scale = function(s) { 
  this.x *= s; 
  this.y *= s; 
  return this; 
}; 
goog.math.Vec2.prototype.invert = function() { 
  this.x = - this.x; 
  this.y = - this.y; 
  return this; 
}; 
goog.math.Vec2.prototype.normalize = function() { 
  return this.scale(1 / this.magnitude()); 
}; 
goog.math.Vec2.prototype.add = function(b) { 
  this.x += b.x; 
  this.y += b.y; 
  return this; 
}; 
goog.math.Vec2.prototype.subtract = function(b) { 
  this.x -= b.x; 
  this.y -= b.y; 
  return this; 
}; 
goog.math.Vec2.prototype.equals = function(b) { 
  return this == b || ! ! b && this.x == b.x && this.y == b.y; 
}; 
goog.math.Vec2.distance = goog.math.Coordinate.distance; 
goog.math.Vec2.squaredDistance = goog.math.Coordinate.squaredDistance; 
goog.math.Vec2.equals = goog.math.Coordinate.equals; 
goog.math.Vec2.sum = function(a, b) { 
  return new goog.math.Vec2(a.x + b.x, a.y + b.y); 
}; 
goog.math.Vec2.difference = function(a, b) { 
  return new goog.math.Vec2(a.x - b.x, a.y - b.y); 
}; 
goog.math.Vec2.dot = function(a, b) { 
  return a.x * b.x + a.y * b.y; 
}; 
goog.math.Vec2.lerp = function(a, b, x) { 
  return new goog.math.Vec2(goog.math.lerp(a.x, b.x, x), goog.math.lerp(a.y, b.y, x)); 
}; 
