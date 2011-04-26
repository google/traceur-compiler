
goog.provide('goog.crypt.Arc4'); 
goog.require('goog.asserts'); 
goog.crypt.Arc4 = function() { 
  this.state_ =[]; 
  this.index1_ = 0; 
  this.index2_ = 0; 
}; 
goog.crypt.Arc4.prototype.setKey = function(key, opt_length) { 
  goog.asserts.assertArray(key, 'Key parameter must be a byte array'); 
  if(! opt_length) { 
    opt_length = key.length; 
  } 
  var state = this.state_; 
  for(var i = 0; i < 256; ++ i) { 
    state[i]= i; 
  } 
  var j = 0; 
  for(var i = 0; i < 256; ++ i) { 
    j =(j + state[i]+ key[i % opt_length]) & 255; 
    var tmp = state[i]; 
    state[i]= state[j]; 
    state[j]= tmp; 
  } 
  this.index1_ = 0; 
  this.index2_ = 0; 
}; 
goog.crypt.Arc4.prototype.discard = function(n) { 
  var devnul = new Array(n); 
  this.crypt(devnul); 
}; 
goog.crypt.Arc4.prototype.crypt = function(data, opt_length) { 
  if(! opt_length) { 
    opt_length = data.length; 
  } 
  goog.asserts.assertArray(data, 'Data parameter must be a byte array'); 
  var i = this.index1_; 
  var j = this.index2_; 
  var state = this.state_; 
  for(var n = 0; n < opt_length; ++ n) { 
    i =(i + 1) & 255; 
    j =(j + state[i]) & 255; 
    var tmp = state[i]; 
    state[i]= state[j]; 
    state[j]= tmp; 
    data[n]^= state[(state[i]+ state[j]) & 255]; 
  } 
  this.index1_ = i; 
  this.index2_ = j; 
}; 
