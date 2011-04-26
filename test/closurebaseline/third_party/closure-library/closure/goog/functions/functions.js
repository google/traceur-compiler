
goog.provide('goog.functions'); 
goog.functions.constant = function(retValue) { 
  return function() { 
    return retValue; 
  }; 
}; 
goog.functions.FALSE = goog.functions.constant(false); 
goog.functions.TRUE = goog.functions.constant(true); 
goog.functions.NULL = goog.functions.constant(null); 
goog.functions.identity = function(opt_returnValue, var_args) { 
  return opt_returnValue; 
}; 
goog.functions.error = function(message) { 
  return function() { 
    throw Error(message); 
  }; 
}; 
goog.functions.lock = function(f) { 
  return function() { 
    return f.call(this); 
  }; 
}; 
goog.functions.withReturnValue = function(f, retValue) { 
  return goog.functions.sequence(f, goog.functions.constant(retValue)); 
}; 
goog.functions.compose = function(var_args) { 
  var functions = arguments; 
  var length = functions.length; 
  return function() { 
    var result; 
    if(length) { 
      result = functions[length - 1].apply(this, arguments); 
    } 
    for(var i = length - 2; i >= 0; i --) { 
      result = functions[i].call(this, result); 
    } 
    return result; 
  }; 
}; 
goog.functions.sequence = function(var_args) { 
  var functions = arguments; 
  var length = functions.length; 
  return function() { 
    var result; 
    for(var i = 0; i < length; i ++) { 
      result = functions[i].apply(this, arguments); 
    } 
    return result; 
  }; 
}; 
goog.functions.and = function(var_args) { 
  var functions = arguments; 
  var length = functions.length; 
  return function() { 
    for(var i = 0; i < length; i ++) { 
      if(! functions[i].apply(this, arguments)) { 
        return false; 
      } 
    } 
    return true; 
  }; 
}; 
goog.functions.or = function(var_args) { 
  var functions = arguments; 
  var length = functions.length; 
  return function() { 
    for(var i = 0; i < length; i ++) { 
      if(functions[i].apply(this, arguments)) { 
        return true; 
      } 
    } 
    return false; 
  }; 
}; 
goog.functions.not = function(f) { 
  return function() { 
    return ! f.apply(this, arguments); 
  }; 
}; 
goog.functions.create = function(constructor, var_args) { 
  var temp = function() { }; 
  temp.prototype = constructor.prototype; 
  var obj = new temp(); 
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1)); 
  return obj; 
}; 
