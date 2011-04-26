
goog.provide('goog.debug'); 
goog.require('goog.array'); 
goog.require('goog.string'); 
goog.require('goog.structs.Set'); 
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) { 
  var target = opt_target || goog.global; 
  var oldErrorHandler = target.onerror; 
  target.onerror = function(message, url, line) { 
    if(oldErrorHandler) { 
      oldErrorHandler(message, url, line); 
    } 
    logFunc({ 
      message: message, 
      fileName: url, 
      line: line 
    }); 
    return Boolean(opt_cancel); 
  }; 
}; 
goog.debug.expose = function(obj, opt_showFn) { 
  if(typeof obj == 'undefined') { 
    return 'undefined'; 
  } 
  if(obj == null) { 
    return 'NULL'; 
  } 
  var str =[]; 
  for(var x in obj) { 
    if(! opt_showFn && goog.isFunction(obj[x])) { 
      continue; 
    } 
    var s = x + ' = '; 
    try { 
      s += obj[x]; 
    } catch(e) { 
      s += '*** ' + e + ' ***'; 
    } 
    str.push(s); 
  } 
  return str.join('\n'); 
}; 
goog.debug.deepExpose = function(obj, opt_showFn) { 
  var previous = new goog.structs.Set(); 
  var str =[]; 
  var helper = function(obj, space) { 
    var nestspace = space + '  '; 
    var indentMultiline = function(str) { 
      return str.replace(/\n/g, '\n' + space); 
    }; 
    try { 
      if(! goog.isDef(obj)) { 
        str.push('undefined'); 
      } else if(goog.isNull(obj)) { 
        str.push('NULL'); 
      } else if(goog.isString(obj)) { 
        str.push('"' + indentMultiline(obj) + '"'); 
      } else if(goog.isFunction(obj)) { 
        str.push(indentMultiline(String(obj))); 
      } else if(goog.isObject(obj)) { 
        if(previous.contains(obj)) { 
          str.push('*** reference loop detected ***'); 
        } else { 
          previous.add(obj); 
          str.push('{'); 
          for(var x in obj) { 
            if(! opt_showFn && goog.isFunction(obj[x])) { 
              continue; 
            } 
            str.push('\n'); 
            str.push(nestspace); 
            str.push(x + ' = '); 
            helper(obj[x], nestspace); 
          } 
          str.push('\n' + space + '}'); 
        } 
      } else { 
        str.push(obj); 
      } 
    } catch(e) { 
      str.push('*** ' + e + ' ***'); 
    } 
  }; 
  helper(obj, ''); 
  return str.join(''); 
}; 
goog.debug.exposeArray = function(arr) { 
  var str =[]; 
  for(var i = 0; i < arr.length; i ++) { 
    if(goog.isArray(arr[i])) { 
      str.push(goog.debug.exposeArray(arr[i])); 
    } else { 
      str.push(arr[i]); 
    } 
  } 
  return '[ ' + str.join(', ') + ' ]'; 
}; 
goog.debug.exposeException = function(err, opt_fn) { 
  try { 
    var e = goog.debug.normalizeErrorObject(err); 
    var error = 'Message: ' + goog.string.htmlEscape(e.message) + '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' + e.fileName + '</a>\nLine: ' + e.lineNumber + '\n\nBrowser stack:\n' + goog.string.htmlEscape(e.stack + '-> ') + '[end]\n\nJS stack traversal:\n' + goog.string.htmlEscape(goog.debug.getStacktrace(opt_fn) + '-> '); 
    return error; 
  } catch(e2) { 
    return 'Exception trying to expose exception! You win, we lose. ' + e2; 
  } 
}; 
goog.debug.normalizeErrorObject = function(err) { 
  var href = goog.getObjectByName('window.location.href'); 
  if(goog.isString(err)) { 
    return { 
      'message': err, 
      'name': 'Unknown error', 
      'lineNumber': 'Not available', 
      'fileName': href, 
      'stack': 'Not available' 
    }; 
  } 
  var lineNumber, fileName; 
  var threwError = false; 
  try { 
    lineNumber = err.lineNumber || err.line || 'Not available'; 
  } catch(e) { 
    lineNumber = 'Not available'; 
    threwError = true; 
  } 
  try { 
    fileName = err.fileName || err.filename || err.sourceURL || href; 
  } catch(e) { 
    fileName = 'Not available'; 
    threwError = true; 
  } 
  if(threwError || ! err.lineNumber || ! err.fileName || ! err.stack) { 
    return { 
      'message': err.message, 
      'name': err.name, 
      'lineNumber': lineNumber, 
      'fileName': fileName, 
      'stack': err.stack || 'Not available' 
    }; 
  } 
  return err; 
}; 
goog.debug.enhanceError = function(err, opt_message) { 
  var error = typeof err == 'string' ? Error(err): err; 
  if(! error.stack) { 
    error.stack = goog.debug.getStacktrace(arguments.callee.caller); 
  } 
  if(opt_message) { 
    var x = 0; 
    while(error['message' + x]) { 
      ++ x; 
    } 
    error['message' + x]= String(opt_message); 
  } 
  return error; 
}; 
goog.debug.getStacktraceSimple = function(opt_depth) { 
  var sb =[]; 
  var fn = arguments.callee.caller; 
  var depth = 0; 
  while(fn &&(! opt_depth || depth < opt_depth)) { 
    sb.push(goog.debug.getFunctionName(fn)); 
    sb.push('()\n'); 
    try { 
      fn = fn.caller; 
    } catch(e) { 
      sb.push('[exception trying to get caller]\n'); 
      break; 
    } 
    depth ++; 
    if(depth >= goog.debug.MAX_STACK_DEPTH) { 
      sb.push('[...long stack...]'); 
      break; 
    } 
  } 
  if(opt_depth && depth >= opt_depth) { 
    sb.push('[...reached max depth limit...]'); 
  } else { 
    sb.push('[end]'); 
  } 
  return sb.join(''); 
}; 
goog.debug.MAX_STACK_DEPTH = 50; 
goog.debug.getStacktrace = function(opt_fn) { 
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller,[]); 
}; 
goog.debug.getStacktraceHelper_ = function(fn, visited) { 
  var sb =[]; 
  if(goog.array.contains(visited, fn)) { 
    sb.push('[...circular reference...]'); 
  } else if(fn && visited.length < goog.debug.MAX_STACK_DEPTH) { 
    sb.push(goog.debug.getFunctionName(fn) + '('); 
    var args = fn.arguments; 
    for(var i = 0; i < args.length; i ++) { 
      if(i > 0) { 
        sb.push(', '); 
      } 
      var argDesc; 
      var arg = args[i]; 
      switch(typeof arg) { 
        case 'object': 
          argDesc = arg ? 'object': 'null'; 
          break; 

        case 'string': 
          argDesc = arg; 
          break; 

        case 'number': 
          argDesc = String(arg); 
          break; 

        case 'boolean': 
          argDesc = arg ? 'true': 'false'; 
          break; 

        case 'function': 
          argDesc = goog.debug.getFunctionName(arg); 
          argDesc = argDesc ? argDesc: '[fn]'; 
          break; 

        case 'undefined': 
        default: 
          argDesc = typeof arg; 
          break; 

      } 
      if(argDesc.length > 40) { 
        argDesc = argDesc.substr(0, 40) + '...'; 
      } 
      sb.push(argDesc); 
    } 
    visited.push(fn); 
    sb.push(')\n'); 
    try { 
      sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited)); 
    } catch(e) { 
      sb.push('[exception trying to get caller]\n'); 
    } 
  } else if(fn) { 
    sb.push('[...long stack...]'); 
  } else { 
    sb.push('[end]'); 
  } 
  return sb.join(''); 
}; 
goog.debug.getFunctionName = function(fn) { 
  var functionSource = String(fn); 
  if(! goog.debug.fnNameCache_[functionSource]) { 
    var matches = /function ([^\(]+)/.exec(functionSource); 
    if(matches) { 
      var method = matches[1]; 
      goog.debug.fnNameCache_[functionSource]= method; 
    } else { 
      goog.debug.fnNameCache_[functionSource]= '[Anonymous]'; 
    } 
  } 
  return goog.debug.fnNameCache_[functionSource]; 
}; 
goog.debug.makeWhitespaceVisible = function(string) { 
  return string.replace(/ /g, '[_]').replace(/\f/g, '[f]').replace(/\n/g, '[n]\n').replace(/\r/g, '[r]').replace(/\t/g, '[t]'); 
}; 
goog.debug.fnNameCache_ = { }; 
