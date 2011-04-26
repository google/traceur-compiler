
goog.provide('goog.fx.easing'); 
goog.fx.easing.easeIn = function(t) { 
  return t * t * t; 
}; 
goog.fx.easing.easeOut = function(t) { 
  return 1 - Math.pow(1 - t, 3); 
}; 
goog.fx.easing.inAndOut = function(t) { 
  return 3 * t * t - 2 * t * t * t; 
}; 
