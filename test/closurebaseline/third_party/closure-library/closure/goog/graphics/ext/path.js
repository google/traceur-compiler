
goog.provide('goog.graphics.ext.Path'); 
goog.require('goog.graphics.AffineTransform'); 
goog.require('goog.graphics.Path'); 
goog.require('goog.math'); 
goog.require('goog.math.Rect'); 
goog.graphics.ext.Path = function() { 
  goog.graphics.Path.call(this); 
}; 
goog.inherits(goog.graphics.ext.Path, goog.graphics.Path); 
goog.graphics.ext.Path.prototype.bounds_ = null; 
goog.graphics.ext.Path.prototype.clone = function() { 
  var output =(goog.graphics.ext.Path.superClass_.clone.call(this)); 
  output.bounds_ = this.bounds_ && this.bounds_.clone(); 
  return output; 
}; 
goog.graphics.ext.Path.prototype.transform = function(tx) { 
  goog.graphics.ext.Path.superClass_.transform.call(this, tx); 
  this.bounds_ = null; 
  return this; 
}; 
goog.graphics.ext.Path.prototype.modifyBounds = function(deltaX, deltaY, xFactor, yFactor) { 
  if(! this.isSimple()) { 
    var simple = goog.graphics.Path.createSimplifiedPath(this); 
    this.clear(); 
    this.appendPath(simple); 
  } 
  return this.transform(goog.graphics.AffineTransform.getScaleInstance(xFactor, yFactor).translate(deltaX, deltaY)); 
}; 
goog.graphics.ext.Path.prototype.useBoundingBox = function(bounds) { 
  this.bounds_ = bounds && bounds.clone(); 
}; 
goog.graphics.ext.Path.prototype.getBoundingBox = function() { 
  if(! this.bounds_ && ! this.isEmpty()) { 
    var minY; 
    var minX = minY = Number.POSITIVE_INFINITY; 
    var maxY; 
    var maxX = maxY = Number.NEGATIVE_INFINITY; 
    var simplePath = this.isSimple() ? this: goog.graphics.Path.createSimplifiedPath(this); 
    simplePath.forEachSegment(function(type, points) { 
      for(var i = 0, len = points.length; i < len; i += 2) { 
        minX = Math.min(minX, points[i]); 
        maxX = Math.max(maxX, points[i]); 
        minY = Math.min(minY, points[i + 1]); 
        maxY = Math.max(maxY, points[i + 1]); 
      } 
    }); 
    this.bounds_ = new goog.math.Rect(minX, minY, maxX - minX, maxY - minY); 
  } 
  return this.bounds_; 
}; 
