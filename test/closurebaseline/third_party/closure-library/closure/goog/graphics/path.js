
goog.provide('goog.graphics.Path'); 
goog.provide('goog.graphics.Path.Segment'); 
goog.require('goog.array'); 
goog.require('goog.math'); 
goog.graphics.Path = function() { 
  this.segments_ =[]; 
  this.count_ =[]; 
  this.arguments_ =[]; 
}; 
goog.graphics.Path.prototype.closePoint_ = null; 
goog.graphics.Path.prototype.currentPoint_ = null; 
goog.graphics.Path.prototype.simple_ = true; 
goog.graphics.Path.Segment = { 
  MOVETO: 0, 
  LINETO: 1, 
  CURVETO: 2, 
  ARCTO: 3, 
  CLOSE: 4 
}; 
goog.graphics.Path.segmentArgCounts_ =(function() { 
  var counts =[]; 
  counts[goog.graphics.Path.Segment.MOVETO]= 2; 
  counts[goog.graphics.Path.Segment.LINETO]= 2; 
  counts[goog.graphics.Path.Segment.CURVETO]= 6; 
  counts[goog.graphics.Path.Segment.ARCTO]= 6; 
  counts[goog.graphics.Path.Segment.CLOSE]= 0; 
  return counts; 
})(); 
goog.graphics.Path.getSegmentCount = function(segment) { 
  return goog.graphics.Path.segmentArgCounts_[segment]; 
}; 
goog.graphics.Path.prototype.appendPath = function(path) { 
  if(path.currentPoint_) { 
    Array.prototype.push.apply(this.segments_, path.segments_); 
    Array.prototype.push.apply(this.count_, path.count_); 
    Array.prototype.push.apply(this.arguments_, path.arguments_); 
    this.currentPoint_ = path.currentPoint_.concat(); 
    this.closePoint_ = path.closePoint_.concat(); 
    this.simple_ = this.simple_ && path.simple_; 
  } 
  return this; 
}; 
goog.graphics.Path.prototype.clear = function() { 
  this.segments_.length = 0; 
  this.count_.length = 0; 
  this.arguments_.length = 0; 
  delete this.closePoint_; 
  delete this.currentPoint_; 
  delete this.simple_; 
  return this; 
}; 
goog.graphics.Path.prototype.moveTo = function(x, y) { 
  if(goog.array.peek(this.segments_) == goog.graphics.Path.Segment.MOVETO) { 
    this.arguments_.length -= 2; 
  } else { 
    this.segments_.push(goog.graphics.Path.Segment.MOVETO); 
    this.count_.push(1); 
  } 
  this.arguments_.push(x, y); 
  this.currentPoint_ = this.closePoint_ =[x, y]; 
  return this; 
}; 
goog.graphics.Path.prototype.lineTo = function(var_args) { 
  var lastSegment = goog.array.peek(this.segments_); 
  if(lastSegment == null) { 
    throw Error('Path cannot start with lineTo'); 
  } 
  if(lastSegment != goog.graphics.Path.Segment.LINETO) { 
    this.segments_.push(goog.graphics.Path.Segment.LINETO); 
    this.count_.push(0); 
  } 
  for(var i = 0; i < arguments.length; i += 2) { 
    var x = arguments[i]; 
    var y = arguments[i + 1]; 
    this.arguments_.push(x, y); 
  } 
  this.count_[this.count_.length - 1]+= i / 2; 
  this.currentPoint_ =[x, y]; 
  return this; 
}; 
goog.graphics.Path.prototype.curveTo = function(var_args) { 
  var lastSegment = goog.array.peek(this.segments_); 
  if(lastSegment == null) { 
    throw Error('Path cannot start with curve'); 
  } 
  if(lastSegment != goog.graphics.Path.Segment.CURVETO) { 
    this.segments_.push(goog.graphics.Path.Segment.CURVETO); 
    this.count_.push(0); 
  } 
  for(var i = 0; i < arguments.length; i += 6) { 
    var x = arguments[i + 4]; 
    var y = arguments[i + 5]; 
    this.arguments_.push(arguments[i], arguments[i + 1], arguments[i + 2], arguments[i + 3], x, y); 
  } 
  this.count_[this.count_.length - 1]+= i / 6; 
  this.currentPoint_ =[x, y]; 
  return this; 
}; 
goog.graphics.Path.prototype.close = function() { 
  var lastSegment = goog.array.peek(this.segments_); 
  if(lastSegment == null) { 
    throw Error('Path cannot start with close'); 
  } 
  if(lastSegment != goog.graphics.Path.Segment.CLOSE) { 
    this.segments_.push(goog.graphics.Path.Segment.CLOSE); 
    this.count_.push(1); 
    this.currentPoint_ = this.closePoint_; 
  } 
  return this; 
}; 
goog.graphics.Path.prototype.arc = function(cx, cy, rx, ry, fromAngle, extent, connect) { 
  var startX = cx + goog.math.angleDx(fromAngle, rx); 
  var startY = cy + goog.math.angleDy(fromAngle, ry); 
  if(connect) { 
    if(! this.currentPoint_ || startX != this.currentPoint_[0]|| startY != this.currentPoint_[1]) { 
      this.lineTo(startX, startY); 
    } 
  } else { 
    this.moveTo(startX, startY); 
  } 
  return this.arcTo(rx, ry, fromAngle, extent); 
}; 
goog.graphics.Path.prototype.arcTo = function(rx, ry, fromAngle, extent) { 
  var cx = this.currentPoint_[0]- goog.math.angleDx(fromAngle, rx); 
  var cy = this.currentPoint_[1]- goog.math.angleDy(fromAngle, ry); 
  var ex = cx + goog.math.angleDx(fromAngle + extent, rx); 
  var ey = cy + goog.math.angleDy(fromAngle + extent, ry); 
  this.segments_.push(goog.graphics.Path.Segment.ARCTO); 
  this.count_.push(1); 
  this.arguments_.push(rx, ry, fromAngle, extent, ex, ey); 
  this.simple_ = false; 
  this.currentPoint_ =[ex, ey]; 
  return this; 
}; 
goog.graphics.Path.prototype.arcToAsCurves = function(rx, ry, fromAngle, extent) { 
  var cx = this.currentPoint_[0]- goog.math.angleDx(fromAngle, rx); 
  var cy = this.currentPoint_[1]- goog.math.angleDy(fromAngle, ry); 
  var extentRad = goog.math.toRadians(extent); 
  var arcSegs = Math.ceil(Math.abs(extentRad) / Math.PI * 2); 
  var inc = extentRad / arcSegs; 
  var angle = goog.math.toRadians(fromAngle); 
  for(var j = 0; j < arcSegs; j ++) { 
    var relX = Math.cos(angle); 
    var relY = Math.sin(angle); 
    var z = 4 / 3 * Math.sin(inc / 2) /(1 + Math.cos(inc / 2)); 
    var c0 = cx +(relX - z * relY) * rx; 
    var c1 = cy +(relY + z * relX) * ry; 
    angle += inc; 
    relX = Math.cos(angle); 
    relY = Math.sin(angle); 
    this.curveTo(c0, c1, cx +(relX + z * relY) * rx, cy +(relY - z * relX) * ry, cx + relX * rx, cy + relY * ry); 
  } 
  return this; 
}; 
goog.graphics.Path.prototype.forEachSegment = function(callback) { 
  var points = this.arguments_; 
  var index = 0; 
  for(var i = 0, length = this.segments_.length; i < length; i ++) { 
    var seg = this.segments_[i]; 
    var n = goog.graphics.Path.segmentArgCounts_[seg]* this.count_[i]; 
    callback(seg, points.slice(index, index + n)); 
    index += n; 
  } 
}; 
goog.graphics.Path.prototype.getCurrentPoint = function() { 
  return this.currentPoint_ && this.currentPoint_.concat(); 
}; 
goog.graphics.Path.prototype.clone = function() { 
  var path = new this.constructor(); 
  path.segments_ = this.segments_.concat(); 
  path.count_ = this.count_.concat(); 
  path.arguments_ = this.arguments_.concat(); 
  path.closePoint_ = this.closePoint_ && this.closePoint_.concat(); 
  path.currentPoint_ = this.currentPoint_ && this.currentPoint_.concat(); 
  path.simple_ = this.simple_; 
  return path; 
}; 
goog.graphics.Path.prototype.isSimple = function() { 
  return this.simple_; 
}; 
goog.graphics.Path.simplifySegmentMap_ =(function() { 
  var map = { }; 
  map[goog.graphics.Path.Segment.MOVETO]= goog.graphics.Path.prototype.moveTo; 
  map[goog.graphics.Path.Segment.LINETO]= goog.graphics.Path.prototype.lineTo; 
  map[goog.graphics.Path.Segment.CLOSE]= goog.graphics.Path.prototype.close; 
  map[goog.graphics.Path.Segment.CURVETO]= goog.graphics.Path.prototype.curveTo; 
  map[goog.graphics.Path.Segment.ARCTO]= goog.graphics.Path.prototype.arcToAsCurves; 
  return map; 
})(); 
goog.graphics.Path.createSimplifiedPath = function(src) { 
  if(src.isSimple()) { 
    return src.clone(); 
  } 
  var path = new goog.graphics.Path(); 
  src.forEachSegment(function(segment, args) { 
    goog.graphics.Path.simplifySegmentMap_[segment].apply(path, args); 
  }); 
  return path; 
}; 
goog.graphics.Path.prototype.createTransformedPath = function(tx) { 
  var path = goog.graphics.Path.createSimplifiedPath(this); 
  path.transform(tx); 
  return path; 
}; 
goog.graphics.Path.prototype.transform = function(tx) { 
  if(! this.isSimple()) { 
    throw Error('Non-simple path'); 
  } 
  tx.transform(this.arguments_, 0, this.arguments_, 0, this.arguments_.length / 2); 
  if(this.closePoint_) { 
    tx.transform(this.closePoint_, 0, this.closePoint_, 0, 1); 
  } 
  if(this.currentPoint_ && this.closePoint_ != this.currentPoint_) { 
    tx.transform(this.currentPoint_, 0, this.currentPoint_, 0, 1); 
  } 
  return this; 
}; 
goog.graphics.Path.prototype.isEmpty = function() { 
  return this.segments_.length == 0; 
}; 
