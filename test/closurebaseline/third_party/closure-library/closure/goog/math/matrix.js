
goog.provide('goog.math.Matrix'); 
goog.require('goog.array'); 
goog.require('goog.math'); 
goog.require('goog.math.Size'); 
goog.math.Matrix = function(m, opt_n) { 
  if(m instanceof goog.math.Matrix) { 
    this.array_ = m.toArray(); 
  } else if(goog.isArrayLike(m) && goog.math.Matrix.isValidArray((m))) { 
    this.array_ = goog.array.clone((m)); 
  } else if(m instanceof goog.math.Size) { 
    this.array_ = goog.math.Matrix.createZeroPaddedArray_(m.height, m.width); 
  } else if(goog.isNumber(m) && goog.isNumber(opt_n) && m > 0 && opt_n > 0) { 
    this.array_ = goog.math.Matrix.createZeroPaddedArray_((m), opt_n); 
  } else { 
    throw Error('Invalid argument(s) for Matrix contructor'); 
  } 
  this.size_ = new goog.math.Size(this.array_[0].length, this.array_.length); 
}; 
goog.math.Matrix.createIdentityMatrix = function(n) { 
  var rv =[]; 
  for(var i = 0; i < n; i ++) { 
    rv[i]=[]; 
    for(var j = 0; j < n; j ++) { 
      rv[i][j]= i == j ? 1: 0; 
    } 
  } 
  return new goog.math.Matrix(rv); 
}; 
goog.math.Matrix.forEach = function(matrix, fn, opt_obj) { 
  for(var i = 0; i < matrix.getSize().height; i ++) { 
    for(var j = 0; j < matrix.getSize().width; j ++) { 
      fn.call(opt_obj, matrix.array_[i][j], i, j, matrix); 
    } 
  } 
}; 
goog.math.Matrix.isValidArray = function(arr) { 
  var len = 0; 
  for(var i = 0; i < arr.length; i ++) { 
    if(! goog.isArrayLike(arr[i]) || len > 0 && arr[i].length != len) { 
      return false; 
    } 
    for(var j = 0; j < arr[i].length; j ++) { 
      if(! goog.isNumber(arr[i][j])) { 
        return false; 
      } 
    } 
    if(len == 0) { 
      len = arr[i].length; 
    } 
  } 
  return len != 0; 
}; 
goog.math.Matrix.map = function(matrix, fn, opt_obj) { 
  var m = new goog.math.Matrix(matrix.getSize()); 
  goog.math.Matrix.forEach(matrix, function(value, i, j) { 
    m.array_[i][j]= fn.call(opt_obj, value, i, j, matrix); 
  }); 
  return m; 
}; 
goog.math.Matrix.createZeroPaddedArray_ = function(m, n) { 
  var rv =[]; 
  for(var i = 0; i < m; i ++) { 
    rv[i]=[]; 
    for(var j = 0; j < n; j ++) { 
      rv[i][j]= 0; 
    } 
  } 
  return rv; 
}; 
goog.math.Matrix.prototype.array_; 
goog.math.Matrix.prototype.size_; 
goog.math.Matrix.prototype.add = function(m) { 
  if(! goog.math.Size.equals(this.size_, m.getSize())) { 
    throw Error('Matrix summation is only supported on arrays of equal size'); 
  } 
  return goog.math.Matrix.map(this, function(val, i, j) { 
    return val + m.array_[i][j]; 
  }); 
}; 
goog.math.Matrix.prototype.appendColumns = function(m) { 
  if(this.size_.height != m.getSize().height) { 
    throw Error('The given matrix has height ' + m.size_.height + ', but ' + ' needs to have height ' + this.size_.height + '.'); 
  } 
  var result = new goog.math.Matrix(this.size_.height, this.size_.width + m.size_.width); 
  goog.math.Matrix.forEach(this, function(value, i, j) { 
    result.array_[i][j]= value; 
  }); 
  goog.math.Matrix.forEach(m, function(value, i, j) { 
    result.array_[i][this.size_.width + j]= value; 
  }, this); 
  return result; 
}; 
goog.math.Matrix.prototype.appendRows = function(m) { 
  if(this.size_.width != m.getSize().width) { 
    throw Error('The given matrix has width ' + m.size_.width + ', but ' + ' needs to have width ' + this.size_.width + '.'); 
  } 
  var result = new goog.math.Matrix(this.size_.height + m.size_.height, this.size_.width); 
  goog.math.Matrix.forEach(this, function(value, i, j) { 
    result.array_[i][j]= value; 
  }); 
  goog.math.Matrix.forEach(m, function(value, i, j) { 
    result.array_[this.size_.height + i][j]= value; 
  }, this); 
  return result; 
}; 
goog.math.Matrix.prototype.equals = function(m, opt_tolerance) { 
  if(this.size_.width != m.size_.width) { 
    return false; 
  } 
  if(this.size_.height != m.size_.height) { 
    return false; 
  } 
  var tolerance = opt_tolerance || 0; 
  for(var i = 0; i < this.size_.height; i ++) { 
    for(var j = 0; j < this.size_.width; j ++) { 
      if(! goog.math.nearlyEquals(this.array_[i][j], m.array_[i][j], tolerance)) { 
        return false; 
      } 
    } 
  } 
  return true; 
}; 
goog.math.Matrix.prototype.getDeterminant = function() { 
  if(! this.isSquare()) { 
    throw Error('A determinant can only be take on a square matrix'); 
  } 
  return this.getDeterminant_(); 
}; 
goog.math.Matrix.prototype.getInverse = function() { 
  if(! this.isSquare()) { 
    throw Error('An inverse can only be taken on a square matrix.'); 
  } 
  var identity = goog.math.Matrix.createIdentityMatrix(this.size_.height); 
  var mi = this.appendColumns(identity).getReducedRowEchelonForm(); 
  var i = mi.getSubmatrixByCoordinates_(0, 0, identity.size_.width - 1, identity.size_.height - 1); 
  if(! i.equals(identity)) { 
    return null; 
  } 
  return mi.getSubmatrixByCoordinates_(0, identity.size_.width); 
}; 
goog.math.Matrix.prototype.getReducedRowEchelonForm = function() { 
  var result = new goog.math.Matrix(this); 
  var col = 0; 
  for(var row = 0; row < result.size_.height; row ++) { 
    if(col >= result.size_.width) { 
      return result; 
    } 
    var i = row; 
    while(result.array_[i][col]== 0) { 
      i ++; 
      if(i == result.size_.height) { 
        i = row; 
        col ++; 
        if(col == result.size_.width) { 
          return result; 
        } 
      } 
    } 
    this.swapRows_(i, row); 
    var divisor = result.array_[row][col]; 
    for(var j = col; j < result.size_.width; j ++) { 
      result.array_[row][j]= result.array_[row][j]/ divisor; 
    } 
    for(i = 0; i < result.size_.height; i ++) { 
      if(i != row) { 
        var multiple = result.array_[i][col]; 
        for(var j = col; j < result.size_.width; j ++) { 
          result.array_[i][j]-= multiple * result.array_[row][j]; 
        } 
      } 
    } 
    col ++; 
  } 
  return result; 
}; 
goog.math.Matrix.prototype.getSize = function() { 
  return this.size_; 
}; 
goog.math.Matrix.prototype.getTranspose = function() { 
  var m = new goog.math.Matrix(this.size_.width, this.size_.height); 
  goog.math.Matrix.forEach(this, function(value, i, j) { 
    m.array_[j][i]= value; 
  }); 
  return m; 
}; 
goog.math.Matrix.prototype.getValueAt = function(i, j) { 
  if(! this.isInBounds_(i, j)) { 
    return null; 
  } 
  return this.array_[i][j]; 
}; 
goog.math.Matrix.prototype.isSquare = function() { 
  return this.size_.width == this.size_.height; 
}; 
goog.math.Matrix.prototype.setValueAt = function(i, j, value) { 
  if(! this.isInBounds_(i, j)) { 
    throw Error('Index out of bounds when setting matrix value, (' + i + ',' + j + ') in size (' + this.size_.height + ',' + this.size_.width + ')'); 
  } 
  this.array_[i][j]= value; 
}; 
goog.math.Matrix.prototype.multiply = function(m) { 
  if(m instanceof goog.math.Matrix) { 
    if(this.size_.width != m.getSize().height) { 
      throw Error('Invalid matrices for multiplication. Second matrix ' + 'should have the same number of rows as the first has columns.'); 
    } 
    return this.matrixMultiply_((m)); 
  } else if(goog.isNumber(m)) { 
    return this.scalarMultiply_((m)); 
  } else { 
    throw Error('A matrix can only be multiplied by' + ' a number or another matrix.'); 
  } 
}; 
goog.math.Matrix.prototype.subtract = function(m) { 
  if(! goog.math.Size.equals(this.size_, m.getSize())) { 
    throw Error('Matrix subtraction is only supported on arrays of equal size.'); 
  } 
  return goog.math.Matrix.map(this, function(val, i, j) { 
    return val - m.array_[i][j]; 
  }); 
}; 
goog.math.Matrix.prototype.toArray = function() { 
  return this.array_; 
}; 
if(goog.DEBUG) { 
  goog.math.Matrix.prototype.toString = function() { 
    var maxLen = 0; 
    goog.math.Matrix.forEach(this, function(val) { 
      var len = String(val).length; 
      if(len > maxLen) { 
        maxLen = len; 
      } 
    }); 
    var sb =[]; 
    goog.array.forEach(this.array_, function(row, x) { 
      sb.push('[ '); 
      goog.array.forEach(row, function(val, y) { 
        val = String(val); 
        sb.push(goog.string.repeat(' ', maxLen - val.length) + val + ' '); 
      }); 
      sb.push(']\n'); 
    }); 
    return sb.join(''); 
  }; 
} 
goog.math.Matrix.prototype.getCofactor_ = function(i, j) { 
  return(i + j % 2 == 0 ? 1: - 1) * this.getMinor_(i, j); 
}; 
goog.math.Matrix.prototype.getDeterminant_ = function() { 
  if(this.getSize().area() == 1) { 
    return this.array_[0][0]; 
  } 
  var determinant = 0; 
  for(var j = 0; j < this.size_.width; j ++) { 
    determinant +=(this.array_[0][j]* this.getCofactor_(0, j)); 
  } 
  return determinant; 
}; 
goog.math.Matrix.prototype.getMinor_ = function(i, j) { 
  return this.getSubmatrixByDeletion_(i, j).getDeterminant_(); 
}; 
goog.math.Matrix.prototype.getSubmatrixByCoordinates_ = function(i1, j1, opt_i2, opt_j2) { 
  var i2 = opt_i2 ? opt_i2: this.size_.height - 1; 
  var j2 = opt_j2 ? opt_j2: this.size_.width - 1; 
  var result = new goog.math.Matrix(i2 - i1 + 1, j2 - j1 + 1); 
  goog.math.Matrix.forEach(result, function(value, i, j) { 
    result.array_[i][j]= this.array_[i1 + i][j1 + j]; 
  }, this); 
  return result; 
}; 
goog.math.Matrix.prototype.getSubmatrixByDeletion_ = function(i, j) { 
  var m = new goog.math.Matrix(this.size_.width - 1, this.size_.height - 1); 
  goog.math.Matrix.forEach(m, function(value, x, y) { 
    m.setValueAt(x, y, this.array_[x >= i ? x + 1: x][y >= j ? y + 1: y]); 
  }, this); 
  return m; 
}; 
goog.math.Matrix.prototype.isInBounds_ = function(i, j) { 
  return i >= 0 && i < this.size_.height && j >= 0 && j < this.size_.width; 
}; 
goog.math.Matrix.prototype.matrixMultiply_ = function(m) { 
  var resultMatrix = new goog.math.Matrix(this.size_.height, m.getSize().width); 
  goog.math.Matrix.forEach(resultMatrix, function(val, x, y) { 
    var newVal = 0; 
    for(var i = 0; i < this.size_.width; i ++) { 
      newVal += this.getValueAt(x, i) * m.getValueAt(i, y); 
    } 
    resultMatrix.setValueAt(x, y, newVal); 
  }, this); 
  return resultMatrix; 
}; 
goog.math.Matrix.prototype.scalarMultiply_ = function(m) { 
  return goog.math.Matrix.map(this, function(val, x, y) { 
    return val * m; 
  }); 
}; 
goog.math.Matrix.prototype.swapRows_ = function(i1, i2) { 
  var tmp = this.array_[i1]; 
  this.array_[i1]= this.array_[i2]; 
  this.array_[i2]= tmp; 
}; 
