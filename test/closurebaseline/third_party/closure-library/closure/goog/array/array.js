
goog.provide('goog.array'); 
goog.provide('goog.array.ArrayLike'); 
goog.require('goog.asserts'); 
goog.NATIVE_ARRAY_PROTOTYPES = true; 
goog.array.ArrayLike; 
goog.array.peek = function(array) { 
  return array[array.length - 1]; 
}; 
goog.array.ARRAY_PROTOTYPE_ = Array.prototype; 
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(arr, obj, opt_fromIndex) { 
  goog.asserts.assert(arr.length != null); 
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex); 
}: function(arr, obj, opt_fromIndex) { 
  var fromIndex = opt_fromIndex == null ? 0:(opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex): opt_fromIndex); 
  if(goog.isString(arr)) { 
    if(! goog.isString(obj) || obj.length != 1) { 
      return - 1; 
    } 
    return arr.indexOf(obj, fromIndex); 
  } 
  for(var i = fromIndex; i < arr.length; i ++) { 
    if(i in arr && arr[i]=== obj) return i; 
  } 
  return - 1; 
}; 
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(arr, obj, opt_fromIndex) { 
  goog.asserts.assert(arr.length != null); 
  var fromIndex = opt_fromIndex == null ? arr.length - 1: opt_fromIndex; 
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex); 
}: function(arr, obj, opt_fromIndex) { 
  var fromIndex = opt_fromIndex == null ? arr.length - 1: opt_fromIndex; 
  if(fromIndex < 0) { 
    fromIndex = Math.max(0, arr.length + fromIndex); 
  } 
  if(goog.isString(arr)) { 
    if(! goog.isString(obj) || obj.length != 1) { 
      return - 1; 
    } 
    return arr.lastIndexOf(obj, fromIndex); 
  } 
  for(var i = fromIndex; i >= 0; i --) { 
    if(i in arr && arr[i]=== obj) return i; 
  } 
  return - 1; 
}; 
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(arr, f, opt_obj) { 
  goog.asserts.assert(arr.length != null); 
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj); 
}: function(arr, f, opt_obj) { 
  var l = arr.length; 
  var arr2 = goog.isString(arr) ? arr.split(''): arr; 
  for(var i = 0; i < l; i ++) { 
    if(i in arr2) { 
      f.call(opt_obj, arr2[i], i, arr); 
    } 
  } 
}; 
goog.array.forEachRight = function(arr, f, opt_obj) { 
  var l = arr.length; 
  var arr2 = goog.isString(arr) ? arr.split(''): arr; 
  for(var i = l - 1; i >= 0; -- i) { 
    if(i in arr2) { 
      f.call(opt_obj, arr2[i], i, arr); 
    } 
  } 
}; 
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(arr, f, opt_obj) { 
  goog.asserts.assert(arr.length != null); 
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj); 
}: function(arr, f, opt_obj) { 
  var l = arr.length; 
  var res =[]; 
  var resLength = 0; 
  var arr2 = goog.isString(arr) ? arr.split(''): arr; 
  for(var i = 0; i < l; i ++) { 
    if(i in arr2) { 
      var val = arr2[i]; 
      if(f.call(opt_obj, val, i, arr)) { 
        res[resLength ++]= val; 
      } 
    } 
  } 
  return res; 
}; 
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(arr, f, opt_obj) { 
  goog.asserts.assert(arr.length != null); 
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj); 
}: function(arr, f, opt_obj) { 
  var l = arr.length; 
  var res = new Array(l); 
  var arr2 = goog.isString(arr) ? arr.split(''): arr; 
  for(var i = 0; i < l; i ++) { 
    if(i in arr2) { 
      res[i]= f.call(opt_obj, arr2[i], i, arr); 
    } 
  } 
  return res; 
}; 
goog.array.reduce = function(arr, f, val, opt_obj) { 
  if(arr.reduce) { 
    if(opt_obj) { 
      return arr.reduce(goog.bind(f, opt_obj), val); 
    } else { 
      return arr.reduce(f, val); 
    } 
  } 
  var rval = val; 
  goog.array.forEach(arr, function(val, index) { 
    rval = f.call(opt_obj, rval, val, index, arr); 
  }); 
  return rval; 
}; 
goog.array.reduceRight = function(arr, f, val, opt_obj) { 
  if(arr.reduceRight) { 
    if(opt_obj) { 
      return arr.reduceRight(goog.bind(f, opt_obj), val); 
    } else { 
      return arr.reduceRight(f, val); 
    } 
  } 
  var rval = val; 
  goog.array.forEachRight(arr, function(val, index) { 
    rval = f.call(opt_obj, rval, val, index, arr); 
  }); 
  return rval; 
}; 
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(arr, f, opt_obj) { 
  goog.asserts.assert(arr.length != null); 
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj); 
}: function(arr, f, opt_obj) { 
  var l = arr.length; 
  var arr2 = goog.isString(arr) ? arr.split(''): arr; 
  for(var i = 0; i < l; i ++) { 
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(arr, f, opt_obj) { 
  goog.asserts.assert(arr.length != null); 
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj); 
}: function(arr, f, opt_obj) { 
  var l = arr.length; 
  var arr2 = goog.isString(arr) ? arr.split(''): arr; 
  for(var i = 0; i < l; i ++) { 
    if(i in arr2 && ! f.call(opt_obj, arr2[i], i, arr)) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.array.find = function(arr, f, opt_obj) { 
  var i = goog.array.findIndex(arr, f, opt_obj); 
  return i < 0 ? null: goog.isString(arr) ? arr.charAt(i): arr[i]; 
}; 
goog.array.findIndex = function(arr, f, opt_obj) { 
  var l = arr.length; 
  var arr2 = goog.isString(arr) ? arr.split(''): arr; 
  for(var i = 0; i < l; i ++) { 
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) { 
      return i; 
    } 
  } 
  return - 1; 
}; 
goog.array.findRight = function(arr, f, opt_obj) { 
  var i = goog.array.findIndexRight(arr, f, opt_obj); 
  return i < 0 ? null: goog.isString(arr) ? arr.charAt(i): arr[i]; 
}; 
goog.array.findIndexRight = function(arr, f, opt_obj) { 
  var l = arr.length; 
  var arr2 = goog.isString(arr) ? arr.split(''): arr; 
  for(var i = l - 1; i >= 0; i --) { 
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) { 
      return i; 
    } 
  } 
  return - 1; 
}; 
goog.array.contains = function(arr, obj) { 
  return goog.array.indexOf(arr, obj) >= 0; 
}; 
goog.array.isEmpty = function(arr) { 
  return arr.length == 0; 
}; 
goog.array.clear = function(arr) { 
  if(! goog.isArray(arr)) { 
    for(var i = arr.length - 1; i >= 0; i --) { 
      delete arr[i]; 
    } 
  } 
  arr.length = 0; 
}; 
goog.array.insert = function(arr, obj) { 
  if(! goog.array.contains(arr, obj)) { 
    arr.push(obj); 
  } 
}; 
goog.array.insertAt = function(arr, obj, opt_i) { 
  goog.array.splice(arr, opt_i, 0, obj); 
}; 
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) { 
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd); 
}; 
goog.array.insertBefore = function(arr, obj, opt_obj2) { 
  var i; 
  if(arguments.length == 2 ||(i = goog.array.indexOf(arr, opt_obj2)) < 0) { 
    arr.push(obj); 
  } else { 
    goog.array.insertAt(arr, obj, i); 
  } 
}; 
goog.array.remove = function(arr, obj) { 
  var i = goog.array.indexOf(arr, obj); 
  var rv; 
  if((rv = i >= 0)) { 
    goog.array.removeAt(arr, i); 
  } 
  return rv; 
}; 
goog.array.removeAt = function(arr, i) { 
  goog.asserts.assert(arr.length != null); 
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1; 
}; 
goog.array.removeIf = function(arr, f, opt_obj) { 
  var i = goog.array.findIndex(arr, f, opt_obj); 
  if(i >= 0) { 
    goog.array.removeAt(arr, i); 
    return true; 
  } 
  return false; 
}; 
goog.array.concat = function(var_args) { 
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments); 
}; 
goog.array.clone = function(arr) { 
  if(goog.isArray(arr)) { 
    return goog.array.concat((arr)); 
  } else { 
    var rv =[]; 
    for(var i = 0, len = arr.length; i < len; i ++) { 
      rv[i]= arr[i]; 
    } 
    return rv; 
  } 
}; 
goog.array.toArray = function(object) { 
  if(goog.isArray(object)) { 
    return goog.array.concat((object)); 
  } 
  return goog.array.clone((object)); 
}; 
goog.array.extend = function(arr1, var_args) { 
  for(var i = 1; i < arguments.length; i ++) { 
    var arr2 = arguments[i]; 
    var isArrayLike; 
    if(goog.isArray(arr2) ||(isArrayLike = goog.isArrayLike(arr2)) && arr2.hasOwnProperty('callee')) { 
      arr1.push.apply(arr1, arr2); 
    } else if(isArrayLike) { 
      var len1 = arr1.length; 
      var len2 = arr2.length; 
      for(var j = 0; j < len2; j ++) { 
        arr1[len1 + j]= arr2[j]; 
      } 
    } else { 
      arr1.push(arr2); 
    } 
  } 
}; 
goog.array.splice = function(arr, index, howMany, var_args) { 
  goog.asserts.assert(arr.length != null); 
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1)); 
}; 
goog.array.slice = function(arr, start, opt_end) { 
  goog.asserts.assert(arr.length != null); 
  if(arguments.length <= 2) { 
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start); 
  } else { 
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end); 
  } 
}; 
goog.array.removeDuplicates = function(arr, opt_rv) { 
  var returnArray = opt_rv || arr; 
  var seen = { }, cursorInsert = 0, cursorRead = 0; 
  while(cursorRead < arr.length) { 
    var current = arr[cursorRead ++]; 
    var key = goog.isObject(current) ? 'o' + goog.getUid(current):(typeof current).charAt(0) + current; 
    if(! Object.prototype.hasOwnProperty.call(seen, key)) { 
      seen[key]= true; 
      returnArray[cursorInsert ++]= current; 
    } 
  } 
  returnArray.length = cursorInsert; 
}; 
goog.array.binarySearch = function(arr, target, opt_compareFn) { 
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target); 
}; 
goog.array.binarySelect = function(arr, evaluator, opt_obj) { 
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj); 
}; 
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) { 
  var left = 0; 
  var right = arr.length; 
  var found; 
  while(left < right) { 
    var middle =(left + right) >> 1; 
    var compareResult; 
    if(isEvaluator) { 
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr); 
    } else { 
      compareResult = compareFn(opt_target, arr[middle]); 
    } 
    if(compareResult > 0) { 
      left = middle + 1; 
    } else { 
      right = middle; 
      found = ! compareResult; 
    } 
  } 
  return found ? left: ~ left; 
}; 
goog.array.sort = function(arr, opt_compareFn) { 
  goog.asserts.assert(arr.length != null); 
  goog.array.ARRAY_PROTOTYPE_.sort.call(arr, opt_compareFn || goog.array.defaultCompare); 
}; 
goog.array.stableSort = function(arr, opt_compareFn) { 
  for(var i = 0; i < arr.length; i ++) { 
    arr[i]= { 
      index: i, 
      value: arr[i]
    }; 
  } 
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare; 
  function stableCompareFn(obj1, obj2) { 
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index; 
  } 
  ; 
  goog.array.sort(arr, stableCompareFn); 
  for(var i = 0; i < arr.length; i ++) { 
    arr[i]= arr[i].value; 
  } 
}; 
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) { 
  var compare = opt_compareFn || goog.array.defaultCompare; 
  goog.array.sort(arr, function(a, b) { 
    return compare(a[key], b[key]); 
  }); 
}; 
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) { 
  var compare = opt_compareFn || goog.array.defaultCompare; 
  for(var i = 1; i < arr.length; i ++) { 
    var compareResult = compare(arr[i - 1], arr[i]); 
    if(compareResult > 0 || compareResult == 0 && opt_strict) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.array.equals = function(arr1, arr2, opt_equalsFn) { 
  if(! goog.isArrayLike(arr1) || ! goog.isArrayLike(arr2) || arr1.length != arr2.length) { 
    return false; 
  } 
  var l = arr1.length; 
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality; 
  for(var i = 0; i < l; i ++) { 
    if(! equalsFn(arr1[i], arr2[i])) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.array.compare = function(arr1, arr2, opt_equalsFn) { 
  return goog.array.equals(arr1, arr2, opt_equalsFn); 
}; 
goog.array.defaultCompare = function(a, b) { 
  return a > b ? 1: a < b ? - 1: 0; 
}; 
goog.array.defaultCompareEquality = function(a, b) { 
  return a === b; 
}; 
goog.array.binaryInsert = function(array, value, opt_compareFn) { 
  var index = goog.array.binarySearch(array, value, opt_compareFn); 
  if(index < 0) { 
    goog.array.insertAt(array, value, -(index + 1)); 
    return true; 
  } 
  return false; 
}; 
goog.array.binaryRemove = function(array, value, opt_compareFn) { 
  var index = goog.array.binarySearch(array, value, opt_compareFn); 
  return(index >= 0) ? goog.array.removeAt(array, index): false; 
}; 
goog.array.bucket = function(array, sorter) { 
  var buckets = { }; 
  for(var i = 0; i < array.length; i ++) { 
    var value = array[i]; 
    var key = sorter(value, i, array); 
    if(goog.isDef(key)) { 
      var bucket = buckets[key]||(buckets[key]=[]); 
      bucket.push(value); 
    } 
  } 
  return buckets; 
}; 
goog.array.repeat = function(value, n) { 
  var array =[]; 
  for(var i = 0; i < n; i ++) { 
    array[i]= value; 
  } 
  return array; 
}; 
goog.array.flatten = function(var_args) { 
  var result =[]; 
  for(var i = 0; i < arguments.length; i ++) { 
    var element = arguments[i]; 
    if(goog.isArray(element)) { 
      result.push.apply(result, goog.array.flatten.apply(null, element)); 
    } else { 
      result.push(element); 
    } 
  } 
  return result; 
}; 
goog.array.rotate = function(array, n) { 
  goog.asserts.assert(array.length != null); 
  if(array.length) { 
    n %= array.length; 
    if(n > 0) { 
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(- n, n)); 
    } else if(n < 0) { 
      goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, - n)); 
    } 
  } 
  return array; 
}; 
goog.array.zip = function(var_args) { 
  if(! arguments.length) { 
    return[]; 
  } 
  var result =[]; 
  for(var i = 0; true; i ++) { 
    var value =[]; 
    for(var j = 0; j < arguments.length; j ++) { 
      var arr = arguments[j]; 
      if(i >= arr.length) { 
        return result; 
      } 
      value.push(arr[i]); 
    } 
    result.push(value); 
  } 
}; 
goog.array.shuffle = function(arr, opt_randFn) { 
  var randFn = opt_randFn || Math.random; 
  for(var i = arr.length - 1; i > 0; i --) { 
    var j = Math.floor(randFn() *(i + 1)); 
    var tmp = arr[i]; 
    arr[i]= arr[j]; 
    arr[j]= tmp; 
  } 
}; 
