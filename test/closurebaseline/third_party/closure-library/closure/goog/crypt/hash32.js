
goog.provide('goog.crypt.hash32'); 
goog.require('goog.crypt'); 
goog.crypt.hash32.SEED32 = 314159265; 
goog.crypt.hash32.CONSTANT32 = - 1640531527; 
goog.crypt.hash32.encodeString = function(str) { 
  return goog.crypt.hash32.encodeByteArray(goog.crypt.stringToByteArray(str)); 
}; 
goog.crypt.hash32.encodeStringUtf8 = function(str) { 
  return goog.crypt.hash32.encodeByteArray(goog.crypt.stringToUtf8ByteArray(str)); 
}; 
goog.crypt.hash32.encodeInteger = function(value) { 
  return goog.crypt.hash32.mix32_({ 
    a: value, 
    b: goog.crypt.hash32.CONSTANT32, 
    c: goog.crypt.hash32.SEED32 
  }); 
}; 
goog.crypt.hash32.encodeByteArray = function(bytes, opt_offset, opt_length, opt_seed) { 
  var offset = opt_offset || 0; 
  var length = opt_length || bytes.length; 
  var seed = opt_seed || goog.crypt.hash32.SEED32; 
  var mix = { 
    a: goog.crypt.hash32.CONSTANT32, 
    b: goog.crypt.hash32.CONSTANT32, 
    c: seed 
  }; 
  var keylen; 
  for(keylen = length; keylen >= 12; keylen -= 12, offset += 12) { 
    mix.a += goog.crypt.hash32.wordAt_(bytes, offset); 
    mix.b += goog.crypt.hash32.wordAt_(bytes, offset + 4); 
    mix.c += goog.crypt.hash32.wordAt_(bytes, offset + 8); 
    goog.crypt.hash32.mix32_(mix); 
  } 
  mix.c += length; 
  switch(keylen) { 
    case 11: 
      mix.c +=(bytes[offset + 10]) << 24; 

    case 10: 
      mix.c +=(bytes[offset + 9]& 0xff) << 16; 

    case 9: 
      mix.c +=(bytes[offset + 8]& 0xff) << 8; 

    case 8: 
      mix.b += goog.crypt.hash32.wordAt_(bytes, offset + 4); 
      mix.a += goog.crypt.hash32.wordAt_(bytes, offset); 
      break; 

    case 7: 
      mix.b +=(bytes[offset + 6]& 0xff) << 16; 

    case 6: 
      mix.b +=(bytes[offset + 5]& 0xff) << 8; 

    case 5: 
      mix.b +=(bytes[offset + 4]& 0xff); 

    case 4: 
      mix.a += goog.crypt.hash32.wordAt_(bytes, offset); 
      break; 

    case 3: 
      mix.a +=(bytes[offset + 2]& 0xff) << 16; 

    case 2: 
      mix.a +=(bytes[offset + 1]& 0xff) << 8; 

    case 1: 
      mix.a +=(bytes[offset + 0]& 0xff); 

  } 
  return goog.crypt.hash32.mix32_(mix); 
}; 
goog.crypt.hash32.mix32_ = function(mix) { 
  var a = mix.a, b = mix.b, c = mix.c; 
  a -= b; 
  a -= c; 
  a ^= c >>> 13; 
  b -= c; 
  b -= a; 
  b ^= a << 8; 
  c -= a; 
  c -= b; 
  c ^= b >>> 13; 
  a -= b; 
  a -= c; 
  a ^= c >>> 12; 
  b -= c; 
  b -= a; 
  b ^= a << 16; 
  c -= a; 
  c -= b; 
  c ^= b >>> 5; 
  a -= b; 
  a -= c; 
  a ^= c >>> 3; 
  b -= c; 
  b -= a; 
  b ^= a << 10; 
  c -= a; 
  c -= b; 
  c ^= b >>> 15; 
  mix.a = a; 
  mix.b = b; 
  mix.c = c; 
  return c; 
}; 
goog.crypt.hash32.wordAt_ = function(bytes, offset) { 
  var a = goog.crypt.hash32.toSigned_(bytes[offset + 0]); 
  var b = goog.crypt.hash32.toSigned_(bytes[offset + 1]); 
  var c = goog.crypt.hash32.toSigned_(bytes[offset + 2]); 
  var d = goog.crypt.hash32.toSigned_(bytes[offset + 3]); 
  return a +(b << 8) +(c << 16) +(d << 24); 
}; 
goog.crypt.hash32.toSigned_ = function(n) { 
  return n > 127 ? n - 256: n; 
}; 
