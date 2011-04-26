
goog.provide('goog.debug.reflect'); 
goog.debug.reflect.typeMap_ = null; 
goog.debug.reflect.constructors_ = null; 
goog.debug.reflect.toString_ = Object.prototype.toString; 
goog.debug.reflect.registerType_ = function(name, ctor) { 
  goog.debug.reflect.constructors_.push(ctor); 
  goog.debug.reflect.typeMap_[goog.getUid(ctor)]= name; 
}; 
goog.debug.reflect.init_ = function() { 
  if(goog.debug.reflect.typeMap_) { 
    return; 
  } 
  goog.debug.reflect.typeMap_ = { }; 
  goog.debug.reflect.constructors_ =[]; 
  var implicitNs = goog.getObjectByName('goog.implicitNamespaces_') || { }; 
  for(var ns in implicitNs) { 
    if(implicitNs.hasOwnProperty(ns)) { 
      var nsObj = goog.getObjectByName(ns); 
      for(var name in nsObj) { 
        if(nsObj.hasOwnProperty(name) && goog.isFunction(nsObj[name])) { 
          goog.debug.reflect.registerType_(ns + '.' + name, nsObj[name]); 
        } 
      } 
    } 
  } 
  goog.debug.reflect.registerType_('Array', Array); 
  goog.debug.reflect.registerType_('Boolean', Boolean); 
  goog.debug.reflect.registerType_('Date', Date); 
  goog.debug.reflect.registerType_('Error', Error); 
  goog.debug.reflect.registerType_('Function', Function); 
  goog.debug.reflect.registerType_('Number', Number); 
  goog.debug.reflect.registerType_('Object', Object); 
  goog.debug.reflect.registerType_('String', String); 
  goog.debug.reflect.registerType_('RegExp', goog.global['RegExp']); 
}; 
goog.debug.reflect.typeOf = function(obj) { 
  if(! obj || goog.isNumber(obj) || goog.isString(obj) || goog.isBoolean(obj)) { 
    return goog.typeOf(obj); 
  } 
  goog.debug.reflect.init_(); 
  if(obj.constructor) { 
    var type = goog.debug.reflect.typeMap_[goog.getUid(obj.constructor)]; 
    if(type) { 
      return type; 
    } 
  } 
  var isActiveXObject = goog.global.ActiveXObject && obj instanceof ActiveXObject; 
  var typeString = isActiveXObject ? String(obj): goog.debug.reflect.toString_.call((obj)); 
  var match = typeString.match(/^\[object (\w+)\]$/); 
  if(match) { 
    var name = match[1]; 
    var ctor = goog.global[name]; 
    try { 
      if(obj instanceof ctor) { 
        return name; 
      } 
    } catch(e) { } 
  } 
  return isActiveXObject ? 'ActiveXObject': 'Object'; 
}; 
