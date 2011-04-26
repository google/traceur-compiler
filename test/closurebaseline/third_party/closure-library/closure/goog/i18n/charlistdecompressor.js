
goog.provide('goog.i18n.CharListDecompressor'); 
goog.require('goog.array'); 
goog.require('goog.i18n.uChar'); 
goog.i18n.CharListDecompressor = function() { 
  this.buildCharMap_('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr' + 'stuvwxyz!#$%()*+,-.:;<=>?@[]^_`{|}~'); 
}; 
goog.i18n.CharListDecompressor.prototype.charMap_ = null; 
goog.i18n.CharListDecompressor.prototype.buildCharMap_ = function(str) { 
  if(! this.charMap_) { 
    this.charMap_ = { }; 
    for(var i = 0; i < str.length; i ++) { 
      this.charMap_[str.charAt(i)]= i; 
    } 
  } 
}; 
goog.i18n.CharListDecompressor.prototype.getCodeAt_ = function(str, start, leng) { 
  var result = 0; 
  for(var i = 0; i < leng; i ++) { 
    var c = this.charMap_[str.charAt(start + i)]; 
    result += c * Math.pow(88, i); 
  } 
  return result; 
}; 
goog.i18n.CharListDecompressor.prototype.addChars_ = function(list, lastcode, value, type) { 
  if(type == 0) { 
    lastcode += value + 1; 
    goog.array.extend(list, goog.i18n.uChar.fromCharCode(lastcode)); 
  } else if(type == 1) { 
    lastcode -= value + 1; 
    goog.array.extend(list, goog.i18n.uChar.fromCharCode(lastcode)); 
  } else if(type == 2) { 
    for(var i = 0; i <= value; i ++) { 
      lastcode ++; 
      goog.array.extend(list, goog.i18n.uChar.fromCharCode(lastcode)); 
    } 
  } 
  return lastcode; 
}; 
goog.i18n.CharListDecompressor.prototype.toCharList = function(str) { 
  var metasize = 8; 
  var result =[]; 
  var lastcode = 0; 
  var i = 0; 
  while(i < str.length) { 
    var c = this.charMap_[str.charAt(i)]; 
    var meta = c % metasize; 
    var type = Math.floor(meta / 3); 
    var leng =(meta % 3) + 1; 
    if(leng == 3) { 
      leng ++; 
    } 
    var code = this.getCodeAt_(str, i, leng); 
    var value = Math.floor(code / metasize); 
    lastcode = this.addChars_(result, lastcode, value, type); 
    i += leng; 
  } 
  return result; 
}; 
