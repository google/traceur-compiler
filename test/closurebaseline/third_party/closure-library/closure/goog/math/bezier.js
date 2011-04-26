
goog.provide('goog.math.Bezier'); 
goog.require('goog.math'); 
goog.require('goog.math.Coordinate'); 
goog.math.Bezier = function(x0, y0, x1, y1, x2, y2, x3, y3) { 
  this.x0 = x0; 
  this.y0 = y0; 
  this.x1 = x1; 
  this.y1 = y1; 
  this.x2 = x2; 
  this.y2 = y2; 
  this.x3 = x3; 
  this.y3 = y3; 
}; 
goog.math.Bezier.KAPPA = 4 *(Math.sqrt(2) - 1) / 3; 
goog.math.Bezier.prototype.clone = function() { 
  return new goog.math.Bezier(this.x0, this.y0, this.x1, this.y1, this.x2, this.y2, this.x3, this.y3); 
}; 
goog.math.Bezier.prototype.equals = function(other) { 
  return this.x0 == other.x0 && this.y0 == other.y0 && this.x1 == other.x1 && this.y1 == other.y1 && this.x2 == other.x2 && this.y2 == other.y2 && this.x3 == other.x3 && this.y3 == other.y3; 
}; 
goog.math.Bezier.prototype.flip = function() { 
  var temp = this.x0; 
  this.x0 = this.x3; 
  this.x3 = temp; 
  temp = this.y0; 
  this.y0 = this.y3; 
  this.y3 = temp; 
  temp = this.x1; 
  this.x1 = this.x2; 
  this.x2 = temp; 
  temp = this.y1; 
  this.y1 = this.y2; 
  this.y2 = temp; 
}; 
goog.math.Bezier.prototype.getPoint = function(t) { 
  if(t == 0) { 
    return new goog.math.Coordinate(this.x0, this.y0); 
  } else if(t == 1) { 
    return new goog.math.Coordinate(this.x3, this.y3); 
  } 
  var ix0 = goog.math.lerp(this.x0, this.x1, t); 
  var iy0 = goog.math.lerp(this.y0, this.y1, t); 
  var ix1 = goog.math.lerp(this.x1, this.x2, t); 
  var iy1 = goog.math.lerp(this.y1, this.y2, t); 
  var ix2 = goog.math.lerp(this.x2, this.x3, t); 
  var iy2 = goog.math.lerp(this.y2, this.y3, t); 
  ix0 = goog.math.lerp(ix0, ix1, t); 
  iy0 = goog.math.lerp(iy0, iy1, t); 
  ix1 = goog.math.lerp(ix1, ix2, t); 
  iy1 = goog.math.lerp(iy1, iy2, t); 
  return new goog.math.Coordinate(goog.math.lerp(ix0, ix1, t), goog.math.lerp(iy0, iy1, t)); 
}; 
goog.math.Bezier.prototype.subdivideLeft = function(t) { 
  if(t == 1) { 
    return; 
  } 
  var ix0 = goog.math.lerp(this.x0, this.x1, t); 
  var iy0 = goog.math.lerp(this.y0, this.y1, t); 
  var ix1 = goog.math.lerp(this.x1, this.x2, t); 
  var iy1 = goog.math.lerp(this.y1, this.y2, t); 
  var ix2 = goog.math.lerp(this.x2, this.x3, t); 
  var iy2 = goog.math.lerp(this.y2, this.y3, t); 
  this.x1 = ix0; 
  this.y1 = iy0; 
  ix0 = goog.math.lerp(ix0, ix1, t); 
  iy0 = goog.math.lerp(iy0, iy1, t); 
  ix1 = goog.math.lerp(ix1, ix2, t); 
  iy1 = goog.math.lerp(iy1, iy2, t); 
  this.x2 = ix0; 
  this.y2 = iy0; 
  this.x3 = goog.math.lerp(ix0, ix1, t); 
  this.y3 = goog.math.lerp(iy0, iy1, t); 
}; 
goog.math.Bezier.prototype.subdivideRight = function(t) { 
  this.flip(); 
  this.subdivideLeft(1 - t); 
  this.flip(); 
}; 
goog.math.Bezier.prototype.subdivide = function(s, t) { 
  this.subdivideRight(s); 
  this.subdivideLeft((t - s) /(1 - s)); 
}; 
goog.math.Bezier.prototype.solvePositionFromXValue = function(xVal) { 
  var epsilon = 1e-6; 
  var t =(xVal - this.x0) /(this.x3 - this.x0); 
  if(t <= 0) { 
    return 0; 
  } else if(t >= 1) { 
    return 1; 
  } 
  var tMin = 0; 
  var tMax = 1; 
  for(var i = 0; i < 8; i ++) { 
    var value = this.getPoint(t).x; 
    var derivative =(this.getPoint(t + epsilon).x - value) / epsilon; 
    if(Math.abs(value - xVal) < epsilon) { 
      return t; 
    } else if(Math.abs(derivative) < epsilon) { 
      break; 
    } else { 
      if(value < xVal) { 
        tMin = t; 
      } else { 
        tMax = t; 
      } 
      t -=(value - xVal) / derivative; 
    } 
  } 
  for(var i = 0; Math.abs(value - xVal) > epsilon && i < 8; i ++) { 
    if(value < xVal) { 
      tMin = t; 
      t =(t + tMax) / 2; 
    } else { 
      tMax = t; 
      t =(t + tMin) / 2; 
    } 
    value = this.getPoint(t).x; 
  } 
  return t; 
}; 
goog.math.Bezier.prototype.solveYValueFromXValue = function(xVal) { 
  return this.getPoint(this.solvePositionFromXValue(xVal)).y; 
}; 
