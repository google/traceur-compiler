
goog.provide('goog.string.path'); 
goog.require('goog.array'); 
goog.require('goog.string'); 
goog.string.path.join = function(var_args) { 
  var path = arguments[0]; 
  for(var i = 1; i < arguments.length; i ++) { 
    var arg = arguments[i]; 
    if(goog.string.startsWith(arg, '/')) { 
      path = arg; 
    } else if(path == '' || goog.string.endsWith(arg, '/')) { 
      path += arg; 
    } else { 
      path += '/' + arg; 
    } 
  } 
  return path; 
}; 
goog.string.path.normalizePath = function(path) { 
  if(path == '') { 
    return '.'; 
  } 
  var initialSlashes = ''; 
  if(goog.string.startsWith(path, '/')) { 
    initialSlashes = '/'; 
    if(goog.string.startsWith(path, '//') && ! goog.string.startsWith(path, '///')) { 
      initialSlashes = '//'; 
    } 
  } 
  var parts = path.split('/'); 
  var newParts =[]; 
  for(var i = 0; i < parts.length; i ++) { 
    var part = parts[i]; 
    if(part == '' || part == '.') { 
      continue; 
    } 
    if(part != '..' ||(! initialSlashes && ! newParts.length) || goog.array.peek(newParts) == '..') { 
      newParts.push(part); 
    } else { 
      newParts.pop(); 
    } 
  } 
  var returnPath = initialSlashes + newParts.join('/'); 
  return returnPath || '.'; 
}; 
