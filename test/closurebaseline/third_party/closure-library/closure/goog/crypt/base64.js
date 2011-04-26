
goog.provide('goog.crypt.base64'); 
goog.require('goog.crypt'); 
goog.require('goog.userAgent'); 
goog.crypt.base64.byteToCharMap_ = null; 
goog.crypt.base64.charToByteMap_ = null; 
goog.crypt.base64.byteToCharMapWebSafe_ = null; 
goog.crypt.base64.charToByteMapWebSafe_ = null; 
goog.crypt.base64.ENCODED_VALS_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789'; 
goog.crypt.base64.ENCODED_VALS = goog.crypt.base64.ENCODED_VALS_BASE + '+/='; 
goog.crypt.base64.ENCODED_VALS_WEBSAFE = goog.crypt.base64.ENCODED_VALS_BASE + '-_.'; 
goog.crypt.base64.HAS_NATIVE_SUPPORT = goog.userAgent.GECKO || goog.userAgent.WEBKIT || goog.userAgent.OPERA || typeof(goog.global.atob) == 'function'; 
goog.crypt.base64.encodeByteArray = function(input, opt_webSafe) { 
  if(! goog.isArrayLike(input)) { 
    throw Error('encodeByteArray takes an array as a parameter'); 
  } 
  goog.crypt.base64.init_(); 
  var byteToCharMap = opt_webSafe ? goog.crypt.base64.byteToCharMapWebSafe_: goog.crypt.base64.byteToCharMap_; 
  var output =[]; 
  for(var i = 0; i < input.length; i += 3) { 
    var byte1 = input[i]; 
    var haveByte2 = i + 1 < input.length; 
    var byte2 = haveByte2 ? input[i + 1]: 0; 
    var haveByte3 = i + 2 < input.length; 
    var byte3 = haveByte3 ? input[i + 2]: 0; 
    var outByte1 = byte1 >> 2; 
    var outByte2 =((byte1 & 0x03) << 4) |(byte2 >> 4); 
    var outByte3 =((byte2 & 0x0F) << 2) |(byte3 >> 6); 
    var outByte4 = byte3 & 0x3F; 
    if(! haveByte3) { 
      outByte4 = 64; 
      if(! haveByte2) { 
        outByte3 = 64; 
      } 
    } 
    output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]); 
  } 
  return output.join(''); 
}; 
goog.crypt.base64.encodeString = function(input, opt_webSafe) { 
  if(goog.crypt.base64.HAS_NATIVE_SUPPORT && ! opt_webSafe) { 
    return goog.global.btoa(input); 
  } 
  return goog.crypt.base64.encodeByteArray(goog.crypt.stringToByteArray(input), opt_webSafe); 
}; 
goog.crypt.base64.decodeString = function(input, opt_webSafe) { 
  if(goog.crypt.base64.HAS_NATIVE_SUPPORT && ! opt_webSafe) { 
    return goog.global.atob(input); 
  } 
  return goog.crypt.byteArrayToString(goog.crypt.base64.decodeStringToByteArray(input, opt_webSafe)); 
}; 
goog.crypt.base64.decodeStringToByteArray = function(input, opt_webSafe) { 
  goog.crypt.base64.init_(); 
  var charToByteMap = opt_webSafe ? goog.crypt.base64.charToByteMapWebSafe_: goog.crypt.base64.charToByteMap_; 
  var output =[]; 
  for(var i = 0; i < input.length;) { 
    var byte1 = charToByteMap[input.charAt(i ++)]; 
    var haveByte2 = i < input.length; 
    var byte2 = haveByte2 ? charToByteMap[input.charAt(i)]: 0; 
    ++ i; 
    var haveByte3 = i < input.length; 
    var byte3 = haveByte3 ? charToByteMap[input.charAt(i)]: 0; 
    ++ i; 
    var haveByte4 = i < input.length; 
    var byte4 = haveByte4 ? charToByteMap[input.charAt(i)]: 0; 
    ++ i; 
    if(byte1 == null || byte2 == null || byte3 == null || byte4 == null) { 
      throw Error(); 
    } 
    var outByte1 =(byte1 << 2) |(byte2 >> 4); 
    output.push(outByte1); 
    if(byte3 != 64) { 
      var outByte2 =((byte2 << 4) & 0xF0) |(byte3 >> 2); 
      output.push(outByte2); 
      if(byte4 != 64) { 
        var outByte3 =((byte3 << 6) & 0xC0) | byte4; 
        output.push(outByte3); 
      } 
    } 
  } 
  return output; 
}; 
goog.crypt.base64.init_ = function() { 
  if(! goog.crypt.base64.byteToCharMap_) { 
    goog.crypt.base64.byteToCharMap_ = { }; 
    goog.crypt.base64.charToByteMap_ = { }; 
    goog.crypt.base64.byteToCharMapWebSafe_ = { }; 
    goog.crypt.base64.charToByteMapWebSafe_ = { }; 
    for(var i = 0; i < goog.crypt.base64.ENCODED_VALS.length; i ++) { 
      goog.crypt.base64.byteToCharMap_[i]= goog.crypt.base64.ENCODED_VALS.charAt(i); 
      goog.crypt.base64.charToByteMap_[goog.crypt.base64.byteToCharMap_[i]]= i; 
      goog.crypt.base64.byteToCharMapWebSafe_[i]= goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(i); 
      goog.crypt.base64.charToByteMapWebSafe_[goog.crypt.base64.byteToCharMapWebSafe_[i]]= i; 
    } 
  } 
}; 
