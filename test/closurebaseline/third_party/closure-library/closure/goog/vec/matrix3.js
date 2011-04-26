
goog.provide('goog.vec.Matrix3'); 
goog.require('goog.vec'); 
goog.vec.Matrix3.Type; 
goog.vec.Matrix3.create = function() { 
  return new Float32Array(9); 
}; 
goog.vec.Matrix3.createIdentity = function() { 
  var mat = goog.vec.Matrix3.create(); 
  mat[0]= mat[4]= mat[8]= 1; 
  return mat; 
}; 
goog.vec.Matrix3.createFromArray = function(matrix) { 
  var newMatrix = goog.vec.Matrix3.create(); 
  goog.vec.Matrix3.setFromArray(newMatrix, matrix); 
  return newMatrix; 
}; 
goog.vec.Matrix3.createFromValues = function(v00, v10, v20, v01, v11, v21, v02, v12, v22) { 
  var newMatrix = goog.vec.Matrix3.create(); 
  goog.vec.Matrix3.setFromValues(newMatrix, v00, v10, v20, v01, v11, v21, v02, v12, v22); 
  return newMatrix; 
}; 
goog.vec.Matrix3.clone = goog.vec.Matrix3.createFromArray; 
goog.vec.Matrix3.getElement = function(mat, row, column) { 
  return mat[row + column * 3]; 
}; 
goog.vec.Matrix3.setElement = function(mat, row, column, value) { 
  mat[row + column * 3]= value; 
}; 
goog.vec.Matrix3.setFromValues = function(mat, v00, v10, v20, v01, v11, v21, v02, v12, v22) { 
  mat[0]= v00; 
  mat[1]= v10; 
  mat[2]= v20; 
  mat[3]= v01; 
  mat[4]= v11; 
  mat[5]= v21; 
  mat[6]= v02; 
  mat[7]= v12; 
  mat[8]= v22; 
}; 
goog.vec.Matrix3.setFromArray = function(mat, values) { 
  mat[0]= values[0]; 
  mat[1]= values[1]; 
  mat[2]= values[2]; 
  mat[3]= values[3]; 
  mat[4]= values[4]; 
  mat[5]= values[5]; 
  mat[6]= values[6]; 
  mat[7]= values[7]; 
  mat[8]= values[8]; 
}; 
goog.vec.Matrix3.setFromRowMajorArray = function(mat, values) { 
  mat[0]= values[0]; 
  mat[1]= values[3]; 
  mat[2]= values[6]; 
  mat[3]= values[1]; 
  mat[4]= values[4]; 
  mat[5]= values[7]; 
  mat[6]= values[2]; 
  mat[7]= values[5]; 
  mat[8]= values[8]; 
}; 
goog.vec.Matrix3.setDiagonalValues = function(mat, v00, v11, v22) { 
  mat[0]= v00; 
  mat[4]= v11; 
  mat[8]= v22; 
}; 
goog.vec.Matrix3.setDiagonal = function(mat, vec) { 
  mat[0]= vec[0]; 
  mat[4]= vec[1]; 
  mat[8]= vec[2]; 
}; 
goog.vec.Matrix3.setColumnValues = function(mat, column, v0, v1, v2) { 
  var i = column * 3; 
  mat[i]= v0; 
  mat[i + 1]= v1; 
  mat[i + 2]= v2; 
}; 
goog.vec.Matrix3.setColumn = function(mat, column, vec) { 
  var i = column * 3; 
  mat[i]= vec[0]; 
  mat[i + 1]= vec[1]; 
  mat[i + 2]= vec[2]; 
}; 
goog.vec.Matrix3.getColumn = function(mat, column, vec) { 
  var i = column * 3; 
  vec[0]= mat[i]; 
  vec[1]= mat[i + 1]; 
  vec[2]= mat[i + 2]; 
}; 
goog.vec.Matrix3.setColumns = function(mat, vec0, vec1, vec2) { 
  goog.vec.Matrix3.setColumn(mat, 0, vec0); 
  goog.vec.Matrix3.setColumn(mat, 1, vec1); 
  goog.vec.Matrix3.setColumn(mat, 2, vec2); 
}; 
goog.vec.Matrix3.getColumns = function(mat, vec0, vec1, vec2) { 
  goog.vec.Matrix3.getColumn(mat, 0, vec0); 
  goog.vec.Matrix3.getColumn(mat, 1, vec1); 
  goog.vec.Matrix3.getColumn(mat, 2, vec2); 
}; 
goog.vec.Matrix3.setRowValues = function(mat, row, v0, v1, v2) { 
  mat[row]= v0; 
  mat[row + 3]= v1; 
  mat[row + 6]= v2; 
}; 
goog.vec.Matrix3.setRow = function(mat, row, vec) { 
  mat[row]= vec[0]; 
  mat[row + 3]= vec[1]; 
  mat[row + 6]= vec[2]; 
}; 
goog.vec.Matrix3.getRow = function(mat, row, vec) { 
  vec[0]= mat[row]; 
  vec[1]= mat[row + 3]; 
  vec[2]= mat[row + 6]; 
}; 
goog.vec.Matrix3.setRows = function(mat, vec0, vec1, vec2) { 
  goog.vec.Matrix3.setRow(mat, 0, vec0); 
  goog.vec.Matrix3.setRow(mat, 1, vec1); 
  goog.vec.Matrix3.setRow(mat, 2, vec2); 
}; 
goog.vec.Matrix3.getRows = function(mat, vec0, vec1, vec2) { 
  goog.vec.Matrix3.getRow(mat, 0, vec0); 
  goog.vec.Matrix3.getRow(mat, 1, vec1); 
  goog.vec.Matrix3.getRow(mat, 2, vec2); 
}; 
goog.vec.Matrix3.setZero = function(mat) { 
  mat[0]= 0; 
  mat[1]= 0; 
  mat[2]= 0; 
  mat[3]= 0; 
  mat[4]= 0; 
  mat[5]= 0; 
  mat[6]= 0; 
  mat[7]= 0; 
  mat[8]= 0; 
}; 
goog.vec.Matrix3.setIdentity = function(mat) { 
  mat[0]= 1; 
  mat[1]= 0; 
  mat[2]= 0; 
  mat[3]= 0; 
  mat[4]= 1; 
  mat[5]= 0; 
  mat[6]= 0; 
  mat[7]= 0; 
  mat[8]= 1; 
}; 
goog.vec.Matrix3.add = function(mat0, mat1, resultMat) { 
  resultMat[0]= mat0[0]+ mat1[0]; 
  resultMat[1]= mat0[1]+ mat1[1]; 
  resultMat[2]= mat0[2]+ mat1[2]; 
  resultMat[3]= mat0[3]+ mat1[3]; 
  resultMat[4]= mat0[4]+ mat1[4]; 
  resultMat[5]= mat0[5]+ mat1[5]; 
  resultMat[6]= mat0[6]+ mat1[6]; 
  resultMat[7]= mat0[7]+ mat1[7]; 
  resultMat[8]= mat0[8]+ mat1[8]; 
  return resultMat; 
}; 
goog.vec.Matrix3.subtract = function(mat0, mat1, resultMat) { 
  resultMat[0]= mat0[0]- mat1[0]; 
  resultMat[1]= mat0[1]- mat1[1]; 
  resultMat[2]= mat0[2]- mat1[2]; 
  resultMat[3]= mat0[3]- mat1[3]; 
  resultMat[4]= mat0[4]- mat1[4]; 
  resultMat[5]= mat0[5]- mat1[5]; 
  resultMat[6]= mat0[6]- mat1[6]; 
  resultMat[7]= mat0[7]- mat1[7]; 
  resultMat[8]= mat0[8]- mat1[8]; 
  return resultMat; 
}; 
goog.vec.Matrix3.scale = function(mat0, scalar, resultMat) { 
  resultMat[0]= mat0[0]* scalar; 
  resultMat[1]= mat0[1]* scalar; 
  resultMat[2]= mat0[2]* scalar; 
  resultMat[3]= mat0[3]* scalar; 
  resultMat[4]= mat0[4]* scalar; 
  resultMat[5]= mat0[5]* scalar; 
  resultMat[6]= mat0[6]* scalar; 
  resultMat[7]= mat0[7]* scalar; 
  resultMat[8]= mat0[8]* scalar; 
  return resultMat; 
}; 
goog.vec.Matrix3.multMat = function(mat0, mat1, resultMat) { 
  var a00 = mat0[0], a10 = mat0[1], a20 = mat0[2]; 
  var a01 = mat0[3], a11 = mat0[4], a21 = mat0[5]; 
  var a02 = mat0[6], a12 = mat0[7], a22 = mat0[8]; 
  var b00 = mat1[0], b10 = mat1[1], b20 = mat1[2]; 
  var b01 = mat1[3], b11 = mat1[4], b21 = mat1[5]; 
  var b02 = mat1[6], b12 = mat1[7], b22 = mat1[8]; 
  resultMat[0]= a00 * b00 + a01 * b10 + a02 * b20; 
  resultMat[1]= a10 * b00 + a11 * b10 + a12 * b20; 
  resultMat[2]= a20 * b00 + a21 * b10 + a22 * b20; 
  resultMat[3]= a00 * b01 + a01 * b11 + a02 * b21; 
  resultMat[4]= a10 * b01 + a11 * b11 + a12 * b21; 
  resultMat[5]= a20 * b01 + a21 * b11 + a22 * b21; 
  resultMat[6]= a00 * b02 + a01 * b12 + a02 * b22; 
  resultMat[7]= a10 * b02 + a11 * b12 + a12 * b22; 
  resultMat[8]= a20 * b02 + a21 * b12 + a22 * b22; 
  return resultMat; 
}; 
goog.vec.Matrix3.transpose = function(mat, resultMat) { 
  if(resultMat == mat) { 
    var a10 = mat[1], a20 = mat[2], a21 = mat[5]; 
    resultMat[1]= mat[3]; 
    resultMat[2]= mat[6]; 
    resultMat[3]= a10; 
    resultMat[5]= mat[7]; 
    resultMat[6]= a20; 
    resultMat[7]= a21; 
  } else { 
    resultMat[0]= mat[0]; 
    resultMat[1]= mat[3]; 
    resultMat[2]= mat[6]; 
    resultMat[3]= mat[1]; 
    resultMat[4]= mat[4]; 
    resultMat[5]= mat[7]; 
    resultMat[6]= mat[2]; 
    resultMat[7]= mat[5]; 
    resultMat[8]= mat[8]; 
  } 
  return resultMat; 
}; 
goog.vec.Matrix3.invert = function(mat0, resultMat) { 
  var a00 = mat0[0], a10 = mat0[1], a20 = mat0[2]; 
  var a01 = mat0[3], a11 = mat0[4], a21 = mat0[5]; 
  var a02 = mat0[6], a12 = mat0[7], a22 = mat0[8]; 
  var t00 = a11 * a22 - a12 * a21; 
  var t10 = a12 * a20 - a10 * a22; 
  var t20 = a10 * a21 - a11 * a20; 
  var det = a00 * t00 + a01 * t10 + a02 * t20; 
  if(Math.abs(det) <= 1.0e-06) { 
    return false; 
  } 
  var idet = 1 / det; 
  resultMat[0]= t00 * idet; 
  resultMat[3]=(a02 * a21 - a01 * a22) * idet; 
  resultMat[6]=(a01 * a12 - a02 * a11) * idet; 
  resultMat[1]= t10 * idet; 
  resultMat[4]=(a00 * a22 - a02 * a20) * idet; 
  resultMat[7]=(a02 * a10 - a00 * a12) * idet; 
  resultMat[2]= t20 * idet; 
  resultMat[5]=(a01 * a20 - a00 * a21) * idet; 
  resultMat[8]=(a00 * a11 - a01 * a10) * idet; 
  return true; 
}; 
goog.vec.Matrix3.equals = function(mat0, mat1) { 
  return mat0.length == mat1.length && mat0[0]== mat1[0]&& mat0[1]== mat1[1]&& mat0[2]== mat1[2]&& mat0[3]== mat1[3]&& mat0[4]== mat1[4]&& mat0[5]== mat1[5]&& mat0[6]== mat1[6]&& mat0[7]== mat1[7]&& mat0[8]== mat1[8]; 
}; 
goog.vec.Matrix3.multVec3 = function(mat, vec, resultVec) { 
  var x = vec[0], y = vec[1], z = vec[2]; 
  resultVec[0]= x * mat[0]+ y * mat[3]+ z * mat[6]; 
  resultVec[1]= x * mat[1]+ y * mat[4]+ z * mat[7]; 
  resultVec[2]= x * mat[2]+ y * mat[5]+ z * mat[8]; 
  return resultVec; 
}; 
goog.vec.Matrix3.makeTranslate = function(mat, x, y) { 
  goog.vec.Matrix3.setIdentity(mat); 
  goog.vec.Matrix3.setColumnValues(mat, 2, x, y, 1); 
}; 
goog.vec.Matrix3.makeScale = function(mat, x, y, z) { 
  goog.vec.Matrix3.setIdentity(mat); 
  goog.vec.Matrix3.setDiagonalValues(mat, x, y, z); 
}; 
goog.vec.Matrix3.makeAxisAngleRotate = function(mat, angle, ax, ay, az) { 
  var c = Math.cos(angle); 
  var d = 1 - c; 
  var s = Math.sin(angle); 
  goog.vec.Matrix3.setFromValues(mat, ax * ax * d + c, ax * ay * d + az * s, ax * az * d - ay * s, ax * ay * d - az * s, ay * ay * d + c, ay * az * d + ax * s, ax * az * d + ay * s, ay * az * d - ax * s, az * az * d + c); 
}; 
