
goog.provide('goog.iter'); 
goog.provide('goog.iter.Iterator'); 
goog.provide('goog.iter.StopIteration'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.iter.Iterable; 
if('StopIteration' in goog.global) { 
  goog.iter.StopIteration = goog.global['StopIteration']; 
} else { 
  goog.iter.StopIteration = Error('StopIteration'); 
} 
goog.iter.Iterator = function() { }; 
goog.iter.Iterator.prototype.next = function() { 
  throw goog.iter.StopIteration; 
}; 
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) { 
  return this; 
}; 
goog.iter.toIterator = function(iterable) { 
  if(iterable instanceof goog.iter.Iterator) { 
    return iterable; 
  } 
  if(typeof iterable.__iterator__ == 'function') { 
    return iterable.__iterator__(false); 
  } 
  if(goog.isArrayLike(iterable)) { 
    var i = 0; 
    var newIter = new goog.iter.Iterator; 
    newIter.next = function() { 
      while(true) { 
        if(i >= iterable.length) { 
          throw goog.iter.StopIteration; 
        } 
        if(!(i in iterable)) { 
          i ++; 
          continue; 
        } 
        return iterable[i ++]; 
      } 
    }; 
    return newIter; 
  } 
  throw Error('Not implemented'); 
}; 
goog.iter.forEach = function(iterable, f, opt_obj) { 
  if(goog.isArrayLike(iterable)) { 
    try { 
      goog.array.forEach((iterable), f, opt_obj); 
    } catch(ex) { 
      if(ex !== goog.iter.StopIteration) { 
        throw ex; 
      } 
    } 
  } else { 
    iterable = goog.iter.toIterator(iterable); 
    try { 
      while(true) { 
        f.call(opt_obj, iterable.next(), undefined, iterable); 
      } 
    } catch(ex) { 
      if(ex !== goog.iter.StopIteration) { 
        throw ex; 
      } 
    } 
  } 
}; 
goog.iter.filter = function(iterable, f, opt_obj) { 
  iterable = goog.iter.toIterator(iterable); 
  var newIter = new goog.iter.Iterator; 
  newIter.next = function() { 
    while(true) { 
      var val = iterable.next(); 
      if(f.call(opt_obj, val, undefined, iterable)) { 
        return val; 
      } 
    } 
  }; 
  return newIter; 
}; 
goog.iter.range = function(startOrStop, opt_stop, opt_step) { 
  var start = 0; 
  var stop = startOrStop; 
  var step = opt_step || 1; 
  if(arguments.length > 1) { 
    start = startOrStop; 
    stop = opt_stop; 
  } 
  if(step == 0) { 
    throw Error('Range step argument must not be zero'); 
  } 
  var newIter = new goog.iter.Iterator; 
  newIter.next = function() { 
    if(step > 0 && start >= stop || step < 0 && start <= stop) { 
      throw goog.iter.StopIteration; 
    } 
    var rv = start; 
    start += step; 
    return rv; 
  }; 
  return newIter; 
}; 
goog.iter.join = function(iterable, deliminator) { 
  return goog.iter.toArray(iterable).join(deliminator); 
}; 
goog.iter.map = function(iterable, f, opt_obj) { 
  iterable = goog.iter.toIterator(iterable); 
  var newIter = new goog.iter.Iterator; 
  newIter.next = function() { 
    while(true) { 
      var val = iterable.next(); 
      return f.call(opt_obj, val, undefined, iterable); 
    } 
  }; 
  return newIter; 
}; 
goog.iter.reduce = function(iterable, f, val, opt_obj) { 
  var rval = val; 
  goog.iter.forEach(iterable, function(val) { 
    rval = f.call(opt_obj, rval, val); 
  }); 
  return rval; 
}; 
goog.iter.some = function(iterable, f, opt_obj) { 
  iterable = goog.iter.toIterator(iterable); 
  try { 
    while(true) { 
      if(f.call(opt_obj, iterable.next(), undefined, iterable)) { 
        return true; 
      } 
    } 
  } catch(ex) { 
    if(ex !== goog.iter.StopIteration) { 
      throw ex; 
    } 
  } 
  return false; 
}; 
goog.iter.every = function(iterable, f, opt_obj) { 
  iterable = goog.iter.toIterator(iterable); 
  try { 
    while(true) { 
      if(! f.call(opt_obj, iterable.next(), undefined, iterable)) { 
        return false; 
      } 
    } 
  } catch(ex) { 
    if(ex !== goog.iter.StopIteration) { 
      throw ex; 
    } 
  } 
  return true; 
}; 
goog.iter.chain = function(var_args) { 
  var args = arguments; 
  var length = args.length; 
  var i = 0; 
  var newIter = new goog.iter.Iterator; 
  newIter.next = function() { 
    try { 
      if(i >= length) { 
        throw goog.iter.StopIteration; 
      } 
      var current = goog.iter.toIterator(args[i]); 
      return current.next(); 
    } catch(ex) { 
      if(ex !== goog.iter.StopIteration || i >= length) { 
        throw ex; 
      } else { 
        i ++; 
        return this.next(); 
      } 
    } 
  }; 
  return newIter; 
}; 
goog.iter.dropWhile = function(iterable, f, opt_obj) { 
  iterable = goog.iter.toIterator(iterable); 
  var newIter = new goog.iter.Iterator; 
  var dropping = true; 
  newIter.next = function() { 
    while(true) { 
      var val = iterable.next(); 
      if(dropping && f.call(opt_obj, val, undefined, iterable)) { 
        continue; 
      } else { 
        dropping = false; 
      } 
      return val; 
    } 
  }; 
  return newIter; 
}; 
goog.iter.takeWhile = function(iterable, f, opt_obj) { 
  iterable = goog.iter.toIterator(iterable); 
  var newIter = new goog.iter.Iterator; 
  var taking = true; 
  newIter.next = function() { 
    while(true) { 
      if(taking) { 
        var val = iterable.next(); 
        if(f.call(opt_obj, val, undefined, iterable)) { 
          return val; 
        } else { 
          taking = false; 
        } 
      } else { 
        throw goog.iter.StopIteration; 
      } 
    } 
  }; 
  return newIter; 
}; 
goog.iter.toArray = function(iterable) { 
  if(goog.isArrayLike(iterable)) { 
    return goog.array.toArray((iterable)); 
  } 
  iterable = goog.iter.toIterator(iterable); 
  var array =[]; 
  goog.iter.forEach(iterable, function(val) { 
    array.push(val); 
  }); 
  return array; 
}; 
goog.iter.equals = function(iterable1, iterable2) { 
  iterable1 = goog.iter.toIterator(iterable1); 
  iterable2 = goog.iter.toIterator(iterable2); 
  var b1, b2; 
  try { 
    while(true) { 
      b1 = b2 = false; 
      var val1 = iterable1.next(); 
      b1 = true; 
      var val2 = iterable2.next(); 
      b2 = true; 
      if(val1 != val2) { 
        return false; 
      } 
    } 
  } catch(ex) { 
    if(ex !== goog.iter.StopIteration) { 
      throw ex; 
    } else { 
      if(b1 && ! b2) { 
        return false; 
      } 
      if(! b2) { 
        try { 
          val2 = iterable2.next(); 
          return false; 
        } catch(ex1) { 
          if(ex1 !== goog.iter.StopIteration) { 
            throw ex1; 
          } 
          return true; 
        } 
      } 
    } 
  } 
  return false; 
}; 
goog.iter.nextOrValue = function(iterable, defaultValue) { 
  try { 
    return goog.iter.toIterator(iterable).next(); 
  } catch(e) { 
    if(e != goog.iter.StopIteration) { 
      throw e; 
    } 
    return defaultValue; 
  } 
}; 
goog.iter.product = function(var_args) { 
  var someArrayEmpty = goog.array.some(arguments, function(arr) { 
    return ! arr.length; 
  }); 
  if(someArrayEmpty || ! arguments.length) { 
    return new goog.iter.Iterator(); 
  } 
  var iter = new goog.iter.Iterator(); 
  var arrays = arguments; 
  var indicies = goog.array.repeat(0, arrays.length); 
  iter.next = function() { 
    if(indicies) { 
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) { 
        return arrays[arrayIndex][valueIndex]; 
      }); 
      for(var i = indicies.length - 1; i >= 0; i --) { 
        goog.asserts.assert(indicies); 
        if(indicies[i]< arrays[i].length - 1) { 
          indicies[i]++; 
          break; 
        } 
        if(i == 0) { 
          indicies = null; 
          break; 
        } 
        indicies[i]= 0; 
      } 
      return retVal; 
    } 
    throw goog.iter.StopIteration; 
  }; 
  return iter; 
}; 
