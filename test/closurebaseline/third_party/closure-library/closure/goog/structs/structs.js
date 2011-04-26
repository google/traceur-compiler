
goog.provide('goog.structs'); 
goog.require('goog.array'); 
goog.require('goog.object'); 
goog.structs.getCount = function(col) { 
  if(typeof col.getCount == 'function') { 
    return col.getCount(); 
  } 
  if(goog.isArrayLike(col) || goog.isString(col)) { 
    return col.length; 
  } 
  return goog.object.getCount(col); 
}; 
goog.structs.getValues = function(col) { 
  if(typeof col.getValues == 'function') { 
    return col.getValues(); 
  } 
  if(goog.isString(col)) { 
    return col.split(''); 
  } 
  if(goog.isArrayLike(col)) { 
    var rv =[]; 
    var l = col.length; 
    for(var i = 0; i < l; i ++) { 
      rv.push(col[i]); 
    } 
    return rv; 
  } 
  return goog.object.getValues(col); 
}; 
goog.structs.getKeys = function(col) { 
  if(typeof col.getKeys == 'function') { 
    return col.getKeys(); 
  } 
  if(typeof col.getValues == 'function') { 
    return undefined; 
  } 
  if(goog.isArrayLike(col) || goog.isString(col)) { 
    var rv =[]; 
    var l = col.length; 
    for(var i = 0; i < l; i ++) { 
      rv.push(i); 
    } 
    return rv; 
  } 
  return goog.object.getKeys(col); 
}; 
goog.structs.contains = function(col, val) { 
  if(typeof col.contains == 'function') { 
    return col.contains(val); 
  } 
  if(typeof col.containsValue == 'function') { 
    return col.containsValue(val); 
  } 
  if(goog.isArrayLike(col) || goog.isString(col)) { 
    return goog.array.contains((col), val); 
  } 
  return goog.object.containsValue(col, val); 
}; 
goog.structs.isEmpty = function(col) { 
  if(typeof col.isEmpty == 'function') { 
    return col.isEmpty(); 
  } 
  if(goog.isArrayLike(col) || goog.isString(col)) { 
    return goog.array.isEmpty((col)); 
  } 
  return goog.object.isEmpty(col); 
}; 
goog.structs.clear = function(col) { 
  if(typeof col.clear == 'function') { 
    col.clear(); 
  } else if(goog.isArrayLike(col)) { 
    goog.array.clear((col)); 
  } else { 
    goog.object.clear(col); 
  } 
}; 
goog.structs.forEach = function(col, f, opt_obj) { 
  if(typeof col.forEach == 'function') { 
    col.forEach(f, opt_obj); 
  } else if(goog.isArrayLike(col) || goog.isString(col)) { 
    goog.array.forEach((col), f, opt_obj); 
  } else { 
    var keys = goog.structs.getKeys(col); 
    var values = goog.structs.getValues(col); 
    var l = values.length; 
    for(var i = 0; i < l; i ++) { 
      f.call(opt_obj, values[i], keys && keys[i], col); 
    } 
  } 
}; 
goog.structs.filter = function(col, f, opt_obj) { 
  if(typeof col.filter == 'function') { 
    return col.filter(f, opt_obj); 
  } 
  if(goog.isArrayLike(col) || goog.isString(col)) { 
    return goog.array.filter((col), f, opt_obj); 
  } 
  var rv; 
  var keys = goog.structs.getKeys(col); 
  var values = goog.structs.getValues(col); 
  var l = values.length; 
  if(keys) { 
    rv = { }; 
    for(var i = 0; i < l; i ++) { 
      if(f.call(opt_obj, values[i], keys[i], col)) { 
        rv[keys[i]]= values[i]; 
      } 
    } 
  } else { 
    rv =[]; 
    for(var i = 0; i < l; i ++) { 
      if(f.call(opt_obj, values[i], undefined, col)) { 
        rv.push(values[i]); 
      } 
    } 
  } 
  return rv; 
}; 
goog.structs.map = function(col, f, opt_obj) { 
  if(typeof col.map == 'function') { 
    return col.map(f, opt_obj); 
  } 
  if(goog.isArrayLike(col) || goog.isString(col)) { 
    return goog.array.map((col), f, opt_obj); 
  } 
  var rv; 
  var keys = goog.structs.getKeys(col); 
  var values = goog.structs.getValues(col); 
  var l = values.length; 
  if(keys) { 
    rv = { }; 
    for(var i = 0; i < l; i ++) { 
      rv[keys[i]]= f.call(opt_obj, values[i], keys[i], col); 
    } 
  } else { 
    rv =[]; 
    for(var i = 0; i < l; i ++) { 
      rv[i]= f.call(opt_obj, values[i], undefined, col); 
    } 
  } 
  return rv; 
}; 
goog.structs.some = function(col, f, opt_obj) { 
  if(typeof col.some == 'function') { 
    return col.some(f, opt_obj); 
  } 
  if(goog.isArrayLike(col) || goog.isString(col)) { 
    return goog.array.some((col), f, opt_obj); 
  } 
  var keys = goog.structs.getKeys(col); 
  var values = goog.structs.getValues(col); 
  var l = values.length; 
  for(var i = 0; i < l; i ++) { 
    if(f.call(opt_obj, values[i], keys && keys[i], col)) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.structs.every = function(col, f, opt_obj) { 
  if(typeof col.every == 'function') { 
    return col.every(f, opt_obj); 
  } 
  if(goog.isArrayLike(col) || goog.isString(col)) { 
    return goog.array.every((col), f, opt_obj); 
  } 
  var keys = goog.structs.getKeys(col); 
  var values = goog.structs.getValues(col); 
  var l = values.length; 
  for(var i = 0; i < l; i ++) { 
    if(! f.call(opt_obj, values[i], keys && keys[i], col)) { 
      return false; 
    } 
  } 
  return true; 
}; 
