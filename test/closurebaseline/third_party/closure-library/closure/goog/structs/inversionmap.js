
goog.provide('goog.structs.InversionMap'); 
goog.require('goog.array'); 
goog.structs.InversionMap = function(rangeArray, valueArray, opt_delta) { 
  if(rangeArray.length != valueArray.length) { 
    return null; 
  } 
  this.storeInversion_(rangeArray, opt_delta); 
  this.values = valueArray; 
}; 
goog.structs.InversionMap.prototype.rangeArray; 
goog.structs.InversionMap.prototype.storeInversion_ = function(rangeArray, opt_delta) { 
  this.rangeArray = rangeArray; 
  for(var i = 1; i < rangeArray.length; i ++) { 
    if(rangeArray[i]== null) { 
      rangeArray[i]= rangeArray[i - 1]+ 1; 
    } else if(opt_delta) { 
      rangeArray[i]+= rangeArray[i - 1]; 
    } 
  } 
}; 
goog.structs.InversionMap.prototype.spliceInversion = function(rangeArray, valueArray, opt_delta) { 
  var otherMap = new goog.structs.InversionMap(rangeArray, valueArray, opt_delta); 
  var startRange = otherMap.rangeArray[0]; 
  var endRange =(goog.array.peek(otherMap.rangeArray)); 
  var startSplice = this.getLeast(startRange); 
  var endSplice = this.getLeast(endRange); 
  if(startRange != this.rangeArray[startSplice]) { 
    startSplice ++; 
  } 
  var spliceLength = endSplice - startSplice + 1; 
  goog.partial(goog.array.splice, this.rangeArray, startSplice, spliceLength).apply(null, otherMap.rangeArray); 
  goog.partial(goog.array.splice, this.values, startSplice, spliceLength).apply(null, otherMap.values); 
}; 
goog.structs.InversionMap.prototype.at = function(intKey) { 
  var index = this.getLeast(intKey); 
  if(index < 0) { 
    return null; 
  } 
  return this.values[index]; 
}; 
goog.structs.InversionMap.prototype.getLeast = function(intKey) { 
  var arr = this.rangeArray; 
  var low = 0; 
  var high = arr.length; 
  while(high - low > 8) { 
    var mid =(high + low) >> 1; 
    if(arr[mid]<= intKey) { 
      low = mid; 
    } else { 
      high = mid; 
    } 
  } 
  for(; low < high; ++ low) { 
    if(intKey < arr[low]) { 
      break; 
    } 
  } 
  return low - 1; 
}; 
