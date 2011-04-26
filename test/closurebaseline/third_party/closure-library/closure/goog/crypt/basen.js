
goog.provide('goog.crypt.baseN'); 
goog.crypt.baseN.BASE_BINARY = '01'; 
goog.crypt.baseN.BASE_OCTAL = '01234567'; 
goog.crypt.baseN.BASE_DECIMAL = '0123456789'; 
goog.crypt.baseN.BASE_LOWERCASE_HEXADECIMAL = '0123456789abcdef'; 
goog.crypt.baseN.BASE_UPPERCASE_HEXADECIMAL = '0123456789ABCDEF'; 
goog.crypt.baseN.BASE_64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; 
goog.crypt.baseN.BASE_64_URL_SAFE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'; 
goog.crypt.baseN.recodeString = function(number, inputBase, outputBase) { 
  if(outputBase == '') { 
    throw Error('Empty output base'); 
  } 
  var isZero = true; 
  for(var i = 0, n = number.length; i < n; i ++) { 
    if(number.charAt(i) != inputBase.charAt(0)) { 
      isZero = false; 
      break; 
    } 
  } 
  if(isZero) { 
    return outputBase.charAt(0); 
  } 
  var numberDigits = goog.crypt.baseN.stringToArray_(number, inputBase); 
  var inputBaseSize = inputBase.length; 
  var outputBaseSize = outputBase.length; 
  var result =[]; 
  for(var i = numberDigits.length - 1; i >= 0; i --) { 
    var carry = 0; 
    for(var j = 0, n = result.length; j < n; j ++) { 
      var digit = result[j]; 
      digit = digit * inputBaseSize + carry; 
      if(digit >= outputBaseSize) { 
        var remainder = digit % outputBaseSize; 
        carry =(digit - remainder) / outputBaseSize; 
        digit = remainder; 
      } else { 
        carry = 0; 
      } 
      result[j]= digit; 
    } 
    while(carry) { 
      var remainder = carry % outputBaseSize; 
      result.push(remainder); 
      carry =(carry - remainder) / outputBaseSize; 
    } 
    carry = numberDigits[i]; 
    var j = 0; 
    while(carry) { 
      if(j >= result.length) { 
        result.push(0); 
      } 
      var digit = result[j]; 
      digit += carry; 
      if(digit >= outputBaseSize) { 
        var remainder = digit % outputBaseSize; 
        carry =(digit - remainder) / outputBaseSize; 
        digit = remainder; 
      } else { 
        carry = 0; 
      } 
      result[j]= digit; 
      j ++; 
    } 
  } 
  return goog.crypt.baseN.arrayToString_(result, outputBase); 
}; 
goog.crypt.baseN.stringToArray_ = function(number, base) { 
  var index = { }; 
  for(var i = 0, n = base.length; i < n; i ++) { 
    index[base.charAt(i)]= i; 
  } 
  var result =[]; 
  for(var i = number.length - 1; i >= 0; i --) { 
    var character = number.charAt(i); 
    var digit = index[character]; 
    if(typeof digit == 'undefined') { 
      throw Error('Number ' + number + ' contains a character not found in base ' + base + ', which is ' + character); 
    } 
    result.push(digit); 
  } 
  return result; 
}; 
goog.crypt.baseN.arrayToString_ = function(number, base) { 
  var n = number.length; 
  var chars =[]; 
  var baseSize = base.length; 
  for(var i = n - 1; i >= 0; i --) { 
    var digit = number[i]; 
    if(digit >= baseSize || digit < 0) { 
      throw Error('Number ' + number + ' contains an invalid digit: ' + digit); 
    } 
    chars.push(base.charAt(digit)); 
  } 
  return chars.join(''); 
}; 
