
goog.provide('goog.crypt'); 
goog.require('goog.array'); 
goog.crypt.stringToByteArray = function(str) { 
  var output =[], p = 0; 
  for(var i = 0; i < str.length; i ++) { 
    var c = str.charCodeAt(i); 
    while(c > 0xff) { 
      output[p ++]= c & 0xff; 
      c >>= 8; 
    } 
    output[p ++]= c; 
  } 
  return output; 
}; 
goog.crypt.byteArrayToString = function(array) { 
  return String.fromCharCode.apply(null, array); 
}; 
goog.crypt.byteArrayToHex = function(array) { 
  return goog.array.map(array, function(numByte) { 
    var hexByte = numByte.toString(16); 
    return hexByte.length > 1 ? hexByte: '0' + hexByte; 
  }).join(''); 
}; 
goog.crypt.stringToUtf8ByteArray = function(str) { 
  str = str.replace(/\r\n/g, '\n'); 
  var out =[], p = 0; 
  for(var i = 0; i < str.length; i ++) { 
    var c = str.charCodeAt(i); 
    if(c < 128) { 
      out[p ++]= c; 
    } else if(c < 2048) { 
      out[p ++]=(c >> 6) | 192; 
      out[p ++]=(c & 63) | 128; 
    } else { 
      out[p ++]=(c >> 12) | 224; 
      out[p ++]=((c >> 6) & 63) | 128; 
      out[p ++]=(c & 63) | 128; 
    } 
  } 
  return out; 
}; 
goog.crypt.utf8ByteArrayToString = function(bytes) { 
  var out =[], pos = 0, c = 0; 
  while(pos < bytes.length) { 
    var c1 = bytes[pos ++]; 
    if(c1 < 128) { 
      out[c ++]= String.fromCharCode(c1); 
    } else if(c1 > 191 && c1 < 224) { 
      var c2 = bytes[pos ++]; 
      out[c ++]= String.fromCharCode((c1 & 31) << 6 | c2 & 63); 
    } else { 
      var c2 = bytes[pos ++]; 
      var c3 = bytes[pos ++]; 
      out[c ++]= String.fromCharCode((c1 & 15) << 12 |(c2 & 63) << 6 | c3 & 63); 
    } 
  } 
  return out.join(''); 
}; 
