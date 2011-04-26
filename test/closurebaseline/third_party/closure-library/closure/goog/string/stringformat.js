
goog.provide('goog.string.format'); 
goog.require('goog.string'); 
goog.string.format = function(formatString, var_args) { 
  var args = Array.prototype.slice.call(arguments); 
  var template = args.shift(); 
  if(typeof template == 'undefined') { 
    throw Error('[goog.string.format] Template required'); 
  } 
  var formatRe = /%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g; 
  function replacerDemuxer(match, flags, width, dotp, precision, type, offset, wholeString) { 
    if(type == '%') { 
      return '%'; 
    } 
    var value = args.shift(); 
    if(typeof value == 'undefined') { 
      throw Error('[goog.string.format] Not enough arguments'); 
    } 
    arguments[0]= value; 
    return goog.string.format.demuxes_[type].apply(null, arguments); 
  } 
  return template.replace(formatRe, replacerDemuxer); 
}; 
goog.string.format.demuxes_ = { }; 
goog.string.format.demuxes_['s']= function(value, flags, width, dotp, precision, type, offset, wholeString) { 
  var replacement = value; 
  if(isNaN(width) || replacement.length >= width) { 
    return replacement; 
  } 
  if(flags.indexOf('-', 0) > - 1) { 
    replacement = replacement + goog.string.repeat(' ', width - replacement.length); 
  } else { 
    replacement = goog.string.repeat(' ', width - replacement.length) + replacement; 
  } 
  return replacement; 
}; 
goog.string.format.demuxes_['f']= function(value, flags, width, dotp, precision, type, offset, wholeString) { 
  var replacement = value.toString(); 
  if(!(isNaN(precision) || precision == '')) { 
    replacement = value.toFixed(precision); 
  } 
  var sign; 
  if(value < 0) { 
    sign = '-'; 
  } else if(flags.indexOf('+') >= 0) { 
    sign = '+'; 
  } else if(flags.indexOf(' ') >= 0) { 
    sign = ' '; 
  } else { 
    sign = ''; 
  } 
  if(value >= 0) { 
    replacement = sign + replacement; 
  } 
  if(isNaN(width) || replacement.length >= width) { 
    return replacement; 
  } 
  replacement = isNaN(precision) ? Math.abs(value).toString(): Math.abs(value).toFixed(precision); 
  var padCount = width - replacement.length - sign.length; 
  if(flags.indexOf('-', 0) >= 0) { 
    replacement = sign + replacement + goog.string.repeat(' ', padCount); 
  } else { 
    var paddingChar =(flags.indexOf('0', 0) >= 0) ? '0': ' '; 
    replacement = sign + goog.string.repeat(paddingChar, padCount) + replacement; 
  } 
  return replacement; 
}; 
goog.string.format.demuxes_['d']= function(value, flags, width, dotp, precision, type, offset, wholeString) { 
  value = parseInt(value, 10); 
  precision = 0; 
  return goog.string.format.demuxes_['f'](value, flags, width, dotp, precision, type, offset, wholeString); 
}; 
goog.string.format.demuxes_['i']= goog.string.format.demuxes_['d']; 
goog.string.format.demuxes_['u']= goog.string.format.demuxes_['d']; 
