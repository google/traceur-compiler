
goog.provide('goog.object'); 
goog.object.forEach = function(obj, f, opt_obj) { 
  for(var key in obj) { 
    f.call(opt_obj, obj[key], key, obj); 
  } 
}; 
goog.object.filter = function(obj, f, opt_obj) { 
  var res = { }; 
  for(var key in obj) { 
    if(f.call(opt_obj, obj[key], key, obj)) { 
      res[key]= obj[key]; 
    } 
  } 
  return res; 
}; 
goog.object.map = function(obj, f, opt_obj) { 
  var res = { }; 
  for(var key in obj) { 
    res[key]= f.call(opt_obj, obj[key], key, obj); 
  } 
  return res; 
}; 
goog.object.some = function(obj, f, opt_obj) { 
  for(var key in obj) { 
    if(f.call(opt_obj, obj[key], key, obj)) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.object.every = function(obj, f, opt_obj) { 
  for(var key in obj) { 
    if(! f.call(opt_obj, obj[key], key, obj)) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.object.getCount = function(obj) { 
  var rv = 0; 
  for(var key in obj) { 
    rv ++; 
  } 
  return rv; 
}; 
goog.object.getAnyKey = function(obj) { 
  for(var key in obj) { 
    return key; 
  } 
}; 
goog.object.getAnyValue = function(obj) { 
  for(var key in obj) { 
    return obj[key]; 
  } 
}; 
goog.object.contains = function(obj, val) { 
  return goog.object.containsValue(obj, val); 
}; 
goog.object.getValues = function(obj) { 
  var res =[]; 
  var i = 0; 
  for(var key in obj) { 
    res[i ++]= obj[key]; 
  } 
  return res; 
}; 
goog.object.getKeys = function(obj) { 
  var res =[]; 
  var i = 0; 
  for(var key in obj) { 
    res[i ++]= key; 
  } 
  return res; 
}; 
goog.object.getValueByKeys = function(obj, var_args) { 
  var isArrayLike = goog.isArrayLike(var_args); 
  var keys = isArrayLike ? var_args: arguments; 
  for(var i = isArrayLike ? 0: 1; i < keys.length; i ++) { 
    obj = obj[keys[i]]; 
    if(! goog.isDef(obj)) { 
      break; 
    } 
  } 
  return obj; 
}; 
goog.object.containsKey = function(obj, key) { 
  return key in obj; 
}; 
goog.object.containsValue = function(obj, val) { 
  for(var key in obj) { 
    if(obj[key]== val) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.object.findKey = function(obj, f, opt_this) { 
  for(var key in obj) { 
    if(f.call(opt_this, obj[key], key, obj)) { 
      return key; 
    } 
  } 
  return undefined; 
}; 
goog.object.findValue = function(obj, f, opt_this) { 
  var key = goog.object.findKey(obj, f, opt_this); 
  return key && obj[key]; 
}; 
goog.object.isEmpty = function(obj) { 
  for(var key in obj) { 
    return false; 
  } 
  return true; 
}; 
goog.object.clear = function(obj) { 
  for(var i in obj) { 
    delete obj[i]; 
  } 
}; 
goog.object.remove = function(obj, key) { 
  var rv; 
  if((rv = key in obj)) { 
    delete obj[key]; 
  } 
  return rv; 
}; 
goog.object.add = function(obj, key, val) { 
  if(key in obj) { 
    throw Error('The object already contains the key "' + key + '"'); 
  } 
  goog.object.set(obj, key, val); 
}; 
goog.object.get = function(obj, key, opt_val) { 
  if(key in obj) { 
    return obj[key]; 
  } 
  return opt_val; 
}; 
goog.object.set = function(obj, key, value) { 
  obj[key]= value; 
}; 
goog.object.setIfUndefined = function(obj, key, value) { 
  return key in obj ? obj[key]:(obj[key]= value); 
}; 
goog.object.clone = function(obj) { 
  var res = { }; 
  for(var key in obj) { 
    res[key]= obj[key]; 
  } 
  return res; 
}; 
goog.object.unsafeClone = function(obj) { 
  var type = goog.typeOf(obj); 
  if(type == 'object' || type == 'array') { 
    if(obj.clone) { 
      return obj.clone(); 
    } 
    var clone = type == 'array' ?[]: { }; 
    for(var key in obj) { 
      clone[key]= goog.object.unsafeClone(obj[key]); 
    } 
    return clone; 
  } 
  return obj; 
}; 
goog.object.transpose = function(obj) { 
  var transposed = { }; 
  for(var key in obj) { 
    transposed[obj[key]]= key; 
  } 
  return transposed; 
}; 
goog.object.PROTOTYPE_FIELDS_ =['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf']; 
goog.object.extend = function(target, var_args) { 
  var key, source; 
  for(var i = 1; i < arguments.length; i ++) { 
    source = arguments[i]; 
    for(key in source) { 
      target[key]= source[key]; 
    } 
    for(var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j ++) { 
      key = goog.object.PROTOTYPE_FIELDS_[j]; 
      if(Object.prototype.hasOwnProperty.call(source, key)) { 
        target[key]= source[key]; 
      } 
    } 
  } 
}; 
goog.object.create = function(var_args) { 
  var argLength = arguments.length; 
  if(argLength == 1 && goog.isArray(arguments[0])) { 
    return goog.object.create.apply(null, arguments[0]); 
  } 
  if(argLength % 2) { 
    throw Error('Uneven number of arguments'); 
  } 
  var rv = { }; 
  for(var i = 0; i < argLength; i += 2) { 
    rv[arguments[i]]= arguments[i + 1]; 
  } 
  return rv; 
}; 
goog.object.createSet = function(var_args) { 
  var argLength = arguments.length; 
  if(argLength == 1 && goog.isArray(arguments[0])) { 
    return goog.object.createSet.apply(null, arguments[0]); 
  } 
  var rv = { }; 
  for(var i = 0; i < argLength; i ++) { 
    rv[arguments[i]]= true; 
  } 
  return rv; 
}; 
