
goog.provide('goog.vec.Ray'); 
goog.require('goog.vec.Vec3'); 
goog.vec.Ray = function(opt_origin, opt_dir) { 
  this.origin = goog.vec.Vec3.createFromArray(opt_origin ||[0, 0, 0]); 
  this.dir = goog.vec.Vec3.createFromArray(opt_dir ||[0, 0, 0]); 
}; 
goog.vec.Ray.prototype.set = function(origin, dir) { 
  goog.vec.Vec3.setFromArray(this.origin, origin); 
  goog.vec.Vec3.setFromArray(this.dir, dir); 
}; 
goog.vec.Ray.prototype.setOrigin = function(origin) { 
  goog.vec.Vec3.setFromArray(this.origin, origin); 
}; 
goog.vec.Ray.prototype.setDir = function(dir) { 
  goog.vec.Vec3.setFromArray(this.dir, dir); 
}; 
goog.vec.Ray.prototype.equals = function(other) { 
  return other != null && goog.vec.Vec3.equals(this.origin, other.origin) && goog.vec.Vec3.equals(this.dir, other.dir); 
}; 
