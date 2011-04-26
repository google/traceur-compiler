
goog.provide('goog.vec.Quaternion'); 
goog.require('goog.vec'); 
goog.require('goog.vec.Vec4'); 
goog.vec.Quaternion.Type; 
goog.vec.Quaternion.create = goog.vec.Vec4.create; 
goog.vec.Quaternion.createFromArray = goog.vec.Vec4.createFromArray; 
goog.vec.Quaternion.createFromValues = goog.vec.Vec4.createFromValues; 
goog.vec.Quaternion.clone = goog.vec.Vec4.clone; 
goog.vec.Quaternion.setFromValues = goog.vec.Vec4.setFromValues; 
goog.vec.Quaternion.setFromArray = goog.vec.Vec4.setFromArray; 
goog.vec.Quaternion.add = goog.vec.Vec4.add; 
goog.vec.Quaternion.negate = goog.vec.Vec4.negate; 
goog.vec.Quaternion.scale = goog.vec.Vec4.scale; 
goog.vec.Quaternion.magnitudeSquared = goog.vec.Vec4.magnitudeSquared; 
goog.vec.Quaternion.magnitude = goog.vec.Vec4.magnitude; 
goog.vec.Quaternion.normalize = goog.vec.Vec4.normalize; 
goog.vec.Quaternion.dot = goog.vec.Vec4.dot; 
goog.vec.Quaternion.conjugate = function(quat, resultQuat) { 
  resultQuat[0]= - quat[0]; 
  resultQuat[1]= - quat[1]; 
  resultQuat[2]= - quat[2]; 
  resultQuat[3]= quat[3]; 
}; 
goog.vec.Quaternion.concat = function(quat0, quat1, resultQuat) { 
  var x0 = quat0[0], y0 = quat0[1], z0 = quat0[2], w0 = quat0[3]; 
  var x1 = quat1[0], y1 = quat1[1], z1 = quat1[2], w1 = quat1[3]; 
  resultQuat[0]= w0 * x1 + x0 * w1 + y0 * z1 - z0 * y1; 
  resultQuat[1]= w0 * y1 - x0 * z1 + y0 * w1 + z0 * x1; 
  resultQuat[2]= w0 * z1 + x0 * y1 - y0 * x1 + z0 * w1; 
  resultQuat[3]= w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1; 
}; 
goog.vec.Quaternion.fromRotationMatrix4 = function(matrix, quat) { 
  var sx = matrix[0], sy = matrix[5], sz = matrix[10]; 
  quat[3]= Math.sqrt(Math.max(0, 1 + sx + sy + sz)) / 2; 
  quat[0]= Math.sqrt(Math.max(0, 1 + sx - sy - sz)) / 2; 
  quat[1]= Math.sqrt(Math.max(0, 1 - sx + sy - sz)) / 2; 
  quat[2]= Math.sqrt(Math.max(0, 1 - sx - sy + sz)) / 2; 
  quat[0]=(matrix[6]- matrix[9]< 0) !=(quat[0]< 0) ? - quat[0]: quat[0]; 
  quat[1]=(matrix[8]- matrix[2]< 0) !=(quat[1]< 0) ? - quat[1]: quat[1]; 
  quat[2]=(matrix[1]- matrix[4]< 0) !=(quat[2]< 0) ? - quat[2]: quat[2]; 
}; 
goog.vec.Quaternion.toRotationMatrix4 = function(quat, matrix) { 
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3]; 
  var x2 = 2 * x, y2 = 2 * y, z2 = 2 * z; 
  var wx = x2 * w; 
  var wy = y2 * w; 
  var wz = z2 * w; 
  var xx = x2 * x; 
  var xy = y2 * x; 
  var xz = z2 * x; 
  var yy = y2 * y; 
  var yz = z2 * y; 
  var zz = z2 * z; 
  matrix[0]= 1 -(yy + zz); 
  matrix[1]= xy + wz; 
  matrix[2]= xz - wy; 
  matrix[3]= 0; 
  matrix[4]= xy - wz; 
  matrix[5]= 1 -(xx + zz); 
  matrix[6]= yz + wx; 
  matrix[7]= 0; 
  matrix[8]= xz + wy; 
  matrix[9]= yz - wx; 
  matrix[10]= 1 -(xx + yy); 
  matrix[11]= 0; 
  matrix[12]= 0; 
  matrix[13]= 0; 
  matrix[14]= 0; 
  matrix[15]= 1; 
}; 
goog.vec.Quaternion.slerp = function(q0, q1, t, resultQuat) { 
  var cosVal = goog.vec.Quaternion.dot(q0, q1); 
  if(cosVal > 1 || cosVal < - 1) { 
    goog.vec.Quaternion.setFromArray(resultQuat, q1); 
    return; 
  } 
  var factor = 1; 
  if(cosVal < 0) { 
    factor = - 1; 
    cosVal = - cosVal; 
  } 
  var angle = Math.acos(cosVal); 
  if(angle <= goog.vec.EPSILON) { 
    goog.vec.Quaternion.setFromArray(resultQuat, q1); 
    return; 
  } 
  var invSinVal = 1 / Math.sin(angle); 
  var c0 = Math.sin((1 - t) * angle) * invSinVal; 
  var c1 = factor * Math.sin(t * angle) * invSinVal; 
  resultQuat[0]= q0[0]* c0 + q1[0]* c1; 
  resultQuat[1]= q0[1]* c0 + q1[1]* c1; 
  resultQuat[2]= q0[2]* c0 + q1[2]* c1; 
  resultQuat[3]= q0[3]* c0 + q1[3]* c1; 
}; 
goog.vec.Quaternion.nlerp = goog.vec.Vec4.lerp; 
