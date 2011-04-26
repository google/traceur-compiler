
goog.provide('goog.graphics.paths'); 
goog.require('goog.graphics.Path'); 
goog.require('goog.math.Coordinate'); 
goog.graphics.paths.createRegularNGon = function(center, vertex, n) { 
  var path = new goog.graphics.Path(); 
  path.moveTo(vertex.x, vertex.y); 
  var startAngle = Math.atan2(vertex.y - center.y, vertex.x - center.x); 
  var radius = goog.math.Coordinate.distance(center, vertex); 
  for(var i = 1; i < n; i ++) { 
    var angle = startAngle + 2 * Math.PI *(i / n); 
    path.lineTo(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle)); 
  } 
  path.close(); 
  return path; 
}; 
goog.graphics.paths.createArrow = function(a, b, aHead, bHead) { 
  var path = new goog.graphics.Path(); 
  path.moveTo(a.x, a.y); 
  path.lineTo(b.x, b.y); 
  var angle = Math.atan2(b.y - a.y, b.x - a.x); 
  if(aHead) { 
    path.appendPath(goog.graphics.paths.createRegularNGon(new goog.math.Coordinate(a.x + aHead * Math.cos(angle), a.y + aHead * Math.sin(angle)), a, 3)); 
  } 
  if(bHead) { 
    path.appendPath(goog.graphics.paths.createRegularNGon(new goog.math.Coordinate(b.x + bHead * Math.cos(angle + Math.PI), b.y + bHead * Math.sin(angle + Math.PI)), b, 3)); 
  } 
  return path; 
}; 
