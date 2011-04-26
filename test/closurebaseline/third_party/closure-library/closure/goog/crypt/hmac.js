
goog.provide('goog.crypt.Hmac'); 
goog.require('goog.asserts'); 
goog.require('goog.crypt.Hash'); 
goog.crypt.Hmac = function(hasher, key, opt_blockSize) { 
  goog.base(this); 
  this.hasher_ = hasher; 
  this.blockSize_ = opt_blockSize || 16; 
  this.keyO_ = new Array(this.blockSize_); 
  this.keyI_ = new Array(this.blockSize_); 
  this.initialize_(key); 
}; 
goog.inherits(goog.crypt.Hmac, goog.crypt.Hash); 
goog.crypt.Hmac.OPAD_ = 0x5c; 
goog.crypt.Hmac.IPAD_ = 0x36; 
goog.crypt.Hmac.prototype.initialize_ = function(key) { 
  if(key.length > this.blockSize_) { 
    this.hasher_.update(key); 
    key = this.hasher_.digest(); 
  } 
  var keyByte; 
  for(var i = 0; i < this.blockSize_; i ++) { 
    if(i < key.length) { 
      keyByte = key[i]; 
    } else { 
      keyByte = 0; 
    } 
    this.keyO_[i]= keyByte ^ goog.crypt.Hmac.OPAD_; 
    this.keyI_[i]= keyByte ^ goog.crypt.Hmac.IPAD_; 
  } 
  this.hasher_.update(this.keyI_); 
}; 
goog.crypt.Hmac.prototype.reset = function() { 
  this.hasher_.reset(); 
  this.hasher_.update(this.keyI_); 
}; 
goog.crypt.Hmac.prototype.update = function(bytes, opt_length) { 
  this.hasher_.update(bytes, opt_length); 
}; 
goog.crypt.Hmac.prototype.digest = function() { 
  var temp = this.hasher_.digest(); 
  this.hasher_.reset(); 
  this.hasher_.update(this.keyO_); 
  this.hasher_.update(temp); 
  return this.hasher_.digest(); 
}; 
goog.crypt.Hmac.prototype.getHmac = function(message) { 
  this.reset(); 
  this.update(message); 
  return this.digest(); 
}; 
