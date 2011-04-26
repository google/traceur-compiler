
goog.provide('goog.json'); 
goog.provide('goog.json.Serializer'); 
goog.json.isValid_ = function(s) { 
  if(/^\s*$/.test(s)) { 
    return false; 
  } 
  var backslashesRe = /\\["\\\/bfnrtu]/g; 
  var simpleValuesRe = /"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g; 
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g; 
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/; 
  return remainderRe.test(s.replace(backslashesRe, '@').replace(simpleValuesRe, ']').replace(openBracketsRe, '')); 
}; 
goog.json.parse = function(s) { 
  var o = String(s); 
  if(goog.json.isValid_(o)) { 
    try { 
      return eval('(' + o + ')'); 
    } catch(ex) { } 
  } 
  throw Error('Invalid JSON string: ' + o); 
}; 
goog.json.unsafeParse = function(s) { 
  return eval('(' + s + ')'); 
}; 
goog.json.serialize = function(object) { 
  return new goog.json.Serializer().serialize(object); 
}; 
goog.json.Serializer = function() { }; 
goog.json.Serializer.prototype.serialize = function(object) { 
  var sb =[]; 
  this.serialize_(object, sb); 
  return sb.join(''); 
}; 
goog.json.Serializer.prototype.serialize_ = function(object, sb) { 
  switch(typeof object) { 
    case 'string': 
      this.serializeString_((object), sb); 
      break; 

    case 'number': 
      this.serializeNumber_((object), sb); 
      break; 

    case 'boolean': 
      sb.push(object); 
      break; 

    case 'undefined': 
      sb.push('null'); 
      break; 

    case 'object': 
      if(object == null) { 
        sb.push('null'); 
        break; 
      } 
      if(goog.isArray(object)) { 
        this.serializeArray_((object), sb); 
        break; 
      } 
      this.serializeObject_((object), sb); 
      break; 

    case 'function': 
      break; 

    default: 
      throw Error('Unknown type: ' + typeof object); 

  } 
}; 
goog.json.Serializer.charToJsonCharCache_ = { 
  '\"': '\\"', 
  '\\': '\\\\', 
  '/': '\\/', 
  '\b': '\\b', 
  '\f': '\\f', 
  '\n': '\\n', 
  '\r': '\\r', 
  '\t': '\\t', 
  '\x0B': '\\u000b' 
}; 
goog.json.Serializer.charsToReplace_ = /\uffff/.test('\uffff') ? /[\\\"\x00-\x1f\x7f-\uffff]/g: /[\\\"\x00-\x1f\x7f-\xff]/g; 
goog.json.Serializer.prototype.serializeString_ = function(s, sb) { 
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) { 
    if(c in goog.json.Serializer.charToJsonCharCache_) { 
      return goog.json.Serializer.charToJsonCharCache_[c]; 
    } 
    var cc = c.charCodeAt(0); 
    var rv = '\\u'; 
    if(cc < 16) { 
      rv += '000'; 
    } else if(cc < 256) { 
      rv += '00'; 
    } else if(cc < 4096) { 
      rv += '0'; 
    } 
    return goog.json.Serializer.charToJsonCharCache_[c]= rv + cc.toString(16); 
  }), '"'); 
}; 
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) { 
  sb.push(isFinite(n) && ! isNaN(n) ? n: 'null'); 
}; 
goog.json.Serializer.prototype.serializeArray_ = function(arr, sb) { 
  var l = arr.length; 
  sb.push('['); 
  var sep = ''; 
  for(var i = 0; i < l; i ++) { 
    sb.push(sep); 
    this.serialize_(arr[i], sb); 
    sep = ','; 
  } 
  sb.push(']'); 
}; 
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) { 
  sb.push('{'); 
  var sep = ''; 
  for(var key in obj) { 
    if(Object.prototype.hasOwnProperty.call(obj, key)) { 
      var value = obj[key]; 
      if(typeof value != 'function') { 
        sb.push(sep); 
        this.serializeString_(key, sb); 
        sb.push(':'); 
        this.serialize_(value, sb); 
        sep = ','; 
      } 
    } 
  } 
  sb.push('}'); 
}; 
