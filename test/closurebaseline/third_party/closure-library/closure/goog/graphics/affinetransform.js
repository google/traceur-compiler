
goog.provide('goog.graphics.AffineTransform'); 
goog.require('goog.math'); 
goog.graphics.AffineTransform = function(opt_m00, opt_m10, opt_m01, opt_m11, opt_m02, opt_m12) { 
  if(arguments.length == 6) { 
    this.setTransform((opt_m00),(opt_m10),(opt_m01),(opt_m11),(opt_m02),(opt_m12)); 
  } else if(arguments.length != 0) { 
    throw Error('Insufficient matrix parameters'); 
  } else { 
    this.m00_ = this.m11_ = 1; 
    this.m10_ = this.m01_ = this.m02_ = this.m12_ = 0; 
  } 
}; 
goog.graphics.AffineTransform.prototype.isIdentity = function() { 
  return this.m00_ == 1 && this.m10_ == 0 && this.m01_ == 0 && this.m11_ == 1 && this.m02_ == 0 && this.m12_ == 0; 
}; 
goog.graphics.AffineTransform.prototype.clone = function() { 
  return new goog.graphics.AffineTransform(this.m00_, this.m10_, this.m01_, this.m11_, this.m02_, this.m12_); 
}; 
goog.graphics.AffineTransform.prototype.setTransform = function(m00, m10, m01, m11, m02, m12) { 
  if(! goog.isNumber(m00) || ! goog.isNumber(m10) || ! goog.isNumber(m01) || ! goog.isNumber(m11) || ! goog.isNumber(m02) || ! goog.isNumber(m12)) { 
    throw Error('Invalid transform parameters'); 
  } 
  this.m00_ = m00; 
  this.m10_ = m10; 
  this.m01_ = m01; 
  this.m11_ = m11; 
  this.m02_ = m02; 
  this.m12_ = m12; 
  return this; 
}; 
goog.graphics.AffineTransform.prototype.copyFrom = function(tx) { 
  this.m00_ = tx.m00_; 
  this.m10_ = tx.m10_; 
  this.m01_ = tx.m01_; 
  this.m11_ = tx.m11_; 
  this.m02_ = tx.m02_; 
  this.m12_ = tx.m12_; 
  return this; 
}; 
goog.graphics.AffineTransform.prototype.scale = function(sx, sy) { 
  this.m00_ *= sx; 
  this.m10_ *= sx; 
  this.m01_ *= sy; 
  this.m11_ *= sy; 
  return this; 
}; 
goog.graphics.AffineTransform.prototype.translate = function(dx, dy) { 
  this.m02_ += dx * this.m00_ + dy * this.m01_; 
  this.m12_ += dx * this.m10_ + dy * this.m11_; 
  return this; 
}; 
goog.graphics.AffineTransform.prototype.rotate = function(theta, x, y) { 
  return this.concatenate(goog.graphics.AffineTransform.getRotateInstance(theta, x, y)); 
}; 
goog.graphics.AffineTransform.prototype.shear = function(shx, shy) { 
  var m00 = this.m00_; 
  var m10 = this.m10_; 
  this.m00_ += shy * this.m01_; 
  this.m10_ += shy * this.m11_; 
  this.m01_ += shx * m00; 
  this.m11_ += shx * m10; 
  return this; 
}; 
goog.graphics.AffineTransform.prototype.toString = function() { 
  return 'matrix(' +[this.m00_, this.m10_, this.m01_, this.m11_, this.m02_, this.m12_].join(',') + ')'; 
}; 
goog.graphics.AffineTransform.prototype.getScaleX = function() { 
  return this.m00_; 
}; 
goog.graphics.AffineTransform.prototype.getScaleY = function() { 
  return this.m11_; 
}; 
goog.graphics.AffineTransform.prototype.getTranslateX = function() { 
  return this.m02_; 
}; 
goog.graphics.AffineTransform.prototype.getTranslateY = function() { 
  return this.m12_; 
}; 
goog.graphics.AffineTransform.prototype.getShearX = function() { 
  return this.m01_; 
}; 
goog.graphics.AffineTransform.prototype.getShearY = function() { 
  return this.m10_; 
}; 
goog.graphics.AffineTransform.prototype.concatenate = function(tx) { 
  var m0 = this.m00_; 
  var m1 = this.m01_; 
  this.m00_ = tx.m00_ * m0 + tx.m10_ * m1; 
  this.m01_ = tx.m01_ * m0 + tx.m11_ * m1; 
  this.m02_ += tx.m02_ * m0 + tx.m12_ * m1; 
  m0 = this.m10_; 
  m1 = this.m11_; 
  this.m10_ = tx.m00_ * m0 + tx.m10_ * m1; 
  this.m11_ = tx.m01_ * m0 + tx.m11_ * m1; 
  this.m12_ += tx.m02_ * m0 + tx.m12_ * m1; 
  return this; 
}; 
goog.graphics.AffineTransform.prototype.preConcatenate = function(tx) { 
  var m0 = this.m00_; 
  var m1 = this.m10_; 
  this.m00_ = tx.m00_ * m0 + tx.m01_ * m1; 
  this.m10_ = tx.m10_ * m0 + tx.m11_ * m1; 
  m0 = this.m01_; 
  m1 = this.m11_; 
  this.m01_ = tx.m00_ * m0 + tx.m01_ * m1; 
  this.m11_ = tx.m10_ * m0 + tx.m11_ * m1; 
  m0 = this.m02_; 
  m1 = this.m12_; 
  this.m02_ = tx.m00_ * m0 + tx.m01_ * m1 + tx.m02_; 
  this.m12_ = tx.m10_ * m0 + tx.m11_ * m1 + tx.m12_; 
  return this; 
}; 
goog.graphics.AffineTransform.prototype.transform = function(src, srcOff, dst, dstOff, numPts) { 
  var i = srcOff; 
  var j = dstOff; 
  var srcEnd = srcOff + 2 * numPts; 
  while(i < srcEnd) { 
    var x = src[i ++]; 
    var y = src[i ++]; 
    dst[j ++]= x * this.m00_ + y * this.m01_ + this.m02_; 
    dst[j ++]= x * this.m10_ + y * this.m11_ + this.m12_; 
  } 
}; 
goog.graphics.AffineTransform.prototype.getDeterminant = function() { 
  return this.m00_ * this.m11_ - this.m01_ * this.m10_; 
}; 
goog.graphics.AffineTransform.prototype.isInvertible = function() { 
  var det = this.getDeterminant(); 
  return goog.math.isFiniteNumber(det) && goog.math.isFiniteNumber(this.m02_) && goog.math.isFiniteNumber(this.m12_) && det != 0; 
}; 
goog.graphics.AffineTransform.prototype.createInverse = function() { 
  var det = this.getDeterminant(); 
  return new goog.graphics.AffineTransform(this.m11_ / det, - this.m10_ / det, - this.m01_ / det, this.m00_ / det,(this.m01_ * this.m12_ - this.m11_ * this.m02_) / det,(this.m10_ * this.m02_ - this.m00_ * this.m12_) / det); 
}; 
goog.graphics.AffineTransform.getScaleInstance = function(sx, sy) { 
  return new goog.graphics.AffineTransform().setToScale(sx, sy); 
}; 
goog.graphics.AffineTransform.getTranslateInstance = function(dx, dy) { 
  return new goog.graphics.AffineTransform().setToTranslation(dx, dy); 
}; 
goog.graphics.AffineTransform.getShearInstance = function(shx, shy) { 
  return new goog.graphics.AffineTransform().setToShear(shx, shy); 
}; 
goog.graphics.AffineTransform.getRotateInstance = function(theta, x, y) { 
  return new goog.graphics.AffineTransform().setToRotation(theta, x, y); 
}; 
goog.graphics.AffineTransform.prototype.setToScale = function(sx, sy) { 
  return this.setTransform(sx, 0, 0, sy, 0, 0); 
}; 
goog.graphics.AffineTransform.prototype.setToTranslation = function(dx, dy) { 
  return this.setTransform(1, 0, 0, 1, dx, dy); 
}; 
goog.graphics.AffineTransform.prototype.setToShear = function(shx, shy) { 
  return this.setTransform(1, shy, shx, 1, 0, 0); 
}; 
goog.graphics.AffineTransform.prototype.setToRotation = function(theta, x, y) { 
  var cos = Math.cos(theta); 
  var sin = Math.sin(theta); 
  return this.setTransform(cos, sin, - sin, cos, x - x * cos + y * sin, y - x * sin - y * cos); 
}; 
goog.graphics.AffineTransform.prototype.equals = function(tx) { 
  if(this == tx) { 
    return true; 
  } 
  if(! tx) { 
    return false; 
  } 
  return this.m00_ == tx.m00_ && this.m01_ == tx.m01_ && this.m02_ == tx.m02_ && this.m10_ == tx.m10_ && this.m11_ == tx.m11_ && this.m12_ == tx.m12_; 
}; 
