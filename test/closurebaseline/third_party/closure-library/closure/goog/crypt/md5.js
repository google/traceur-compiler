
goog.provide('goog.crypt.Md5'); 
goog.require('goog.crypt.Hash'); 
goog.crypt.Md5 = function() { 
  goog.base(this); 
  this.chain_ = new Array(4); 
  this.block_ = new Array(64); 
  this.blockLength_ = 0; 
  this.totalLength_ = 0; 
  this.reset(); 
}; 
goog.inherits(goog.crypt.Md5, goog.crypt.Hash); 
goog.crypt.Md5.prototype.reset = function() { 
  this.chain_[0]= 0x67452301; 
  this.chain_[1]= 0xefcdab89; 
  this.chain_[2]= 0x98badcfe; 
  this.chain_[3]= 0x10325476; 
  this.blockLength_ = 0; 
  this.totalLength_ = 0; 
}; 
goog.crypt.Md5.prototype.compress_ = function() { 
  var X = new Array(16); 
  var block = this.block_; 
  for(var i = 0; i < 64; i += 4) { 
    X[i / 4]=(block[i]) |(block[i + 1]<< 8) |(block[i + 2]<< 16) |(block[i + 3]<< 24); 
  } 
  var A = this.chain_[0]; 
  var B = this.chain_[1]; 
  var C = this.chain_[2]; 
  var D = this.chain_[3]; 
  var sum = 0; 
  sum =(A +(D ^(B &(C ^ D))) + X[0]+ 0xd76aa478) & 0xffffffff; 
  A = B +(((sum << 7) & 0xffffffff) |(sum >>> 25)); 
  sum =(D +(C ^(A &(B ^ C))) + X[1]+ 0xe8c7b756) & 0xffffffff; 
  D = A +(((sum << 12) & 0xffffffff) |(sum >>> 20)); 
  sum =(C +(B ^(D &(A ^ B))) + X[2]+ 0x242070db) & 0xffffffff; 
  C = D +(((sum << 17) & 0xffffffff) |(sum >>> 15)); 
  sum =(B +(A ^(C &(D ^ A))) + X[3]+ 0xc1bdceee) & 0xffffffff; 
  B = C +(((sum << 22) & 0xffffffff) |(sum >>> 10)); 
  sum =(A +(D ^(B &(C ^ D))) + X[4]+ 0xf57c0faf) & 0xffffffff; 
  A = B +(((sum << 7) & 0xffffffff) |(sum >>> 25)); 
  sum =(D +(C ^(A &(B ^ C))) + X[5]+ 0x4787c62a) & 0xffffffff; 
  D = A +(((sum << 12) & 0xffffffff) |(sum >>> 20)); 
  sum =(C +(B ^(D &(A ^ B))) + X[6]+ 0xa8304613) & 0xffffffff; 
  C = D +(((sum << 17) & 0xffffffff) |(sum >>> 15)); 
  sum =(B +(A ^(C &(D ^ A))) + X[7]+ 0xfd469501) & 0xffffffff; 
  B = C +(((sum << 22) & 0xffffffff) |(sum >>> 10)); 
  sum =(A +(D ^(B &(C ^ D))) + X[8]+ 0x698098d8) & 0xffffffff; 
  A = B +(((sum << 7) & 0xffffffff) |(sum >>> 25)); 
  sum =(D +(C ^(A &(B ^ C))) + X[9]+ 0x8b44f7af) & 0xffffffff; 
  D = A +(((sum << 12) & 0xffffffff) |(sum >>> 20)); 
  sum =(C +(B ^(D &(A ^ B))) + X[10]+ 0xffff5bb1) & 0xffffffff; 
  C = D +(((sum << 17) & 0xffffffff) |(sum >>> 15)); 
  sum =(B +(A ^(C &(D ^ A))) + X[11]+ 0x895cd7be) & 0xffffffff; 
  B = C +(((sum << 22) & 0xffffffff) |(sum >>> 10)); 
  sum =(A +(D ^(B &(C ^ D))) + X[12]+ 0x6b901122) & 0xffffffff; 
  A = B +(((sum << 7) & 0xffffffff) |(sum >>> 25)); 
  sum =(D +(C ^(A &(B ^ C))) + X[13]+ 0xfd987193) & 0xffffffff; 
  D = A +(((sum << 12) & 0xffffffff) |(sum >>> 20)); 
  sum =(C +(B ^(D &(A ^ B))) + X[14]+ 0xa679438e) & 0xffffffff; 
  C = D +(((sum << 17) & 0xffffffff) |(sum >>> 15)); 
  sum =(B +(A ^(C &(D ^ A))) + X[15]+ 0x49b40821) & 0xffffffff; 
  B = C +(((sum << 22) & 0xffffffff) |(sum >>> 10)); 
  sum =(A +(C ^(D &(B ^ C))) + X[1]+ 0xf61e2562) & 0xffffffff; 
  A = B +(((sum << 5) & 0xffffffff) |(sum >>> 27)); 
  sum =(D +(B ^(C &(A ^ B))) + X[6]+ 0xc040b340) & 0xffffffff; 
  D = A +(((sum << 9) & 0xffffffff) |(sum >>> 23)); 
  sum =(C +(A ^(B &(D ^ A))) + X[11]+ 0x265e5a51) & 0xffffffff; 
  C = D +(((sum << 14) & 0xffffffff) |(sum >>> 18)); 
  sum =(B +(D ^(A &(C ^ D))) + X[0]+ 0xe9b6c7aa) & 0xffffffff; 
  B = C +(((sum << 20) & 0xffffffff) |(sum >>> 12)); 
  sum =(A +(C ^(D &(B ^ C))) + X[5]+ 0xd62f105d) & 0xffffffff; 
  A = B +(((sum << 5) & 0xffffffff) |(sum >>> 27)); 
  sum =(D +(B ^(C &(A ^ B))) + X[10]+ 0x02441453) & 0xffffffff; 
  D = A +(((sum << 9) & 0xffffffff) |(sum >>> 23)); 
  sum =(C +(A ^(B &(D ^ A))) + X[15]+ 0xd8a1e681) & 0xffffffff; 
  C = D +(((sum << 14) & 0xffffffff) |(sum >>> 18)); 
  sum =(B +(D ^(A &(C ^ D))) + X[4]+ 0xe7d3fbc8) & 0xffffffff; 
  B = C +(((sum << 20) & 0xffffffff) |(sum >>> 12)); 
  sum =(A +(C ^(D &(B ^ C))) + X[9]+ 0x21e1cde6) & 0xffffffff; 
  A = B +(((sum << 5) & 0xffffffff) |(sum >>> 27)); 
  sum =(D +(B ^(C &(A ^ B))) + X[14]+ 0xc33707d6) & 0xffffffff; 
  D = A +(((sum << 9) & 0xffffffff) |(sum >>> 23)); 
  sum =(C +(A ^(B &(D ^ A))) + X[3]+ 0xf4d50d87) & 0xffffffff; 
  C = D +(((sum << 14) & 0xffffffff) |(sum >>> 18)); 
  sum =(B +(D ^(A &(C ^ D))) + X[8]+ 0x455a14ed) & 0xffffffff; 
  B = C +(((sum << 20) & 0xffffffff) |(sum >>> 12)); 
  sum =(A +(C ^(D &(B ^ C))) + X[13]+ 0xa9e3e905) & 0xffffffff; 
  A = B +(((sum << 5) & 0xffffffff) |(sum >>> 27)); 
  sum =(D +(B ^(C &(A ^ B))) + X[2]+ 0xfcefa3f8) & 0xffffffff; 
  D = A +(((sum << 9) & 0xffffffff) |(sum >>> 23)); 
  sum =(C +(A ^(B &(D ^ A))) + X[7]+ 0x676f02d9) & 0xffffffff; 
  C = D +(((sum << 14) & 0xffffffff) |(sum >>> 18)); 
  sum =(B +(D ^(A &(C ^ D))) + X[12]+ 0x8d2a4c8a) & 0xffffffff; 
  B = C +(((sum << 20) & 0xffffffff) |(sum >>> 12)); 
  sum =(A +(B ^ C ^ D) + X[5]+ 0xfffa3942) & 0xffffffff; 
  A = B +(((sum << 4) & 0xffffffff) |(sum >>> 28)); 
  sum =(D +(A ^ B ^ C) + X[8]+ 0x8771f681) & 0xffffffff; 
  D = A +(((sum << 11) & 0xffffffff) |(sum >>> 21)); 
  sum =(C +(D ^ A ^ B) + X[11]+ 0x6d9d6122) & 0xffffffff; 
  C = D +(((sum << 16) & 0xffffffff) |(sum >>> 16)); 
  sum =(B +(C ^ D ^ A) + X[14]+ 0xfde5380c) & 0xffffffff; 
  B = C +(((sum << 23) & 0xffffffff) |(sum >>> 9)); 
  sum =(A +(B ^ C ^ D) + X[1]+ 0xa4beea44) & 0xffffffff; 
  A = B +(((sum << 4) & 0xffffffff) |(sum >>> 28)); 
  sum =(D +(A ^ B ^ C) + X[4]+ 0x4bdecfa9) & 0xffffffff; 
  D = A +(((sum << 11) & 0xffffffff) |(sum >>> 21)); 
  sum =(C +(D ^ A ^ B) + X[7]+ 0xf6bb4b60) & 0xffffffff; 
  C = D +(((sum << 16) & 0xffffffff) |(sum >>> 16)); 
  sum =(B +(C ^ D ^ A) + X[10]+ 0xbebfbc70) & 0xffffffff; 
  B = C +(((sum << 23) & 0xffffffff) |(sum >>> 9)); 
  sum =(A +(B ^ C ^ D) + X[13]+ 0x289b7ec6) & 0xffffffff; 
  A = B +(((sum << 4) & 0xffffffff) |(sum >>> 28)); 
  sum =(D +(A ^ B ^ C) + X[0]+ 0xeaa127fa) & 0xffffffff; 
  D = A +(((sum << 11) & 0xffffffff) |(sum >>> 21)); 
  sum =(C +(D ^ A ^ B) + X[3]+ 0xd4ef3085) & 0xffffffff; 
  C = D +(((sum << 16) & 0xffffffff) |(sum >>> 16)); 
  sum =(B +(C ^ D ^ A) + X[6]+ 0x04881d05) & 0xffffffff; 
  B = C +(((sum << 23) & 0xffffffff) |(sum >>> 9)); 
  sum =(A +(B ^ C ^ D) + X[9]+ 0xd9d4d039) & 0xffffffff; 
  A = B +(((sum << 4) & 0xffffffff) |(sum >>> 28)); 
  sum =(D +(A ^ B ^ C) + X[12]+ 0xe6db99e5) & 0xffffffff; 
  D = A +(((sum << 11) & 0xffffffff) |(sum >>> 21)); 
  sum =(C +(D ^ A ^ B) + X[15]+ 0x1fa27cf8) & 0xffffffff; 
  C = D +(((sum << 16) & 0xffffffff) |(sum >>> 16)); 
  sum =(B +(C ^ D ^ A) + X[2]+ 0xc4ac5665) & 0xffffffff; 
  B = C +(((sum << 23) & 0xffffffff) |(sum >>> 9)); 
  sum =(A +(C ^(B |(~ D))) + X[0]+ 0xf4292244) & 0xffffffff; 
  A = B +(((sum << 6) & 0xffffffff) |(sum >>> 26)); 
  sum =(D +(B ^(A |(~ C))) + X[7]+ 0x432aff97) & 0xffffffff; 
  D = A +(((sum << 10) & 0xffffffff) |(sum >>> 22)); 
  sum =(C +(A ^(D |(~ B))) + X[14]+ 0xab9423a7) & 0xffffffff; 
  C = D +(((sum << 15) & 0xffffffff) |(sum >>> 17)); 
  sum =(B +(D ^(C |(~ A))) + X[5]+ 0xfc93a039) & 0xffffffff; 
  B = C +(((sum << 21) & 0xffffffff) |(sum >>> 11)); 
  sum =(A +(C ^(B |(~ D))) + X[12]+ 0x655b59c3) & 0xffffffff; 
  A = B +(((sum << 6) & 0xffffffff) |(sum >>> 26)); 
  sum =(D +(B ^(A |(~ C))) + X[3]+ 0x8f0ccc92) & 0xffffffff; 
  D = A +(((sum << 10) & 0xffffffff) |(sum >>> 22)); 
  sum =(C +(A ^(D |(~ B))) + X[10]+ 0xffeff47d) & 0xffffffff; 
  C = D +(((sum << 15) & 0xffffffff) |(sum >>> 17)); 
  sum =(B +(D ^(C |(~ A))) + X[1]+ 0x85845dd1) & 0xffffffff; 
  B = C +(((sum << 21) & 0xffffffff) |(sum >>> 11)); 
  sum =(A +(C ^(B |(~ D))) + X[8]+ 0x6fa87e4f) & 0xffffffff; 
  A = B +(((sum << 6) & 0xffffffff) |(sum >>> 26)); 
  sum =(D +(B ^(A |(~ C))) + X[15]+ 0xfe2ce6e0) & 0xffffffff; 
  D = A +(((sum << 10) & 0xffffffff) |(sum >>> 22)); 
  sum =(C +(A ^(D |(~ B))) + X[6]+ 0xa3014314) & 0xffffffff; 
  C = D +(((sum << 15) & 0xffffffff) |(sum >>> 17)); 
  sum =(B +(D ^(C |(~ A))) + X[13]+ 0x4e0811a1) & 0xffffffff; 
  B = C +(((sum << 21) & 0xffffffff) |(sum >>> 11)); 
  sum =(A +(C ^(B |(~ D))) + X[4]+ 0xf7537e82) & 0xffffffff; 
  A = B +(((sum << 6) & 0xffffffff) |(sum >>> 26)); 
  sum =(D +(B ^(A |(~ C))) + X[11]+ 0xbd3af235) & 0xffffffff; 
  D = A +(((sum << 10) & 0xffffffff) |(sum >>> 22)); 
  sum =(C +(A ^(D |(~ B))) + X[2]+ 0x2ad7d2bb) & 0xffffffff; 
  C = D +(((sum << 15) & 0xffffffff) |(sum >>> 17)); 
  sum =(B +(D ^(C |(~ A))) + X[9]+ 0xeb86d391) & 0xffffffff; 
  B = C +(((sum << 21) & 0xffffffff) |(sum >>> 11)); 
  this.chain_[0]=(this.chain_[0]+ A) & 0xffffffff; 
  this.chain_[1]=(this.chain_[1]+ B) & 0xffffffff; 
  this.chain_[2]=(this.chain_[2]+ C) & 0xffffffff; 
  this.chain_[3]=(this.chain_[3]+ D) & 0xffffffff; 
}; 
goog.crypt.Md5.prototype.update = function(bytes, opt_length) { 
  if(! goog.isDef(opt_length)) { 
    opt_length = bytes.length; 
  } 
  var block = this.block_; 
  var blockLength = this.blockLength_; 
  for(var i = 0; i < opt_length; ++ i) { 
    block[blockLength ++]= bytes[i]; 
    if(blockLength == 64) { 
      this.compress_(); 
      blockLength = 0; 
    } 
  } 
  this.blockLength_ = blockLength; 
  this.totalLength_ += opt_length; 
}; 
goog.crypt.Md5.prototype.digest = function() { 
  var pad = new Array((this.blockLength_ < 56 ? 64: 128) - this.blockLength_); 
  pad[0]= 0x80; 
  for(var i = 1; i < pad.length - 8; ++ i) { 
    pad[i]= 0; 
  } 
  var totalBits = this.totalLength_ * 8; 
  for(var i = pad.length - 8; i < pad.length; ++ i) { 
    pad[i]= totalBits & 0xff; 
    totalBits /= 0x100; 
  } 
  this.update(pad); 
  var digest = new Array(16); 
  var n = 0; 
  for(var i = 0; i < 4; ++ i) { 
    for(var j = 0; j < 32; j += 8) { 
      digest[n ++]=(this.chain_[i]>>> j) & 0xff; 
    } 
  } 
  return digest; 
}; 
