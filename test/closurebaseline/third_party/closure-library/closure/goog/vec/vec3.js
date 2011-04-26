
goog.provide('goog.vec.Vec3'); 
goog.require('goog.vec'); 
goog.vec.Vec3.Type; 
goog.vec.Vec3.create = function() { 
  return new Float32Array(3); 
}; 
goog.vec.Vec3.createFromArray = function(vec) { 
  var newVec = goog.vec.Vec3.create(); 
  goog.vec.Vec3.setFromArray(newVec, vec); 
  return newVec; 
}; 
goog.vec.Vec3.createFromValues = function(v0, v1, v2) { 
  var vec = goog.vec.Vec3.create(); 
  goog.vec.Vec3.setFromValues(vec, v0, v1, v2); 
  return vec; 
}; 
goog.vec.Vec3.clone = goog.vec.Vec3.createFromArray; 
goog.vec.Vec3.setFromValues = function(vec, v0, v1, v2) { 
  vec[0]= v0; 
  vec[1]= v1; 
  vec[2]= v2; 
}; 
goog.vec.Vec3.setFromArray = function(vec, values) { 
  vec[0]= values[0]; 
  vec[1]= values[1]; 
  vec[2]= values[2]; 
}; 
goog.vec.Vec3.add = function(vec0, vec1, resultVec) { 
  resultVec[0]= vec0[0]+ vec1[0]; 
  resultVec[1]= vec0[1]+ vec1[1]; 
  resultVec[2]= vec0[2]+ vec1[2]; 
  return resultVec; 
}; 
goog.vec.Vec3.subtract = function(vec0, vec1, resultVec) { 
  resultVec[0]= vec0[0]- vec1[0]; 
  resultVec[1]= vec0[1]- vec1[1]; 
  resultVec[2]= vec0[2]- vec1[2]; 
  return resultVec; 
}; 
goog.vec.Vec3.negate = function(vec0, resultVec) { 
  resultVec[0]= - vec0[0]; 
  resultVec[1]= - vec0[1]; 
  resultVec[2]= - vec0[2]; 
  return resultVec; 
}; 
goog.vec.Vec3.scale = function(vec0, scalar, resultVec) { 
  resultVec[0]= vec0[0]* scalar; 
  resultVec[1]= vec0[1]* scalar; 
  resultVec[2]= vec0[2]* scalar; 
  return resultVec; 
}; 
goog.vec.Vec3.magnitudeSquared = function(vec0) { 
  var x = vec0[0], y = vec0[1], z = vec0[2]; 
  return x * x + y * y + z * z; 
}; 
goog.vec.Vec3.magnitude = function(vec0) { 
  var x = vec0[0], y = vec0[1], z = vec0[2]; 
  return Math.sqrt(x * x + y * y + z * z); 
}; 
goog.vec.Vec3.normalize = function(vec0, resultVec) { 
  var ilen = 1 / goog.vec.Vec3.magnitude(vec0); 
  resultVec[0]= vec0[0]* ilen; 
  resultVec[1]= vec0[1]* ilen; 
  resultVec[2]= vec0[2]* ilen; 
  return resultVec; 
}; 
goog.vec.Vec3.dot = function(v0, v1) { 
  return v0[0]* v1[0]+ v0[1]* v1[1]+ v0[2]* v1[2]; 
}; 
goog.vec.Vec3.cross = function(v0, v1, resultVec) { 
  var x0 = v0[0], y0 = v0[1], z0 = v0[2]; 
  var x1 = v1[0], y1 = v1[1], z1 = v1[2]; 
  resultVec[0]= y0 * z1 - z0 * y1; 
  resultVec[1]= z0 * x1 - x0 * z1; 
  resultVec[2]= x0 * y1 - y0 * x1; 
  return resultVec; 
}; 
goog.vec.Vec3.lerp = function(v0, v1, f, resultVec) { 
  var x = v0[0], y = v0[1], z = v0[2]; 
  resultVec[0]=(v1[0]- x) * f + x; 
  resultVec[1]=(v1[1]- y) * f + y; 
  resultVec[2]=(v1[2]- z) * f + z; 
  return resultVec; 
}; 
goog.vec.Vec3.equals = function(v0, v1) { 
  return v0.length == v1.length && v0[0]== v1[0]&& v0[1]== v1[1]&& v0[2]== v1[2]; 
}; 
