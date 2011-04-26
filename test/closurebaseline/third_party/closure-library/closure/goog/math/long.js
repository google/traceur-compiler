
goog.provide('goog.math.Long'); 
goog.math.Long = function(low, high) { 
  this.low_ = low | 0; 
  this.high_ = high | 0; 
}; 
goog.math.Long.IntCache_ = { }; 
goog.math.Long.fromInt = function(value) { 
  if(- 128 <= value && value < 128) { 
    var cachedObj = goog.math.Long.IntCache_[value]; 
    if(cachedObj) { 
      return cachedObj; 
    } 
  } 
  var obj = new goog.math.Long(value | 0, value < 0 ? - 1: 0); 
  if(- 128 <= value && value < 128) { 
    goog.math.Long.IntCache_[value]= obj; 
  } 
  return obj; 
}; 
goog.math.Long.fromNumber = function(value) { 
  if(isNaN(value) || ! isFinite(value)) { 
    return goog.math.Long.ZERO; 
  } else if(value <= - goog.math.Long.TWO_PWR_63_DBL_) { 
    return goog.math.Long.MIN_VALUE; 
  } else if(value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) { 
    return goog.math.Long.MAX_VALUE; 
  } else if(value < 0) { 
    return goog.math.Long.fromNumber(- value).negate(); 
  } else { 
    return new goog.math.Long((value % goog.math.Long.TWO_PWR_32_DBL_) | 0,(value / goog.math.Long.TWO_PWR_32_DBL_) | 0); 
  } 
}; 
goog.math.Long.fromBits = function(lowBits, highBits) { 
  return new goog.math.Long(lowBits, highBits); 
}; 
goog.math.Long.fromString = function(str, opt_radix) { 
  if(str.length == 0) { 
    throw Error('number format error: empty string'); 
  } 
  var radix = opt_radix || 10; 
  if(radix < 2 || 36 < radix) { 
    throw Error('radix out of range: ' + radix); 
  } 
  if(str.charAt(0) == '-') { 
    return goog.math.Long.fromString(str.substring(1), radix).negate(); 
  } else if(str.indexOf('-') >= 0) { 
    throw Error('number format error: interior "-" character: ' + str); 
  } 
  var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8)); 
  var result = goog.math.Long.ZERO; 
  for(var i = 0; i < str.length; i += 8) { 
    var size = Math.min(8, str.length - i); 
    var value = parseInt(str.substring(i, i + size), radix); 
    if(size < 8) { 
      var power = goog.math.Long.fromNumber(Math.pow(radix, size)); 
      result = result.multiply(power).add(goog.math.Long.fromNumber(value)); 
    } else { 
      result = result.multiply(radixToPower); 
      result = result.add(goog.math.Long.fromNumber(value)); 
    } 
  } 
  return result; 
}; 
goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16; 
goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24; 
goog.math.Long.TWO_PWR_32_DBL_ = goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_; 
goog.math.Long.TWO_PWR_31_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ / 2; 
goog.math.Long.TWO_PWR_48_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_; 
goog.math.Long.TWO_PWR_64_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_; 
goog.math.Long.TWO_PWR_63_DBL_ = goog.math.Long.TWO_PWR_64_DBL_ / 2; 
goog.math.Long.ZERO = goog.math.Long.fromInt(0); 
goog.math.Long.ONE = goog.math.Long.fromInt(1); 
goog.math.Long.NEG_ONE = goog.math.Long.fromInt(- 1); 
goog.math.Long.MAX_VALUE = goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0); 
goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0); 
goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24); 
goog.math.Long.prototype.toInt = function() { 
  return this.low_; 
}; 
goog.math.Long.prototype.toNumber = function() { 
  return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned(); 
}; 
goog.math.Long.prototype.toString = function(opt_radix) { 
  var radix = opt_radix || 10; 
  if(radix < 2 || 36 < radix) { 
    throw Error('radix out of range: ' + radix); 
  } 
  if(this.isZero()) { 
    return '0'; 
  } 
  if(this.isNegative()) { 
    if(this.equals(goog.math.Long.MIN_VALUE)) { 
      var radixLong = goog.math.Long.fromNumber(radix); 
      var div = this.div(radixLong); 
      var rem = div.multiply(radixLong).subtract(this); 
      return div.toString(radix) + rem.toInt().toString(radix); 
    } else { 
      return '-' + this.negate().toString(radix); 
    } 
  } 
  var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6)); 
  var rem = this; 
  var result = ''; 
  while(true) { 
    var remDiv = rem.div(radixToPower); 
    var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt(); 
    var digits = intval.toString(radix); 
    rem = remDiv; 
    if(rem.isZero()) { 
      return digits + result; 
    } else { 
      while(digits.length < 6) { 
        digits = '0' + digits; 
      } 
      result = '' + digits + result; 
    } 
  } 
}; 
goog.math.Long.prototype.getHighBits = function() { 
  return this.high_; 
}; 
goog.math.Long.prototype.getLowBits = function() { 
  return this.low_; 
}; 
goog.math.Long.prototype.getLowBitsUnsigned = function() { 
  return(this.low_ >= 0) ? this.low_: goog.math.Long.TWO_PWR_32_DBL_ + this.low_; 
}; 
goog.math.Long.prototype.getNumBitsAbs = function() { 
  if(this.isNegative()) { 
    if(this.equals(goog.math.Long.MIN_VALUE)) { 
      return 64; 
    } else { 
      return this.negate().getNumBitsAbs(); 
    } 
  } else { 
    var val = this.high_ != 0 ? this.high_: this.low_; 
    for(var bit = 31; bit > 0; bit --) { 
      if((val &(1 << bit)) != 0) { 
        break; 
      } 
    } 
    return this.high_ != 0 ? bit + 33: bit + 1; 
  } 
}; 
goog.math.Long.prototype.isZero = function() { 
  return this.high_ == 0 && this.low_ == 0; 
}; 
goog.math.Long.prototype.isNegative = function() { 
  return this.high_ < 0; 
}; 
goog.math.Long.prototype.isOdd = function() { 
  return(this.low_ & 1) == 1; 
}; 
goog.math.Long.prototype.equals = function(other) { 
  return(this.high_ == other.high_) &&(this.low_ == other.low_); 
}; 
goog.math.Long.prototype.notEquals = function(other) { 
  return(this.high_ != other.high_) ||(this.low_ != other.low_); 
}; 
goog.math.Long.prototype.lessThan = function(other) { 
  return this.compare(other) < 0; 
}; 
goog.math.Long.prototype.lessThanOrEqual = function(other) { 
  return this.compare(other) <= 0; 
}; 
goog.math.Long.prototype.greaterThan = function(other) { 
  return this.compare(other) > 0; 
}; 
goog.math.Long.prototype.greaterThanOrEqual = function(other) { 
  return this.compare(other) >= 0; 
}; 
goog.math.Long.prototype.compare = function(other) { 
  if(this.equals(other)) { 
    return 0; 
  } 
  var thisNeg = this.isNegative(); 
  var otherNeg = other.isNegative(); 
  if(thisNeg && ! otherNeg) { 
    return - 1; 
  } 
  if(! thisNeg && otherNeg) { 
    return 1; 
  } 
  if(this.subtract(other).isNegative()) { 
    return - 1; 
  } else { 
    return 1; 
  } 
}; 
goog.math.Long.prototype.negate = function() { 
  if(this.equals(goog.math.Long.MIN_VALUE)) { 
    return goog.math.Long.MIN_VALUE; 
  } else { 
    return this.not().add(goog.math.Long.ONE); 
  } 
}; 
goog.math.Long.prototype.add = function(other) { 
  var a48 = this.high_ >>> 16; 
  var a32 = this.high_ & 0xFFFF; 
  var a16 = this.low_ >>> 16; 
  var a00 = this.low_ & 0xFFFF; 
  var b48 = other.high_ >>> 16; 
  var b32 = other.high_ & 0xFFFF; 
  var b16 = other.low_ >>> 16; 
  var b00 = other.low_ & 0xFFFF; 
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0; 
  c00 += a00 + b00; 
  c16 += c00 >>> 16; 
  c00 &= 0xFFFF; 
  c16 += a16 + b16; 
  c32 += c16 >>> 16; 
  c16 &= 0xFFFF; 
  c32 += a32 + b32; 
  c48 += c32 >>> 16; 
  c32 &= 0xFFFF; 
  c48 += a48 + b48; 
  c48 &= 0xFFFF; 
  return goog.math.Long.fromBits((c16 << 16) | c00,(c48 << 16) | c32); 
}; 
goog.math.Long.prototype.subtract = function(other) { 
  return this.add(other.negate()); 
}; 
goog.math.Long.prototype.multiply = function(other) { 
  if(this.isZero()) { 
    return goog.math.Long.ZERO; 
  } else if(other.isZero()) { 
    return goog.math.Long.ZERO; 
  } 
  if(this.equals(goog.math.Long.MIN_VALUE)) { 
    return other.isOdd() ? goog.math.Long.MIN_VALUE: goog.math.Long.ZERO; 
  } else if(other.equals(goog.math.Long.MIN_VALUE)) { 
    return this.isOdd() ? goog.math.Long.MIN_VALUE: goog.math.Long.ZERO; 
  } 
  if(this.isNegative()) { 
    if(other.isNegative()) { 
      return this.negate().multiply(other.negate()); 
    } else { 
      return this.negate().multiply(other).negate(); 
    } 
  } else if(other.isNegative()) { 
    return this.multiply(other.negate()).negate(); 
  } 
  if(this.lessThan(goog.math.Long.TWO_PWR_24_) && other.lessThan(goog.math.Long.TWO_PWR_24_)) { 
    return goog.math.Long.fromNumber(this.toNumber() * other.toNumber()); 
  } 
  var a48 = this.high_ >>> 16; 
  var a32 = this.high_ & 0xFFFF; 
  var a16 = this.low_ >>> 16; 
  var a00 = this.low_ & 0xFFFF; 
  var b48 = other.high_ >>> 16; 
  var b32 = other.high_ & 0xFFFF; 
  var b16 = other.low_ >>> 16; 
  var b00 = other.low_ & 0xFFFF; 
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0; 
  c00 += a00 * b00; 
  c16 += c00 >>> 16; 
  c00 &= 0xFFFF; 
  c16 += a16 * b00; 
  c32 += c16 >>> 16; 
  c16 &= 0xFFFF; 
  c16 += a00 * b16; 
  c32 += c16 >>> 16; 
  c16 &= 0xFFFF; 
  c32 += a32 * b00; 
  c48 += c32 >>> 16; 
  c32 &= 0xFFFF; 
  c32 += a16 * b16; 
  c48 += c32 >>> 16; 
  c32 &= 0xFFFF; 
  c32 += a00 * b32; 
  c48 += c32 >>> 16; 
  c32 &= 0xFFFF; 
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48; 
  c48 &= 0xFFFF; 
  return goog.math.Long.fromBits((c16 << 16) | c00,(c48 << 16) | c32); 
}; 
goog.math.Long.prototype.div = function(other) { 
  if(other.isZero()) { 
    throw Error('division by zero'); 
  } else if(this.isZero()) { 
    return goog.math.Long.ZERO; 
  } 
  if(this.equals(goog.math.Long.MIN_VALUE)) { 
    if(other.equals(goog.math.Long.ONE) || other.equals(goog.math.Long.NEG_ONE)) { 
      return goog.math.Long.MIN_VALUE; 
    } else if(other.equals(goog.math.Long.MIN_VALUE)) { 
      return goog.math.Long.ONE; 
    } else { 
      var halfThis = this.shiftRight(1); 
      var approx = halfThis.div(other).shiftLeft(1); 
      if(approx.equals(goog.math.Long.ZERO)) { 
        return other.isNegative() ? goog.math.Long.ONE: goog.math.Long.NEG_ONE; 
      } else { 
        var rem = this.subtract(other.multiply(approx)); 
        var result = approx.add(rem.div(other)); 
        return result; 
      } 
    } 
  } else if(other.equals(goog.math.Long.MIN_VALUE)) { 
    return goog.math.Long.ZERO; 
  } 
  if(this.isNegative()) { 
    if(other.isNegative()) { 
      return this.negate().div(other.negate()); 
    } else { 
      return this.negate().div(other).negate(); 
    } 
  } else if(other.isNegative()) { 
    return this.div(other.negate()).negate(); 
  } 
  var res = goog.math.Long.ZERO; 
  var rem = this; 
  while(rem.greaterThanOrEqual(other)) { 
    var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber())); 
    var log2 = Math.ceil(Math.log(approx) / Math.LN2); 
    var delta =(log2 <= 48) ? 1: Math.pow(2, log2 - 48); 
    var approxRes = goog.math.Long.fromNumber(approx); 
    var approxRem = approxRes.multiply(other); 
    while(approxRem.isNegative() || approxRem.greaterThan(rem)) { 
      approx -= delta; 
      approxRes = goog.math.Long.fromNumber(approx); 
      approxRem = approxRes.multiply(other); 
    } 
    if(approxRes.isZero()) { 
      approxRes = goog.math.Long.ONE; 
    } 
    res = res.add(approxRes); 
    rem = rem.subtract(approxRem); 
  } 
  return res; 
}; 
goog.math.Long.prototype.modulo = function(other) { 
  return this.subtract(this.div(other).multiply(other)); 
}; 
goog.math.Long.prototype.not = function() { 
  return goog.math.Long.fromBits(~ this.low_, ~ this.high_); 
}; 
goog.math.Long.prototype.and = function(other) { 
  return goog.math.Long.fromBits(this.low_ & other.low_, this.high_ & other.high_); 
}; 
goog.math.Long.prototype.or = function(other) { 
  return goog.math.Long.fromBits(this.low_ | other.low_, this.high_ | other.high_); 
}; 
goog.math.Long.prototype.xor = function(other) { 
  return goog.math.Long.fromBits(this.low_ ^ other.low_, this.high_ ^ other.high_); 
}; 
goog.math.Long.prototype.shiftLeft = function(numBits) { 
  numBits &= 63; 
  if(numBits == 0) { 
    return this; 
  } else { 
    var low = this.low_; 
    if(numBits < 32) { 
      var high = this.high_; 
      return goog.math.Long.fromBits(low << numBits,(high << numBits) |(low >>>(32 - numBits))); 
    } else { 
      return goog.math.Long.fromBits(0, low <<(numBits - 32)); 
    } 
  } 
}; 
goog.math.Long.prototype.shiftRight = function(numBits) { 
  numBits &= 63; 
  if(numBits == 0) { 
    return this; 
  } else { 
    var high = this.high_; 
    if(numBits < 32) { 
      var low = this.low_; 
      return goog.math.Long.fromBits((low >>> numBits) |(high <<(32 - numBits)), high >> numBits); 
    } else { 
      return goog.math.Long.fromBits(high >>(numBits - 32), high >= 0 ? 0: - 1); 
    } 
  } 
}; 
goog.math.Long.prototype.shiftRightUnsigned = function(numBits) { 
  numBits &= 63; 
  if(numBits == 0) { 
    return this; 
  } else { 
    var high = this.high_; 
    if(numBits < 32) { 
      var low = this.low_; 
      return goog.math.Long.fromBits((low >>> numBits) |(high <<(32 - numBits)), high >>> numBits); 
    } else if(numBits == 32) { 
      return goog.math.Long.fromBits(high, 0); 
    } else { 
      return goog.math.Long.fromBits(high >>>(numBits - 32), 0); 
    } 
  } 
}; 
