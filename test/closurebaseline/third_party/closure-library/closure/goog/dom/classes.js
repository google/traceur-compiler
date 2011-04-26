
goog.provide('goog.dom.classes'); 
goog.require('goog.array'); 
goog.dom.classes.set = function(element, className) { 
  element.className = className; 
}; 
goog.dom.classes.get = function(element) { 
  var className = element.className; 
  return className && typeof className.split == 'function' ? className.split(/\s+/):[]; 
}; 
goog.dom.classes.add = function(element, var_args) { 
  var classes = goog.dom.classes.get(element); 
  var args = goog.array.slice(arguments, 1); 
  var b = goog.dom.classes.add_(classes, args); 
  element.className = classes.join(' '); 
  return b; 
}; 
goog.dom.classes.remove = function(element, var_args) { 
  var classes = goog.dom.classes.get(element); 
  var args = goog.array.slice(arguments, 1); 
  var b = goog.dom.classes.remove_(classes, args); 
  element.className = classes.join(' '); 
  return b; 
}; 
goog.dom.classes.add_ = function(classes, args) { 
  var rv = 0; 
  for(var i = 0; i < args.length; i ++) { 
    if(! goog.array.contains(classes, args[i])) { 
      classes.push(args[i]); 
      rv ++; 
    } 
  } 
  return rv == args.length; 
}; 
goog.dom.classes.remove_ = function(classes, args) { 
  var rv = 0; 
  for(var i = 0; i < classes.length; i ++) { 
    if(goog.array.contains(args, classes[i])) { 
      goog.array.splice(classes, i --, 1); 
      rv ++; 
    } 
  } 
  return rv == args.length; 
}; 
goog.dom.classes.swap = function(element, fromClass, toClass) { 
  var classes = goog.dom.classes.get(element); 
  var removed = false; 
  for(var i = 0; i < classes.length; i ++) { 
    if(classes[i]== fromClass) { 
      goog.array.splice(classes, i --, 1); 
      removed = true; 
    } 
  } 
  if(removed) { 
    classes.push(toClass); 
    element.className = classes.join(' '); 
  } 
  return removed; 
}; 
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) { 
  var classes = goog.dom.classes.get(element); 
  if(goog.isString(classesToRemove)) { 
    goog.array.remove(classes, classesToRemove); 
  } else if(goog.isArray(classesToRemove)) { 
    goog.dom.classes.remove_(classes, classesToRemove); 
  } 
  if(goog.isString(classesToAdd) && ! goog.array.contains(classes, classesToAdd)) { 
    classes.push(classesToAdd); 
  } else if(goog.isArray(classesToAdd)) { 
    goog.dom.classes.add_(classes, classesToAdd); 
  } 
  element.className = classes.join(' '); 
}; 
goog.dom.classes.has = function(element, className) { 
  return goog.array.contains(goog.dom.classes.get(element), className); 
}; 
goog.dom.classes.enable = function(element, className, enabled) { 
  if(enabled) { 
    goog.dom.classes.add(element, className); 
  } else { 
    goog.dom.classes.remove(element, className); 
  } 
}; 
goog.dom.classes.toggle = function(element, className) { 
  var add = ! goog.dom.classes.has(element, className); 
  goog.dom.classes.enable(element, className, add); 
  return add; 
}; 
