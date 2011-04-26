
goog.provide('goog.i18n.NumberFormat'); 
goog.require('goog.i18n.NumberFormatSymbols'); 
goog.require('goog.i18n.currencyCodeMap'); 
goog.i18n.NumberFormat = function(pattern, opt_currency) { 
  this.intlCurrencyCode_ = opt_currency || goog.i18n.NumberFormatSymbols.DEF_CURRENCY_CODE; 
  this.currencySymbol_ = goog.i18n.currencyCodeMap[this.intlCurrencyCode_]; 
  this.maximumIntegerDigits_ = 40; 
  this.minimumIntegerDigits_ = 1; 
  this.maximumFractionDigits_ = 3; 
  this.minimumFractionDigits_ = 0; 
  this.minExponentDigits_ = 0; 
  this.useSignForPositiveExponent_ = false; 
  this.positivePrefix_ = ''; 
  this.positiveSuffix_ = ''; 
  this.negativePrefix_ = '-'; 
  this.negativeSuffix_ = ''; 
  this.multiplier_ = 1; 
  this.groupingSize_ = 3; 
  this.decimalSeparatorAlwaysShown_ = false; 
  this.useExponentialNotation_ = false; 
  if(typeof pattern == 'number') { 
    this.applyStandardPattern_(pattern); 
  } else { 
    this.applyPattern_(pattern); 
  } 
}; 
goog.i18n.NumberFormat.Format = { 
  DECIMAL: 1, 
  SCIENTIFIC: 2, 
  PERCENT: 3, 
  CURRENCY: 4 
}; 
goog.i18n.NumberFormat.prototype.applyPattern_ = function(pattern) { 
  this.pattern_ = pattern.replace(/ /g, '\u00a0'); 
  var pos =[0]; 
  this.positivePrefix_ = this.parseAffix_(pattern, pos); 
  var trunkStart = pos[0]; 
  this.parseTrunk_(pattern, pos); 
  var trunkLen = pos[0]- trunkStart; 
  this.positiveSuffix_ = this.parseAffix_(pattern, pos); 
  if(pos[0]< pattern.length && pattern.charAt(pos[0]) == goog.i18n.NumberFormat.PATTERN_SEPARATOR_) { 
    pos[0]++; 
    this.negativePrefix_ = this.parseAffix_(pattern, pos); 
    pos[0]+= trunkLen; 
    this.negativeSuffix_ = this.parseAffix_(pattern, pos); 
  } else { 
    this.negativePrefix_ = this.positivePrefix_ + this.negativePrefix_; 
    this.negativeSuffix_ += this.positiveSuffix_; 
  } 
}; 
goog.i18n.NumberFormat.prototype.applyStandardPattern_ = function(patternType) { 
  switch(patternType) { 
    case goog.i18n.NumberFormat.Format.DECIMAL: 
      this.applyPattern_(goog.i18n.NumberFormatSymbols.DECIMAL_PATTERN); 
      break; 

    case goog.i18n.NumberFormat.Format.SCIENTIFIC: 
      this.applyPattern_(goog.i18n.NumberFormatSymbols.SCIENTIFIC_PATTERN); 
      break; 

    case goog.i18n.NumberFormat.Format.PERCENT: 
      this.applyPattern_(goog.i18n.NumberFormatSymbols.PERCENT_PATTERN); 
      break; 

    case goog.i18n.NumberFormat.Format.CURRENCY: 
      this.applyPattern_(goog.i18n.NumberFormatSymbols.CURRENCY_PATTERN); 
      break; 

    default: 
      throw Error('Unsupported pattern type.'); 

  } 
}; 
goog.i18n.NumberFormat.prototype.parse = function(text, opt_pos) { 
  var pos = opt_pos ||[0]; 
  var start = pos[0]; 
  var ret = NaN; 
  text = text.replace(/ /g, '\u00a0'); 
  var gotPositive = text.indexOf(this.positivePrefix_, pos[0]) == pos[0]; 
  var gotNegative = text.indexOf(this.negativePrefix_, pos[0]) == pos[0]; 
  if(gotPositive && gotNegative) { 
    if(this.positivePrefix_.length > this.negativePrefix_.length) { 
      gotNegative = false; 
    } else if(this.positivePrefix_.length < this.negativePrefix_.length) { 
      gotPositive = false; 
    } 
  } 
  if(gotPositive) { 
    pos[0]+= this.positivePrefix_.length; 
  } else if(gotNegative) { 
    pos[0]+= this.negativePrefix_.length; 
  } 
  if(text.indexOf(goog.i18n.NumberFormatSymbols.INFINITY, pos[0]) == pos[0]) { 
    pos[0]+= goog.i18n.NumberFormatSymbols.INFINITY.length; 
    ret = Infinity; 
  } else { 
    ret = this.parseNumber_(text, pos); 
  } 
  if(gotPositive) { 
    if(!(text.indexOf(this.positiveSuffix_, pos[0]) == pos[0])) { 
      return NaN; 
    } 
    pos[0]+= this.positiveSuffix_.length; 
  } else if(gotNegative) { 
    if(!(text.indexOf(this.negativeSuffix_, pos[0]) == pos[0])) { 
      return NaN; 
    } 
    pos[0]+= this.negativeSuffix_.length; 
  } 
  return gotNegative ? - ret: ret; 
}; 
goog.i18n.NumberFormat.prototype.parseNumber_ = function(text, pos) { 
  var sawDecimal = false; 
  var sawExponent = false; 
  var sawDigit = false; 
  var scale = 1; 
  var decimal = goog.i18n.NumberFormatSymbols.DECIMAL_SEP; 
  var grouping = goog.i18n.NumberFormatSymbols.GROUP_SEP; 
  var exponentChar = goog.i18n.NumberFormatSymbols.EXP_SYMBOL; 
  var normalizedText = ''; 
  for(; pos[0]< text.length; pos[0]++) { 
    var ch = text.charAt(pos[0]); 
    var digit = this.getDigit_(ch); 
    if(digit >= 0 && digit <= 9) { 
      normalizedText += digit; 
      sawDigit = true; 
    } else if(ch == decimal.charAt(0)) { 
      if(sawDecimal || sawExponent) { 
        break; 
      } 
      normalizedText += '.'; 
      sawDecimal = true; 
    } else if(ch == grouping.charAt(0) &&('\u00a0' != grouping.charAt(0) || pos[0]+ 1 < text.length && this.getDigit_(text.charAt(pos[0]+ 1)) >= 0)) { 
      if(sawDecimal || sawExponent) { 
        break; 
      } 
      continue; 
    } else if(ch == exponentChar.charAt(0)) { 
      if(sawExponent) { 
        break; 
      } 
      normalizedText += 'E'; 
      sawExponent = true; 
    } else if(ch == '+' || ch == '-') { 
      normalizedText += ch; 
    } else if(ch == goog.i18n.NumberFormatSymbols.PERCENT.charAt(0)) { 
      if(scale != 1) { 
        break; 
      } 
      scale = 100; 
      if(sawDigit) { 
        pos[0]++; 
        break; 
      } 
    } else if(ch == goog.i18n.NumberFormatSymbols.PERMILL.charAt(0)) { 
      if(scale != 1) { 
        break; 
      } 
      scale = 1000; 
      if(sawDigit) { 
        pos[0]++; 
        break; 
      } 
    } else { 
      break; 
    } 
  } 
  return parseFloat(normalizedText) / scale; 
}; 
goog.i18n.NumberFormat.prototype.format = function(number) { 
  if(isNaN(number)) { 
    return goog.i18n.NumberFormatSymbols.NAN; 
  } 
  var parts =[]; 
  var isNegative = number < 0.0 || number == 0.0 && 1 / number < 0.0; 
  parts.push(isNegative ? this.negativePrefix_: this.positivePrefix_); 
  if(! isFinite(number)) { 
    parts.push(goog.i18n.NumberFormatSymbols.INFINITY); 
  } else { 
    number *= isNegative ? - 1: 1; 
    number *= this.multiplier_; 
    this.useExponentialNotation_ ? this.subformatExponential_(number, parts): this.subformatFixed_(number, this.minimumIntegerDigits_, parts); 
  } 
  parts.push(isNegative ? this.negativeSuffix_: this.positiveSuffix_); 
  return parts.join(''); 
}; 
goog.i18n.NumberFormat.prototype.subformatFixed_ = function(number, minIntDigits, parts) { 
  var power = Math.pow(10, this.maximumFractionDigits_); 
  number = Math.round(number * power); 
  var intValue = Math.floor(number / power); 
  var fracValue = Math.floor(number - intValue * power); 
  var fractionPresent = this.minimumFractionDigits_ > 0 || fracValue > 0; 
  var intPart = ''; 
  var translatableInt = intValue; 
  while(translatableInt > 1E20) { 
    intPart = '0' + intPart; 
    translatableInt = Math.round(translatableInt / 10); 
  } 
  intPart = translatableInt + intPart; 
  var decimal = goog.i18n.NumberFormatSymbols.DECIMAL_SEP; 
  var grouping = goog.i18n.NumberFormatSymbols.GROUP_SEP; 
  var zeroCode = goog.i18n.NumberFormatSymbols.ZERO_DIGIT.charCodeAt(0); 
  var digitLen = intPart.length; 
  if(intValue > 0 || minIntDigits > 0) { 
    for(var i = digitLen; i < minIntDigits; i ++) { 
      parts.push(goog.i18n.NumberFormatSymbols.ZERO_DIGIT); 
    } 
    for(var i = 0; i < digitLen; i ++) { 
      parts.push(String.fromCharCode(zeroCode + intPart.charAt(i) * 1)); 
      if(digitLen - i > 1 && this.groupingSize_ > 0 &&((digitLen - i) % this.groupingSize_ == 1)) { 
        parts.push(grouping); 
      } 
    } 
  } else if(! fractionPresent) { 
    parts.push(goog.i18n.NumberFormatSymbols.ZERO_DIGIT); 
  } 
  if(this.decimalSeparatorAlwaysShown_ || fractionPresent) { 
    parts.push(decimal); 
  } 
  var fracPart = '' +(fracValue + power); 
  var fracLen = fracPart.length; 
  while(fracPart.charAt(fracLen - 1) == '0' && fracLen > this.minimumFractionDigits_ + 1) { 
    fracLen --; 
  } 
  for(var i = 1; i < fracLen; i ++) { 
    parts.push(String.fromCharCode(zeroCode + fracPart.charAt(i) * 1)); 
  } 
}; 
goog.i18n.NumberFormat.prototype.addExponentPart_ = function(exponent, parts) { 
  parts.push(goog.i18n.NumberFormatSymbols.EXP_SYMBOL); 
  if(exponent < 0) { 
    exponent = - exponent; 
    parts.push(goog.i18n.NumberFormatSymbols.MINUS_SIGN); 
  } else if(this.useSignForPositiveExponent_) { 
    parts.push(goog.i18n.NumberFormatSymbols.PLUS_SIGN); 
  } 
  var exponentDigits = '' + exponent; 
  for(var i = exponentDigits.length; i < this.minExponentDigits_; i ++) { 
    parts.push(goog.i18n.NumberFormatSymbols.ZERO_DIGIT); 
  } 
  parts.push(exponentDigits); 
}; 
goog.i18n.NumberFormat.prototype.subformatExponential_ = function(number, parts) { 
  if(number == 0.0) { 
    this.subformatFixed_(number, this.minimumIntegerDigits_, parts); 
    this.addExponentPart_(0, parts); 
    return; 
  } 
  var exponent = Math.floor(Math.log(number) / Math.log(10)); 
  number /= Math.pow(10, exponent); 
  var minIntDigits = this.minimumIntegerDigits_; 
  if(this.maximumIntegerDigits_ > 1 && this.maximumIntegerDigits_ > this.minimumIntegerDigits_) { 
    while((exponent % this.maximumIntegerDigits_) != 0) { 
      number *= 10; 
      exponent --; 
    } 
    minIntDigits = 1; 
  } else { 
    if(this.minimumIntegerDigits_ < 1) { 
      exponent ++; 
      number /= 10; 
    } else { 
      exponent -= this.minimumIntegerDigits_ - 1; 
      number *= Math.pow(10, this.minimumIntegerDigits_ - 1); 
    } 
  } 
  this.subformatFixed_(number, minIntDigits, parts); 
  this.addExponentPart_(exponent, parts); 
}; 
goog.i18n.NumberFormat.prototype.getDigit_ = function(ch) { 
  var code = ch.charCodeAt(0); 
  if(48 <= code && code < 58) { 
    return code - 48; 
  } else { 
    var zeroCode = goog.i18n.NumberFormatSymbols.ZERO_DIGIT.charCodeAt(0); 
    return zeroCode <= code && code < zeroCode + 10 ? code - zeroCode: - 1; 
  } 
}; 
goog.i18n.NumberFormat.PATTERN_ZERO_DIGIT_ = '0'; 
goog.i18n.NumberFormat.PATTERN_GROUPING_SEPARATOR_ = ','; 
goog.i18n.NumberFormat.PATTERN_DECIMAL_SEPARATOR_ = '.'; 
goog.i18n.NumberFormat.PATTERN_PER_MILLE_ = '\u2030'; 
goog.i18n.NumberFormat.PATTERN_PERCENT_ = '%'; 
goog.i18n.NumberFormat.PATTERN_DIGIT_ = '#'; 
goog.i18n.NumberFormat.PATTERN_SEPARATOR_ = ';'; 
goog.i18n.NumberFormat.PATTERN_EXPONENT_ = 'E'; 
goog.i18n.NumberFormat.PATTERN_PLUS_ = '+'; 
goog.i18n.NumberFormat.PATTERN_MINUS_ = '-'; 
goog.i18n.NumberFormat.PATTERN_CURRENCY_SIGN_ = '\u00A4'; 
goog.i18n.NumberFormat.QUOTE_ = '\''; 
goog.i18n.NumberFormat.prototype.parseAffix_ = function(pattern, pos) { 
  var affix = ''; 
  var inQuote = false; 
  var len = pattern.length; 
  for(; pos[0]< len; pos[0]++) { 
    var ch = pattern.charAt(pos[0]); 
    if(ch == goog.i18n.NumberFormat.QUOTE_) { 
      if(pos[0]+ 1 < len && pattern.charAt(pos[0]+ 1) == goog.i18n.NumberFormat.QUOTE_) { 
        pos[0]++; 
        affix += '\''; 
      } else { 
        inQuote = ! inQuote; 
      } 
      continue; 
    } 
    if(inQuote) { 
      affix += ch; 
    } else { 
      switch(ch) { 
        case goog.i18n.NumberFormat.PATTERN_DIGIT_: 
        case goog.i18n.NumberFormat.PATTERN_ZERO_DIGIT_: 
        case goog.i18n.NumberFormat.PATTERN_GROUPING_SEPARATOR_: 
        case goog.i18n.NumberFormat.PATTERN_DECIMAL_SEPARATOR_: 
        case goog.i18n.NumberFormat.PATTERN_SEPARATOR_: 
          return affix; 

        case goog.i18n.NumberFormat.PATTERN_CURRENCY_SIGN_: 
          if((pos[0]+ 1) < len && pattern.charAt(pos[0]+ 1) == goog.i18n.NumberFormat.PATTERN_CURRENCY_SIGN_) { 
            pos[0]++; 
            affix += this.intlCurrencyCode_; 
          } else { 
            affix += this.currencySymbol_; 
          } 
          break; 

        case goog.i18n.NumberFormat.PATTERN_PERCENT_: 
          if(this.multiplier_ != 1) { 
            throw Error('Too many percent/permill'); 
          } 
          this.multiplier_ = 100; 
          affix += goog.i18n.NumberFormatSymbols.PERCENT; 
          break; 

        case goog.i18n.NumberFormat.PATTERN_PER_MILLE_: 
          if(this.multiplier_ != 1) { 
            throw Error('Too many percent/permill'); 
          } 
          this.multiplier_ = 1000; 
          affix += goog.i18n.NumberFormatSymbols.PERMILL; 
          break; 

        default: 
          affix += ch; 

      } 
    } 
  } 
  return affix; 
}; 
goog.i18n.NumberFormat.prototype.parseTrunk_ = function(pattern, pos) { 
  var decimalPos = - 1; 
  var digitLeftCount = 0; 
  var zeroDigitCount = 0; 
  var digitRightCount = 0; 
  var groupingCount = - 1; 
  var len = pattern.length; 
  for(var loop = true; pos[0]< len && loop; pos[0]++) { 
    var ch = pattern.charAt(pos[0]); 
    switch(ch) { 
      case goog.i18n.NumberFormat.PATTERN_DIGIT_: 
        if(zeroDigitCount > 0) { 
          digitRightCount ++; 
        } else { 
          digitLeftCount ++; 
        } 
        if(groupingCount >= 0 && decimalPos < 0) { 
          groupingCount ++; 
        } 
        break; 

      case goog.i18n.NumberFormat.PATTERN_ZERO_DIGIT_: 
        if(digitRightCount > 0) { 
          throw Error('Unexpected "0" in pattern "' + pattern + '"'); 
        } 
        zeroDigitCount ++; 
        if(groupingCount >= 0 && decimalPos < 0) { 
          groupingCount ++; 
        } 
        break; 

      case goog.i18n.NumberFormat.PATTERN_GROUPING_SEPARATOR_: 
        groupingCount = 0; 
        break; 

      case goog.i18n.NumberFormat.PATTERN_DECIMAL_SEPARATOR_: 
        if(decimalPos >= 0) { 
          throw Error('Multiple decimal separators in pattern "' + pattern + '"'); 
        } 
        decimalPos = digitLeftCount + zeroDigitCount + digitRightCount; 
        break; 

      case goog.i18n.NumberFormat.PATTERN_EXPONENT_: 
        if(this.useExponentialNotation_) { 
          throw Error('Multiple exponential symbols in pattern "' + pattern + '"'); 
        } 
        this.useExponentialNotation_ = true; 
        this.minExponentDigits_ = 0; 
        if((pos[0]+ 1) < len && pattern.charAt(pos[0]+ 1) == goog.i18n.NumberFormat.PATTERN_PLUS_) { 
          pos[0]++; 
          this.useSignForPositiveExponent_ = true; 
        } 
        while((pos[0]+ 1) < len && pattern.charAt(pos[0]+ 1) == goog.i18n.NumberFormat.PATTERN_ZERO_DIGIT_) { 
          pos[0]++; 
          this.minExponentDigits_ ++; 
        } 
        if((digitLeftCount + zeroDigitCount) < 1 || this.minExponentDigits_ < 1) { 
          throw Error('Malformed exponential pattern "' + pattern + '"'); 
        } 
        loop = false; 
        break; 

      default: 
        pos[0]--; 
        loop = false; 
        break; 

    } 
  } 
  if(zeroDigitCount == 0 && digitLeftCount > 0 && decimalPos >= 0) { 
    var n = decimalPos; 
    if(n == 0) { 
      n ++; 
    } 
    digitRightCount = digitLeftCount - n; 
    digitLeftCount = n - 1; 
    zeroDigitCount = 1; 
  } 
  if(decimalPos < 0 && digitRightCount > 0 || decimalPos >= 0 &&(decimalPos < digitLeftCount || decimalPos > digitLeftCount + zeroDigitCount) || groupingCount == 0) { 
    throw Error('Malformed pattern "' + pattern + '"'); 
  } 
  var totalDigits = digitLeftCount + zeroDigitCount + digitRightCount; 
  this.maximumFractionDigits_ = decimalPos >= 0 ? totalDigits - decimalPos: 0; 
  if(decimalPos >= 0) { 
    this.minimumFractionDigits_ = digitLeftCount + zeroDigitCount - decimalPos; 
    if(this.minimumFractionDigits_ < 0) { 
      this.minimumFractionDigits_ = 0; 
    } 
  } 
  var effectiveDecimalPos = decimalPos >= 0 ? decimalPos: totalDigits; 
  this.minimumIntegerDigits_ = effectiveDecimalPos - digitLeftCount; 
  if(this.useExponentialNotation_) { 
    this.maximumIntegerDigits_ = digitLeftCount + this.minimumIntegerDigits_; 
    if(this.maximumFractionDigits_ == 0 && this.minimumIntegerDigits_ == 0) { 
      this.minimumIntegerDigits_ = 1; 
    } 
  } 
  this.groupingSize_ = Math.max(0, groupingCount); 
  this.decimalSeparatorAlwaysShown_ = decimalPos == 0 || decimalPos == totalDigits; 
}; 
