
goog.provide('goog.graphics.ext.coordinates'); 
goog.require('goog.string'); 
goog.graphics.ext.coordinates.specialCoordinateCache_ = { }; 
goog.graphics.ext.coordinates.isPercent_ = function(coord) { 
  return goog.string.contains(coord, '%'); 
}; 
goog.graphics.ext.coordinates.isPixels_ = function(coord) { 
  return goog.string.contains(coord, 'px'); 
}; 
goog.graphics.ext.coordinates.isSpecial = function(coord) { 
  var cache = goog.graphics.ext.coordinates.specialCoordinateCache_; 
  if(!(coord in cache)) { 
    cache[coord]= goog.isString(coord) &&(goog.graphics.ext.coordinates.isPercent_(coord) || goog.graphics.ext.coordinates.isPixels_(coord)); 
  } 
  return cache[coord]; 
}; 
goog.graphics.ext.coordinates.computeValue = function(coord, size, scale) { 
  var number = parseFloat(String(coord)); 
  if(goog.isString(coord)) { 
    if(goog.graphics.ext.coordinates.isPercent_(coord)) { 
      return number * size / 100; 
    } else if(goog.graphics.ext.coordinates.isPixels_(coord)) { 
      return number / scale; 
    } 
  } 
  return number; 
}; 
goog.graphics.ext.coordinates.getValue = function(coord, forMaximum, containerSize, scale, opt_cache) { 
  if(! goog.isNumber(coord)) { 
    var cacheString = opt_cache &&((forMaximum ? 'X': '') + coord); 
    if(opt_cache && cacheString in opt_cache) { 
      coord = opt_cache[cacheString]; 
    } else { 
      if(goog.graphics.ext.coordinates.isSpecial((coord))) { 
        coord = goog.graphics.ext.coordinates.computeValue(coord, containerSize, scale); 
      } else { 
        coord = parseFloat((coord)); 
      } 
      if(opt_cache) { 
        opt_cache[cacheString]= coord; 
      } 
    } 
  } 
  return coord; 
}; 
