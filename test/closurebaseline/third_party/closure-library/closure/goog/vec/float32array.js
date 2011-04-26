
goog.provide('goog.vec.Float32Array'); 
goog.vec.Float32Array = function(p0) { 
  this.length = p0.length || p0; 
  for(var i = 0; i < this.length; i ++) { 
    this[i]= p0[i]|| 0; 
  } 
}; 
goog.vec.Float32Array.BYTES_PER_ELEMENT = 4; 
goog.vec.Float32Array.prototype.BYTES_PER_ELEMENT = 4; 
goog.vec.Float32Array.prototype.set = function(values, opt_offset) { 
  opt_offset = opt_offset || 0; 
  for(var i = 0; i < values.length && opt_offset + i < this.length; i ++) { 
    this[opt_offset + i]= values[i]; 
  } 
}; 
goog.vec.Float32Array.prototype.toString = Array.prototype.join; 
if(typeof Float32Array == 'undefined') { 
  goog.exportProperty(goog.vec.Float32Array, 'BYTES_PER_ELEMENT', goog.vec.Float32Array.BYTES_PER_ELEMENT); 
  goog.exportProperty(goog.vec.Float32Array.prototype, 'BYTES_PER_ELEMENT', goog.vec.Float32Array.prototype.BYTES_PER_ELEMENT); 
  goog.exportProperty(goog.vec.Float32Array.prototype, 'set', goog.vec.Float32Array.prototype.set); 
  goog.exportProperty(goog.vec.Float32Array.prototype, 'toString', goog.vec.Float32Array.prototype.toString); 
  goog.exportSymbol('Float32Array', goog.vec.Float32Array); 
} 
