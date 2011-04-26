
goog.provide('goog.math.Line'); 
goog.require('goog.math'); 
goog.require('goog.math.Coordinate'); 
goog.math.Line = function(x0, y0, x1, y1) { 
  this.x0 = x0; 
  this.y0 = y0; 
  this.x1 = x1; 
  this.y1 = y1; 
}; 
goog.math.Line.prototype.clone = function() { 
  return new goog.math.Line(this.x0, this.y0, this.x1, this.y1); 
}; 
goog.math.Line.prototype.equals = function(other) { 
  return this.x0 == other.x0 && this.y0 == other.y0 && this.x1 == other.x1 && this.y1 == other.y1; 
}; 
goog.math.Line.prototype.getSegmentLengthSquared = function() { 
  var xdist = this.x1 - this.x0; 
  var ydist = this.y1 - this.y0; 
  return xdist * xdist + ydist * ydist; 
}; 
goog.math.Line.prototype.getSegmentLength = function() { 
  return Math.sqrt(this.getSegmentLengthSquared()); 
}; 
goog.math.Line.prototype.getClosestLinearInterpolation_ = function(x, opt_y) { 
  var y; 
  if(x instanceof goog.math.Coordinate) { 
    y = x.y; 
    x = x.x; 
  } else { 
    y = opt_y; 
  } 
  var x0 = this.x0; 
  var y0 = this.y0; 
  var xChange = this.x1 - x0; 
  var yChange = this.y1 - y0; 
  return((x - x0) * xChange +(y - y0) * yChange) / this.getSegmentLengthSquared(); 
}; 
goog.math.Line.prototype.getInterpolatedPoint = function(t) { 
  return new goog.math.Coordinate(goog.math.lerp(this.x0, this.x1, t), goog.math.lerp(this.y0, this.y1, t)); 
}; 
goog.math.Line.prototype.getClosestPoint = function(x, opt_y) { 
  return this.getInterpolatedPoint(this.getClosestLinearInterpolation_(x, opt_y)); 
}; 
goog.math.Line.prototype.getClosestSegmentPoint = function(x, opt_y) { 
  return this.getInterpolatedPoint(goog.math.clamp(this.getClosestLinearInterpolation_(x, opt_y), 0, 1)); 
}; 
