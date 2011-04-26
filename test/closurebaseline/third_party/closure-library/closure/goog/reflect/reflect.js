
goog.provide('goog.reflect'); 
goog.reflect.object = function(type, object) { 
  return object; 
}; 
goog.reflect.sinkValue = new Function('a', 'return a'); 
goog.reflect.canAccessProperty = function(obj, prop) { 
  try { 
    goog.reflect.sinkValue(obj[prop]); 
    return true; 
  } catch(e) { } 
  return false; 
}; 
