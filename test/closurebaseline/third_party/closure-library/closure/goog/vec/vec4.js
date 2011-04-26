
goog.provide('goog.vec.Vec4'); 
goog.require('goog.vec'); 
goog.vec.Vec4.Type; 
goog.vec.Vec4.create = function() { 
  return new Float32Array(4); 
}; 
goog.vec.Vec4.createFromArray = function(vec) { 
  var newVec = goog.vec.Vec4.create(); 
  goog.vec.Vec4.setFromArray(newVec, vec); 
  return newVec; 
}; 
goog.vec.Vec4.createFromValues = function(v0, v1, v2, v3) { 
  var vec = goog.vec.Vec4.create(); 
  goog.vec.Vec4.setFromValues(vec, v0, v1, v2, v3); 
  return vec; 
}; 
goog.vec.Vec4.clone = goog.vec.Vec4.createFromArray; 
goog.vec.Vec4.setFromValues = function(vec, v0, v1, v2, v3) { 
  vec[0]= v0; 
  vec[1]= v1; 
  vec[2]= v2; 
  vec[3]= v3; 
}; 
goog.vec.Vec4.setFromArray = function(vec, values) { 
  vec[0]= values[0]; 
  vec[1]= values[1]; 
  vec[2]= values[2]; 
  vec[3]= values[3]; 
}; 
goog.vec.Vec4.add = function(vec0, vec1, resultVec) { 
  resultVec[0]= vec0[0]+ vec1[0]; 
  resultVec[1]= vec0[1]+ vec1[1]; 
  resultVec[2]= vec0[2]+ vec1[2]; 
  resultVec[3]= vec0[3]+ vec1[3]; 
  return resultVec; 
}; 
goog.vec.Vec4.subtract = function(vec0, vec1, resultVec) { 
  resultVec[0]= vec0[0]- vec1[0]; 
  resultVec[1]= vec0[1]- vec1[1]; 
  resultVec[2]= vec0[2]- vec1[2]; 
  resultVec[3]= vec0[3]- vec1[3]; 
  return resultVec; 
}; 
goog.vec.Vec4.negate = function(vec0, resultVec) { 
  resultVec[0]= - vec0[0]; 
  resultVec[1]= - vec0[1]; 
  resultVec[2]= - vec0[2]; 
  resultVec[3]= - vec0[3]; 
  return resultVec; 
}; 
goog.vec.Vec4.scale = function(vec0, scalar, resultVec) { 
  resultVec[0]= vec0[0]* scalar; 
  resultVec[1]= vec0[1]* scalar; 
  resultVec[2]= vec0[2]* scalar; 
  resultVec[3]= vec0[3]* scalar; 
  return resultVec; 
}; 
goog.vec.Vec4.magnitudeSquared = function(vec0) { 
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3]; 
  return x * x + y * y + z * z + w * w; 
}; 
goog.vec.Vec4.magnitude = function(vec0) { 
  var x = vec0[0], y = vec0[1], z = vec0[2], w = vec0[3]; 
  return Math.sqrt(x * x + y * y + z * z + w * w); 
}; 
goog.vec.Vec4.normalize = function(vec0, resultVec) { 
  var ilen = 1 / goog.vec.Vec4.magnitude(vec0); 
  resultVec[0]= vec0[0]* ilen; 
  resultVec[1]= vec0[1]* ilen; 
  resultVec[2]= vec0[2]* ilen; 
  resultVec[3]= vec0[3]* ilen; 
  return resultVec; 
}; 
goog.vec.Vec4.dot = function(v0, v1) { 
  return v0[0]* v1[0]+ v0[1]* v1[1]+ v0[2]* v1[2]+ v0[3]* v1[3]; 
}; 
goog.vec.Vec4.lerp = function(v0, v1, f, resultVec) { 
  var x = v0[0], y = v0[1], z = v0[2], w = v0[3]; 
  resultVec[0]=(v1[0]- x) * f + x; 
  resultVec[1]=(v1[1]- y) * f + y; 
  resultVec[2]=(v1[2]- z) * f + z; 
  resultVec[3]=(v1[3]- w) * f + w; 
  return resultVec; 
}; 
goog.vec.Vec4.equals = function(v0, v1) { 
  return v0.length == v1.length && v0[0]== v1[0]&& v0[1]== v1[1]&& v0[2]== v1[2]&& v0[3]== v1[3]; 
}; 
