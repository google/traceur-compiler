
goog.provide('goog.gears'); 
goog.require('goog.string'); 
goog.gears.getFactory = function() { 
  if(goog.gears.factory_ != undefined) { 
    return goog.gears.factory_; 
  } 
  var factory = goog.getObjectByName('google.gears.factory'); 
  if(factory) { 
    return goog.gears.factory_ = factory; 
  } 
  try { 
    var gearsFactory =(goog.getObjectByName('GearsFactory')); 
    return goog.gears.factory_ = new gearsFactory; 
  } catch(ex) { } 
  try { 
    factory = new ActiveXObject('Gears.Factory'); 
    var buildInfo = factory.getBuildInfo(); 
    if(buildInfo.indexOf('ie_mobile') != - 1) { 
      factory.privateSetGlobalObject(goog.global); 
    } 
    return goog.gears.factory_ = factory; 
  } catch(ex) { } 
  return goog.gears.factory_ = goog.gears.tryGearsObject_(); 
}; 
goog.gears.tryGearsObject_ = function() { 
  var win = goog.getObjectByName('window'); 
  if(win && win['navigator']['mimeTypes']['application/x-googlegears']) { 
    try { 
      var doc = win['document']; 
      var factory = doc['getElementById']('gears-factory'); 
      if(! factory) { 
        factory = doc['createElement']('object'); 
        factory['style']['display']= 'none'; 
        factory['width']= '0'; 
        factory['height']= '0'; 
        factory['type']= 'application/x-googlegears'; 
        factory['id']= 'gears-factory'; 
        doc['documentElement']['appendChild'](factory); 
      } 
      if(typeof factory.create != 'undefined') { 
        return factory; 
      } 
    } catch(ex) { } 
  } 
  return null; 
}; 
goog.gears.factory_ = undefined; 
goog.gears.hasFactory = function() { 
  if(goog.gears.hasFactory_ != undefined) return goog.gears.hasFactory_; 
  var factory = goog.getObjectByName('google.gears.factory'); 
  if(factory || goog.getObjectByName('GearsFactory')) { 
    return goog.gears.hasFactory_ = true; 
  } 
  if(typeof ActiveXObject != 'undefined') { 
    try { 
      new ActiveXObject('Gears.Factory'); 
      return goog.gears.hasFactory_ = true; 
    } catch(ex) { 
      return goog.gears.hasFactory_ = false; 
    } 
  } 
  var mimeTypes = goog.getObjectByName('navigator.mimeTypes'); 
  if(mimeTypes && mimeTypes['application/x-googlegears']) { 
    factory = goog.gears.tryGearsObject_(); 
    if(factory) { 
      goog.gears.factory_ = factory; 
      return goog.gears.hasFactory_ = true; 
    } 
  } 
  return goog.gears.hasFactory_ = false; 
}; 
goog.gears.hasFactory_ = undefined; 
goog.gears.MAX_FILE_NAME_LENGTH_ = 64; 
goog.gears.MAX_FILE_NAME_PREFIX_LENGTH_ = goog.gears.MAX_FILE_NAME_LENGTH_ - 10; 
goog.gears.makeSafeFileName = function(originalFileName) { 
  if(! originalFileName) { 
    throw Error('file name empty'); 
  } 
  originalFileName = String(originalFileName); 
  var sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9\.\-@_]/g, ''); 
  if(! sanitizedFileName) { 
    throw Error('file name invalid: ' + originalFileName); 
  } 
  if(sanitizedFileName.length <= goog.gears.MAX_FILE_NAME_LENGTH_) { 
    return sanitizedFileName; 
  } 
  var prefix = sanitizedFileName.substring(0, goog.gears.MAX_FILE_NAME_PREFIX_LENGTH_); 
  return prefix + String(goog.string.hashCode(originalFileName)); 
}; 
